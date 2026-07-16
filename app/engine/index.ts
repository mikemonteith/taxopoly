import {
  BOARD_TILES,
  StreetGroup,
  TileCode,
  TileType,
  type BoardTile,
} from "./static-data";
import {
  BoardTileState,
  StreetBoardTileState,
  TaxBoardTileState,
  GoBoardTileState,
  GoToJailBoardTileState,
  TrainStationBoardTileState,
  UtilitiesBoardTileState,
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
  jailTurnsRemaining: number;
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
  public currentRoll: number = 0;

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
        return new GoBoardTileState(tile, this);
      case TileType.Street:
        return new StreetBoardTileState(tile, this);
      case TileType.TrainStation:
        return new TrainStationBoardTileState(tile, this);
      case TileType.Utility:
        return new UtilitiesBoardTileState(tile, this);
      case TileType.Tax:
        return new TaxBoardTileState(tile, this);
      case TileType.GoToJail:
        return new GoToJailBoardTileState(tile, this);
      default:
        return new BoardTileState(tile, this);
    }
  }

  constructor({ numPlayers }: GameEngineConstructorArgs = constructorDefaults) {
    this.state = {
      players: new Array(numPlayers).fill(null).map((_, index) => ({
        id: `player-${index + 1}`,
        name: `Player ${index + 1}`,
        tileId: 0,
        balance: 1500, // Starting balance for each player
        jailTurnsRemaining: 0, // Players start out of jail
      })),
      board: BOARD_TILES.map((tile) => this.createTileState(tile)),
      turn: 0,
    };

    log("GameEngine initialized");
  }

  tick(diceRoll: number) {
    this.currentRoll = diceRoll;
    const currentPlayer = this.state.players[this.state.turn];

    log(`Player ${currentPlayer.name} rolled a ${diceRoll}`);

    // Move the player
    this.movePlayer(currentPlayer, diceRoll);

    // Advance to the next player's turn
    this.state.turn = (this.state.turn + 1) % this.state.players.length;

    // Reassign the state to trigger reactivity in frameworks that rely on object identity
    this.state = { ...this.state };
    this.notifySubscribers();
  }

  movePlayer(player: Player, diceRoll: number) {
    // If the player is in jail, they cannot move until their jail turns are up
    if (player.jailTurnsRemaining > 0) {
      player.jailTurnsRemaining -= 1;
      return; // Player is in jail, end their turn early
    }

    // Move the player
    player.tileId = (player.tileId + diceRoll) % this.state.board.length;
    const newTile = this.state.board[player.tileId];
    log(
      `Player ${player.name} moved to tile ${newTile.props.name} (${newTile.props.code})`,
    );

    newTile.landedOn(player);

    // If the player passed go, we need to call the passedOver method on the Go tile.
    if (player.tileId < diceRoll && player.tileId !== 0) {
      const goTile = this.state.board[0] as GoBoardTileState;
      goTile.passedOver(player);
    }
  }

  getTile<T extends BoardTileState = BoardTileState>(
    code: TileCode,
    tileClass: new (...args: any[]) => T,
  ): T {
    const tile = this.state.board.find((tile) => tile.props.code === code);
    if (!tile) {
      throw new Error(`Tile with code ${code} not found`);
    }
    if (!(tile instanceof tileClass)) {
      throw new Error(
        `Tile with code ${code} is not of type ${tileClass.name}`,
      );
    }
    return tile;
  }

  /**
   * Gets all tiles of the same street group as the given tile.
   */
  getStreet(StreetGroup: StreetGroup): StreetBoardTileState[] {
    return this.state.board.filter(
      (tile) =>
        tile instanceof StreetBoardTileState &&
        tile.props.street === StreetGroup,
    ) as StreetBoardTileState[];
  }

  getStations(): TrainStationBoardTileState[] {
    return this.state.board.filter(
      (tile) => tile instanceof TrainStationBoardTileState,
    ) as TrainStationBoardTileState[];
  }

  getUtilities(): UtilitiesBoardTileState[] {
    return this.state.board.filter(
      (tile) => tile instanceof UtilitiesBoardTileState,
    ) as UtilitiesBoardTileState[];
  }

  getState(): GameState {
    return this.state;
  }
}
