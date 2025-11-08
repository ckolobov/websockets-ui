export enum MessageType {
  Registration = 'reg',
}

export const isMessageType = (messageType: unknown): messageType is MessageType =>
  typeof messageType === 'string' &&
  Object.values(MessageType).includes(messageType as MessageType);

export interface RequestMessageObject {
  type: MessageType.Registration;
  data: string;
  id: 0;
}

export type RequestMessage = {
  type: MessageType.Registration;
  data: {
    name?: string;
    password?: string;
  };
  id: 0;
};

export type ResponseMessage = {
  type: MessageType.Registration;
  data: {
    name: string;
    index: number | string;
    error: boolean;
    errorText: string;
  };
  id: 0;
};
