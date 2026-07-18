import { GameEngine } from "..";
import { StreetGroup, TileCode } from "../static-data";
import {
  StreetBoardTileState,
  TrainStationBoardTileState,
  UtilitiesBoardTileState,
} from "../tiles";

/**
 * This file contains tests for the dev-only "load a varied game state" helper,
 * used to explore the UI without having to play out a whole game first.
 */

let engine: GameEngine;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 4 });
});

test("leaves some properties unowned", () => {
  engine.loadDevScenario();

  const unowned = engine
    .getState()
    .board.filter(
      (tile) =>
        (tile instanceof StreetBoardTileState ||
          tile instanceof TrainStationBoardTileState ||
          tile instanceof UtilitiesBoardTileState) &&
        tile.owner === null,
    );
  expect(unowned.length).toBeGreaterThan(0);
});

test("owns some properties outright without a monopoly", () => {
  engine.loadDevScenario();

  const euston = engine.getTile(TileCode.EustonRoad, StreetBoardTileState);
  expect(euston.owner).not.toBeNull();
  const lightBlueGroup = engine.getStreet(StreetGroup.LightBlue);
  expect(lightBlueGroup.some((tile) => tile.owner !== euston.owner)).toBe(true);
});

test("covers every house tier from 1 up to a hotel", () => {
  engine.loadDevScenario();

  const houseCounts = new Set(
    engine
      .getState()
      .board.filter(
        (tile): tile is StreetBoardTileState =>
          tile instanceof StreetBoardTileState && tile.houseCount > 0,
      )
      .map((tile) => tile.houseCount),
  );

  expect(houseCounts).toEqual(new Set([1, 2, 3, 4, 5]));
});

test("houses are evenly built within each monopolized street", () => {
  engine.loadDevScenario();

  const monopolizedGroups = Object.values(StreetGroup).filter((group) => {
    const tiles = engine.getStreet(group);
    return tiles.every(
      (tile) => tile.owner !== null && tile.owner === tiles[0].owner,
    );
  });

  for (const group of monopolizedGroups) {
    const houseCounts = engine.getStreet(group).map((tile) => tile.houseCount);
    expect(Math.max(...houseCounts) - Math.min(...houseCounts)).toBe(0);
  }
});

test("puts players in a mix of jail states", () => {
  engine.loadDevScenario();
  const [p1, p2, p3, p4] = engine.getState().players;

  expect(p1.jailTurnsRemaining).toBe(0);
  expect(p2.jailTurnsRemaining).toBeGreaterThan(0);
  expect(p3.jailTurnsRemaining).toBe(0);
  expect(p4.jailTurnsRemaining).toBe(0);
});

test("puts players in a mix of Get Out of Jail Free situations", () => {
  engine.loadDevScenario();
  const [p1, p2, p3] = engine.getState().players;

  expect(p1.getOutOfJailFreeCards).toBe(0);
  expect(p2.getOutOfJailFreeCards).toBe(1);
  expect(p3.getOutOfJailFreeCards).toBe(2);
});

test("gives players a mix of balances, including negative", () => {
  engine.loadDevScenario();
  const balances = engine.getState().players.map((player) => player.balance);

  expect(balances.some((balance) => balance < 0)).toBe(true);
  expect(balances.some((balance) => balance > 2000)).toBe(true);
});

test("scatters players around the board, some sharing a tile", () => {
  engine.loadDevScenario();
  const tileIds = engine.getState().players.map((player) => player.tileId);

  expect(new Set(tileIds).size).toBeLessThan(tileIds.length); // at least one shared tile
  expect(new Set(tileIds).size).toBeGreaterThan(1); // but not everyone on the same tile
});

test("seeds a non-flat wealth history so the chart shows movement immediately", () => {
  engine.loadDevScenario();
  const { wealthHistory } = engine.getState();

  expect(wealthHistory.length).toBeGreaterThan(1);
  const player1Balances = wealthHistory.map(
    (snapshot) => snapshot.balances["player-1"],
  );
  expect(new Set(player1Balances).size).toBeGreaterThan(1);
});

test("is deterministic across repeated loads", () => {
  engine.loadDevScenario();
  const first = JSON.stringify(
    engine.getState().players.map((p) => [p.balance, p.tileId]),
  );

  engine.loadDevScenario();
  const second = JSON.stringify(
    engine.getState().players.map((p) => [p.balance, p.tileId]),
  );

  expect(second).toBe(first);
});
