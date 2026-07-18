import { GameEngine, type Player } from "..";
import { TileCode } from "../static-data";
import { StreetBoardTileState } from "../tiles";

/**
 * This file contains tests for the game engine, specifically focusing on scenarios that involve two or more players.
 */

let engine: GameEngine;
let player1: Player;
let player2: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 2 });
  player1 = engine.getState().players[0];
  player2 = engine.getState().players[1];
});

test("players take turns moving around the board", () => {
  engine.tick(3); // Player 1 moves 3 spaces
  expect(player1.tileId).toBe(3);
  expect(player2.tileId).toBe(0);

  engine.tick(4); // Player 2 moves 4 spaces
  expect(player1.tileId).toBe(3);
  expect(player2.tileId).toBe(4);

  engine.tick(5); // Player 1 moves 5 spaces
  expect(player1.tileId).toBe(8);
  expect(player2.tileId).toBe(4);
});

test("player cannot buy an already owned property", () => {
  engine.tick(1); // Player 1 moves to Old Kent Road (buys)
  engine.tick(1); // Player 2 moves to Old Kent Road (cannot buy)

  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  expect(okr.owner).toBe(player1);
});

test("player must pay rent", () => {
  engine.tick(1); // Player 1 moves to Old Kent Road (buys)
  const balance1 = player1.balance;
  const balance2 = player2.balance;

  engine.tick(1); // Player 2 moves to Old Kent Road (pays rent)

  expect(player1.balance).toBe(balance1 + 2);
  expect(player2.balance).toBe(balance2 - 2);
});

test("player does not collect rent if they are in jail", () => {
  engine.tick(1); // Player 1 moves to Old Kent Road (buys)
  const balance1 = player1.balance;
  const balance2 = player2.balance;

  // Send Player 1 to jail
  player1.jailTurnsRemaining = 3;
  engine.tick(1); // Player 2 moves to Old Kent Road (does not pay rent)

  expect(player1.balance).toBe(balance1); // No rent collected
  expect(player2.balance).toBe(balance2); // No rent paid
});

test("player must pay double rent if they own all properties of a street: 2 properties", () => {
  engine.tick(1); // Player 1 moves to Old Kent Road (buys)
  engine.tick(0); // Player 2 stays still
  engine.tick(2); // Player 2 moves to Whitechapel Road (buys)
  const startingBalance = player2.balance;
  engine.tick(1); // Player 1 moves to Old Kent Road (pays double rent)
  expect(player2.balance).toBe(startingBalance - 2 * 2); // Rent for Old Kent Road is 2, doubled to 4
});

test("player must pay double rent if they own all properties of a street: 3 properties", () => {
  const startingBalance = player2.balance;
  engine.tick(21); // Player 1 moves to Strand (buys)
  engine.tick(20); // Player 2 moves to free parking
  engine.tick(2); // Player 1 moves to Fleet Street (buys)
  engine.tick(0); // Player 2 stays still
  engine.tick(1); // Player 1 moves to Trafalgar Square (buys)

  engine.tick(1); // Player 2 moves to Strand (pays double rent)
  expect(player2.balance).toBe(startingBalance - 2 * 18); // Rent for Strand is 18, doubled to 36
});

test.todo("player must pay increased rent for houses and hotels on properties");

test.each([[12], [8], [6], [1]])(
  "player must pay 4x roll rent for utilities based on dice roll of %s",
  (diceRoll) => {
    const startingBalance = 1000;
    engine.tick(12); // Player 1 moves to Electric Company (buys)

    engine.tick(12 - diceRoll); // Player 2 moves close enough so that next diceRoll takes them to electric company
    engine.tick(0); // Player 1 stays still
    player2.balance = startingBalance;
    engine.tick(diceRoll); // Player 2 moves to Electric Company (pays rent based on dice roll)
    expect(player2.balance).toBe(startingBalance - 4 * diceRoll); // Rent is 4 times the dice roll
  },
);

test.each([[12], [8], [6], [1]])(
  "player must pay 10x roll (if both owned) rent for utilities based on dice roll of %s",
  (diceRoll) => {
    const startingBalance = 1000;
    engine.tick(12); // Player 1 moves to Electric Company (buys)

    engine.tick(12 - diceRoll); // Player 2 moves close enough so that next diceRoll takes them to electric company
    engine.tick(16); // Player 1 moves to Water Works (buys)
    player2.balance = startingBalance;
    engine.tick(diceRoll); // Player 2 moves to Electric Company (pays rent based on dice roll)
    expect(player2.balance).toBe(startingBalance - 10 * diceRoll); // Rent is 10 times the dice roll (double rent)
  },
);

test.each([
  [1, 25],
  [2, 50],
  [3, 100],
  [4, 200],
])(
  "player must pay rent for train stations based on number of stations owned: %s = $%s",
  (stationsOwned, expectedRent) => {
    const startingBalance = 1000;
    engine.tick(5); // Player 1 moves to Kings Cross Station (buys)
    if (stationsOwned > 1) {
      engine.tick(0); // Player 2 stays still
      engine.tick(10); // Player 1 moves to Marylebone Station (buys)
    }
    if (stationsOwned > 2) {
      engine.tick(0); // Player 2 stays still
      engine.tick(20); // Player 1 moves to Fenchurch St Station (buys)
    }
    if (stationsOwned > 3) {
      engine.tick(0); // Player 2 stays still
      engine.tick(30); // Player 1 moves to Liverpool St Station (buys)
    }
    player2.balance = startingBalance;
    // Simulate landing on a train station and paying rent
    engine.tick(5); // Player 2 moves to a train station (pays rent)
    expect(player2.balance).toBe(startingBalance - expectedRent);
  },
);

test("player can mortgage properties to raise funds", () => {
  engine.tick(1); // Player 1 moves to Old Kent Road (buys) — rent is $2
  engine.tick(13); // Player 2 moves to Whitehall (buys, $140)
  engine.tick(0); // Player 1 stays still

  player2.tileId = 0; // Reset position so the next roll lands cleanly on OKR
  player2.balance = 1; // Not even enough to cover $2 rent, and no houses to sell
  const balance1 = player1.balance;
  engine.tick(1); // Player 2 moves to Old Kent Road (pays rent)

  const whitehall = engine.getTile(TileCode.Whitehall, StreetBoardTileState);
  expect(whitehall.mortgaged).toBe(true);
  expect(player2.balance).toBe(1 - 2 + 70); // Whitehall costs $140, mortgages for $70
  expect(player1.balance).toBe(balance1 + 2); // Rent still collected in full
});

test("mortgaged properties collect no rent", () => {
  engine.tick(1); // Player 1 moves to Old Kent Road (buys)
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  okr.mortgaged = true;

  const balance1 = player1.balance;
  const balance2 = player2.balance;
  engine.tick(1); // Player 2 moves to Old Kent Road (mortgaged — no rent due)

  expect(player1.balance).toBe(balance1);
  expect(player2.balance).toBe(balance2);
});

test.todo("player can unmortgage properties by paying back with interest");
