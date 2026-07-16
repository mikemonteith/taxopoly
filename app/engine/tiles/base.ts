import type { GameState, Player } from "..";
import type { BoardTile } from "../static-data";

export class BoardTileState<T extends BoardTile = BoardTile> {
  readonly props: T;

  landedOn(gameState: GameState, player: Player) {}

  constructor(props: T) {
    this.props = props;
  }
}
