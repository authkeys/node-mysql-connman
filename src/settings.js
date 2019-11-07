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

import fs from 'fs';
import util from 'util';

const parseDbClusterEnv = function(string) {
  const config = {
    rw: [],
    ro: []
  };
  const parts = string.split(',');
  parts.forEach(function(part) {
    if (!part.trim()) {
      return;
    }
    const [ns, host, port] = part.split(':');
    if (!ns) {
      throw new Error('Invalid string');
    }
    if (!config[ns]) {
      throw new Error(util.format('namespace %s is unknown. It must be "rw" or "ro"', ns));
    }
    if (!host) {
      throw new Error(util.format('no host defined: %s. Format is namespace:host:[port]', part));
    }
    config[ns].push({
      host,
      port: Number(port) || 3306
    });
  });

  if (config.rw.length === 0) {
    throw new Error('no primary server defined');
  }
  return config;
};

export const loadDbEnvSettings = function(settings = {}) {
  const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    DB_PORT,
    DB_SSL_CA,
    DB_CLUSTER,
    DB_CONNECTION_LIMIT,
    DB_QUEUE_LIMIT,
    DB_NOPOOL
  } = process.env;
  if (!settings.config) {
    settings.config = {};
  }
  if (!DB_USER && !settings.config.user) {
    throw new Error('DB ERROR! mysql requires DB_USER');
  }
  if (!DB_PASSWORD && !settings.config.password) {
    throw new Error('DB ERROR! mysql requires DB_PASSWORD');
  }
  if (!DB_NAME && !settings.config.database) {
    throw new Error('DB ERROR! mysql requires DB_NAME');
  }
  if (!DB_CLUSTER && !settings.cluster) {
    if (!DB_HOST && !settings.config.host) {
      throw new Error('DB ERROR! mysql required DB_HOST or DB_CLUSTER');
    }
  }
  if (!settings.noDbPool) {
    settings.noDbPool = false;
  }
  if (DB_NOPOOL) {
    settings.noDbPool = DB_NOPOOL && (DB_NOPOOL === '1' || DB_NOPOOL === 'true' || DB_NOPOOL === 'on');
  }
  if (DB_USER) {
    settings.config.user = DB_USER;
  }
  if (DB_PASSWORD) {
    settings.config.password = DB_PASSWORD;
  }
  if (DB_NAME) {
    settings.config.database = DB_NAME;
  }
  if (DB_CLUSTER) {
    try {
      settings.cluster = parseDbClusterEnv(DB_CLUSTER);
    } catch (e) {
      throw new Error(util.format('DB ERROR! Unable to parse DB_CLUSTER:', e.message));
    }
  } else {
    if (DB_HOST) {
      settings.config.host = DB_HOST;
    }
    if (DB_PORT) {
      settings.config.port = Number(DB_PORT);
    }
    if (isNaN(settings.config.port)) {
      settings.config.port = 3306;
    }
  }
  if (DB_CONNECTION_LIMIT !== undefined) {
    settings.config.connectionLimit = Number(DB_CONNECTION_LIMIT) || 10;
  }
  if (DB_QUEUE_LIMIT !== undefined) {
    settings.config.queueLimit = Number(DB_QUEUE_LIMIT) || 4;
  }
  if (typeof settings.config.timezone === 'undefined') {
    settings.config.timezone = 'Z';
  }
  if (typeof settings.config.waitForConnections === 'undefined') {
    settings.config.waitForConnections = true;
  }
  if (DB_SSL_CA) {
    if (!settings.config.ssl) {
      settings.config.ssl = {};
    }
    settings.config.ssl = {
      ca: fs.readFileSync(DB_SSL_CA)
    };
  }
  return settings;
};
