import { GameBoard, CellStatus, ShipParameters, ShipDirection, ShipType } from './types.js';
import { Ship } from './Ship.js';

const SHIP_TYPE_LENGTH_MAPPING: Record<number, ShipType> = {
  1: ShipType.Small,
  2: ShipType.Medium,
  3: ShipType.Large,
  4: ShipType.Huge,
};

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

    const size = this.getSize();

    // Check bounds
    if (direction === ShipDirection.Horizontal && x + length > size) return false;
    if (direction !== ShipDirection.Horizontal && y + length > size) return false;

    // Check ship and surrounding cells to avoid touching
    for (let i = -1; i <= length; i++) {
      for (let j = -1; j <= 1; j++) {
        const xi = x + (direction === ShipDirection.Horizontal ? i : j);
        const yi = y + (direction === ShipDirection.Horizontal ? j : i);

        if (xi >= 0 && xi < size && yi >= 0 && yi < size) {
          if (this.grid[yi][xi] !== CellStatus.Empty) return false;
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

  generateShips() {
    const size = this.getSize();
    const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    for (let shipLength of ships) {
      let placed = false;

      while (!placed) {
        // Randomly choose direction
        const direction = Math.random() < 0.5 ? ShipDirection.Horizontal : ShipDirection.Vertical;

        // Randomly choose starting position
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);

        const newShipParameters: ShipParameters = {
          position: { x, y },
          length: shipLength,
          direction,
          type: SHIP_TYPE_LENGTH_MAPPING[shipLength],
        };

        // 3. Check if the ship fits and doesn’t overlap
        if (this.isValidShipPosition(newShipParameters)) {
          // 4. Place the ship
          this.addShip(newShipParameters);
          placed = true;
        }
      }
    }
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

  private getNotAttackedCells(): { x: number; y: number }[] {
    const result = [];

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (this.grid[y][x] !== CellStatus.Miss && this.grid[y][x] !== CellStatus.Hit) {
          result.push({ x, y });
        }
      }
    }

    return result;
  }

  getRandomNotAttackedCell(): { x: number; y: number } {
    const emptyCells = this.getNotAttackedCells();
    const randomIndex = Math.floor(Math.random() * emptyCells.length);

    return emptyCells[randomIndex];
  }
}
