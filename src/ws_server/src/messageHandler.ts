import { MessageType, isMessageType } from './types.js';
import { parseRequestMessage } from './utils/parseRequestMessage.js';
import { register } from './actions/register.js';

export const messageHandler = (message: string): string => {
  try {
    console.log(`Received message: ${message}`);

    const parsedMessage = parseRequestMessage(message);

    if (!parsedMessage?.type || !isMessageType(parsedMessage.type)) {
      console.log(`Unknown message type: ${parsedMessage?.type}`);
      return JSON.stringify('Unknown message type');
    }

    switch (parsedMessage.type) {
      case MessageType.Registration: {
        return register(parsedMessage);
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
    return JSON.stringify('Unknown WebSocket Server error');
  }
};
