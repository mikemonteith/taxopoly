import type { GameState, Player, GameEngine } from "..";
import type { BoardTile } from "../static-data";

export class BoardTileState<T extends BoardTile = BoardTile> {
  readonly props: T;

  protected engine: GameEngine;

  landedOn(player: Player) {}

  constructor(props: T, engine: GameEngine) {
    this.props = props;
    this.engine = engine;
  }
}
