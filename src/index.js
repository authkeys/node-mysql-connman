// Copyright 2019 AuthKeys srl
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import _UpgradeManager from './upgradeManager';
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
          port: node.port || 3306
        });
        this.pool.add('rw' + i, _config);
        nodes['rw' + i] = _config;
      });
      cluster.ro.forEach((node, i) => {
        const _config = Object.assign({}, config, {
          host: node.host,
          port: node.port || 3306
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

export { loadDbEnvSettings } from './settings';
export const UpgradeManager = _UpgradeManager;
export default ConnectionManager;
