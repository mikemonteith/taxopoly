import type { GameEngine } from ".";
import { StreetGroup } from "./static-data";
import { StreetBoardTileState } from "./tiles/street-tile";
import { OwnableBoardTileState } from "./tiles/ownable-tile";

export class Player {
  private readonly engine: GameEngine;
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

  constructor(id: string, name: string, engine: GameEngine) {
    this.id = id;
    this.name = name;
    this.engine = engine;
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

      this.engine.log(
        `Player ${this.name} bought a ${target.houseCount === 5 ? "hotel" : "house"} on ${target.props.name}`,
      );

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

  /**
   * Deducts `amount` from this player's balance. A player can never be left
   * owing money they could have raised: if this leaves them short, they must
   * first sell houses/hotels and then mortgage properties (see `raiseFunds`)
   * until they can cover it, or until there's nothing left to liquidate — at
   * which point they're simply left with a negative balance (going bankrupt
   * isn't handled yet).
   */
  pay(amount: number) {
    this.balance -= amount;
    this.raiseFunds();
  }

  /**
   * Raises cash by selling houses/hotels, then mortgaging properties, one at
   * a time, until the balance is no longer negative or there's nothing left
   * to sell/mortgage.
   */
  private raiseFunds() {
    while (this.balance < 0) {
      if (this.sellLeastValuableHouse()) continue;
      if (this.mortgageLeastValuableProperty()) continue;
      break; // Nothing left to raise — stays in debt for now.
    }
  }

  /**
   * Sells a single house/hotel back to the Bank for half its build cost,
   * taking it from whichever eligible property has the lowest rent (the
   * least valuable one), so the player's best assets are the last to go.
   * Houses must be sold evenly within a street — only a property currently
   * sitting at its group's maximum house count is eligible, mirroring the
   * even-build rule in reverse.
   */
  private sellLeastValuableHouse(): boolean {
    const groupsWithHouses = Object.values(StreetGroup).filter((group) =>
      this.engine
        .getStreet(group)
        .some((tile) => tile.owner === this && tile.houseCount > 0),
    );

    let target: StreetBoardTileState | null = null;
    for (const group of groupsWithHouses) {
      const siblings = this.engine.getStreet(group);
      const maxHouses = Math.max(...siblings.map((tile) => tile.houseCount));

      for (const tile of siblings) {
        if (tile.owner !== this) continue;
        if (tile.houseCount !== maxHouses || tile.houseCount === 0) continue;
        if (!target || tile.rent < target.rent) {
          target = tile;
        }
      }
    }
    if (!target) return false;

    const wasHotel = target.houseCount === 5;
    const refund = target.props.houseCost / 2;
    target.houseCount -= 1;
    this.balance += refund;
    this.engine.log(
      `Player ${this.name} sold a ${wasHotel ? "hotel" : "house"} on ${target.props.name} for $${refund}`,
    );
    return true;
  }

  /**
   * Mortgages the cheapest unmortgaged, house-free property this player
   * owns, in exchange for half its face value from the Bank — preserving
   * more valuable properties for as long as possible.
   */
  private mortgageLeastValuableProperty(): boolean {
    let target: OwnableBoardTileState<any> | null = null;
    for (const tile of this.engine.getState().board) {
      if (!(tile instanceof OwnableBoardTileState)) continue;
      if (tile.owner !== this || tile.mortgaged) continue;
      if (tile instanceof StreetBoardTileState && tile.houseCount > 0) {
        continue; // Must sell all houses in the street before mortgaging it.
      }
      if (!target || tile.props.price < target.props.price) {
        target = tile;
      }
    }
    if (!target) return false;

    const mortgageValue = target.props.price / 2;
    target.mortgaged = true;
    this.balance += mortgageValue;
    this.engine.log(
      `Player ${this.name} mortgaged ${target.props.name} for $${mortgageValue}`,
    );
    return true;
  }
}
