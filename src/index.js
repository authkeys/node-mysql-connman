import MariadbClusterClient from './clusterclient';
import MariadbPoolClusterClient from './poolclusterclient';
import MariadbClient from './client';
import MariadbPoolClient from './poolclient';
import mysql from 'mysql2';

class ConnectionManager {
  DbClientClass;

  pool;

  constructor(config, noPoolDb = false, cluster = undefined) {
    if (cluster) {
      this.pool = mysql.createPoolCluster({
        canRetry: true
      });
      const nodes = {};
      this.pool.on('remove', id => {
        if (config.debug) {
          console.debug('ConnectionManager node %s removed!!!', id);
        }
        setTimeout(() => {
          this.pool.add(id, nodes[id]);
          if (config.debug) {
            console.debug('ConnectionManager added node %s', id);
          }
        }, 5000);
      });
      cluster.rw.forEach((node, i) => {
        const _config = Object.assign({}, config, {
          host: node.host,
          port: node.port
        });
        this.pool.add('rw' + i, _config);
        nodes['rw' + i] = _config;
      });
      cluster.ro.forEach((node, i) => {
        const _config = Object.assign({}, config, {
          host: node.host,
          port: node.port
        });
        this.pool.add('ro' + i, _config);
        nodes['ro' + i] = _config;
      });
      this.DbClientClass = noPoolDb ? MariadbClusterClient : MariadbPoolClusterClient;
    } else {
      this.pool = mysql.createPool(config);
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
export * from './settings';
export default ConnectionManager;
