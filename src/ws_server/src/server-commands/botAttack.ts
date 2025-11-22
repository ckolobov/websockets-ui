import { roomsDb } from '../database/rooms.js';
import { PlayerInRoom } from '../models/Room.js';
import { AttackStatus } from '../types.js';
import { turn } from './turn.js';
import { finish } from './finish.js';
import { getAttackStatus } from '../utils/getAttackStatus.js';
import { sendAttackMessage } from '../utils/sendAttackMessage.js';

export const botAttack = (roomId: string) => {
  const room = roomsDb.getRoomById(roomId);
  if (!room) {
    console.error('Bot cannot attack. Room not found.');
    return;
  }

  const players = room.getPlayers().filter((player) => player !== null);
  if (players.length < 2) {
    console.error('Bot cannot attack. Not enough players in the room.');
    return;
  }

  const currentPlayerId = room.getCurrentTurn();
  if (currentPlayerId === null) {
    console.error('Bot cannot attack. Current turn is undefined.');
    return;
  }

  console.log(`Bot tries random attack in room ${roomId}`);
  const botAttackResult = room.randomAttack(currentPlayerId);
  if (botAttackResult === null) {
    console.error('Bot attack is not successful.');
    return;
  }

  const { x, y, hit, sunk, gameOver, shipCells } = botAttackResult;

  const attackStatus = getAttackStatus({ hit, sunk });

  console.log(
    `Bot in room ${roomId} attacked cell { x: ${x}, y: ${y} } with result ${attackStatus}`,
  );

  if (attackStatus === AttackStatus.Miss) {
    room.switchTurn();
  }

  const playersToInform: PlayerInRoom[] = room.getRealPlayers();

  sendAttackMessage({
    players: playersToInform.map((player) => player.playerId),
    x,
    y,
    currentPlayerId,
    attackStatus,
    roomId,
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
    finish({ roomId, botWin: true });
  }

  if (attackStatus !== AttackStatus.Miss) {
    botAttack(roomId);
  }
};
