import { GameEngine, type Player } from "..";
import { TileCode } from "../static-data";
import { BuildableBoardTileState } from "../tiles";

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

  const okr = engine.getTile(TileCode.OldKentRoad, BuildableBoardTileState);
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
