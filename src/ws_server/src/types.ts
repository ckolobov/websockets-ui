import { ShipType } from './models/types.js';

export enum ClientMessageType {
  Registration = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  Attack = 'attack',
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

export interface AddUserToRoomRequestMessage {
  type: ClientMessageType.AddUserToRoom;
  data: {
    indexRoom: number | string;
  };
  id: 0;
}

interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface AddShipsRequestMessage {
  type: ClientMessageType.AddShips;
  data: {
    gameId: number | string;
    ships: Ship[];
    indexPlayer: number | string;
  };
  id: 0;
}

export interface AttackRequestMessage {
  type: ClientMessageType.Attack;
  data: {
    gameId: number | string;
    x: number;
    y: number;
    indexPlayer: number | string; // id of the player in the current game session
  };
  id: 0;
}

export type RequestMessage =
  | RegisterRequestMessage
  | CreateRoomRequestMessage
  | AddUserToRoomRequestMessage
  | AddShipsRequestMessage
  | AttackRequestMessage;

export enum ServerMessageType {
  UpdateWinners = 'update_winners',
  UpdateRoom = 'update_room',
  CreateGame = 'create_game',
  StartGame = 'start_game',
  Turn = 'turn',
  Attack = 'attack',
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

export interface CreateGameServerMessage {
  type: ServerMessageType.CreateGame;
  data: {
    idGame: number | string;
    idPlayer: number | string;
  };
  id: 0;
}

export interface StartGameServerMessage {
  type: ServerMessageType.StartGame;
  data: {
    ships: Ship[];
    currentPlayerIndex: number | string;
  };
  id: 0;
}

export interface TurnServerMessage {
  type: ServerMessageType.Turn;
  data: {
    currentPlayer: number | string; // id of the player in the current game session
  };
  id: 0;
}

export enum AttackStatus {
  Miss = 'miss',
  Killed = 'killed',
  Shot = 'shot',
}

export interface AttackServerMessage {
  type: ServerMessageType.Attack;
  data: {
    position: {
      x: number;
      y: number;
    };
    currentPlayer: number | string; // id of the player in the current game session
    status: AttackStatus;
  };
  id: 0;
}

export type ResponseMessage =
  | RegisterResponseMessage
  | UpdateWinnersServerMessage
  | UpdateRoomServerMessage
  | CreateGameServerMessage
  | StartGameServerMessage
  | TurnServerMessage
  | AttackServerMessage;
