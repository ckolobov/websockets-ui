import { ShipPosition, ShipDirection, ShipParameters } from './types.js';

export class Ship {
  private position: ShipPosition;
  private hits: number;
  private isSunk: boolean;
  private length: number;
  private direction: ShipDirection;

  constructor(shipParameters: ShipParameters) {
    this.length = shipParameters.length;
    this.position = shipParameters.position;
    this.direction = shipParameters.direction;
    this.hits = 0;
    this.isSunk = false;
  }

  getPosition(): ShipPosition {
    return this.position;
  }

  getHits(): number {
    return this.hits;
  }

  getIsSunk(): boolean {
    return this.isSunk;
  }

  getLength(): number {
    return this.length;
  }

  registerHit(): void {
    if (this.isSunk) {
      return;
    }

    this.hits++;

    if (this.hits >= this.length) {
      this.isSunk = true;
    }
  }

  occupiesCell(x: number, y: number): boolean {
    const { x: shipX, y: shipY } = this.position;
    const length = this.length;
    const direction = this.direction;

    if (direction === ShipDirection.Horizontal) {
      return y === shipY && x >= shipX && x < shipX + length;
    } else {
      return x === shipX && y >= shipY && y < shipY + length;
    }
  }

  getCells(): Array<{ x: number; y: number }> {
    const cells: Array<{ x: number; y: number }> = [];
    const { x, y } = this.position;
    const direction = this.direction;
    const length = this.length;

    if (direction === ShipDirection.Horizontal) {
      for (let i = 0; i < length; i++) {
        cells.push({ x: x + i, y });
      }
    } else {
      for (let i = 0; i < length; i++) {
        cells.push({ x, y: y + i });
      }
    }

    return cells;
  }
}
