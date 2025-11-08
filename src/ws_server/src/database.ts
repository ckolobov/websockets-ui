import { Player, PlayerData } from './types.js';
import { randomUUID } from 'crypto';

class InMemoryDatabase {
  private players: Map<string, Player> = new Map();
  private nameIndex: Map<string, string> = new Map(); // name -> id mapping

  createPlayer(data: PlayerData): Player {
    const existingPlayerId = this.nameIndex.get(data.name);
    if (existingPlayerId) {
      throw new Error(`Player with name "${data.name}" already exists`);
    }

    const player: Player = {
      id: randomUUID(),
      name: data.name,
      password: data.password,
    };

    this.players.set(player.id, player);
    this.nameIndex.set(player.name, player.id);

    console.log(`Player created: ${player.name} (ID: ${player.id})`);
    return player;
  }

  getPlayerById(id: string): Player | undefined {
    return this.players.get(id);
  }

  getPlayerByName(name: string): Player | undefined {
    const playerId = this.nameIndex.get(name);
    if (!playerId) {
      return undefined;
    }
    return this.players.get(playerId);
  }

  authenticatePlayer(name: string, password: string): Player | null {
    const player = this.getPlayerByName(name);
    if (!player) {
      return null;
    }

    if (player.password === password) {
      console.log(`Player authenticated: ${name}`);
      return player;
    }

    console.log(`Authentication failed for: ${name}`);
    return null;
  }

  updatePlayerPassword(id: string, newPassword: string): boolean {
    const player = this.players.get(id);
    if (!player) {
      return false;
    }

    player.password = newPassword;
    console.log(`Password updated for player: ${player.name}`);
    return true;
  }

  deletePlayer(id: string): boolean {
    const player = this.players.get(id);
    if (!player) {
      return false;
    }

    this.nameIndex.delete(player.name);
    this.players.delete(id);
    console.log(`Player deleted: ${player.name} (ID: ${id})`);
    return true;
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  nameExists(name: string): boolean {
    return this.nameIndex.has(name);
  }

  clear(): void {
    this.players.clear();
    this.nameIndex.clear();
    console.log('Database cleared');
  }
}

export const db = new InMemoryDatabase();
