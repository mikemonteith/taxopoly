import { computeNetWorth, GameEngine, type Player } from "..";
import { TileCode } from "../static-data";
import { StreetBoardTileState } from "../tiles";

/**
 * Tests for `computeNetWorth`: a player's true wealth, as opposed to their
 * cash balance — the price paid for every property and house/hotel they
 * own, not what could be recouped by mortgaging or selling back to the Bank.
 */

let engine: GameEngine;
let player: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 1 });
  player = engine.getState().players[0];
});

test("equals the balance when the player owns nothing", () => {
  player.balance = 1234;
  expect(computeNetWorth(engine.getState(), player)).toBe(1234);
});

test("adds the face price of every unbuilt property owned", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  okr.owner = player;
  player.balance = 1000;

  expect(computeNetWorth(engine.getState(), player)).toBe(
    1000 + okr.props.price,
  );
});

test("adds the full cost of every house/hotel built, on top of the property's price", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  okr.owner = player;
  okr.houseCount = 3;
  player.balance = 1000;

  expect(computeNetWorth(engine.getState(), player)).toBe(
    1000 + okr.props.price + 3 * okr.props.houseCost,
  );
});

test("values a hotel as five houses' worth of build cost", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  okr.owner = player;
  okr.houseCount = 5; // hotel
  player.balance = 1000;

  expect(computeNetWorth(engine.getState(), player)).toBe(
    1000 + okr.props.price + 5 * okr.props.houseCost,
  );
});

test("still counts the full price of a mortgaged property, not a discounted recoup value", () => {
  const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  okr.owner = player;
  okr.mortgaged = true;
  player.balance = 1000;

  expect(computeNetWorth(engine.getState(), player)).toBe(
    1000 + okr.props.price,
  );
});

test("ignores properties owned by other players", () => {
  const engine2 = new GameEngine({ numPlayers: 2 });
  const [p1, p2] = engine2.getState().players;
  const okr = engine2.getTile(TileCode.OldKentRoad, StreetBoardTileState);
  okr.owner = p2;
  p1.balance = 500;

  expect(computeNetWorth(engine2.getState(), p1)).toBe(500);
});
