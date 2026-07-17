import { GameEngine, type Player } from "..";

/**
 * This file contains tests for the community chest and chance cards.
 */

let engine: GameEngine;
let player1: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 1 });
  player1 = engine.getState().players[0];
});

test.todo("player draws a community chest card");

test.todo("player draws a chance card");
