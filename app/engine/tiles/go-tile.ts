import type { GameState, Player } from "..";
import type { BoardTile } from "../static-data";

export class GoBoardTileState<T extends BoardTile = BoardTile> {
  readonly props: T;

  private readonly passGoAmount: number = 200; // Amount to add to player's balance when passing Go

  landedOn(gameState: GameState, player: Player) {
    player.balance += this.passGoAmount;
  }

  constructor(props: T) {
    this.props = props;
  }
}
