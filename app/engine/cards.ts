import type { GameEngine, Player } from ".";
import {
  BOARD_TILES,
  ChanceCardCode,
  CommunityChestCardCode,
  TileCode,
} from "./static-data";
import { getRoll } from "./dice";
import { GoToJailBoardTileState } from "./tiles/jail-tile";
import { StreetBoardTileState } from "./tiles/street-tile";

type CardEffect = (engine: GameEngine, player: Player) => void;

function tileIdForCode(code: TileCode): number {
  const tile = BOARD_TILES.find((t) => t.code === code);
  if (!tile) {
    throw new Error(`Tile with code ${code} not found`);
  }
  return tile.id;
}

function otherPlayers(engine: GameEngine, player: Player): Player[] {
  return engine.getState().players.filter((p) => p !== player);
}

/** Every other player pays `amount` to `player`. */
function collectFromEachPlayer(
  engine: GameEngine,
  player: Player,
  amount: number,
) {
  for (const other of otherPlayers(engine, player)) {
    other.pay(amount);
    player.balance += amount;
  }
}

/** `player` pays `amount` to every other player. */
function payEachPlayer(engine: GameEngine, player: Player, amount: number) {
  for (const other of otherPlayers(engine, player)) {
    player.pay(amount);
    other.balance += amount;
  }
}

/** Charges `player` for every house/hotel they own, at the given per-house/per-hotel rates. */
function payPropertyRepairs(
  engine: GameEngine,
  player: Player,
  perHouse: number,
  perHotel: number,
) {
  const ownedStreets = engine
    .getState()
    .board.filter(
      (tile): tile is StreetBoardTileState =>
        tile instanceof StreetBoardTileState && tile.owner === player,
    );
  const cost = ownedStreets.reduce(
    (total, tile) =>
      total + (tile.houseCount === 5 ? perHotel : tile.houseCount * perHouse),
    0,
  );
  player.pay(cost);
}

function sendToJail(engine: GameEngine, player: Player) {
  const goToJailTile = engine.getTile(
    TileCode.GoToJail,
    GoToJailBoardTileState,
  );
  goToJailTile.landedOn(player);
}

/** Advance token to the nearest tile in `candidateIds` (wrapping past GO). */
function nearestTileId(candidateIds: number[], fromTileId: number): number {
  const sorted = [...candidateIds].sort((a, b) => a - b);
  return sorted.find((id) => id > fromTileId) ?? sorted[0];
}

function advanceToNearestUtility(engine: GameEngine, player: Player) {
  const utilities = engine.getUtilities();
  const tileId = nearestTileId(
    utilities.map((u) => u.props.id),
    player.tileId,
  );
  engine.advanceToTile(player, tileId, { triggerLandedOn: false });

  const utility = utilities.find((u) => u.props.id === tileId)!;
  if (utility.owner && utility.owner !== player) {
    const amount = getRoll() * 10;
    player.pay(amount);
    utility.owner.balance += amount;
  } else if (!utility.owner && player.balance >= utility.props.price) {
    player.balance -= utility.props.price;
    utility.owner = player;
  }
}

function advanceToNearestStation(engine: GameEngine, player: Player) {
  const stations = engine.getStations();
  const tileId = nearestTileId(
    stations.map((s) => s.props.id),
    player.tileId,
  );
  engine.advanceToTile(player, tileId, { triggerLandedOn: false });

  const station = stations.find((s) => s.props.id === tileId)!;
  if (station.owner && station.owner !== player) {
    const amount = station.rent * 2;
    player.pay(amount);
    station.owner.balance += amount;
  } else if (!station.owner && player.balance >= station.props.price) {
    player.balance -= station.props.price;
    station.owner = player;
  }
}

