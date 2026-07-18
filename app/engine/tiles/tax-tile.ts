import type { GameState, Player } from "..";
import type { TaxBoardTile } from "../static-data";
import { BoardTileState } from "./index";

export class TaxBoardTileState extends BoardTileState<TaxBoardTile> {
  landedOn(player: Player) {
    const amount = this.props.tax;
    player.balance -= amount;
    this.engine.log(`Player ${player.name} paid $${amount} in taxes`);
  }
}
