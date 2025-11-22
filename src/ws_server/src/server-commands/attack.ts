import { roomsDb } from '../database/rooms.js';
import { PlayerInRoom } from '../models/Room.js';
import { AttackStatus } from '../types.js';
import { turn } from './turn.js';
import { finish } from './finish.js';
import { getAttackStatus } from '../utils/getAttackStatus.js';
import { sendAttackMessage } from '../utils/sendAttackMessage.js';
import { botAttack } from './botAttack.js';

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

  console.log(
    `Player ${currentPlayerId} in room ${roomId} attacked cell { x: ${x}, y: ${y} } with result ${attackStatus}`,
  );
  if (attackStatus === AttackStatus.Miss) {
    room.switchTurn();
  }

  sendAttackMessage({
    players: playersToInform.map((player) => player.playerId),
    x,
    y,
    currentPlayerId,
    attackStatus,
    roomId,
  });
  turn(roomId);

  if (attackStatus === AttackStatus.Miss) {
    botAttack(roomId);
  }

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
                roomId,
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
    finish({ roomId, botWin: false });
  }
};
