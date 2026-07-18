import { GameEngine, MIN_CASH_RESERVE, type Player } from "..";
import { ChanceCardCode, TileCode } from "../static-data";
import { CHANCE_CARD_EFFECTS } from "../cards";
import {
  StreetBoardTileState,
  TrainStationBoardTileState,
  UtilitiesBoardTileState,
} from "../tiles";

/**
 * This file contains tests for the $200 cash reserve every player insists on
 * keeping in hand: they'll only buy a house or property — outright, at
 * auction, or via a card — if they'd still have at least that much left
 * afterwards, rather than spending right down to the wire.
 */

let engine: GameEngine;
let player: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 1 });
  player = engine.getState().players[0];
});

test("the reserve is $200", () => {
  expect(MIN_CASH_RESERVE).toBe(200);
});

describe("Player.canAfford", () => {
  test("false when the purchase would leave less than the reserve", () => {
    player.balance = 259;
    expect(player.canAfford(60)).toBe(false);
  });

  test("true when the purchase leaves exactly the reserve", () => {
    player.balance = 260;
    expect(player.canAfford(60)).toBe(true);
  });
});

test("does not buy an unowned property outright if it would dip below the reserve", () => {
  player.balance = 259; // $60 property; would leave $199
  player.biddingAggressiveness = 0; // Refuses to bid at the auction that follows, too

  engine.tick(1); // Move to Old Kent Road

  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  expect(okr.owner).toBe(null);
  expect(player.balance).toBe(259);
});

test("buys an unowned property outright once it leaves exactly the reserve", () => {
  player.balance = 260;

  engine.tick(1); // Move to Old Kent Road ($60)

  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  expect(okr.owner).toBe(player);
  expect(player.balance).toBe(200);
});

test("does not buy a house if it would dip below the reserve", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  player.balance = 249; // Houses cost $50; would leave $199

  player.takeTurn(engine);

  expect(okr.houseCount).toBe(0);
  expect(whitechapel.houseCount).toBe(0);
  expect(player.balance).toBe(249);
});

test("buys a house once it leaves exactly the reserve", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  const whitechapel = engine.getTile(
    TileCode.WhitechapelRoad,
    StreetBoardTileState,
  );
  okr.owner = player;
  whitechapel.owner = player;
  player.balance = 250;

  player.takeTurn(engine);

  const totalHouses = okr.houseCount + whitechapel.houseCount;
  expect(totalHouses).toBe(1);
  expect(player.balance).toBe(200);
});

test("does not buy the nearest utility via a Chance card if it would dip below the reserve", () => {
  player.tileId = 0; // Nearest utility is Electric Company ($150)
  player.balance = 349; // Would leave $199

  CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToNearestUtility](engine, player);

  const electricCompany = engine.getTile(
    TileCode.ElectricCompany,
    UtilitiesBoardTileState,
  );
  expect(electricCompany.owner).toBe(null);
  expect(player.balance).toBe(349);
});

test("does not buy the nearest station via a Chance card if it would dip below the reserve", () => {
  player.tileId = 0; // Nearest station is Kings Cross Station ($200)
  player.balance = 399; // Would leave $199

  CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToNearestStation](engine, player);

  const kingsCross = engine.getTile(
    TileCode.KingsCrossStation,
    TrainStationBoardTileState,
  );
  expect(kingsCross.owner).toBe(null);
  expect(player.balance).toBe(399);
});
