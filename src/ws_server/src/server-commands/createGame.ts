import { roomsDb } from '../database/rooms.js';
import { playerConnectionsDb } from '../database/playerConnections.js';
import { PlayerInRoom } from '../models/Room.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { ServerMessageType } from '../types.js';

export const createGame = (roomId: string) => {
  const room = roomsDb.getRoomById(roomId);
  if (!room) {
    console.error('Game is not created. Room not found.');
    return;
  }

  const players = room.getPlayers().filter((player) => player !== null);
  if (players.length < 2) {
    console.error('Game is not created. Not enough players in the room.');
    return;
  }

  room.createGame();

  const playersToInform: PlayerInRoom[] = room.getRealPlayers();

  playersToInform.forEach((playerInRoom) => {
    const playerId = playerInRoom.playerId;
    const wsConnection = playerConnectionsDb.getPlayerConnection(playerId);

    if (!wsConnection) {
      console.error(`Not found connection for player ${playerId}`);
      return;
    }

    const createGameMessage = makeResponseMessageString({
      type: ServerMessageType.CreateGame,
      data: {
        idGame: roomId,
        idPlayer: playerId,
      },
      id: 0,
    });

    wsConnection.send(createGameMessage);
  });
};
