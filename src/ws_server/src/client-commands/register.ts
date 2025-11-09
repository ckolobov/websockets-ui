import { RegisterRequestMessage, ResponseMessage, ClientMessageType } from '../types.js';
import { makeResponseMessageString } from '../utils/makeResponseMessageString.js';
import { playersDb } from '../database/players.js';

type Response = string;
type NewPlayerId = string | null;

export const register = (requestMessage: RegisterRequestMessage): [Response, NewPlayerId] => {
  try {
    const { name, password } = requestMessage.data;
    if (!name || !password) {
      throw new Error('Invalid registration data');
    }
    const newPlayer = playersDb.createPlayer({ name, password });
    const response: ResponseMessage = {
      type: ClientMessageType.Registration,
      data: {
        name: name,
        index: newPlayer.id,
        error: false,
        errorText: '',
      },
      id: 0,
    };
    return [makeResponseMessageString(response), newPlayer.id];
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      const errorResponse: ResponseMessage = {
        type: ClientMessageType.Registration,
        data: {
          name: '',
          index: '',
          error: true,
          errorText: error.message,
        },
        id: 0,
      };
      return [makeResponseMessageString(errorResponse), null];
    }
    return ['Unknown server error', null];
  }
};
