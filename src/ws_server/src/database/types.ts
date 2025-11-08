// Player Types
export interface Player {
  id: string;
  name: string;
  password: string;
}

export interface PlayerData {
  name: string;
  password: string;
}

// Game Board Types
export enum CellStatus {
  Empty = 0,
  Ship = 1,
  Miss = 2,
  Hit = 3,
}

export type Cell = CellStatus;
export type GameBoard = Cell[][];

export interface ShipPosition {
  x: number;
  y: number;
  length: number;
  direction: 'horizontal' | 'vertical';
}

export interface Ship {
  position: ShipPosition;
  hits: number;
  isSunk: boolean;
}

export interface PlayerRoomData {
  playerId: string;
  board: GameBoard;
  ships: Ship[];
  ready: boolean;
}

export interface Room {
  id: string;
  players: [PlayerRoomData, PlayerRoomData | null];
  gameStarted: boolean;
  currentTurn: string | null; // playerId whose turn it is
  createdAt: Date;
}
