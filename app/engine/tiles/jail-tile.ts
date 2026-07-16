import type { GameState, Player } from "..";
import type { BoardTile } from "../static-data";
import { BoardTileState } from "./index";

export class GoToJailBoardTileState extends BoardTileState<BoardTile> {
  constructor(props: BoardTile) {
    super(props);
  }

  landedOn(gameState: GameState, player: Player) {
    player.jailTurnsRemaining = 3; // Set the number of turns the player must stay in jail
    player.tileId = 10;
  }
}
