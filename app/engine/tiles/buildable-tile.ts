import { type GameState, type Player } from "..";
import type { BuildableBoardTile } from "../static-data";
import { OwnableBoardTileState } from "./ownable-tile";

export class BuildableBoardTileState extends OwnableBoardTileState<BuildableBoardTile> {
  private houses: 0 | 1 | 2 | 3 | 4 | 5; // 0-4 houses, 5 = hotel

  constructor(props: BuildableBoardTile) {
    super(props);
    this.houses = 0; // Allow up to 5 houses (4 houses + 1 hotel)
  }

  get rent() {
    if (this.owner === undefined) {
      return 0;
    }
    return this.props.rent[this.houses]; // Calculate rent based on the number of houses
  }

  landedOn(gameState: GameState, player: Player) {
    const owner = this.owner;

    if (owner) {
      // Pay rent
      player.balance -= this.rent;
      owner.balance += this.rent;
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
