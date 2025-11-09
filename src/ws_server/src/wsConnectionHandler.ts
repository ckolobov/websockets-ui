import { IncomingMessage } from 'node:http';
import { WebSocket } from 'ws';
import { ClientMessageType, isClientMessageType } from './types.js';
import { parseRequestMessage } from './utils/parseRequestMessage.js';
import { register } from './client-commands/register.js';
import { createRoom } from './client-commands/createRoom.js';
import { updateRoom } from './server-commands/updateRoom.js';
import { updateWinners } from './server-commands/updateWinners.js';
import { playerConnectionsDb } from './database/playerConnections.js';
import { winnersDb } from './database/winners.js';
import { addUserToRoom } from './client-commands/addUserToRoom.js';
import { createGame } from './server-commands/createGame.js';
import { startGame } from './server-commands/startGame.js';
import { addShips } from './client-commands/addShips.js';
import { roomsDb } from './database/rooms.js';
import { turn } from './server-commands/turn.js';
import { attack as clientAttack } from './client-commands/attack.js';
import { attack as serverAttack } from './server-commands/attack.js';

export const wsConnectionHandler = (ws: WebSocket, request: IncomingMessage) => {
  const clientIp = request.socket.remoteAddress;
  console.log(`New client connected from ${clientIp}`);
  let playerId: string | null = null;

  ws.on('message', (message: string) => {
    try {
      console.log(`Received message: ${message}`);

      const parsedMessage = parseRequestMessage(message);

      if (!parsedMessage?.type || !isClientMessageType(parsedMessage.type)) {
        console.log(`Unknown message type: ${parsedMessage?.type}`);
        return JSON.stringify('Unknown message type');
      }

      switch (parsedMessage.type) {
        case ClientMessageType.Registration: {
          const [response, registeredPlayerId] = register(parsedMessage);
          playerId = registeredPlayerId;
          ws.send(response);
          if (playerId) {
            playerConnectionsDb.addPlayerConnection(playerId, ws);
            winnersDb.addPlayer(playerId);
            updateRoom();
            updateWinners();
          }
          break;
        }
        case ClientMessageType.CreateRoom: {
          const success = createRoom(playerId);
          if (success) {
            updateRoom();
          }
          break;
        }
        case ClientMessageType.AddUserToRoom: {
          const roomId: string | null = addUserToRoom(parsedMessage, playerId);
          if (roomId) {
            updateRoom();
            createGame(roomId);
          }
          break;
        }
        case ClientMessageType.AddShips: {
          const roomId: string | null = addShips(parsedMessage);
          if (roomId && roomsDb.getRoomById(roomId)?.getGameStarted()) {
            startGame(roomId);
            turn(roomId);
          }
          break;
        }
        case ClientMessageType.Attack: {
          const { x, y } = parsedMessage.data;
          const result = clientAttack(parsedMessage);
          if (result) {
            const { roomId, sunk, gameOver, hit, shipCells } = result;
            serverAttack({ roomId, hit, sunk, gameOver, x, y, shipCells });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      return JSON.stringify('Unknown WebSocket Server error');
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${clientIp}`);
    if (playerId) {
      playerConnectionsDb.removePlayerConnection(playerId);
    }
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });
};
