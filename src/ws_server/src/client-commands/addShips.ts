import { roomsDb } from '../database/rooms.js';
import { ShipDirection } from '../models/types.js';
import { AddShipsRequestMessage } from '../types.js';

type RoomId = string;

export const addShips = (requestMessage: AddShipsRequestMessage): RoomId | null => {
  try {
    const { ships, indexPlayer: playerId } = requestMessage.data;
    if (!playerId) {
      throw new Error('Ships are not added. Player ID is empty');
    }

    const shipParameters = ships.map((ship) => ({
      ...ship,
      direction: ship.direction ? ShipDirection.Vertical : ShipDirection.Horizontal,
    }));

    roomsDb.addShips(String(playerId), shipParameters);

    return roomsDb.getRoomByPlayerId(String(playerId))?.getId() || null;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown server error');
    }
    return null;
  }
};
