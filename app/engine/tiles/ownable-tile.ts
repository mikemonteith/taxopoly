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
      if (owner.jailTurnsRemaining === 0) {
        // Pay rent
        player.balance -= this.rent;
        owner.balance += this.rent;
      }
    } else {
      // Always buy if you can afford it
      const price = this.props.price;
      if (player.balance >= price) {
        player.balance -= price;
        this.owner = player;
      }
    }
  }
}
