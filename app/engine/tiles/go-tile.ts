import type { Player, GameEngine } from "..";
import type { BoardTile } from "../static-data";
import { BoardTileState } from ".";

export class GoBoardTileState<
  T extends BoardTile = BoardTile,
> extends BoardTileState<T> {
  private readonly passGoAmount: number = 200; // Amount to add to player's balance when passing Go

  landedOn(player: Player) {
    player.balance += this.passGoAmount;
  }

  passedOver(player: Player) {
    player.balance += this.passGoAmount;
  }

  constructor(props: T, engine: GameEngine) {
    super(props, engine);
  }
}
