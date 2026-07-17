import { GameEngine, type Player } from "..";
import { TileCode, type BuildableBoardTile } from "../static-data";
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
  engine.tick(3);
  expect(player.tileId).toBe(3);

  engine.tick(10);
  expect(player.tileId).toBe(13);

  engine.tick(20);
  expect(player.tileId).toBe(33);

  // Back to the start of the board
  engine.tick(10);
  expect(player.tileId).toBe(3);
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

test.todo("player can buy houses if they have a monopoly", () => {});

test.todo("player sells houses if they run out of money", () => {});

test.todo(
  "player mortgages a property if they run out of money, and have no houses",
  () => {},
);

test.todo("player unmortgages a property if they have enough money", () => {});
