import { playerConnectionsDb } from '../database/playerConnections.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { AttackServerMessage, AttackStatus, ServerMessageType } from '../types.js';

interface SendAttackMessageParams {
  players: string[];
  x: number;
  y: number;
  currentPlayerId: string;
  attackStatus: AttackStatus;
  roomId: string;
}

export const sendAttackMessage = ({
  players,
  x,
  y,
  currentPlayerId,
  attackStatus,
  roomId,
}: SendAttackMessageParams) => {
  players.forEach((playerId) => {
    const wsConnection = playerConnectionsDb.getPlayerConnection(playerId);

    if (!wsConnection) {
      console.error(`Not found connection for player ${playerId}`);
      return;
    }

    const attackServerMessage: AttackServerMessage = {
      type: ServerMessageType.Attack,
      data: {
        position: {
          x,
          y,
        },
        currentPlayer: currentPlayerId,
        status: attackStatus,
      },
      id: 0,
    };

    console.log(`Attack results in room ${roomId} sent to ${playerId}`);
    wsConnection.send(makeResponseMessageString(attackServerMessage));
  });
};
