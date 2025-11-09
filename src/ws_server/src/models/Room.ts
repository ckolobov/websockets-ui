import { randomUUID } from 'crypto';
import { Board } from './Board.js';
import { ShipParameters } from './types.js';

export interface PlayerInRoom {
  playerId: string;
  board: Board;
  ready: boolean;
}

export class Room {
  private id: string;
  private players: [PlayerInRoom, PlayerInRoom | null];
  private gameStarted: boolean;
  private currentTurn: string | null;
  private createdAt: Date;

  constructor(creatorPlayerId: string) {
    this.id = randomUUID();
    this.players = [this.createPlayerInRoom(creatorPlayerId), null];
    this.gameStarted = false;
    this.currentTurn = null;
    this.createdAt = new Date();
  }

  private createPlayerInRoom(playerId: string): PlayerInRoom {
    return {
      playerId,
      board: new Board(),
      ready: false,
    };
  }

  getId(): string {
    return this.id;
  }

  getPlayers(): [PlayerInRoom, PlayerInRoom | null] {
    return this.players;
  }

  getGameStarted(): boolean {
    return this.gameStarted;
  }

  getCurrentTurn(): string | null {
    return this.currentTurn;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isFull(): boolean {
    return this.players[1] !== null;
  }

  isEmpty(): boolean {
    return this.players[0] === null;
  }

  hasPlayer(playerId: string): boolean {
    return this.players[0]?.playerId === playerId || this.players[1]?.playerId === playerId;
  }

  getPlayer(playerId: string): PlayerInRoom | null {
    if (this.players[0]?.playerId === playerId) {
      return this.players[0];
    }
    if (this.players[1]?.playerId === playerId) {
      return this.players[1];
    }
    return null;
  }

  getPlayerOpponent(playerId: string): PlayerInRoom | null {
    if (this.players[0]?.playerId === playerId) {
      return this.players[1];
    }
    if (this.players[1]?.playerId === playerId) {
      return this.players[0];
    }
    return null;
  }

  addPlayer(playerId: string): boolean {
    if (this.isFull()) {
      console.error(`Room ${this.id} is full`);
      return false;
    }

    if (this.hasPlayer(playerId)) {
      console.error(`Player ${playerId} is already in room ${this.id}`);
      return false;
    }

    this.players[1] = this.createPlayerInRoom(playerId);
    console.log(`Player ${playerId} joined room ${this.id}`);
    return true;
  }

  setPlayerReady(playerId: string, ready: boolean): void {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in room ${this.id}`);
    }

    player.ready = ready;
    console.log(`Player ${playerId} ready status set to ${ready} in room ${this.id}`);

    // Check if both players are ready to start the game
    if (this.players[0]?.ready && this.players[1]?.ready && !this.gameStarted) {
      this.startGame();
    }
  }

  private startGame(): void {
    this.gameStarted = true;
    this.currentTurn = this.players[0].playerId; // First player starts
    console.log(`Game started in room ${this.id}`);
  }

  addShip(playerId: string, shipParameters: ShipParameters): void {
    const player = this.getPlayer(playerId);
    if (!player) {
      console.error(`Player ${playerId} not found in room ${this.id}`);
      return;
    }

    if (this.gameStarted) {
      console.error(`Cannot add ships after game has started in room ${this.id}`);
      return;
    }

    const success = player.board.addShip(shipParameters);
    if (success) {
      console.log(
        `Ship added for player ${playerId} at (${shipParameters.position.x}, ${shipParameters.position.y}) in room ${this.id}`,
      );
    } else {
      console.error(`Failed to add ship for player ${playerId} in room ${this.id}`);
    }
  }

  getShipsByPlayerId(playerId: string): ShipParameters[] {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in room ${this.id}`);
    }

    const playerShips = player.board.getShips();

    return playerShips.map((ship) => ({
      position: ship.getPosition(),
      length: ship.getLength(),
      direction: ship.getDirection(),
      type: ship.getType(),
    }));
  }

  attack(
    attackerId: string,
    x: number,
    y: number,
  ): {
    hit: boolean;
    sunk: boolean;
    gameOver: boolean;
    shipCells?: { x: number; y: number }[];
  } | null {
    if (!this.gameStarted) {
      console.error(`Game has not started in room ${this.id}`);
      return null;
    }

    if (this.currentTurn !== attackerId) {
      console.error(`Not player ${attackerId}'s turn in room ${this.id}`);
      return null;
    }

    const opponent = this.getPlayerOpponent(attackerId);
    if (!opponent) {
      console.error(`Opponent not found for player ${attackerId} in room ${this.id}`);
      return null;
    }

    const result = opponent.board.attack(x, y);
    const gameOver = opponent.board.areAllShipsSunk();

    return {
      hit: result.hit,
      sunk: result.sunk,
      gameOver,
      shipCells: result.ship?.getCells(),
    };
  }

  switchTurn() {
    const currentTurn = this.currentTurn;
    if (!currentTurn) {
      return;
    }

    const opponent = this.getPlayerOpponent(currentTurn);
    if (!opponent) {
      return;
    }

    this.currentTurn = opponent.playerId;
  }

  randomAttack(attackerId: string): {
    hit: boolean;
    sunk: boolean;
    gameOver: boolean;
    shipCells?: { x: number; y: number }[];
    x: number;
    y: number;
  } | null {
    const opponent = this.getPlayerOpponent(attackerId);
    if (!opponent) {
      console.error(`Opponent not found for player ${attackerId} in room ${this.id}`);
      return null;
    }

    const { x, y } = opponent.board.getRandomEmptyCell();

    const result = this.attack(attackerId, x, y);

    if (!result) {
      return null;
    }

    return {
      ...result,
      x,
      y,
    };
  }
}
