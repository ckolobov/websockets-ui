import { roomsDb } from '../database/rooms.js';
import { AddUserToRoomRequestMessage } from '../types.js';

type RoomId = string;

export const addUserToRoom = (
  requestMessage: AddUserToRoomRequestMessage,
  playerId: string | null,
): RoomId | null => {
  try {
    if (!playerId) {
      throw new Error('Player is not added to room. Player ID is empty');
    }

    const { indexRoom: roomId } = requestMessage.data;

    const room = roomsDb.joinRoom(String(roomId), playerId);

    return room.getId();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown server error');
    }

    return null;
  }
};
