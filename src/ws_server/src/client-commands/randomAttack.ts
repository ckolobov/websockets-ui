import { roomsDb } from '../database/rooms.js';
import { RandomAttackRequestMessage } from '../types.js';

export const randomAttack = (
  requestMessage: RandomAttackRequestMessage,
): {
  hit: boolean;
  sunk: boolean;
  gameOver: boolean;
  roomId: string;
  shipCells?: { x: number; y: number }[];
  x: number;
  y: number;
} | null => {
  try {
    const { indexPlayer } = requestMessage.data;
    const playerId = String(indexPlayer);
    if (!playerId) {
      throw new Error('Random cannot be done. Player ID is empty');
    }

    const room = roomsDb.getRoomByPlayerId(playerId);
    if (!room) {
      throw new Error('Random attack cannot be done. Room not found');
    }

    const result = room.randomAttack(playerId);
    if (!result) {
      throw new Error('Random attack is not successful');
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
