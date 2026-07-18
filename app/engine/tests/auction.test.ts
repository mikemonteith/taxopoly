import { GameEngine, type Player } from "..";
import { TileCode } from "../static-data";
import {
  StreetBoardTileState,
  TrainStationBoardTileState,
  UtilitiesBoardTileState,
} from "../tiles";

/**
 * This file contains tests for auctions: what happens when a player lands on
 * an unowned property but can't (or, in this simulation, won't) buy it
 * outright at face value.
 */

let engine: GameEngine;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 3 });
});

test("the highest bidder wins, but pays just above the next-highest bid, not their own max", () => {
  const [p1, p2, p3] = engine.getState().players;
  p1.biddingAggressiveness = 1;
  p2.biddingAggressiveness = 1;
  p3.biddingAggressiveness = 1;
  // No monopoly progress for anyone, so each values Old Kent Road ($60) at
  // face value, capped by their aggressiveness-scaled balance.
  p1.balance = 60;
  p2.balance = 45;
  p3.balance = 20;

  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  engine.runAuction(okr);

  expect(okr.owner).toBe(p1); // Highest bidder ($60)
  expect(p1.balance).toBe(60 - (45 + 10)); // Just beats the runner-up's $45 bid
});

test("nobody wins if nobody can afford to bid anything", () => {
  const [p1, p2, p3] = engine.getState().players;
  p1.balance = 0;
  p2.balance = 0;
  p3.balance = 0;

  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  engine.runAuction(okr);

  expect(okr.owner).toBe(null);
});

test("a lone bidder wins for just above the auction floor", () => {
  const [p1, p2, p3] = engine.getState().players;
  p1.biddingAggressiveness = 1;
  p1.balance = 200;
  p2.balance = 0;
  p3.balance = 0;

  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  engine.runAuction(okr);

  expect(okr.owner).toBe(p1);
  expect(p1.balance).toBe(200 - 10); // No competition, so it goes for $10
});

describe("Player.maxBidFor", () => {
  let player: Player;

  beforeEach(() => {
    player = engine.getState().players[0];
    player.biddingAggressiveness = 1;
    player.balance = 10_000; // Plenty of cash, so the bid isn't balance-capped
  });

  test("values an unrelated property at face price", () => {
    const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
    expect(player.maxBidFor(okr)).toBe(okr.props.price);
  });

  test("pays a large premium for the property that completes a monopoly", () => {
    const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
    const whitechapel = engine.getTile(
      TileCode.WhitechapelRoad,
      StreetBoardTileState,
    );
    okr.owner = player;

    expect(player.maxBidFor(whitechapel)).toBe(whitechapel.props.price * 3);
  });

  test("pays a smaller premium for partial progress towards a monopoly", () => {
    const strand = engine.getTile(TileCode.Strand, StreetBoardTileState);
    const fleetStreet = engine.getTile(
      TileCode.FleetStreet,
      StreetBoardTileState,
    );
    strand.owner = player; // Owns 1 of 3 Red properties

    expect(player.maxBidFor(fleetStreet)).toBe(fleetStreet.props.price * 1.5);
  });

  test("values completing the utilities the same way as a street monopoly", () => {
    const electric = engine.getTile(
      TileCode.ElectricCompany,
      UtilitiesBoardTileState,
    );
    const waterWorks = engine.getTile(
      TileCode.WaterWorks,
      UtilitiesBoardTileState,
    );
    electric.owner = player;

    expect(player.maxBidFor(waterWorks)).toBe(waterWorks.props.price * 3);
  });

  test("values completing the stations the same way, at partial progress", () => {
    const kingsCross = engine.getTile(
      TileCode.KingsCrossStation,
      TrainStationBoardTileState,
    );
    const marylebone = engine.getTile(
      TileCode.MaryleboneStation,
      TrainStationBoardTileState,
    );
    kingsCross.owner = player; // Owns 1 of 4 stations

    expect(player.maxBidFor(marylebone)).toBe(marylebone.props.price * 1.5);
  });

  test("scales the bid by biddingAggressiveness", () => {
    const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
    player.biddingAggressiveness = 2;

    expect(player.maxBidFor(okr)).toBe(okr.props.price * 2);
  });

  test("never bids more than the player can afford", () => {
    const mayfair = engine.getTile(TileCode.Mayfair, StreetBoardTileState);
    player.balance = 50; // Far less than Mayfair's $400 price

    expect(player.maxBidFor(mayfair)).toBe(50);
  });

  test("bids nothing when the player has no money", () => {
    const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
    player.balance = 0;

    expect(player.maxBidFor(okr)).toBe(0);
  });
});
