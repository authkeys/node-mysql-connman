import { assert } from 'chai';
import { loadEnvSettings } from '../src';

const mergeObjects = (from, to) => {
  Object.keys(from).forEach(k => {
    to[k] = from[k];
  });
};

const caCert = `-----BEGIN CERTIFICATE-----
MIIEMDCCApigAwIBAgIDQRUDMA0GCSqGSIb3DQEBDAUAMDoxODA2BgNVBAMML2Mw
Yjg4M2YwLWU4YTMtNDE4ZC05NmRkLWZiNDhhNmMzYWQyMCBQcm9qZWN0IENBMB4X
DTE5MDgyNjE0MTcwOFoXDTI5MDgyMzE0MTcwOFowOjE4MDYGA1UEAwwvYzBiODgz
ZjAtZThhMy00MThkLTk2ZGQtZmI0OGE2YzNhZDIwIFByb2plY3QgQ0EwggGiMA0G
CSqGSIb3DQEBAQUAA4IBjwAwggGKAoIBgQDOKuFStEecPmJ6p5id1Z7HtRhyzckm
PTEufBCmmHZzeFkxdXcrlVoh5p5w0nd8FV5QoVB9/vuItbobIeL2l5M6J4lnczMZ
3CT+nhtAVlCke7tbzHo6ujytNczDEm7yZ21SkqUCZDVnU5RognuT4JRoxUP/Ahpz
evn+78j0BZ7s8CR8pxg1Ct2d3dGbRgZWLR/RbpffWvjmx3azT2YOeftVVVDx92Yj
GXpOiLvWz338XqJ6E5e4ot7QZA1xW8zM8tdybjaOhgB8NQmzcHkVyXhUGAzrZcmB
a2vAc9wQM59dVQMbLY26orY2RWL0aS7g/WGfemT+yXNxf47pkB+4bBoPfP/uaOGx
GtueMMesjugJL5GXoGQ91nWrYPglPeabrYsj9y0d/X+INEsneposxsMGGsy387CP
s62oJKI0CupxXeLzivcuM4qy2CFIvNXqqXOy+0k7r7eaUmfdGhNY4Od3XOxdqmbc
Wn7/htXyRvkUjIIvoMQSj+1XwRf0CovLZWkCAwEAAaM/MD0wHQYDVR0OBBYEFIag
CccGVaPHkIxBhNEYuG+ek6T4MA8GA1UdEwQIMAYBAf8CAQAwCwYDVR0PBAQDAgEG
MA0GCSqGSIb3DQEBDAUAA4IBgQB7EbAzXsJ3YFphzNTpxdJ+iTecsRn/u/rQT+lZ
nuq4qH+drrc3uejMCHrQTXOPPUeq+yoafzQH3yVrHeCo3rLhsmRX4S4g8za6/div
rSE+f8rWkNujbAalJ1GZyvcaaoRz4ytQ30IDCVZdHkHxwKjwJyjEOSgDnRy7l6mM
otyGT4lkJq01Isl+rZe074ll0XGSB25hBVJoCe3D29O9egADKwwLPNYP0qvR4gfY
0FY7h1L1FvRhONovAQgq7ADvb0Cg/n3m8yW3ipiVZzHsE6a7EFC9TD9DZnHE/yBt
PBRkg93edLh3QWu6Xxj1YD4VNskWa9Aebj6dOAwq4TYVK/f4zPHtzxRiBq7iD8CE
yTurCOPGi0NZIKzNHRXNLCLomSLOfm/r8TSwnqyq7vBBOLZRgg5hD1IHGF1zcntn
cp7RMocTD0mNohPbRFyw8Y8CyTTWgPV5Cq/BkbAJXwz2NBCpxAB+5Lo4dG8WelwD
ucOzJht4xJXNNj/2X+V46RtbEaw=
-----END CERTIFICATE-----
`;
describe('Testing settings', () => {
  let _env;
  beforeEach(function() {
    _env = Object.assign({}, process.env);
  });

  afterEach(function() {
    process.env = _env;
  });
  describe('Testing loadEnvSettings', () => {
    it('Should throw an error', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb'
      };
      mergeObjects(config, process.env);
      const settings = {};
      try {
        loadEnvSettings(settings);
        done(new Error('Not supposed to be here'));
      } catch (e) {
        assert.strictEqual('DB ERROR! mysql required DB_HOST or DB_CLUSTER', e.message);
        done();
      }
    });

    it('Should throw an error', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword'
      };
      mergeObjects(config, process.env);
      const settings = {};
      try {
        loadEnvSettings(settings);
        done(new Error('Not supposed to be here'));
      } catch (e) {
        assert.strictEqual('DB ERROR! mysql requires DB_NAME', e.message);
        done();
      }
    });

    it('Should throw an error', done => {
      const config = {
        DB_USER: 'testuser'
      };
      mergeObjects(config, process.env);
      const settings = {};
      try {
        loadEnvSettings(settings);
        done(new Error('Not supposed to be here'));
      } catch (e) {
        assert.strictEqual('DB ERROR! mysql requires DB_PASSWORD', e.message);
        done();
      }
    });
    it('Should throw an error', done => {
      const settings = {};
      try {
        loadEnvSettings(settings);
        done(new Error('Not supposed to be here'));
      } catch (e) {
        assert.strictEqual('DB ERROR! mysql requires DB_USER', e.message);
        done();
      }
    });

    it('Should throw an error', done => {
      try {
        loadEnvSettings();
        done(new Error('Not supposed to be here'));
      } catch (e) {
        assert.strictEqual('DB ERROR! mysql requires DB_USER', e.message);
        done();
      }
    });

    it('Should throw an error', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: 'ro:xxxx,ro:yyyy'
      };
      mergeObjects(config, process.env);

      try {
        loadEnvSettings({});
        done(new Error('Not supposed to be here xxx'));
      } catch (e) {
        assert.strictEqual('DB ERROR! Unable to parse DB_CLUSTER: no primary server defined', e.message);
        done();
      }
    });

    it('Should throw an error', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: 'r:xxxx'
      };
      mergeObjects(config, process.env);

      try {
        loadEnvSettings({});
        done(new Error('Not supposed to be here xxx'));
      } catch (e) {
        assert.strictEqual(
          'DB ERROR! Unable to parse DB_CLUSTER: namespace r is unknown. It must be "rw" or "ro"',
          e.message
        );
        done();
      }
    });

    it('Should throw an error', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: 'rw:xxxx,pinco'
      };
      mergeObjects(config, process.env);

      try {
        loadEnvSettings({});
        done(new Error('Not supposed to be here xxx'));
      } catch (e) {
        assert.strictEqual(
          'DB ERROR! Unable to parse DB_CLUSTER: namespace pinco is unknown. It must be "rw" or "ro"',
          e.message
        );
        done();
      }
    });

    it('Should throw an error', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: 'rw:xxxx,ro:'
      };
      mergeObjects(config, process.env);

      try {
        loadEnvSettings({});
        done(new Error('Not supposed to be here xxx'));
      } catch (e) {
        assert.strictEqual(
          'DB ERROR! Unable to parse DB_CLUSTER: no host defined: ro:. Format is namespace:host:[port]',
          e.message
        );
        done();
      }
    });

    it('Should throw an error', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: '::'
      };
      mergeObjects(config, process.env);

      try {
        loadEnvSettings({});
        done(new Error('Not supposed to be here xxx'));
      } catch (e) {
        assert.strictEqual('DB ERROR! Unable to parse DB_CLUSTER: Invalid string', e.message);
        done();
      }
    });

    it('Should set the correct minimal settings', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_HOST: 'testhost',
        DB_NAME: 'testdb',
        DB_PORT: 13306
      };
      mergeObjects(config, process.env);
      const settings = loadEnvSettings({});
      assert.strictEqual(settings.config.host, config.DB_HOST);
      assert.strictEqual(settings.config.database, config.DB_NAME);
      assert.strictEqual(settings.config.port, config.DB_PORT);
      assert.strictEqual(settings.config.user, config.DB_USER);
      assert.strictEqual(settings.config.password, config.DB_PASSWORD);
      assert.strictEqual(settings.config.timezone, 'Z');
      assert.strictEqual(settings.config.waitForConnections, true);
      assert.isUndefined(settings.config.ssl);
      assert.isFalse(settings.noDbPool);
      assert.isUndefined(settings.cluster);
      done();
    });

    it('Should set the correct full settings', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_HOST: 'testhost',
        DB_NAME: 'testdb',
        DB_PORT: '13306',
        DB_QUEUE_LIMIT: '10',
        DB_CONNECTION_LIMIT: '20',
        DB_NOPOOL: '1',
        DB_SSL_CA: './tests/assets/ca-certificate.crt'
      };
      mergeObjects(config, process.env);
      const settings = loadEnvSettings({});
      assert.strictEqual(settings.config.host, config.DB_HOST);
      assert.strictEqual(settings.config.database, config.DB_NAME);
      assert.strictEqual(settings.config.port, 13306);
      assert.strictEqual(settings.config.user, config.DB_USER);
      assert.strictEqual(settings.config.password, config.DB_PASSWORD);
      assert.strictEqual(settings.config.timezone, 'Z');
      assert.strictEqual(settings.config.waitForConnections, true);
      assert.strictEqual(settings.config.queueLimit, 10);
      assert.strictEqual(settings.config.connectionLimit, 20);
      assert.strictEqual(settings.config.ssl.ca.toString(), caCert);
      assert.isTrue(settings.noDbPool);
      assert.isUndefined(settings.cluster);
      done();
    });

    it('Should set the correct full settings', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_HOST: 'testhost',
        DB_NAME: 'testdb',
        DB_PORT: '13306',
        DB_CONNECTION_LIMIT: 'a',
        DB_QUEUE_LIMIT: 'a',
        DB_NOPOOL: '0',
        DB_SSL_CA: './tests/assets/ca-certificate.crt'
      };
      mergeObjects(config, process.env);
      const settings = loadEnvSettings({
        config: { ssl: {}, connectionLimit: 1, queueLimit: 1, waitForConnections: false, timezone: 'GMT+1' },
        noDbPool: true
      });
      assert.strictEqual(settings.config.host, config.DB_HOST);
      assert.strictEqual(settings.config.database, config.DB_NAME);
      assert.strictEqual(settings.config.port, 13306);
      assert.strictEqual(settings.config.user, config.DB_USER);
      assert.strictEqual(settings.config.password, config.DB_PASSWORD);
      assert.strictEqual(settings.config.timezone, 'GMT+1');
      assert.strictEqual(settings.config.waitForConnections, false);
      assert.strictEqual(settings.config.queueLimit, 4);
      assert.strictEqual(settings.config.connectionLimit, 10);
      assert.strictEqual(settings.config.ssl.ca.toString(), caCert);
      assert.isFalse(settings.noDbPool);
      assert.isUndefined(settings.cluster);
      done();
    });

    it('Should set the correct settings (default PORT)', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_HOST: 'testhost',
        DB_NAME: 'testdb'
      };
      mergeObjects(config, process.env);
      const settings = {};
      loadEnvSettings(settings);
      assert.strictEqual(settings.config.host, config.DB_HOST);
      assert.strictEqual(settings.config.database, config.DB_NAME);
      assert.strictEqual(settings.config.port, 3306);
      assert.strictEqual(settings.config.user, config.DB_USER);
      assert.strictEqual(settings.config.password, config.DB_PASSWORD);
      assert.strictEqual(settings.config.timezone, 'Z');
      assert.strictEqual(settings.config.waitForConnections, true);
      assert.isUndefined(settings.config.ssl);
      assert.isFalse(settings.noDbPool);
      assert.isUndefined(settings.cluster);
      done();
    });

    it('Should set the correct settings', done => {
      const config = {
        config: {
          user: 'testuser',
          password: 'testpassword',
          host: 'testhost',
          database: 'testdb',
          port: 13306
        }
      };
      const settings = loadEnvSettings(config);
      assert.strictEqual(settings.config.host, config.config.host);
      assert.strictEqual(settings.config.database, config.config.database);
      assert.strictEqual(settings.config.port, config.config.port);
      assert.strictEqual(settings.config.user, config.config.user);
      assert.strictEqual(settings.config.password, config.config.password);
      assert.strictEqual(settings.config.timezone, 'Z');
      assert.strictEqual(settings.config.waitForConnections, true);
      assert.isUndefined(settings.config.ssl);
      assert.isFalse(settings.noDbPool);
      assert.isUndefined(settings.cluster);
      done();
    });

    it('Should set the correct cluster (2 hosts) settings', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: 'rw:host1:13306,ro:host2:13306'
      };
      mergeObjects(config, process.env);
      const settings = loadEnvSettings({});
      assert.isUndefined(settings.config.host);
      assert.isUndefined(settings.config.port);
      assert.strictEqual(settings.config.database, config.DB_NAME);
      assert.strictEqual(settings.config.user, config.DB_USER);
      assert.strictEqual(settings.config.password, config.DB_PASSWORD);
      assert.strictEqual(settings.config.timezone, 'Z');
      assert.strictEqual(settings.config.waitForConnections, true);
      assert.isUndefined(settings.config.ssl);
      assert.isFalse(settings.noDbPool);
      assert.isObject(settings.cluster);
      assert.strictEqual(1, settings.cluster.rw.length);
      assert.strictEqual(1, settings.cluster.ro.length);
      done();
    });

    it('Should set the correct cluster (3 hosts) settings', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: 'rw:host1:13306,ro:host2:13306,ro:host3:13306'
      };
      mergeObjects(config, process.env);
      const settings = loadEnvSettings({});
      assert.isUndefined(settings.config.host);
      assert.isUndefined(settings.config.port);
      assert.strictEqual(settings.config.database, config.DB_NAME);
      assert.strictEqual(settings.config.user, config.DB_USER);
      assert.strictEqual(settings.config.password, config.DB_PASSWORD);
      assert.strictEqual(settings.config.timezone, 'Z');
      assert.strictEqual(settings.config.waitForConnections, true);
      assert.isUndefined(settings.config.ssl);
      assert.isFalse(settings.noDbPool);
      assert.isObject(settings.cluster);
      assert.strictEqual(1, settings.cluster.rw.length);
      assert.strictEqual(2, settings.cluster.ro.length);
      done();
    });

    it('Should set the correct cluster settings', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: 'rw:xxxx,,'
      };
      mergeObjects(config, process.env);
      const settings = {};
      loadEnvSettings(settings);
      done();
    });

    it('Should set the correct cluster settings', done => {
      const config = {
        DB_USER: 'testuser',
        DB_PASSWORD: 'testpassword',
        DB_NAME: 'testdb',
        DB_CLUSTER: 'rw:host1,ro:host2'
      };
      mergeObjects(config, process.env);
      const settings = loadEnvSettings({});
      assert.isUndefined(settings.config.host);
      assert.isUndefined(settings.config.port);
      assert.strictEqual(settings.config.database, config.DB_NAME);
      assert.strictEqual(settings.config.user, config.DB_USER);
      assert.strictEqual(settings.config.password, config.DB_PASSWORD);
      assert.strictEqual(settings.config.timezone, 'Z');
      assert.strictEqual(settings.config.waitForConnections, true);
      assert.isUndefined(settings.config.ssl);
      assert.isFalse(settings.noDbPool);
      assert.isObject(settings.cluster);
      done();
    });
  });
});
