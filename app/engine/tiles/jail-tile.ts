import type { GameEngine, Player } from "..";
import type { BoardTile } from "../static-data";
import { BoardTileState } from "./index";

export class GoToJailBoardTileState extends BoardTileState<BoardTile> {
  constructor(props: BoardTile, engine: GameEngine) {
    super(props, engine);
  }

  landedOn(player: Player) {
    player.jailTurnsRemaining = 3; // Set the number of turns the player must stay in jail
    player.tileId = 10;
    this.engine.log(
      `Player ${player.name} was sent to jail and will miss 3 turns.`,
    );
  }
}
