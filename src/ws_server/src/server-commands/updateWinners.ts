import { playerConnectionsDb } from '../database/playerConnections.js';
import { winnersDb } from '../database/winners.js';
import { playersDb } from '../database/players.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { ServerMessageType } from '../types.js';

export const updateWinners = () => {
  const players = playersDb.getAllPlayers();

  const winners = players.map((player) => ({
    name: player.name,
    wins: winnersDb.getPlayerWinsCount(player.id),
  }));
  winners.sort((w1, w2) => w2.wins - w1.wins);

  const winnersMessage = makeResponseMessageString({
    type: ServerMessageType.UpdateWinners,
    data: winners,
    id: 0,
  });

  const connections = playerConnectionsDb.getAllConnections();

  connections.forEach((connection) => {
    const [playerId, wsConnection] = connection;
    console.log(`Winners table sent to ${playerId}`);
    wsConnection.send(winnersMessage);
  });
};
