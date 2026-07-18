import type { Player, GameEngine } from "..";
import type { BoardTile } from "../static-data";
import { BoardTileState } from ".";

export class GoBoardTileState<
  T extends BoardTile = BoardTile,
> extends BoardTileState<T> {
  private readonly passGoAmount: number = 200; // Amount to add to player's balance when passing Go

  landedOn(player: Player) {
    player.balance += this.passGoAmount;
    this.engine.log(
      `Player ${player.name} landed on Go and received $${this.passGoAmount}.`,
    );
  }

  passedOver(player: Player) {
    player.balance += this.passGoAmount;
    this.engine.log(
      `Player ${player.name} passed over Go and received $${this.passGoAmount}.`,
    );
  }

  constructor(props: T, engine: GameEngine) {
    super(props, engine);
  }
}
