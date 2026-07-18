import type { GameEngine, Player, WealthSnapshot } from ".";
import { TileCode } from "./static-data";
import {
  StreetBoardTileState,
  TrainStationBoardTileState,
  UtilitiesBoardTileState,
} from "./tiles";

function street(engine: GameEngine, code: TileCode) {
  return engine.getTile(code, StreetBoardTileState);
}

function station(engine: GameEngine, code: TileCode) {
  return engine.getTile(code, TrainStationBoardTileState);
}

function utility(engine: GameEngine, code: TileCode) {
  return engine.getTile(code, UtilitiesBoardTileState);
}

/**
 * Puts a game into a hand-picked, varied state for exploring the UI in dev:
 * unowned properties alongside owned and part-owned ones, every house tier
 * from a single house up to a hotel, players scattered around the board
 * (two of them stacked on the same tile), and a spread of jail / cash / Get
 * Out of Jail Free situations. Deterministic — repeated clicks always land
 * on the same state, rather than a fresh random one each time.
 */
export function applyDevScenario(engine: GameEngine): WealthSnapshot[] {
  const players = engine.getState().players;
  const [p1, p2, p3, p4] = players;

  // Player 1: wealthy leader with two fully-built monopolies (a hotel tier
  // and a 3-house tier) plus a station, sitting out on its own mid-board.
  if (p1) {
    p1.tileId = 24; // Trafalgar Square
    p1.balance = 2540;
    p1.jailTurnsRemaining = 0;
    p1.getOutOfJailFreeCards = 0;

    for (const code of [TileCode.ParkLane, TileCode.Mayfair]) {
      const tile = street(engine, code);
      tile.owner = p1;
      tile.houseCount = 5; // hotel
    }
    for (const code of [
      TileCode.LeicesterSquare,
      TileCode.CoventryStreet,
      TileCode.Piccadilly,
    ]) {
      const tile = street(engine, code);
      tile.owner = p1;
      tile.houseCount = 3;
    }
    station(engine, TileCode.KingsCrossStation).owner = p1;
  }

  // Player 2: cautious builder (2-house tier) currently serving time in
  // jail, holding a Get Out of Jail Free card, plus one property owned
  // outright but short of a monopoly.
  if (p2) {
    p2.tileId = 10; // Jail
    p2.balance = 890;
    p2.jailTurnsRemaining = 2;
    p2.getOutOfJailFreeCards = 1;

    for (const code of [TileCode.OldKentRoad, TileCode.WhitechapelRoad]) {
      const tile = street(engine, code);
      tile.owner = p2;
      tile.houseCount = 2;
    }
    street(engine, TileCode.EustonRoad).owner = p2; // owned, but not a monopoly
  }

  // Player 3: just getting started, nearly out of cash, holding two Get Out
  // of Jail Free cards (one from each deck) despite not needing either yet.
  if (p3) {
    p3.tileId = 0; // GO — stacked with Player 4
    p3.balance = 42;
    p3.jailTurnsRemaining = 0;
    p3.getOutOfJailFreeCards = 2;

    for (const code of [
      TileCode.PallMall,
      TileCode.Whitehall,
      TileCode.NorthumberlandAvenue,
    ]) {
      const tile = street(engine, code);
      tile.owner = p3;
      tile.houseCount = 1;
    }
    utility(engine, TileCode.WaterWorks).owner = p3;
  }

  // Player 4: overextended and in the red, one house tier short of a hotel,
  // with a utility and a station of their own.
  if (p4) {
    p4.tileId = 0; // GO — stacked with Player 3
    p4.balance = -260;
    p4.jailTurnsRemaining = 0;
    p4.getOutOfJailFreeCards = 0;

    for (const code of [
      TileCode.BowStreet,
      TileCode.MarlboroughStreet,
      TileCode.VineStreet,
    ]) {
      const tile = street(engine, code);
      tile.owner = p4;
      tile.houseCount = 4;
    }
    utility(engine, TileCode.ElectricCompany).owner = p4;
    station(engine, TileCode.FenchurchStStation).owner = p4;
  }

  return buildWealthHistory(players);
}

/**
 * A short, gently fluctuating history ending at each player's current
 * balance, so the wealth chart shows some real movement immediately rather
 * than a flat line from a single starting snapshot.
 */
function buildWealthHistory(players: Player[]): WealthSnapshot[] {
  const wobble = [0, 0.3, -0.2, 0.5, 0.1, -0.4, 0.6, 0.2, -0.1, 0];
  return wobble.map((factor, tick) => ({
    tick,
    balances: Object.fromEntries(
      players.map((player) => [
        player.id,
        Math.round(player.balance * (1 - factor * 0.25)),
      ]),
    ),
  }));
}
