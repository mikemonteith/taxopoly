import type { GameEngine } from ".";
import { StreetGroup } from "./static-data";
import { StreetBoardTileState } from "./tiles/street-tile";
import { OwnableBoardTileState } from "./tiles/ownable-tile";
import { TrainStationBoardTileState } from "./tiles/train-station-tile";
import { UtilitiesBoardTileState } from "./tiles/utilities-tile";

/**
 * The minimum cash every player insists on keeping in hand — they'll only
 * buy a house or property (outright or at auction) if they'd still have at
 * least this much left afterwards. Keeps a player from voluntarily buying
 * their way into a forced sale next turn.
 */
export const MIN_CASH_RESERVE = 200;

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
  /**
   * Scales how much this player is willing to bid at auction, relative to
   * what a property is actually worth to them (see `maxBidFor`). 1 bids fair
   * value, above 1 overpays, below 1 lowballs. Randomized per player by
   * default so auctions have some real competition, but it's a plain field —
   * set it directly for a deterministic personality (tests, scenarios, or a
   * future UI control).
   */
  biddingAggressiveness: number = 0.7 + Math.random() * 0.6;

  constructor(id: string, name: string, engine: GameEngine) {
    this.id = id;
    this.name = name;
    this.engine = engine;
  }

  /** Runs this player's decisions ahead of their turn, before they roll the dice. */
  takeTurn(engine: GameEngine) {
    this.tryTrade(engine);
    this.buyHouses(engine);
  }

  /**
   * Looks for a mutually-beneficial 1-for-1 property swap with another
   * player, and keeps making them until no more are available. A swap goes
   * ahead when it advances a street each side is already collecting, without
   * costing either of them ground anywhere else: each side gives up a
   * property that's their *only* holding in its street (so it was never
   * going to complete without the other player's cooperation anyway) in
   * exchange for a property that adds to a street they already own at least
   * one piece of. No cash changes hands, and no negotiation is modeled —
   * if the trade objectively helps both sides this way, it happens.
   */
  private tryTrade(engine: GameEngine) {
    let traded = true;
    while (traded) {
      traded = false;
      for (const other of engine.getState().players) {
        if (other === this) continue;
        const swap = this.findMutualTrade(engine, other);
        if (swap) {
          swap.receive.owner = this;
          swap.give.owner = other;
          this.engine.log(
            `Player ${this.name} traded ${swap.give.props.name} to ${other.name} for ${swap.receive.props.name}`,
          );
          traded = true;
          break; // Ownership changed — restart the scan for the next opportunity.
        }
      }
    }
  }

  /** Finds a street swap with `other` that benefits both sides, if one exists (see `tryTrade`). */
  private findMutualTrade(
    engine: GameEngine,
    other: Player,
  ): { give: StreetBoardTileState; receive: StreetBoardTileState } | null {
    const groups = Object.values(StreetGroup);

    for (const receiveGroup of groups) {
      const receiveTiles = engine.getStreet(receiveGroup);
      const myCount = receiveTiles.filter((tile) => tile.owner === this).length;
      if (myCount === 0) continue; // Not a street I'm already collecting.

      const otherCountInReceiveGroup = receiveTiles.filter(
        (tile) => tile.owner === other,
      ).length;
      if (otherCountInReceiveGroup !== 1) continue; // Not other's sole holding there.
      const receive = receiveTiles.find((tile) => tile.owner === other)!;

      for (const giveGroup of groups) {
        if (giveGroup === receiveGroup) continue;
        const giveTiles = engine.getStreet(giveGroup);

        const otherCount = giveTiles.filter(
          (tile) => tile.owner === other,
        ).length;
        if (otherCount === 0) continue; // Not a street other is already collecting.

        const myCountInGiveGroup = giveTiles.filter(
          (tile) => tile.owner === this,
        ).length;
        if (myCountInGiveGroup !== 1) continue; // Not my sole holding there.
        const give = giveTiles.find((tile) => tile.owner === this)!;

        return { give, receive };
      }
    }
    return null;
  }

  /**
   * Keeps building houses for as long as the player can afford it: always on the
   * highest-rent eligible property first, kept evenly distributed within each
   * street (Monopoly's even-build rule — a property can only get its next house
   * once every other property in its group has caught up to the same count).
   */
  private buyHouses(engine: GameEngine) {
    let target = this.nextHousePurchase(engine);
    while (target && this.canAfford(target.props.houseCost)) {
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
   * The most this player is willing to bid at auction for `tile`: face value
   * normally, but a steep premium if owning it would complete a monopoly
   * (street, both utilities, or all four stations), and a smaller premium if
   * it's partial progress towards one — scaled by `biddingAggressiveness`
   * and always capped at what they can spend while keeping `MIN_CASH_RESERVE`
   * in hand.
   */
  maxBidFor(tile: OwnableBoardTileState<any>): number {
    const siblings = this.siblingsOf(tile);
    const ownedSiblings = siblings.filter((sibling) => sibling.owner === this);

    let value: number = tile.props.price;
    if (siblings.length > 1) {
      if (ownedSiblings.length === siblings.length - 1) {
        value = tile.props.price * 3; // The last piece of a monopoly
      } else if (ownedSiblings.length > 0) {
        value = tile.props.price * 1.5; // Partial progress towards one
      }
    }

    const bid = Math.round(value * this.biddingAggressiveness);
    const affordable = Math.max(0, this.balance - MIN_CASH_RESERVE);
    return Math.max(0, Math.min(bid, affordable));
  }

  /** Whether the player could pay `amount` right now and still keep at least `MIN_CASH_RESERVE` in hand afterwards. */
  canAfford(amount: number): boolean {
    return this.balance - amount >= MIN_CASH_RESERVE;
  }

  /** Every other property that would count towards the same set as `tile` (a street's color group, the utilities, or the stations). */
  private siblingsOf(
    tile: OwnableBoardTileState<any>,
  ): OwnableBoardTileState<any>[] {
    if (tile instanceof StreetBoardTileState) {
      return this.engine.getStreet(tile.props.street);
    }
    if (tile instanceof TrainStationBoardTileState) {
      return this.engine.getStations();
    }
    if (tile instanceof UtilitiesBoardTileState) {
      return this.engine.getUtilities();
    }
    return [tile];
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
   * Raises cash by selling houses/hotels, then mortgaging properties, then —
   * once there's truly nothing left to sell or mortgage — auctioning off
   * whatever properties remain to the other players, one at a time, until
   * the balance is no longer negative or there's nothing left to raise.
   */
  private raiseFunds() {
    while (this.balance < 0) {
      if (this.sellLeastValuableHouse()) continue;
      if (this.mortgageLeastValuableProperty()) continue;
      if (this.liquidateRemainingProperty()) continue;
      break; // Truly nothing left to raise — stays in debt for now.
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

  /**
   * Last resort once every house is sold and every property is mortgaged:
   * auctions off one remaining property to the other players, cheapest
   * first, to turn it into cash. If the cheapest one attracts no bidders,
   * tries the next — a more (or less) valuable property might still find a
   * buyer even if that one didn't. Returns whether anything actually sold.
   */
  private liquidateRemainingProperty(): boolean {
    const owned = this.engine
      .getState()
      .board.filter(
        (tile): tile is OwnableBoardTileState<any> =>
          tile instanceof OwnableBoardTileState && tile.owner === this,
      )
      .sort((a, b) => a.props.price - b.props.price);

    return owned.some((tile) => this.engine.auctionOwnedProperty(tile, this));
  }
}
