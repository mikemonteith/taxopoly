import { GameEngine, type Player } from "..";
import { TileCode } from "../static-data";
import { StreetBoardTileState } from "../tiles";

/**
 * This file contains tests for the decisions a player makes for themselves ahead of
 * their turn, starting with automatically building houses.
 */

let engine: GameEngine;
let player: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 1 });
  player = engine.getState().players[0];
});

test("does not buy houses without owning every property in the street", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  okr.owner = player; // Whitechapel Road, the other half of Brown, is unowned

  player.takeTurn(engine);

  expect(player.balance).toBe(1500);
  expect(okr.houseCount).toBe(0);
});

test("does not buy a house it can't afford", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  player.balance = 10; // Old Kent Road's houses cost $50 each

  player.takeTurn(engine);

  expect(player.balance).toBe(10);
  expect(okr.houseCount).toBe(0);
  expect(whitechapel.houseCount).toBe(0);
});

test("keeps houses evenly distributed within a street", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  player.balance = 350; // Enough for exactly 3 houses at $50 each, keeping the $200 reserve

  player.takeTurn(engine);

  // Whitechapel Road has the higher rent, so it gets first (and third) pick, but
  // Old Kent Road must catch up to 1 house before Whitechapel is allowed a 2nd.
  expect(okr.houseCount).toBe(1);
  expect(whitechapel.houseCount).toBe(2);
  expect(Math.abs(okr.houseCount - whitechapel.houseCount)).toBeLessThanOrEqual(
    1,
  );
  expect(player.balance).toBe(200); // Down to exactly the reserve, so a 4th house is out of reach
});

test("builds on the highest-rent monopoly first when it owns several", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  const parkLane = engine.getTile(TileCode.ParkLane, StreetBoardTileState);
  const mayfair = engine.getTile(TileCode.Mayfair, StreetBoardTileState);
  [okr, whitechapel, parkLane, mayfair].forEach((tile) => {
    tile.owner = player;
  });
  player.balance = 400; // Exactly one Dark Blue house ($200) plus the $200 reserve; Brown's cheaper $50 houses stay unbought while Dark Blue is still eligible

  player.takeTurn(engine);

  expect(mayfair.houseCount).toBe(1); // Mayfair has the highest rent of the two monopolies
  expect(parkLane.houseCount).toBe(0);
  expect(okr.houseCount).toBe(0);
  expect(whitechapel.houseCount).toBe(0);
  expect(player.balance).toBe(200);
});

test("stops building once every property in the street has a hotel", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  player.balance = 100_000;

  player.takeTurn(engine);

  expect(okr.houseCount).toBe(5); // 5 represents a hotel
  expect(whitechapel.houseCount).toBe(5);
  expect(player.balance).toBe(100_000 - 10 * 50); // 10 houses total, $50 each
});

test("buys houses as part of the player's turn, before they roll", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  player.balance = 300;

  // takeTurn() runs before movement, even for a 0 roll — which then lands
  // the player back on GO for another $200.
  engine.tick(0);

  expect(player.balance).toBe(400); // 300 - $100 (2 houses) + $200 (GO)
  expect(okr.houseCount).toBe(1);
  expect(whitechapel.houseCount).toBe(1);
});
