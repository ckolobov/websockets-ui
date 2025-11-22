import { roomsDb } from '../database/rooms.js';
import { AttackRequestMessage } from '../types.js';

type RoomId = string;

export const attack = (
  requestMessage: AttackRequestMessage,
): {
  hit: boolean;
  sunk: boolean;
  gameOver: boolean;
  roomId: RoomId;
  shipCells?: { x: number; y: number }[];
} | null => {
  try {
    const { indexPlayer, x, y } = requestMessage.data;
    const playerId = String(indexPlayer);
    if (!playerId) {
      throw new Error('Attack cannot be done. Player ID is empty');
    }

    const room = roomsDb.getRoomByPlayerId(playerId);
    if (!room) {
      throw new Error('Attack cannot be done. Room not found');
    }

    const result = room.attack(playerId, x, y);
    if (!result) {
      throw new Error('Attack is not successful');
    }

    return {
      ...result,
      roomId: room.getId(),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown server error');
    }
    return null;
  }
};
