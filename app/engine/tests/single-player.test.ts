import { GameEngine, type Player } from "..";
import {
  CommunityChestCardCode,
  TileCode,
  type BuildableBoardTile,
} from "../static-data";
import { StreetBoardTileState, type OwnableBoardTileState } from "../tiles";

/**
 * This file contains tests for the game engine, specifically focusing on the single-player scenario.
 * Realistically, there can be no single-player game but it does allow us some very simple tests.
 */

let engine: GameEngine;
let player: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 1 });
  player = engine.getState().players[0];
});

test("player moves around the board", () => {
  engine.tick(1);
  expect(player.tileId).toBe(1);

  engine.tick(10);
  expect(player.tileId).toBe(11);

  engine.tick(20);
  expect(player.tileId).toBe(31);

  // Back to the start of the board
  engine.tick(10);
  expect(player.tileId).toBe(1);
});

test("player starts with $1500 balance", () => {
  expect(player.balance).toBe(1500);
});

test("player lands on Go and collects $200", () => {
  const initialBalance = player.balance;

  // Move the player to free parking
  engine.tick(20);

  // Move the player 5 spaces, passing Go
  engine.tick(20);
  expect(player.tileId).toBe(0);
  expect(player.balance).toBe(initialBalance + 200);
});

test("player passes Go and collects $200", () => {
  const initialBalance = player.balance;

  // Move the player to free parking
  engine.tick(20);

  // Move the player to free parking, passing Go
  engine.tick(40);
  expect(player.tileId).toBe(20);
  expect(player.balance).toBe(initialBalance + 200);
});

test.each([
  [1, "Old Kent Road", 60], // Street
  [5, "Kings Cross Station", 200], // Train Station
  [12, "Electric Company", 150], // Utility
])(
  "player lands on an unowned property and buys it: %s (%s) for $%s",
  (tileId, tileName, cost) => {
    const initialBalance = player.balance;
    engine.tick(tileId); // Move to the specified property
    expect(player.balance).toBe(initialBalance - cost);
    const tile = engine.getState().board[
      player.tileId
    ] as OwnableBoardTileState<BuildableBoardTile>;
    expect(tile.owner, `Error on ${tileName}`).toBe(player);
  },
);

test("player lands on an unowned property can't buy without enough money", () => {
  player.balance = 50;
  engine.tick(1); // Move to Old Kent Road (can't buy)

  expect(player.balance).toBe(50); // Still has the same balance
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  expect(okr.owner).toBe(null);
});

test("player lands on a self-owned property doesn't pay rent", () => {
  engine.tick(1); // Move to Old Kent Road (buys)
  engine.tick(39); // Move back to Go
  const initialBalance = player.balance;

  engine.tick(1); // Move all the way around the board
  expect(player.balance).toBe(initialBalance); // No rent paid
});

test("player lands tax tile, pays tax", () => {
  const initialBalance = player.balance;
  engine.tick(4); // Move to Income Tax
  expect(player.balance).toBe(initialBalance - 200); // Income Tax is $200
});

test("player lands on Go to Jail tile, goes to jail", () => {
  engine.tick(30); // Move to Go to Jail
  expect(player.tileId).toBe(10); // Jail tile ID is 10
  expect(player.jailTurnsRemaining).toBe(3); // Player should have 3 turns in jail
});

test("player gets out of jail on third turn", () => {
  engine.tick(30); // Move to Go to Jail
  expect(player.tileId).toBe(10); // Jail tile ID is 10

  engine.tick(1);
  engine.tick(1);
  engine.tick(1);
  expect(player.tileId).toBe(10); // Still in jail

  engine.tick(1); // Fourth turn, should get out of jail
  expect(player.tileId).toBe(11);
});

test.todo("player gets out of jail on double roll", () => {});

test.todo("player pays $50 to get out of jail", () => {});

test("player buys houses once they complete a monopoly, evenly distributed", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  player.balance = 120; // Enough for two houses at $50 each, not three

  // Player's turn starts; takeTurn() runs before they move, and a 0 roll
  // lands them back on GO for another $200.
  engine.tick(0);

  expect(player.balance).toBe(120 - 100 + 200);
  expect(okr.houseCount).toBe(1);
  expect(whitechapel.houseCount).toBe(1);
});

test("player sells houses if they run out of money", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  okr.houseCount = 3;
  whitechapel.houseCount = 3;
  player.balance = 0;

  player.pay(30); // Can't afford it — houses cost $50, so each refunds $25

  // Sells the lower-rent side first, one house at a time, until it can cover
  // the debt — leaving houses as evenly distributed as they started.
  expect(okr.houseCount).toBe(2);
  expect(whitechapel.houseCount).toBe(2);
  expect(player.balance).toBe(20); // -30 + $25 + $25
});

test("player mortgages a property if they run out of money, and have no houses", () => {
  const euston = engine.getTile(TileCode.EustonRoad, StreetBoardTileState);
  euston.owner = player;
  player.balance = 0;

  player.pay(30); // Euston Road costs $100, so mortgaging it raises $50

  expect(euston.mortgaged).toBe(true);
  expect(player.balance).toBe(20); // -30 + $50
});

test.todo("player unmortgages a property if they have enough money", () => {});
