import type { GameEngine } from ".";
import { StreetGroup } from "./static-data";
import type { StreetBoardTileState } from "./tiles/street-tile";

export class Player {
  readonly id: string;
  name: string;
  /** The tile the player is currently on. */
  tileId: number = 0;
  /** Number of turns remaining in jail. */
  jailTurnsRemaining: number = 0;
  /** How much money the player has. */
  balance: number = 1500;
  /** Number of "Get Out of Jail Free" cards currently held. */
  getOutOfJailFreeCards: number = 0;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  /** Runs this player's decisions ahead of their turn, before they roll the dice. */
  takeTurn(engine: GameEngine) {
    this.buyHouses(engine);
  }

  /**
   * Keeps building houses for as long as the player can afford it: always on the
   * highest-rent eligible property first, kept evenly distributed within each
   * street (Monopoly's even-build rule — a property can only get its next house
   * once every other property in its group has caught up to the same count).
   */
  private buyHouses(engine: GameEngine) {
    let target = this.nextHousePurchase(engine);
    while (target && this.balance >= target.props.houseCost) {
      this.balance -= target.props.houseCost;
      target.houseCount += 1;
      target = this.nextHousePurchase(engine);
    }
  }

  private nextHousePurchase(engine: GameEngine): StreetBoardTileState | null {
    const monopolizedGroups = Object.values(StreetGroup).filter((group) =>
      engine.getStreet(group).every((tile) => tile.owner === this),
    );

    let best: StreetBoardTileState | null = null;
    for (const group of monopolizedGroups) {
      const siblings = engine.getStreet(group);
      const minHouses = Math.min(...siblings.map((tile) => tile.houseCount));

      for (const tile of siblings) {
        if (tile.houseCount !== minHouses || tile.houseCount >= 5) continue;
        if (!best || tile.rent > best.rent) {
          best = tile;
        }
      }
    }
    return best;
  }
}
