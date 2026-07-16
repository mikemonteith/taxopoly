import type { TrainStationBoardTile } from "../static-data";
import { OwnableBoardTileState } from "./ownable-tile";

export class TrainStationBoardTileState extends OwnableBoardTileState<TrainStationBoardTile> {
  get siblings(): TrainStationBoardTileState[] {
    return this.engine.getStations();
  }

  get rent() {
    if (this.owner === null) {
      return 0;
    }
    const ownedStations = this.siblings.filter(
      (sibling) => sibling.owner === this.owner,
    ).length;

    // Rent is based on the number of stations owned by the same player
    // Doubles the rent for each additional station owned
    return this.props.rent * Math.pow(2, ownedStations - 1);
  }
}
