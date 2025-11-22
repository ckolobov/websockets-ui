import { ResponseMessage } from '../types.js';

export const makeResponseMessageString = (message: ResponseMessage): string => {
  const messageData = JSON.stringify(message.data);
  return JSON.stringify({
    type: message.type,
    id: message.id,
    data: messageData,
  });
};
