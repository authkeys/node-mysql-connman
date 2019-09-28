import MariadbPoolClusterClient from './poolclusterclient';

class MariadbClusterClient extends MariadbPoolClusterClient {
  close() {
    if (this.conn) {
      this.conn.destroy();
    }
  }
}

export default MariadbClusterClient;
