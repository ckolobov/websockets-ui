import { roomsDb } from '../database/rooms.js';

export const createRoom = (playerId: string | null): boolean => {
  if (!playerId) {
    console.log('Room is not created. Player ID is empty');
    return false;
  }

  return roomsDb.createRoom(playerId);
};
