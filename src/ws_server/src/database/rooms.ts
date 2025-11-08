import { ShipParameters } from '../models/types.js';
import { Room } from '../models/Room.js';

class Rooms {
  private rooms: Map<string, Room> = new Map();
  private playerRoomIndex: Map<string, string> = new Map(); // playerId -> roomId mapping

  createRoom(playerId: string): Room {
    const existingRoomId = this.playerRoomIndex.get(playerId);
    if (existingRoomId) {
      throw new Error(`Player ${playerId} is already in room ${existingRoomId}`);
    }

    const room = new Room(playerId);
    this.rooms.set(room.getId(), room);
    this.playerRoomIndex.set(playerId, room.getId());

    console.log(`Room created: ${room.getId()} by player ${playerId}`);
    return room;
  }

  joinRoom(roomId: string, playerId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const existingRoomId = this.playerRoomIndex.get(playerId);
    if (existingRoomId) {
      throw new Error(`Player ${playerId} is already in room ${existingRoomId}`);
    }

    if (room.isFull()) {
      throw new Error(`Room ${roomId} is full`);
    }

    const success = room.addPlayer(playerId);
    if (success) {
      this.playerRoomIndex.set(playerId, roomId);
    }

    return room;
  }

  getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByPlayerId(playerId: string): Room | undefined {
    const roomId = this.playerRoomIndex.get(playerId);
    if (!roomId) {
      return undefined;
    }
    return this.rooms.get(roomId);
  }

  addShips(playerId: string, ships: ShipParameters[]): void {
    const room = this.getRoomByPlayerId(playerId);
    if (!room) {
      console.error(`Player ${playerId} is not in any room`);
      return;
    }

    ships.forEach((ship) => {
      room.addShip(playerId, ship);
    });

    room.setPlayerReady(playerId, true);
  }

  attack(
    attackerId: string,
    x: number,
    y: number,
  ): { hit: boolean; sunk: boolean; gameOver: boolean } | null {
    const room = this.getRoomByPlayerId(attackerId);
    if (!room) {
      console.error(`Player ${attackerId} is not in any room`);
      return null;
    }

    return room.attack(attackerId, x, y);
  }

  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    // Remove all players from index
    room.getPlayers().forEach((player) => {
      if (player) {
        this.playerRoomIndex.delete(player.playerId);
      }
    });

    this.rooms.delete(roomId);
    console.log(`Room deleted: ${roomId}`);
    return true;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getAvailableRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(
      (room) => !room.isFull() && !room.getGameStarted(),
    );
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  clear(): void {
    this.rooms.clear();
    this.playerRoomIndex.clear();
    console.log('Rooms database cleared');
  }
}

export const roomsDb = new Rooms();
