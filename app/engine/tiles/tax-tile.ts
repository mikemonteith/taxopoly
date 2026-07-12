import type { GameState, Player } from "..";
import type { TaxBoardTile } from "../static-data";
import { BoardTileState } from "./index";

export class TaxBoardTileState extends BoardTileState<TaxBoardTile> {
  constructor(props: TaxBoardTile) {
    super(props);
  }

  landedOn(gameState: GameState, player: Player) {
    const amount = this.props.tax;
    player.balance -= amount;
  }
}
