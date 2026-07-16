import type { GameState, Player } from "..";
import type { BoardTile } from "../static-data";
import { BoardTileState } from ".";

export class GoBoardTileState<
  T extends BoardTile = BoardTile,
> extends BoardTileState<T> {
  private readonly passGoAmount: number = 200; // Amount to add to player's balance when passing Go

  landedOn(gameState: GameState, player: Player) {
    player.balance += this.passGoAmount;
  }

  passedOver(gameState: GameState, player: Player) {
    player.balance += this.passGoAmount;
  }

  constructor(props: T) {
    super(props);
  }
}
