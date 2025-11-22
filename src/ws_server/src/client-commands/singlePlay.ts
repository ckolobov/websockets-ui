import { roomsDb } from '../database/rooms.js';

export const singlePlay = (playerId: string | null): string | null => {
  try {
    if (!playerId) {
      console.log('Single play is not created. Player ID is empty');
      return null;
    }

    const existingRoom = roomsDb.getRoomByPlayerId(playerId);
    if (existingRoom) {
      if (existingRoom.getGameCreated()) {
        console.log(
          `Cannot start single play for player ${playerId}. The player is already in game in room ${existingRoom.getId()}`,
        );
        return null;
      }

      roomsDb.deleteRoom(existingRoom.getId());
    }

    const roomCreated = roomsDb.createRoom(playerId);
    if (!roomCreated) {
      console.log(`Cannot start single play for player ${playerId}. Failed to created a new room.`);
      return null;
    }

    const newRoom = roomsDb.getRoomByPlayerId(playerId);
    if (!newRoom) {
      return null;
    }

    const room = roomsDb.addBot(newRoom.getId());

    return room.getId();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown server error');
    }

    return null;
  }
};
