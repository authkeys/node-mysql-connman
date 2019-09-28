import fs from 'fs';
import MariadbClusterClient from './clusterclient';
import MariadbPoolClusterClient from './poolclusterclient';
import MariadbClient from './client';
import MariadbPoolClient from './poolclient';
import mysql from 'mysql2';

const noPoolDb =
  process.env.DB_NOPOOL &&
  (process.env.DB_NOPOOL === '1' || process.env.DB_NOPOOL === 'true' || process.env.DB_NOPOOL === 'on');

const connectionLimit = process.env.NODE_ENV === 'production' ? 10 : 4;
const connectionQueueLimit = process.env.NODE_ENV === 'production' ? 10 : 4;

class ConnectionManager {
  DbClientClass;

  pool;

  constructor(settings) {
    const { host, port, username, password, database, cluster, ssl_ca } = settings;
    const defaultOptions = {
      host: host,
      user: username,
      password,
      database,
      port: port || 3306,
      waitForConnections: true,
      connectionLimit,
      timezone: 'Z',
      queueLimit: connectionQueueLimit
    };
    if (ssl_ca) {
      defaultOptions.ssl = {
        // key: fs.readFileSync('./certs/client-key.pem'),
        // cert: fs.readFileSync('./certs/client-cert.pem')
        ca: fs.readFileSync(ssl_ca)
      };
    }
    let options;
    if (settings.options) {
      options = Object.assign(defaultOptions, settings.options);
    } else {
      options = defaultOptions;
    }
    if (cluster) {
      this.pool = mysql.createPoolCluster({
        canRetry: true
      });
      const nodes = {};
      this.pool.on('remove', id => {
        console.error('Node %s removed!!!', id);
        setTimeout(() => {
          this.pool.add(id, nodes[id]);
          console.debug('ConnectionManager cluster pool added', id);
        }, 5000);
      });
      cluster.rw.forEach((node, i) => {
        const config = Object.assign({}, defaultOptions, {
          host: node.host,
          port: node.port
        });
        this.pool.add('rw' + i, config);
        nodes['rw' + i] = config;
      });
      cluster.ro.forEach((node, i) => {
        const config = Object.assign({}, defaultOptions, {
          host: node.host,
          port: node.port
        });
        this.pool.add('ro' + i, config);
        nodes['ro' + i] = config;
      });
      this.DbClientClass = noPoolDb ? MariadbClusterClient : MariadbPoolClusterClient;
    } else {
      this.pool = mysql.createPool(options);
      this.DbClientClass = noPoolDb ? MariadbClient : MariadbPoolClient;
    }
  }

  getClient(poolName = false) {
    return new this.DbClientClass(this.pool, poolName);
  }

  close() {
    this.pool.end();
  }
}

export default ConnectionManager;
