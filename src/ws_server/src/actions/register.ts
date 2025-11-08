import { RequestMessage, ResponseMessage, MessageType } from '../types.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { db } from '../database.js';

export const register = (requestMessage: RequestMessage): string => {
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
    return makeResponseMessageString(errorResponse);
  }
  const newPlayer = db.createPlayer({ name, password });
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
  return makeResponseMessageString(errorResponse);
};
