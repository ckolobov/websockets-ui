import { roomsDb } from '../database/rooms.js';
import { playerConnectionsDb } from '../database/playerConnections.js';
import { PlayerInRoom } from '../models/Room.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { ServerMessageType } from '../types.js';
import { ShipDirection } from '../models/types.js';

export const startGame = (roomId: string) => {
  const room = roomsDb.getRoomById(roomId);
  if (!room) {
    console.error('Game is not created. Room not found.');
    return;
  }

  const players = room.getPlayers().filter((player) => player !== null);
  if (players.length < 2) {
    console.error('Cannot start the game. Not enough players in the room.');
    return;
  }

  const playersToInform: PlayerInRoom[] = room.getRealPlayers();

  playersToInform.forEach((playerInRoom) => {
    const playerId = playerInRoom.playerId;
    const playerShipParameters = roomsDb.getShips(playerId);
    const playerShips = playerShipParameters.map((shipParameters) => ({
      ...shipParameters,
      direction: shipParameters.direction === ShipDirection.Vertical,
    }));

    const wsConnection = playerConnectionsDb.getPlayerConnection(playerId);

    if (!wsConnection) {
      console.error(`Not found connection for player ${playerId}`);
      return;
    }

    const startGameMessage = makeResponseMessageString({
      type: ServerMessageType.StartGame,
      data: {
        ships: playerShips,
        currentPlayerIndex: playerId,
      },
      id: 0,
    });

    wsConnection.send(startGameMessage);
  });
};
