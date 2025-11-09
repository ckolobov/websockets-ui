class Winners {
  private playerWins: Map<string, number> = new Map();

  addPlayer(playerId: string) {
    if (!this.playerWins.has(playerId)) {
      this.playerWins.set(playerId, 0);
    }
  }

  addWin(playerId: string) {
    const currentWins = this.playerWins.get(playerId);
    if (currentWins === undefined) {
      throw new Error('Cannot add win to unregistered player. Add player first.');
    }
    this.playerWins.set(playerId, currentWins + 1);
  }

  getPlayerWinsCount(playerId: string) {
    return this.playerWins.get(playerId) || 0;
  }
}

export const winnersDb = new Winners();
