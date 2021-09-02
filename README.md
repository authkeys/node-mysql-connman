# mysql-connman

## Opinionated mysql2 connection manager

This package helps you connecting to mysql/mariadb. It uses [mysql2](https://www.npmjs.com/package/mysql2) driver.

It supports pooled connection to single node database and to master/slaves clusters.

### ConnectionManager

### Pooled connection to single node

Connection will be released to pool 

```
import ConnectionManager from '@authkeys/mysql-connman';

const settings = {
  config: {
    host: 'dbhost',
    port: 3306,
    user: 'dbuser',
    password: 'dbpwd',
    database: 'dbname'
  }
};

const connectionManager = new ConnectionManager(settings);

const client = connectionManager.getClient();
[...]
client.close();

```

### NON Pooled connection to single node

Connection will be closed

```
import ConnectionManager from '@authkeys/mysql-connman';

const settings = {
    config: {
        host: 'dbhost',
        port: 3306,
        user: 'dbuser',
        password: 'dbpwd',
        database: 'dbname'
    },
    noDbPool: true
};

const connectionManager = new ConnectionManager(settings);
const client = connectionManager.getClient();
[...]
client.close();

```

### Pooled connection to master/slave cluster

Connection will be released to pool 

```
import ConnectionManager from '@authkeys/mysql-connman';

const settings = {
    config: {
        user: 'dbuser',
        password: 'dbpwd',
        database: 'dbname'
    },
    cluster: {
        rw: [{
            host: 'masternode',
            port: 3306
        }],
        ro: [{
             host: 'slavenode1',
             port: 3306
         }, {
            host: 'slavenode2',
            port: 3306
        }]
    }
};

const connectionManager = new ConnectionManager(settings);

const clientReadWrite = connectionManager.getClient('rw');
const clientReadOnly = connectionManager.getClient('ro');
[...]
clientReadWrite.close();
clientReadOnly.close();
```

### NOT Pooled connection to master/slave cluster

Connection will be closed

```
import ConnectionManager from '@authkeys/mysql-connman';

const settings = {
    config: {
        user: 'dbuser',
        password: 'dbpwd',
        database: 'dbname'
    },
    cluster: {
        rw: [{
            host: 'masternode',
            port: 3306
        }],
        ro: [{
             host: 'slavenode1',
             port: 3306
         }, {
            host: 'slavenode2',
            port: 3306
        }]
    },
    noDbPool: true
};

const connectionManager = new ConnectionManager(settings);

const clientReadWrite = connectionManager.getClient('rw');
const clientReadOnly = connectionManager.getClient('ro');
[...]
clientReadWrite.close();
clientReadOnly.close();
```

### Client 

#### run

`run(sql, params)`
   
Execute a generic sql, return `{ results, fields }` 


```

const runSql = async (sql, params) => {
    const client = connectionManager.getClient();
    await client.open();
    const {results, fields} = await client.run(sql, parms) ;
    client.close();
});

```

#### insert

`insert(sql, params)`  

Insert one row, return insertId

```

const insertRow = async val => {
    const client = connectionManager.getClient();
    await client.open();
    const insertId = await client.insert('insert into tab1 (col1) values (?) ', [val]) ;
    client.close();
});

```

#### update

`update(sql, params)`  

Update row(s), return affectedRows

```

const updateRow = async (id, val) => {
    const client = connectionManager.getClient();
    await client.open();
    const affectedRows = await client.update('update tab1 set col1 = ? where id = ? ', [val, id]) ;
    client.close();
});

```

#### delete

`delete(sql, params)`  

Delete row(s), return affectedRows

```

const deleteRow = async id => {
    const client = connectionManager.getClient();
    await client.open();
    const affectedRows = await client.delete('delete from tab1 where id = ? ', [id]) ;
    client.close();
});

```

#### fetch 1 row

`get(sql, params)`   

Fetch one row

```

const selectRow = async id => {
    const client = connectionManager.getClient();
    await client.open();
    const row = await client.get('select id, col1 from tab1 where id = ? ', [id]) ;
    if(row) {
        const { id, col1 } = row;
        console.log('id: %s, col1: %s', id, col1);
    }
    client.close();
});

```


#### fetch row(s)

`all(sql, params)`   

Fetch row(s)

```

const selectRows = async minId => {
    const client = connectionManager.getClient();
    await client.open();
    const rows = await client.all('select id, col1 from tab1 where id >= ? ', [id]) ;
    rows.forEach(row => {
        const { id, col1 } = row;
        console.log('id: %s, col1: %s', id, col1);
    });
    client.close();
});

```

#### raw query

`raw_query(sql)`

Raw query

```

const selectRows = async () => {
    const client = connectionManager.getClient();
    await client.open();
    const rows = await client.raw_query('select id, col1 from tab1') ;
    rows.forEach(row => {
        const { id, col1 } = row;
        console.log('id: %s, col1: %s', id, col1);
    });
    client.close();
});

```
