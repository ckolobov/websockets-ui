export enum MessageType {
  Registration = 'reg',
  CreateRoom = 'create_room',
}

export const isMessageType = (messageType: unknown): messageType is MessageType =>
  typeof messageType === 'string' &&
  Object.values(MessageType).includes(messageType as MessageType);

export interface RequestMessageObject {
  type: MessageType.Registration | MessageType.CreateRoom;
  data: string;
  id: 0;
}

export interface RegisterRequestMessage {
  type: MessageType.Registration;
  data: {
    name?: string;
    password?: string;
  };
  id: 0;
}

export interface CreateRoomRequestMessage {
  type: MessageType.CreateRoom;
  data: null;
  id: 0;
}

export type RequestMessage = RegisterRequestMessage | CreateRoomRequestMessage;

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