export const CHANCE_CARD_EFFECTS: Record<ChanceCardCode, CardEffect> = {
  [ChanceCardCode.AdvanceToGo]: (engine, player) =>
    engine.advanceToTile(player, tileIdForCode(TileCode.Go)),
  [ChanceCardCode.AdvanceToTrafalgarSquare]: (engine, player) =>
    engine.advanceToTile(player, tileIdForCode(TileCode.TrafalgarSquare)),
  [ChanceCardCode.AdvanceToMayfair]: (engine, player) =>
    engine.advanceToTile(player, tileIdForCode(TileCode.Mayfair)),
  [ChanceCardCode.AdvanceToPallMall]: (engine, player) =>
    engine.advanceToTile(player, tileIdForCode(TileCode.PallMall)),
  [ChanceCardCode.AdvanceToNearestStation]: advanceToNearestStation,
  [ChanceCardCode.AdvanceToNearestUtility]: advanceToNearestUtility,
  [ChanceCardCode.BankDividend]: (_engine, player) => {
    player.balance += 50;
  },
  [ChanceCardCode.GetOutOfJailFree]: (_engine, player) => {
    player.getOutOfJailFreeCards += 1;
  },
  [ChanceCardCode.GoBackThreeSpaces]: (engine, player) =>
    engine.moveBackward(player, 3),
  [ChanceCardCode.GoToJail]: sendToJail,
  [ChanceCardCode.GeneralRepairs]: (engine, player) =>
    payPropertyRepairs(engine, player, 25, 100),
  [ChanceCardCode.PoorTax]: (_engine, player) => {
    player.pay(15);
  },
  [ChanceCardCode.AdvanceToMaryleboneStation]: (engine, player) =>
    engine.advanceToTile(player, tileIdForCode(TileCode.MaryleboneStation)),
  [ChanceCardCode.ChairmanOfTheBoard]: (engine, player) =>
    payEachPlayer(engine, player, 50),
  [ChanceCardCode.BuildingLoanMatures]: (_engine, player) => {
    player.balance += 150;
  },
  [ChanceCardCode.CrosswordCompetition]: (_engine, player) => {
    player.balance += 100;
  },
};

export const COMMUNITY_CHEST_CARD_EFFECTS: Record<
  CommunityChestCardCode,
  CardEffect
> = {
  [CommunityChestCardCode.AdvanceToGo]: (engine, player) =>
    engine.advanceToTile(player, tileIdForCode(TileCode.Go)),
  [CommunityChestCardCode.BankError]: (_engine, player) => {
    player.balance += 200;
  },
  [CommunityChestCardCode.DoctorsFees]: (_engine, player) => {
    player.pay(50);
  },
  [CommunityChestCardCode.SaleOfStock]: (_engine, player) => {
    player.balance += 50;
  },
  [CommunityChestCardCode.GetOutOfJailFree]: (_engine, player) => {
    player.getOutOfJailFreeCards += 1;
  },
  [CommunityChestCardCode.GoToJail]: sendToJail,
  [CommunityChestCardCode.GrandOperaNight]: (engine, player) =>
    collectFromEachPlayer(engine, player, 50),
  [CommunityChestCardCode.HolidayFundMatures]: (_engine, player) => {
    player.balance += 100;
  },
  [CommunityChestCardCode.IncomeTaxRefund]: (_engine, player) => {
    player.balance += 20;
  },
  [CommunityChestCardCode.Birthday]: (engine, player) =>
    collectFromEachPlayer(engine, player, 10),
  [CommunityChestCardCode.LifeInsuranceMatures]: (_engine, player) => {
    player.balance += 100;
  },
  [CommunityChestCardCode.HospitalFees]: (_engine, player) => {
    player.pay(100);
  },
  [CommunityChestCardCode.SchoolFees]: (_engine, player) => {
    player.pay(50);
  },
  [CommunityChestCardCode.ConsultancyFee]: (_engine, player) => {
    player.balance += 25;
  },
  [CommunityChestCardCode.StreetRepairs]: (engine, player) =>
    payPropertyRepairs(engine, player, 40, 115),
  [CommunityChestCardCode.BeautyContest]: (_engine, player) => {
    player.balance += 10;
  },
  [CommunityChestCardCode.Inheritance]: (_engine, player) => {
    player.balance += 100;
  },
};
