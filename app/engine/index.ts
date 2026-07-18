import {
  BOARD_TILES,
  CHANCE_CARDS,
  COMMUNITY_CHEST_CARDS,
  StreetGroup,
  TileCode,
  TileType,
  type BoardTile,
  type ChanceCardCode,
  type CommunityChestCardCode,
  type ChanceCard,
  type CommunityChestCard,
} from "./static-data";
import { shuffle } from "./dice";
import {
  BoardTileState,
  StreetBoardTileState,
  TaxBoardTileState,
  GoBoardTileState,
  GoToJailBoardTileState,
  TrainStationBoardTileState,
  UtilitiesBoardTileState,
  ChanceBoardTileState,
  CommunityChestBoardTileState,
} from "./tiles";
import { Player } from "./player";

export { Player };

export type GameState = {
  players: Player[];
  board: BoardTileState<BoardTile>[];
  /** The index of the current player's turn. */
  turn: number;
  /** Every player's balance, snapshotted after each tick (index 0 is the starting balances). */
  wealthHistory: WealthSnapshot[];
};

export type WealthSnapshot = {
  tick: number;
  balances: Record<string, number>;
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

  /** The shuffled Chance deck. Cards cycle to the back of the deck once drawn. */
  public chanceDeck: ChanceCard[];
  /** The shuffled Community Chest deck. Cards cycle to the back of the deck once drawn. */
  public communityChestDeck: CommunityChestCard[];

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
      case TileType.Chance:
        return new ChanceBoardTileState(tile, this);
      case TileType.Chest:
        return new CommunityChestBoardTileState(tile, this);
      default:
        return new BoardTileState(tile, this);
    }
  }

  log(...params: Parameters<typeof console.log>) {
    if (process.env.NODE_ENV === "development") {
      console.log(...params);
    }
  }

  constructor({ numPlayers }: GameEngineConstructorArgs = constructorDefaults) {
    this.chanceDeck = shuffle(CHANCE_CARDS.map((card) => card));
    this.communityChestDeck = shuffle(
      COMMUNITY_CHEST_CARDS.map((card) => card),
    );

    this.state = {
      players: new Array(numPlayers)
        .fill(null)
        .map(
          (_, index) =>
            new Player(`player-${index + 1}`, `Player ${index + 1}`),
        ),
      board: BOARD_TILES.map((tile) => this.createTileState(tile)),
      turn: 0,
      wealthHistory: [],
    };
    this.state.wealthHistory.push(this.snapshotWealth());

    this.log("GameEngine initialized");
  }

  /** Draws the next Chance card, cycling it to the back of the deck. */
  drawChanceCard(): ChanceCard {
    const card = this.chanceDeck.shift()!;
    this.chanceDeck.push(card);
    return card;
  }

  /** Draws the next Community Chest card, cycling it to the back of the deck. */
  drawCommunityChestCard(): CommunityChestCard {
    const card = this.communityChestDeck.shift()!;
    this.communityChestDeck.push(card);
    return card;
  }

  /**
   * Moves a player directly to an absolute tile, as directed by a Chance/Community Chest
   * card. Collects $200 for passing GO, and triggers the destination tile's `landedOn`
   * unless the caller wants to apply bespoke rent rules instead (e.g. the "nearest utility"
   * and "nearest station" cards).
   */
  advanceToTile(
    player: Player,
    tileId: number,
    { triggerLandedOn = true }: { triggerLandedOn?: boolean } = {},
  ) {
    const passedGo = tileId < player.tileId;
    player.tileId = tileId;

    if (triggerLandedOn) {
      this.state.board[tileId].landedOn(player);
    }

    if (passedGo && tileId !== 0) {
      const goTile = this.state.board[0] as GoBoardTileState;
      goTile.passedOver(player);
    }
  }

  /** Moves a player backwards by `spaces`, as directed by a Chance card. No GO bonus applies. */
  moveBackward(player: Player, spaces: number) {
    const length = this.state.board.length;
    player.tileId = (((player.tileId - spaces) % length) + length) % length;
    this.state.board[player.tileId].landedOn(player);
  }

  private snapshotWealth(): WealthSnapshot {
    return {
      tick: this.state.wealthHistory.length,
      balances: Object.fromEntries(
        this.state.players.map((player) => [player.id, player.balance]),
      ),
    };
  }

  tick(diceRoll: number) {
    this.currentRoll = diceRoll;
    const currentPlayer = this.state.players[this.state.turn];

    // Give the player a chance to act (e.g. buy houses) before they roll.
    currentPlayer.takeTurn(this);

    this.log(`Player ${currentPlayer.name} rolled a ${diceRoll}`);

    // Move the player
    this.movePlayer(currentPlayer, diceRoll);

    // Advance to the next player's turn
    this.state.turn = (this.state.turn + 1) % this.state.players.length;

    // Reassign the state to trigger reactivity in frameworks that rely on object identity
    this.state = {
      ...this.state,
      wealthHistory: [...this.state.wealthHistory, this.snapshotWealth()],
    };
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
    this.log(
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
