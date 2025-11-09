import { GameBoard, CellStatus, ShipParameters, ShipDirection } from './types.js';
import { Ship } from './Ship.js';

export class Board {
  private grid: GameBoard;
  private ships: Ship[];
  private readonly size: number = 10;

  constructor() {
    this.grid = this.createEmptyGrid();
    this.ships = [];
  }

  private createEmptyGrid(): GameBoard {
    return Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => CellStatus.Empty),
    );
  }

  getGrid(): GameBoard {
    return this.grid;
  }

  getShips(): Ship[] {
    return this.ships;
  }

  getSize(): number {
    return this.size;
  }

  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  isValidShipPosition(shipParameters: ShipParameters): boolean {
    const {
      position: { x, y },
      length,
      direction,
    } = shipParameters;

    // Check if ship is within bounds
    if (!this.isValidPosition(x, y)) {
      return false;
    }

    if (direction === ShipDirection.Horizontal) {
      if (x + length > this.size) {
        return false;
      }
      // Check if all cells are empty
      for (let i = 0; i < length; i++) {
        if (this.grid[y][x + i] !== CellStatus.Empty) {
          return false;
        }
      }
    } else {
      if (y + length > this.size) {
        return false;
      }
      // Check if all cells are empty
      for (let i = 0; i < length; i++) {
        if (this.grid[y + i][x] !== CellStatus.Empty) {
          return false;
        }
      }
    }

    return true;
  }

  addShip(shipParameters: ShipParameters): boolean {
    if (!this.isValidShipPosition(shipParameters)) {
      return false;
    }

    const ship = new Ship(shipParameters);
    this.ships.push(ship);

    // Place ship on the grid
    const cells = ship.getCells();
    for (const cell of cells) {
      this.grid[cell.y][cell.x] = CellStatus.Ship;
    }

    return true;
  }

  getCellStatus(x: number, y: number): CellStatus | null {
    if (!this.isValidPosition(x, y)) {
      return null;
    }
    return this.grid[y][x];
  }

  setCellStatus(x: number, y: number, status: CellStatus): boolean {
    if (!this.isValidPosition(x, y)) {
      return false;
    }
    this.grid[y][x] = status;
    return true;
  }

  attack(x: number, y: number): { hit: boolean; sunk: boolean; ship?: Ship } {
    if (!this.isValidPosition(x, y)) {
      throw new Error(`Invalid attack position: (${x}, ${y})`);
    }

    const cellStatus = this.grid[y][x];

    // If already attacked
    if (cellStatus === CellStatus.Hit || cellStatus === CellStatus.Miss) {
      throw new Error(`Cell (${x}, ${y}) already attacked`);
    }

    // Check if there's a ship at this position
    const ship = this.ships.find((s) => s.occupiesCell(x, y));

    if (ship) {
      // Hit!
      ship.registerHit();
      this.grid[y][x] = CellStatus.Hit;
      return { hit: true, sunk: ship.getIsSunk(), ship };
    } else {
      // Miss
      this.grid[y][x] = CellStatus.Miss;
      return { hit: false, sunk: false };
    }
  }

  areAllShipsSunk(): boolean {
    return this.ships.length > 0 && this.ships.every((ship) => ship.getIsSunk());
  }

  getShipCount(): number {
    return this.ships.length;
  }

  getSunkShipCount(): number {
    return this.ships.filter((ship) => ship.getIsSunk()).length;
  }

  clear(): void {
    this.grid = this.createEmptyGrid();
    this.ships = [];
  }

  private getEmptyCells(): { x: number; y: number }[] {
    const result = [];

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (this.grid[x][y] === CellStatus.Empty) {
          result.push({ x, y });
        }
      }
    }

    return result;
  }

  getRandomEmptyCell(): { x: number; y: number } {
    const emptyCells = this.getEmptyCells();
    const randomIndex = Math.floor(Math.random() * emptyCells.length);

    return emptyCells[randomIndex];
  }
}
