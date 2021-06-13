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

let useTracer;
let instrumentAsync;
let instrumentSync;

try {
  const { instrumentAsync: iasync, instrumentSync: isync } = require('@fluidware-it/opentracing-injector');
  instrumentAsync = iasync;
  instrumentSync = isync;
  useTracer = true;
  console.debug('@fluidware-it/opentracing-injector present, tracing enable');
} catch (e) {
  console.debug('@fluidware-it/opentracing-injector not present, tracing disable');
}

class MariadbPoolClient {
  db;

  conn;

  pool;

  constructor(db, pool = false) {
    this.db = db;
    this.pool = pool;
  }

  open(span) {
    if (!useTracer) return this._open();
    this.span = span;
    return instrumentAsync('db open', { childOf: span }, false, () => {
      return this._open();
    });
  }

  _open() {
    return new Promise((resolve, reject) => {
      this.db.getConnection((err, conn) => {
        if (err) {
          reject(err);
          return;
        }
        this.conn = conn;
        resolve(true);
      });
    });
  }

  close() {
    if (!useTracer) return this._close();
    instrumentSync('db close', { childOf: this.span }, false, () => {
      this._close();
    });
  }

  _close() {
    if (this.conn) {
      this.conn.release();
    }
  }

  async getServerVersion() {
    const data = await this.all("show variables like 'version%'");
    let comment;
    let version;
    data.forEach(row => {
      if (row.Variable_name === 'version') {
        version = row.Value;
      } else {
        if (row.Variable_name === 'version_comment') {
          comment = row.Value;
        }
      }
    });
    if (!comment) {
      comment = 'Mysql';
    }
    return `${comment}, ${version}`;
  }

  all(sql, params) {
    if (!useTracer) return this._all(sql, params);
    return instrumentAsync('db all', { childOf: this.span }, { sql }, () => {
      return this._all(sql, params);
    });
  }

  _all(sql, params) {
    return new Promise((resolve, reject) => {
      this.conn.execute(sql, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        return resolve(rows);
      });
    });
  }

  get(sql, params) {
    if (!useTracer) return this._get(sql, params);
    return instrumentAsync('db get', { childOf: this.span }, { sql }, () => {
      return this._get(sql, params);
    });
  }

  _get(sql, params) {
    return new Promise((resolve, reject) => {
      try {
        this.conn.execute(sql, params, (err, row) => {
          if (err) {
            return reject(err);
          }
          if (row.length < 1) return resolve(false);
          return resolve(row[0]);
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  run(sql, params) {
    if (!useTracer) return this._run(sql, params);
    return instrumentAsync('db run', { childOf: this.span }, { sql }, () => {
      return this._run(sql, params);
    });
  }

  _run(sql, params) {
    return new Promise((resolve, reject) => {
      this.conn.execute(sql, params, (err, results, fields) => {
        if (err) {
          return reject(err);
        }
        return resolve({ results, fields });
      });
    });
  }

  insert(sql, params) {
    if (!useTracer) return this._insert(sql, params);
    return instrumentAsync('db insert', { childOf: this.span }, { sql }, () => {
      return this._insert(sql, params);
    });
  }

  _insert(sql, params) {
    return new Promise((resolve, reject) => {
      this.conn.execute(sql, params, function(err, results) {
        if (err) {
          reject(err);
          return;
        }
        resolve(results.insertId);
      });
    });
  }

  update(sql, params) {
    if (!useTracer) return this._update(sql, params);
    return instrumentAsync('db update', { childOf: this.span }, { sql }, () => {
      return this._update(sql, params);
    });
  }

  _update(sql, params) {
    return new Promise((resolve, reject) => {
      this.conn.execute(sql, params, function(err, results) {
        if (err) {
          reject(err);
          return;
        }
        resolve(results.affectedRows);
      });
    });
  }

  delete(sql, params) {
    if (!useTracer) return this._delete(sql, params);
    return instrumentAsync('db delete', { childOf: this.span }, { sql }, () => {
      return this._delete(sql, params);
    });
  }

  _delete(sql, params) {
    return new Promise((resolve, reject) => {
      this.conn.execute(sql, params, function(err, results) {
        if (err) {
          reject(err);
          return;
        }
        resolve(results.affectedRows);
      });
    });
  }
}

export default MariadbPoolClient;
