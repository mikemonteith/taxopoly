import { GameEngine, type Player } from "..";
import { TileCode } from "../static-data";
import { StreetBoardTileState } from "../tiles";

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
test("players trade properties when beneficial to both parties", () => {
  const strand = engine.getTile(TileCode.Strand, StreetBoardTileState);
  const fleetStreet = engine.getTile(
    TileCode.FleetStreet,
    StreetBoardTileState,
  );
  const trafalgarSquare = engine.getTile(
    TileCode.TrafalgarSquare,
    StreetBoardTileState,
  );
  const leicesterSquare = engine.getTile(
    TileCode.LeicesterSquare,
    StreetBoardTileState,
  );
  const coventryStreet = engine.getTile(
    TileCode.CoventryStreet,
    StreetBoardTileState,
  );
  const piccadilly = engine.getTile(TileCode.Piccadilly, StreetBoardTileState);

  // Player 1 is missing only Trafalgar Square for a Red monopoly, and holds
  // Piccadilly as a lone, otherwise-useless Yellow property.
  strand.owner = player1;
  fleetStreet.owner = player1;
  piccadilly.owner = player1;
  // Player 2 is missing only Piccadilly for a Yellow monopoly, and holds
  // Trafalgar Square as a lone, otherwise-useless Red property.
  trafalgarSquare.owner = player2;
  leicesterSquare.owner = player2;
  coventryStreet.owner = player2;

  player1.takeTurn(engine);

  // Each side gives up their dead-end property and completes their own monopoly.
  expect(trafalgarSquare.owner).toBe(player1);
  expect(piccadilly.owner).toBe(player2);
  expect(strand.owner).toBe(player1);
  expect(fleetStreet.owner).toBe(player1);
  expect(leicesterSquare.owner).toBe(player2);
  expect(coventryStreet.owner).toBe(player2);
});

test("players refuse trades that are not beneficial to them", () => {
  const trafalgarSquare = engine.getTile(
    TileCode.TrafalgarSquare,
    StreetBoardTileState,
  );
  const piccadilly = engine.getTile(TileCode.Piccadilly, StreetBoardTileState);

  // Neither player is collecting anything — a single, unrelated property each.
  trafalgarSquare.owner = player1;
  piccadilly.owner = player2;

  player1.takeTurn(engine);

  expect(trafalgarSquare.owner).toBe(player1);
  expect(piccadilly.owner).toBe(player2);
});

test("does not trade if only one side would benefit", () => {
  const strand = engine.getTile(TileCode.Strand, StreetBoardTileState);
  const fleetStreet = engine.getTile(
    TileCode.FleetStreet,
    StreetBoardTileState,
  );
  const trafalgarSquare = engine.getTile(
    TileCode.TrafalgarSquare,
    StreetBoardTileState,
  );

  // Player 1 is missing only Trafalgar Square for a Red monopoly, but owns
  // nothing else Player 2 would want in return.
  strand.owner = player1;
  fleetStreet.owner = player1;
  trafalgarSquare.owner = player2;

  player1.takeTurn(engine);

  expect(trafalgarSquare.owner).toBe(player2);
  expect(strand.owner).toBe(player1);
  expect(fleetStreet.owner).toBe(player1);
});

test("trades even when it only makes partial progress towards a monopoly, not full completion", () => {
  const strand = engine.getTile(TileCode.Strand, StreetBoardTileState);
  const fleetStreet = engine.getTile(
    TileCode.FleetStreet,
    StreetBoardTileState,
  );
  const leicesterSquare = engine.getTile(
    TileCode.LeicesterSquare,
    StreetBoardTileState,
  );
  const coventryStreet = engine.getTile(
    TileCode.CoventryStreet,
    StreetBoardTileState,
  );
  const piccadilly = engine.getTile(TileCode.Piccadilly, StreetBoardTileState);

  strand.owner = player1; // 1 of 3 Red — collecting, but nowhere near complete
  piccadilly.owner = player1; // Sole Yellow holding — a spare
  fleetStreet.owner = player2; // Sole Red holding — a spare
  leicesterSquare.owner = player2;
  coventryStreet.owner = player2; // 2 of 3 Yellow — collecting

  const balance1 = player1.balance;
  const balance2 = player2.balance;

  player1.takeTurn(engine);

  expect(fleetStreet.owner).toBe(player1); // Now 2 of 3 Red — still not a monopoly
  expect(piccadilly.owner).toBe(player2); // Completes Player 2's Yellow monopoly

  // No cash changes hands in the trade itself. Player 1 doesn't complete a
  // monopoly here, so there's nothing for them to spend on houses either.
  expect(player1.balance).toBe(balance1);
  expect(player2.balance).toBe(balance2);
});

test("executes every mutually-beneficial trade available in one turn", () => {
  const strand = engine.getTile(TileCode.Strand, StreetBoardTileState);
  const fleetStreet = engine.getTile(
    TileCode.FleetStreet,
    StreetBoardTileState,
  );
  const trafalgarSquare = engine.getTile(
    TileCode.TrafalgarSquare,
    StreetBoardTileState,
  );
  const leicesterSquare = engine.getTile(
    TileCode.LeicesterSquare,
    StreetBoardTileState,
  );
  const coventryStreet = engine.getTile(
    TileCode.CoventryStreet,
    StreetBoardTileState,
  );
  const piccadilly = engine.getTile(TileCode.Piccadilly, StreetBoardTileState);
  const pallMall = engine.getTile(TileCode.PallMall, StreetBoardTileState);
  const whitehall = engine.getTile(TileCode.Whitehall, StreetBoardTileState);
  const northumberlandAvenue = engine.getTile(
    TileCode.NorthumberlandAvenue,
    StreetBoardTileState,
  );
  const regentStreet = engine.getTile(
    TileCode.RegentStreet,
    StreetBoardTileState,
  );
  const oxfordStreet = engine.getTile(
    TileCode.OxfordStreet,
    StreetBoardTileState,
  );
  const bondStreet = engine.getTile(TileCode.BondStreet, StreetBoardTileState);

  // Red/Yellow pair: Player 1 needs Trafalgar Square, has a spare Piccadilly;
  // Player 2 needs Piccadilly, has a spare Trafalgar Square.
  strand.owner = player1;
  fleetStreet.owner = player1;
  piccadilly.owner = player1;
  trafalgarSquare.owner = player2;
  leicesterSquare.owner = player2;
  coventryStreet.owner = player2;

  // Pink/Green pair: Player 1 needs Northumberland Avenue, has a spare Bond
  // Street; Player 2 needs Bond Street, has a spare Northumberland Avenue.
  pallMall.owner = player1;
  whitehall.owner = player1;
  bondStreet.owner = player1;
  northumberlandAvenue.owner = player2;
  regentStreet.owner = player2;
  oxfordStreet.owner = player2;

  player1.takeTurn(engine);

  // Player 1 ends up with two completed monopolies (Red, Pink)...
  expect(strand.owner).toBe(player1);
  expect(fleetStreet.owner).toBe(player1);
  expect(trafalgarSquare.owner).toBe(player1);
  expect(pallMall.owner).toBe(player1);
  expect(whitehall.owner).toBe(player1);
  expect(northumberlandAvenue.owner).toBe(player1);
  // ...and so does Player 2 (Yellow, Green).
  expect(leicesterSquare.owner).toBe(player2);
  expect(coventryStreet.owner).toBe(player2);
  expect(piccadilly.owner).toBe(player2);
  expect(regentStreet.owner).toBe(player2);
  expect(oxfordStreet.owner).toBe(player2);
  expect(bondStreet.owner).toBe(player2);
});
