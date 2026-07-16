import type { UtilityBoardTile } from "../static-data";
import { OwnableBoardTileState } from "./ownable-tile";

export class UtilitiesBoardTileState extends OwnableBoardTileState<UtilityBoardTile> {
  get siblings(): UtilitiesBoardTileState[] {
    return this.engine.getUtilities();
  }

  get rent() {
    if (this.owner === null) {
      return 0;
    }
    const ownedUtilities = this.siblings.filter(
      (sibling) => sibling.owner === this.owner,
    ).length;
    const multiplier = ownedUtilities === 1 ? 4 : 10;
    return multiplier * this.engine.currentRoll;
  }
}
