// Game Board Types
export enum CellStatus {
  Empty = 0,
  Ship = 1,
  Miss = 2,
  Hit = 3,
}

export type Cell = CellStatus;
export type GameBoard = Cell[][];

// Ship Types
export interface ShipPosition {
  x: number;
  y: number;
}

export enum ShipDirection {
  Horizontal,
  Vertical,
}

export enum ShipType {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge',
}

export interface ShipParameters {
  position: ShipPosition;
  direction: ShipDirection;
  length: number;
  type: ShipType;
}
