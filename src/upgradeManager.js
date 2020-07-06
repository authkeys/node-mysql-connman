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
import assert from 'assert';
import { initLogger, common_debug, common_error, common_info } from './utils/logUtils';

const setTimeoutPromise = function(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

class UpgradeManager {
  connectionManager;

  client;

  concurrent_mode;

  version_table = '_version';

  constructor(connectionManager, logLevel = false, concurrent_mode = false, version_table_suffix = false) {
    this.connectionManager = connectionManager;
    assert(typeof concurrent_mode, 'boolean');
    this.concurrent_mode = concurrent_mode;
    initLogger(logLevel);
    if (version_table_suffix) {
      this.version_table = this.version_table + version_table_suffix;
    }
  }

  async checkDb(targetVersion, onSchemaInit, onSchemaUpgrade) {
    this.client = this.connectionManager.getClient();
    await this.client.open();
    let currentVersion;
    try {
      const serverVersion = await this.client.getServerVersion();
      common_info('Db Version', serverVersion);
    } catch (e) {
      common_error('checkDb failed %s', e.message);
      process.exit(99);
    }
    try {
      const row = await this.getCurrentVersion();
      if (row === false) {
        currentVersion = -999;
      } else if (row) {
        currentVersion = row.value;
      }
    } catch (e) {
      common_error('Failed to read current version, exiting. ', e.message);
      process.exit(92);
    }

    common_info('Check db: currentVersion %s targetVersion %s', currentVersion, targetVersion);

    if (currentVersion === -999) {
      try {
        currentVersion = await this.createVersionTable();
      } catch (e) {
        if (e.code === 'ER_TABLE_EXISTS_ERROR') {
          await setTimeoutPromise(2000);
          this.checkDb();
        } else {
          common_error('Unable to create %s table: [%s] %s', this.version_table, e.code, e.message);
          process.exit(90);
        }
        return;
      }
    } else if (currentVersion < 0) {
      common_error('Db in initialization, exiting ');
      process.exit(91);
    }

    try {
      if (currentVersion === 0) {
        await this.initDb(targetVersion, onSchemaInit);
        common_info('Db created');
        return true;
      }
      if (targetVersion === currentVersion) {
        return true;
      }
      if (targetVersion > currentVersion) {
        await this.upgradeDb(currentVersion, targetVersion, onSchemaUpgrade);
        common_info('Db updated to ', targetVersion);
        return true;
      }
    } catch (e) {
      common_error('\n');
      common_error('\n');
      common_error(' !!!!!!!! FATAL ERROR !!!!!!!!');
      common_error('\n');
      common_error('checkDb failed %s', e.message);
      common_error('\n');
      common_error(' !!!!!!!! FATAL ERROR !!!!!!!!');
      common_error('\n');
      common_error('\n');
      console.error(e);
      process.exit(96);
    }
    return true;
  }

  async getCurrentVersion(targetVersion) {
    const sqlCheck = `select value from ${this.version_table}`;
    if (this.concurrent_mode) {
      await this.client.run('SET AUTOCOMMIT=0');
      let row;
      try {
        row = await this.client.get(`${sqlCheck} for update`);
        if (row.value === targetVersion) {
          common_debug('Version is equal: %s vs %s, set AUTOCOMMIT=1', row.value, targetVersion);
          await this.client.run('ROLLBACK');
          await this.client.run('SET AUTOCOMMIT=1');
        }
        return row;
      } catch (e) {
        await this.client.run('ROLLBACK');
        if (e.code === 'ER_NO_SUCH_TABLE') {
          return false;
        }
        common_error('Ooops: %s', e.message, e.code);
        throw e;
      }
    } else {
      try {
        const row = await this.client.get(sqlCheck);
        if (row) {
          return row;
        }
        return null;
      } catch (e) {
        if (e.code === 'ER_NO_SUCH_TABLE') {
          return false;
        }
        common_error('Ooops: %s', e.message, e.code);
        throw e;
      }
    }
  }

  async createVersionTable() {
    const sqlCreateTable = `create table ${this.version_table} (value INTEGER PRIMARY KEY)`;
    try {
      await this.client.run(sqlCreateTable);
    } catch (e) {
      await this.client.run('ROLLBACK');
      throw e;
    }
    try {
      const sqlInsertVersionZero = `insert into ${this.version_table} values (-1)`;
      await this.client.run(sqlInsertVersionZero);
      if (this.concurrent_mode) {
        await this.client.run(`select value from ${this.version_table} for update`);
      }
    } catch (e) {
      common_error('Unable to insert -1 version in %s table: [%s] %s', this.version_table, e.code, e.message);
      throw e;
    }
    return 0;
  }

  async initDb(targetVersion, onInit) {
    let dbConn;
    if (this.concurrent_mode) {
      dbConn = this.connectionManager.getClient();
      await dbConn.open();
    } else {
      dbConn = this.client;
    }
    await onInit(dbConn);
    await this.updateVersion(targetVersion);
    if (this.concurrent_mode) {
      dbConn.close();
    }
  }

  async updateVersion(targetVersion) {
    const sql = `update ${this.version_table} set value = ?`;
    if (this.concurrent_mode) {
      await this.client.run(sql, [targetVersion]);
      await this.client.run('COMMIT');
      return this.client.run('set AUTOCOMMIT=1');
    } else {
      return this.client.run(sql, [targetVersion]);
    }
  }

  async upgradeDb(fromVersion, targetVersion, onUpgrade) {
    await onUpgrade(this.client, fromVersion);
    await this.updateVersion(targetVersion);
  }
}

export default UpgradeManager;
