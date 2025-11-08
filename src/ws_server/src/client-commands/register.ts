import { RegisterRequestMessage, ResponseMessage, MessageType } from '../types.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { playersDb } from '../database/players.js';

type Response = string;
type NewPlayerId = string | null;

export const register = (requestMessage: RegisterRequestMessage): [Response, NewPlayerId] => {
  const { name, password } = requestMessage.data;
  if (!name || !password) {
    console.error('Invalid registration data');
    const errorResponse: ResponseMessage = {
      type: MessageType.Registration,
      data: {
        name: name ?? '',
        index: '',
        error: true,
        errorText: 'Invalid registration data',
      },
      id: 0,
    };
    return [makeResponseMessageString(errorResponse), null];
  }
  const newPlayer = playersDb.createPlayer({ name, password });
  const errorResponse: ResponseMessage = {
    type: MessageType.Registration,
    data: {
      name: name,
      index: newPlayer.id,
      error: false,
      errorText: '',
    },
    id: 0,
  };
  return [makeResponseMessageString(errorResponse), newPlayer.id];
};
