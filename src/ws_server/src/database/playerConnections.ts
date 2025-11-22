import { WebSocket } from 'ws';

class PlayerConnections {
  private playerConnectionMap: Map<string, WebSocket> = new Map();

  getAllConnections() {
    return Array.from(this.playerConnectionMap);
  }

  addPlayerConnection(playerId: string, ws: WebSocket) {
    const existingPlayerConnection = this.getPlayerConnection(playerId);
    if (existingPlayerConnection) {
      existingPlayerConnection.close();
    }
    this.playerConnectionMap.set(playerId, ws);
  }

  getPlayerConnection(playerId: string) {
    return this.playerConnectionMap.get(playerId);
  }

  removePlayerConnection(playerId: string) {
    this.playerConnectionMap.delete(playerId);
  }
}

export const playerConnectionsDb = new PlayerConnections();
