import { type GameState, type Player } from "..";
import type { BuildableBoardTile, NonBuildableBoardTile } from "../static-data";
import { OwnableBoardTileState } from "./ownable-tile";

export class NonBuildableBoardTileState extends OwnableBoardTileState<NonBuildableBoardTile> {
  constructor(props: NonBuildableBoardTile) {
    super(props);
  }

  get rent() {
    if (this.owner === undefined) {
      return 0;
    }
    return this.props.rent;
  }
}
