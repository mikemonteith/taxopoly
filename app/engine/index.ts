import { BOARD_TILES, TileType, type BoardTile } from "./static-data";
import {
  BoardTileState,
  BuildableBoardTileState,
  OwnableBoardTileState,
  TaxBoardTileState,
  GoBoardTileState,
} from "./tiles";

function log(...params: Parameters<typeof console.log>) {
  if (process.env.NODE_ENV === "development") {
    console.log(...params);
  }
}

log(BOARD_TILES);

export type Player = {
  id: string;
  name: string;
  /** The tile the player is currently on. */
  tileId: number;
  /** Number of turns remaining in jail. */
  jailTurnsRemaining?: number;
  /** How much money the player has. */
  balance: number;
};

export type GameState = {
  players: Player[];
  board: BoardTileState<BoardTile>[];
  /** The index of the current player's turn. */
  turn: number;
};

type GameEngineConstructorArgs = {
  numPlayers?: number;
};

const constructorDefaults: GameEngineConstructorArgs = {
  numPlayers: 4,
};

export class GameEngine {
  private state: GameState;

  private subscribers: Set<() => void> = new Set();

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }

  createTileState(tile: BoardTile): BoardTileState<BoardTile> {
    switch (tile.type) {
      case TileType.Go:
        return new GoBoardTileState(tile);
      case TileType.Street:
        return new BuildableBoardTileState(tile);
      case TileType.TrainStation:
      case TileType.Utility:
        return new OwnableBoardTileState(tile);
      case TileType.Tax:
        return new TaxBoardTileState(tile);
      default:
        return new BoardTileState(tile);
    }
  }

  constructor({ numPlayers }: GameEngineConstructorArgs = constructorDefaults) {
    this.state = {
      players: new Array(numPlayers).fill(null).map((_, index) => ({
        id: `player-${index + 1}`,
        name: `Player ${index + 1}`,
        tileId: 0,
        balance: 1500, // Starting balance for each player
      })),
      board: BOARD_TILES.map((tile) => this.createTileState(tile)),
      turn: 0,
    };

    log("GameEngine initialized");
  }

  tick() {
    log("GameEngine tick");

    const currentPlayer = this.state.players[this.state.turn];
    log(`Player ${currentPlayer.name} is taking their turn...`);

    // Roll the dice
    const diceRoll =
      Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    log(`Player ${currentPlayer.name} rolled a ${diceRoll}`);

    // Move the player
    currentPlayer.tileId =
      (currentPlayer.tileId + diceRoll) % this.state.board.length;
    const newTile = this.state.board[currentPlayer.tileId];
    log(
      `Player ${currentPlayer.name} moved to tile ${newTile.props.name} (${newTile.props.code})`,
    );

    newTile.landedOn(this.state, currentPlayer);

    // Advance to the next player's turn
    this.state.turn = (this.state.turn + 1) % this.state.players.length;

    // Reassign the state to trigger reactivity in frameworks that rely on object identity
    this.state = { ...this.state };
    this.notifySubscribers();
  }

  getState(): GameState {
    return this.state;
  }
}
