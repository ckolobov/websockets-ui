import { RequestMessage, RequestMessageObject } from '../types.js';

export const parseRequestMessage = (str: string): RequestMessage => {
  const messageObject = JSON.parse(str) as RequestMessageObject;
  const requestMessage: RequestMessage = {
    type: messageObject.type,
    data: messageObject.data ? (JSON.parse(messageObject.data) as Record<string, unknown>) : null,
    id: messageObject.id,
  } as RequestMessage;

  return requestMessage;
};
