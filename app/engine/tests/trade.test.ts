import { GameEngine, type Player } from "..";

/**
 * This file contains tests for the game engine, specifically focusing on scenarios that involve trading between players.
 */

let engine: GameEngine;
let player1: Player;
let player2: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 2 });
  player1 = engine.getState().players[0];
  player2 = engine.getState().players[1];
});

/**
 * Since owning whole streets doubles the rent, players should be open to trading if it helps them get a street monopoly.
 */
test.todo("players trade properties when beneficial to both parties");

test.todo("players refuse trades that are not beneficial to them");
