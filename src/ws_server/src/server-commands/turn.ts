import { roomsDb } from '../database/rooms.js';
import { playerConnectionsDb } from '../database/playerConnections.js';
import { PlayerInRoom } from '../models/Room.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { ServerMessageType, TurnServerMessage } from '../types.js';

export const turn = (roomId: string) => {
  const room = roomsDb.getRoomById(roomId);
  if (!room) {
    console.error('Cannot send turn. Room not found.');
    return;
  }

  const players: PlayerInRoom[] = room.getPlayers().filter((player) => player !== null);
  if (players.length < 2) {
    console.error('Cannot send turn. Not enough players in the room.');
    return;
  }

  const currentPlayerId = room.getCurrentTurn();
  if (currentPlayerId === null) {
    console.error('Cannot send turn. Current turn is undefined.');
    return;
  }

  players.forEach((playerInRoom) => {
    const playerId = playerInRoom.playerId;
    const wsConnection = playerConnectionsDb.getPlayerConnection(playerId);

    if (!wsConnection) {
      console.error(`Not found connection for player ${playerId}`);
      return;
    }

    const turnServerMessage: TurnServerMessage = {
      type: ServerMessageType.Turn,
      data: {
        currentPlayer: currentPlayerId,
      },
      id: 0,
    };

    wsConnection.send(makeResponseMessageString(turnServerMessage));
  });
};
