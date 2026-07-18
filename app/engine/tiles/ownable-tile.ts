import type {
  BuildableBoardTile,
  UtilityBoardTile,
  TrainStationBoardTile,
} from "../static-data";
import type { Player } from "..";
import { BoardTileState } from "./index";

export abstract class OwnableBoardTileState<
  T extends BuildableBoardTile | UtilityBoardTile | TrainStationBoardTile,
> extends BoardTileState<T> {
  private _owner: Player | null = null;
  /** Mortgaged properties collect no rent, until unmortgaged (not yet implemented). */
  mortgaged: boolean = false;

  set owner(player: Player | null) {
    this._owner = player;
  }

  get owner(): Player | null {
    return this._owner;
  }

  abstract get rent(): number;

  landedOn(player: Player) {
    const owner = this.owner;

    if (owner) {
      if (owner.jailTurnsRemaining === 0 && !this.mortgaged) {
        // Pay rent
        player.pay(this.rent);
        owner.balance += this.rent;
        this.engine.log(
          `Player ${player.name} paid $${this.rent} rent to ${owner.name}`,
        );
      }
    } else {
      // Always buy if you can afford it
      const price = this.props.price;
      if (player.balance >= price) {
        player.balance -= price;
        this.owner = player;
        this.engine.log(
          `Player ${player.name} bought ${this.props.name} for $${price}`,
        );
      } else {
        // Can't afford it outright — auction it off to whoever wants it most.
        this.engine.runAuction(this);
      }
    }
  }
}
