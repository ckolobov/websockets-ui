import { roomsDb } from '../database/rooms.js';
import { playerConnectionsDb } from '../database/playerConnections.js';
import { PlayerInRoom } from '../models/Room.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { FinishServerMessage, ServerMessageType } from '../types.js';
import { winnersDb } from '../database/winners.js';
import { updateWinners } from './updateWinners.js';

interface FinishParams {
  roomId: string;
  botWin: boolean;
}

export const finish = ({ roomId, botWin }: FinishParams) => {
  const room = roomsDb.getRoomById(roomId);
  if (!room) {
    console.error('Cannot finish game. Room not found.');
    return;
  }

  const winner = room.getCurrentTurn();
  if (winner === null) {
    console.error('Cannot finish game. Winner is undefined.');
    return;
  }

  if (!botWin) {
    winnersDb.addWin(winner);
  }

  const playersToInform: PlayerInRoom[] = room.getRealPlayers();

  playersToInform.forEach((playerInRoom) => {
    const playerId = playerInRoom.playerId;
    const wsConnection = playerConnectionsDb.getPlayerConnection(playerId);

    if (!wsConnection) {
      console.error(`Not found connection for player ${playerId}`);
      return;
    }

    const finishServerMessage: FinishServerMessage = {
      type: ServerMessageType.Finish,
      data: {
        winPlayer: winner,
      },
      id: 0,
    };

    console.log(`Info about game finish sent to ${playerId}`);
    wsConnection.send(makeResponseMessageString(finishServerMessage));
  });

  roomsDb.deleteRoom(roomId);

  updateWinners();
};
