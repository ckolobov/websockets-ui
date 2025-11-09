export enum ClientMessageType {
  Registration = 'reg',
  CreateRoom = 'create_room',
}

export const isClientMessageType = (messageType: unknown): messageType is ClientMessageType =>
  typeof messageType === 'string' &&
  Object.values(ClientMessageType).includes(messageType as ClientMessageType);

export interface RequestMessageObject {
  type: ClientMessageType.Registration | ClientMessageType.CreateRoom;
  data: string;
  id: 0;
}

export interface RegisterRequestMessage {
  type: ClientMessageType.Registration;
  data: {
    name?: string;
    password?: string;
  };
  id: 0;
}

export interface CreateRoomRequestMessage {
  type: ClientMessageType.CreateRoom;
  data: null;
  id: 0;
}

export type RequestMessage = RegisterRequestMessage | CreateRoomRequestMessage;

export enum ServerMessageType {
  UpdateWinners = 'update_winners',
  UpdateRoom = 'update_room',
}

export interface RegisterResponseMessage {
  type: ClientMessageType.Registration;
  data: {
    name: string;
    index: number | string;
    error: boolean;
    errorText: string;
  };
  id: 0;
}

interface Winner {
  name: string;
  wins: number;
}

export interface UpdateWinnersServerMessage {
  type: ServerMessageType.UpdateWinners;
  data: Winner[];
  id: 0;
}

interface RoomUser {
  name: string;
  index: string | number;
}

interface Room {
  roomId: string | number;
  roomUsers: RoomUser[];
}

export interface UpdateRoomServerMessage {
  type: ServerMessageType.UpdateRoom;
  data: Room[];
  id: 0;
}

export type ResponseMessage =
  | RegisterResponseMessage
  | UpdateWinnersServerMessage
  | UpdateRoomServerMessage;
