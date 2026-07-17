import type { GameEngine } from "..";
import type { BuildableBoardTile } from "../static-data";
import { OwnableBoardTileState } from "./ownable-tile";

export class StreetBoardTileState extends OwnableBoardTileState<BuildableBoardTile> {
  private houses: 0 | 1 | 2 | 3 | 4 | 5; // 0-4 houses, 5 = hotel

  constructor(props: BuildableBoardTile, engine: GameEngine) {
    super(props, engine);
    this.houses = 0; // Allow up to 5 houses (4 houses + 1 hotel)
  }

  get siblings(): StreetBoardTileState[] {
    return this.engine.getStreet(this.props.street);
  }

  /** Number of houses built (0-4), where 5 represents a hotel. */
  get houseCount() {
    return this.houses;
  }

  set houseCount(value: 0 | 1 | 2 | 3 | 4 | 5) {
    this.houses = value;
  }

  get rent() {
    if (this.owner === undefined) {
      return 0;
    }
    const allOwnedByMe = this.siblings.every(
      (sibling) => sibling.owner === this.owner,
    );
    if (allOwnedByMe && this.houses === 0) {
      return this.props.rent[0] * 2; // Double rent if all properties in the group are owned and no houses
    } else {
      return this.props.rent[this.houses]; // Calculate rent based on the number of houses
    }
  }
}
