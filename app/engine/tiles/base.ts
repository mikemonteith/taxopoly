import type { GameState, Player } from "..";
import type { BoardTile } from "../static-data";

export class BoardTileState<T extends BoardTile = BoardTile> {
  readonly props: T;

  landedOn(gameState: GameState, player: Player) {
    console.error(
      "Undefined tile effect for tile",
      this.props.name,
      this.props.code,
    );
  }

  constructor(props: T) {
    this.props = props;
  }
}
