import { roomsDb } from '../database/rooms.js';
import { playerConnectionsDb } from '../database/playerConnections.js';
import { PlayerInRoom } from '../models/Room.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { AttackServerMessage, AttackStatus, ServerMessageType } from '../types.js';
import { turn } from './turn.js';
import { finish } from './finish.js';

interface GetAttackStatusParams {
  hit: boolean;
  sunk: boolean;
}

const getAttackStatus = ({ hit, sunk }: GetAttackStatusParams): AttackStatus => {
  if (sunk) {
    return AttackStatus.Killed;
  }
  if (hit) {
    return AttackStatus.Shot;
  }
  return AttackStatus.Miss;
};

interface SendAttackMessageParams {
  players: string[];
  x: number;
  y: number;
  currentPlayerId: string;
  attackStatus: AttackStatus;
}

const sendAttackMessage = ({
  players,
  x,
  y,
  currentPlayerId,
  attackStatus,
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

    console.log(`Attack results sent to ${playerId}`);
    wsConnection.send(makeResponseMessageString(attackServerMessage));
  });
};

interface ServerAttackParams {
  roomId: string;
  x: number;
  y: number;
  hit: boolean;
  sunk: boolean;
  gameOver: boolean;
  shipCells?: { x: number; y: number }[];
}

export const attack = ({ roomId, x, y, hit, sunk, gameOver, shipCells }: ServerAttackParams) => {
  const room = roomsDb.getRoomById(roomId);
  if (!room) {
    console.error('Cannot attack. Room not found.');
    return;
  }

  const players = room.getPlayers().filter((player) => player !== null);
  if (players.length < 2) {
    console.error('Cannot attack. Not enough players in the room.');
    return;
  }

  const playersToInform: PlayerInRoom[] = room.getRealPlayers();

  const currentPlayerId = room.getCurrentTurn();
  if (currentPlayerId === null) {
    console.error('Cannot attack. Current turn is undefined.');
    return;
  }

  const attackStatus = getAttackStatus({ hit, sunk });

  if (attackStatus === AttackStatus.Miss) {
    room.switchTurn();
  }

  sendAttackMessage({
    players: playersToInform.map((player) => player.playerId),
    x,
    y,
    currentPlayerId,
    attackStatus,
  });
  turn(roomId);

  if (attackStatus === AttackStatus.Killed && shipCells) {
    shipCells.forEach((cell) => {
      const { x, y } = cell;

      for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
          try {
            const result = room.attack(currentPlayerId, i, j);
            if (result) {
              sendAttackMessage({
                players: playersToInform.map((player) => player.playerId),
                x: i,
                y: j,
                currentPlayerId,
                attackStatus: AttackStatus.Miss,
              });
              turn(roomId);
            }
          } catch {
            continue;
          }
        }
      }
    });
  }

  if (gameOver) {
    finish(roomId);
  }
};
