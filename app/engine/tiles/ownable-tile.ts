import type { BuildableBoardTile, NonBuildableBoardTile } from "../static-data";
import type { Player } from "..";
import { BoardTileState } from "./index";

export class OwnableBoardTileState<
  T extends BuildableBoardTile | NonBuildableBoardTile,
> extends BoardTileState<T> {
  private _owner?: Player;

  set owner(player: Player | undefined) {
    this._owner = player;
  }

  get owner(): Player | undefined {
    return this._owner;
  }

  constructor(props: T) {
    super(props);
  }
}
