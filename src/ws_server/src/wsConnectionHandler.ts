import { IncomingMessage } from 'node:http';
import { WebSocket } from 'ws';
import { MessageType, isMessageType } from './types.js';
import { parseRequestMessage } from './utils/parseRequestMessage.js';
import { register } from './client-commands/register.js';
import { createRoom } from './client-commands/createRoom.js';
import { updateRoom } from './server-commands/updateRoom.js';
import { updateWinners } from './server-commands/updateWinners.js';

export const wsConnectionHandler = (ws: WebSocket, request: IncomingMessage) => {
  const clientIp = request.socket.remoteAddress;
  console.log(`New client connected from ${clientIp}`);
  let playerId: string | null = null;

  ws.on('message', (message: string) => {
    try {
      console.log(`Received message: ${message}`);

      const parsedMessage = parseRequestMessage(message);

      if (!parsedMessage?.type || !isMessageType(parsedMessage.type)) {
        console.log(`Unknown message type: ${parsedMessage?.type}`);
        return JSON.stringify('Unknown message type');
      }

      switch (parsedMessage.type) {
        case MessageType.Registration: {
          const [response, newPlayerId] = register(parsedMessage);
          playerId = newPlayerId;
          ws.send(response);
          if (playerId) {
            updateRoom();
            updateWinners();
          }
          break;
        }
        case MessageType.CreateRoom: {
          const success = createRoom(playerId);
          if (success) {
            updateRoom();
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
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });
};
