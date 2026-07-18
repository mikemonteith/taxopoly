import { GameEngine, type Player } from "..";
import { TileCode } from "../static-data";
import { StreetBoardTileState } from "../tiles";

/**
 * This file contains tests for how a player raises funds when they owe money
 * they can't afford: sell houses/hotels first, then mortgage properties, and
 * only stay in debt once there's truly nothing left to liquidate.
 */

let engine: GameEngine;
let player: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 1 });
  player = engine.getState().players[0];
});

test("sells a hotel (back to 4 houses) for half its build cost", () => {
  const parkLane = engine.getTile(TileCode.ParkLane, StreetBoardTileState);
  const mayfair = engine.getTile(TileCode.Mayfair, StreetBoardTileState);
  parkLane.owner = player;
  mayfair.owner = player;
  parkLane.houseCount = 5;
  mayfair.houseCount = 5;
  player.balance = 0;

  player.pay(50); // Dark Blue houses cost $200, so a sale refunds $100

  // Park Lane has the lower rent of the two, so it's sold from first.
  expect(parkLane.houseCount).toBe(4);
  expect(mayfair.houseCount).toBe(5);
  expect(player.balance).toBe(50); // -50 + $100
});

test("sells houses from the lower-rent monopoly first, across multiple monopolies", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  const parkLane = engine.getTile(TileCode.ParkLane, StreetBoardTileState);
  const mayfair = engine.getTile(TileCode.Mayfair, StreetBoardTileState);
  [okr, whitechapel, parkLane, mayfair].forEach((tile) => {
    tile.owner = player;
    tile.houseCount = 1;
  });
  player.balance = 0;

  player.pay(20); // Only enough to need one $25 sale from Brown ($50 houses)

  expect(okr.houseCount).toBe(0);
  expect(whitechapel.houseCount).toBe(1);
  expect(parkLane.houseCount).toBe(1); // Untouched — Dark Blue is far more valuable
  expect(mayfair.houseCount).toBe(1);
  expect(player.balance).toBe(5); // -20 + $25
});

test("sells every house before mortgaging anything, even in a different street", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  const euston = engine.getTile(TileCode.EustonRoad, StreetBoardTileState);
  okr.owner = player;
  whitechapel.owner = player;
  okr.houseCount = 1;
  whitechapel.houseCount = 1;
  euston.owner = player; // No houses — would be mortgageable if it came to that
  player.balance = 0;

  player.pay(40); // $50 in house refunds available before any mortgage is needed

  expect(okr.houseCount).toBe(0);
  expect(whitechapel.houseCount).toBe(0);
  expect(euston.mortgaged).toBe(false);
  expect(player.balance).toBe(10); // -40 + $25 + $25
});

test("mortgages the cheapest eligible property first", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState); // $60
  const parkLane = engine.getTile(TileCode.ParkLane, StreetBoardTileState); // $350
  okr.owner = player;
  parkLane.owner = player;
  player.balance = 0;

  player.pay(10);

  expect(okr.mortgaged).toBe(true);
  expect(parkLane.mortgaged).toBe(false);
  expect(player.balance).toBe(20); // -10 + $30 (half of $60)
});

test("mortgages a street's properties only after every house on it is sold", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  okr.houseCount = 1;
  whitechapel.houseCount = 1;
  player.balance = 0;

  // More than the houses alone are worth ($50) — once they're sold, the now
  // house-free street itself becomes eligible to mortgage too ($30 each).
  player.pay(90);

  expect(okr.houseCount).toBe(0);
  expect(whitechapel.houseCount).toBe(0);
  expect(okr.mortgaged).toBe(true);
  expect(whitechapel.mortgaged).toBe(true);
  expect(player.balance).toBe(20); // -90 + $25 + $25 + $30 + $30
});

test("goes into negative balance once there's nothing left to sell or mortgage", () => {
  player.balance = 0;

  player.pay(100);

  expect(player.balance).toBe(-100);
});

test("liquidates just enough to cover the debt, not everything available", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  okr.houseCount = 4;
  whitechapel.houseCount = 4;
  player.balance = 0;

  player.pay(20); // A single $25 house sale already covers this

  const totalHouses = okr.houseCount + whitechapel.houseCount;
  expect(totalHouses).toBe(7); // Only one house sold, not the whole street
  expect(player.balance).toBe(5);
});

describe("liquidating remaining properties to other players", () => {
  test("auctions a property to another player once mortgaging alone isn't enough", () => {
    const engine = new GameEngine({ numPlayers: 2 });
    const [p1, p2] = engine.getState().players;
    const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
    okr.owner = p1;
    p1.balance = 0;
    p2.balance = 1000;
    p2.biddingAggressiveness = 1;

    // Mortgaging Old Kent Road alone only raises $30 — not enough on its own.
    p1.pay(35);

    expect(okr.owner).toBe(p2); // Sold off to the other player
    expect(okr.mortgaged).toBe(true); // Still mortgaged — that isn't undone by the sale
    expect(p2.balance).toBe(1000 - 10); // Only the auction touches p2 — mortgaging pays from the bank
    expect(p1.balance).toBe(5); // -35 + $30 (mortgage) + $10 (auction)
  });

  test("liquidates the cheapest remaining property first", () => {
    const engine = new GameEngine({ numPlayers: 2 });
    const [p1, p2] = engine.getState().players;
    const euston = engine.getTile(TileCode.EustonRoad, StreetBoardTileState); // $100
    const whitehall = engine.getTile(TileCode.Whitehall, StreetBoardTileState); // $140
    euston.owner = p1;
    whitehall.owner = p1;
    euston.mortgaged = true;
    whitehall.mortgaged = true;
    p1.balance = 0;
    p2.balance = 1000;
    p2.biddingAggressiveness = 1;

    p1.pay(5); // The cheaper property alone raises enough

    expect(euston.owner).toBe(p2);
    expect(whitehall.owner).toBe(p1); // Untouched — never needed
    expect(p1.balance).toBe(5); // -5 + $10
  });

  test("a bidding war between other players can sell it for well above the auction floor", () => {
    const engine = new GameEngine({ numPlayers: 3 });
    const [p1, p2, p3] = engine.getState().players;
    const pallMall = engine.getTile(TileCode.PallMall, StreetBoardTileState);
    const northumberland = engine.getTile(
      TileCode.NorthumberlandAvenue,
      StreetBoardTileState,
    );
    const whitehall = engine.getTile(TileCode.Whitehall, StreetBoardTileState);
    pallMall.owner = p2;
    northumberland.owner = p2; // p2 owns the other 2 of 3 Pink properties
    whitehall.owner = p1;
    whitehall.mortgaged = true;
    p1.balance = 0;
    p2.balance = 500;
    p2.biddingAggressiveness = 1;
    p3.balance = 500;
    p3.biddingAggressiveness = 1;

    p1.pay(100);

    // Whitehall completes p2's monopoly (3x = $420) but p3 only values it at
    // face price ($140), so p2 wins but only has to beat p3's bid by $10.
    expect(whitehall.owner).toBe(p2);
    expect(p2.balance).toBe(500 - 150);
    expect(p1.balance).toBe(50); // -100 + $150
  });

  test("stays in debt if no one else can or will bid on what's left", () => {
    const engine = new GameEngine({ numPlayers: 2 });
    const [p1, p2] = engine.getState().players;
    const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
    okr.owner = p1;
    okr.mortgaged = true;
    p1.balance = 0;
    p2.balance = 0; // Can't afford to bid anything

    p1.pay(20);

    expect(okr.owner).toBe(p1); // Nobody bought it
    expect(p1.balance).toBe(-20);
  });
});
