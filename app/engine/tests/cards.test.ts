import { GameEngine, type Player } from "..";
import {
  TileCode,
  ChanceCardCode,
  CommunityChestCardCode,
  CHANCE_CARDS,
  COMMUNITY_CHEST_CARDS,
  type ChanceCard,
  type CommunityChestCard,
} from "../static-data";
import { CHANCE_CARD_EFFECTS, COMMUNITY_CHEST_CARD_EFFECTS } from "../cards";
import {
  StreetBoardTileState,
  UtilitiesBoardTileState,
  TrainStationBoardTileState,
} from "../tiles";

/**
 * This file contains tests for the community chest and chance cards.
 */

let engine: GameEngine;
let player1: Player;

beforeEach(() => {
  engine = new GameEngine({ numPlayers: 1 });
  player1 = engine.getState().players[0];
});

describe("card decks", () => {
  test("chance deck contains every chance card exactly once", () => {
    const drawn = new Set<ChanceCard>();
    for (let i = 0; i < CHANCE_CARDS.length; i++) {
      drawn.add(engine.drawChanceCard());
    }
    expect(drawn.size).toBe(CHANCE_CARDS.length);
  });

  test("community chest deck contains every community chest card exactly once", () => {
    const drawn = new Set<CommunityChestCard>();
    for (let i = 0; i < COMMUNITY_CHEST_CARDS.length; i++) {
      drawn.add(engine.drawCommunityChestCard());
    }
    expect(drawn.size).toBe(COMMUNITY_CHEST_CARDS.length);
  });

  test("drawn cards cycle back to the bottom of the deck", () => {
    const firstPass = Array.from({ length: CHANCE_CARDS.length }, () =>
      engine.drawChanceCard(),
    );
    const secondPass = Array.from({ length: CHANCE_CARDS.length }, () =>
      engine.drawChanceCard(),
    );
    expect(secondPass).toEqual(firstPass);
  });
});

test("player draws a community chest card when landing on Community Chest", () => {
  engine.communityChestDeck = [
    COMMUNITY_CHEST_CARDS.find(
      (card) => card.code === CommunityChestCardCode.BankError,
    )!,
    ...engine.communityChestDeck.filter(
      (card) => card.code !== CommunityChestCardCode.BankError,
    ),
  ];
  const initialBalance = player1.balance;

  engine.tick(2); // Move to Community Chest
  expect(player1.tileId).toBe(2);
  expect(player1.balance).toBe(initialBalance + 200);
});

test("player draws a chance card when landing on Chance", () => {
  engine.chanceDeck = [
    CHANCE_CARDS.find((card) => card.code === ChanceCardCode.BankDividend)!,
    ...engine.chanceDeck.filter(
      (card) => card.code !== ChanceCardCode.BankDividend,
    ),
  ];
  const initialBalance = player1.balance;

  engine.tick(7); // Move to Chance
  expect(player1.tileId).toBe(7);
  expect(player1.balance).toBe(initialBalance + 50);
});

describe("Chance card effects", () => {
  test("Advance to GO: moves to GO and collects $200", () => {
    player1.tileId = 20;
    const initialBalance = player1.balance;

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToGo](engine, player1);

    expect(player1.tileId).toBe(0);
    expect(player1.balance).toBe(initialBalance + 200);
  });

  test("Advance to Trafalgar Square: buys the unowned property", () => {
    player1.tileId = 10;

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToTrafalgarSquare](
      engine,
      player1,
    );

    expect(player1.tileId).toBe(24);
    expect(player1.balance).toBe(1500 - 240); // Trafalgar Square costs $240
    const tile = engine.getTile(TileCode.TrafalgarSquare, StreetBoardTileState);
    expect(tile.owner).toBe(player1);
  });

  test("Advance to Trafalgar Square: collects $200 if it wraps past GO", () => {
    player1.tileId = 30; // Past Trafalgar Square (24), so advancing wraps through GO

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToTrafalgarSquare](
      engine,
      player1,
    );

    expect(player1.tileId).toBe(24);
    expect(player1.balance).toBe(1500 + 200 - 240);
  });

  test("Advance to Mayfair: buys the unowned property, no GO bonus", () => {
    player1.tileId = 0;

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToMayfair](engine, player1);

    expect(player1.tileId).toBe(39);
    expect(player1.balance).toBe(1500 - 400); // Mayfair costs $400
  });

  test("Advance to Pall Mall: pays rent if owned by another player", () => {
    engine = new GameEngine({ numPlayers: 2 });
    const [p1, p2] = engine.getState().players;
    const pallMall = engine.getTile(TileCode.PallMall, StreetBoardTileState);
    pallMall.owner = p2;
    p1.tileId = 0;
    const p1Balance = p1.balance;
    const p2Balance = p2.balance;

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToPallMall](engine, p1);

    expect(p1.tileId).toBe(11);
    expect(p1.balance).toBe(p1Balance - 10); // Pall Mall's base rent is $10
    expect(p2.balance).toBe(p2Balance + 10);
  });

  test("Advance to the nearest Utility: buys it if unowned", () => {
    player1.tileId = 0; // Nearest utility is Electric Company (12)

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToNearestUtility](
      engine,
      player1,
    );

    expect(player1.tileId).toBe(12);
    expect(player1.balance).toBe(1500 - 150);
    const tile = engine.getTile(
      TileCode.ElectricCompany,
      UtilitiesBoardTileState,
    );
    expect(tile.owner).toBe(player1);
  });

  test("Advance to the nearest Utility: pays 10x the dice roll if owned", () => {
    engine = new GameEngine({ numPlayers: 2 });
    const [p1, p2] = engine.getState().players;
    const electricCompany = engine.getTile(
      TileCode.ElectricCompany,
      UtilitiesBoardTileState,
    );
    electricCompany.owner = p2;
    p1.tileId = 0;
    const p1Balance = p1.balance;
    const p2Balance = p2.balance;

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToNearestUtility](engine, p1);

    expect(p1.tileId).toBe(12);
    const amountPaid = p1Balance - p1.balance;
    expect(amountPaid).toBe(p2.balance - p2Balance);
    expect(amountPaid % 10).toBe(0);
    expect(amountPaid).toBeGreaterThanOrEqual(20); // Minimum roll of 2 x 10
    expect(amountPaid).toBeLessThanOrEqual(120); // Maximum roll of 12 x 10
  });

  test("Advance to the nearest Station: buys it if unowned", () => {
    player1.tileId = 0; // Nearest station is Kings Cross Station (5)

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToNearestStation](
      engine,
      player1,
    );

    expect(player1.tileId).toBe(5);
    expect(player1.balance).toBe(1500 - 200);
    const tile = engine.getTile(
      TileCode.KingsCrossStation,
      TrainStationBoardTileState,
    );
    expect(tile.owner).toBe(player1);
  });

  test("Advance to the nearest Station: pays double rent if owned", () => {
    engine = new GameEngine({ numPlayers: 2 });
    const [p1, p2] = engine.getState().players;
    const kingsCross = engine.getTile(
      TileCode.KingsCrossStation,
      TrainStationBoardTileState,
    );
    kingsCross.owner = p2;
    p1.tileId = 0;
    const p1Balance = p1.balance;
    const p2Balance = p2.balance;

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToNearestStation](engine, p1);

    expect(p1.tileId).toBe(5);
    expect(p1.balance).toBe(p1Balance - 50); // Double the normal $25 rent
    expect(p2.balance).toBe(p2Balance + 50);
  });

  test("Bank pays you dividend of $50", () => {
    const initialBalance = player1.balance;
    CHANCE_CARD_EFFECTS[ChanceCardCode.BankDividend](engine, player1);
    expect(player1.balance).toBe(initialBalance + 50);
  });

  test("Get out of Jail Free: adds a card to the player's held cards", () => {
    expect(player1.getOutOfJailFreeCards).toBe(0);
    CHANCE_CARD_EFFECTS[ChanceCardCode.GetOutOfJailFree](engine, player1);
    expect(player1.getOutOfJailFreeCards).toBe(1);
  });

  test("Go Back Three Spaces: moves the player back 3 tiles, no GO bonus", () => {
    player1.tileId = 13;
    const initialBalance = player1.balance;

    CHANCE_CARD_EFFECTS[ChanceCardCode.GoBackThreeSpaces](engine, player1);

    expect(player1.tileId).toBe(10);
    expect(player1.balance).toBe(initialBalance);
  });

  test("Go to Jail: sends the player directly to jail", () => {
    player1.tileId = 7;

    CHANCE_CARD_EFFECTS[ChanceCardCode.GoToJail](engine, player1);

    expect(player1.tileId).toBe(10);
    expect(player1.jailTurnsRemaining).toBe(3);
  });

  test("Make general repairs: charges $25 per house and $100 per hotel", () => {
    const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
    const whitechapel = engine.getTile(
      TileCode.WhitechapelRoad,
      StreetBoardTileState,
    );
    okr.owner = player1;
    okr.houseCount = 3;
    whitechapel.owner = player1;
    whitechapel.houseCount = 5; // Hotel
    const initialBalance = player1.balance;

    CHANCE_CARD_EFFECTS[ChanceCardCode.GeneralRepairs](engine, player1);

    expect(player1.balance).toBe(initialBalance - (3 * 25 + 100));
  });

  test("Pay poor tax of $15", () => {
    const initialBalance = player1.balance;
    CHANCE_CARD_EFFECTS[ChanceCardCode.PoorTax](engine, player1);
    expect(player1.balance).toBe(initialBalance - 15);
  });

  test("Take a trip to Marylebone Station: buys it if unowned", () => {
    player1.tileId = 0;

    CHANCE_CARD_EFFECTS[ChanceCardCode.AdvanceToMaryleboneStation](
      engine,
      player1,
    );

    expect(player1.tileId).toBe(15);
    expect(player1.balance).toBe(1500 - 200);
  });

  test("You have been elected Chairman of the Board: pays each player $50", () => {
    engine = new GameEngine({ numPlayers: 3 });
    const [p1, p2, p3] = engine.getState().players;

    CHANCE_CARD_EFFECTS[ChanceCardCode.ChairmanOfTheBoard](engine, p1);

    expect(p1.balance).toBe(1500 - 100);
    expect(p2.balance).toBe(1500 + 50);
    expect(p3.balance).toBe(1500 + 50);
  });

  test("Your building loan matures: collect $150", () => {
    const initialBalance = player1.balance;
    CHANCE_CARD_EFFECTS[ChanceCardCode.BuildingLoanMatures](engine, player1);
    expect(player1.balance).toBe(initialBalance + 150);
  });

  test("You have won a crossword competition: collect $100", () => {
    const initialBalance = player1.balance;
    CHANCE_CARD_EFFECTS[ChanceCardCode.CrosswordCompetition](engine, player1);
    expect(player1.balance).toBe(initialBalance + 100);
  });
});

describe("Community Chest card effects", () => {
  test("Advance to GO: moves to GO and collects $200", () => {
    player1.tileId = 20;
    const initialBalance = player1.balance;

    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.AdvanceToGo](
      engine,
      player1,
    );

    expect(player1.tileId).toBe(0);
    expect(player1.balance).toBe(initialBalance + 200);
  });

  test("Bank error in your favor: collect $200", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.BankError](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance + 200);
  });

  test("Doctor's fees: pay $50", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.DoctorsFees](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance - 50);
  });

  test("From sale of stock you get $50", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.SaleOfStock](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance + 50);
  });

  test("Get Out of Jail Free: adds a card to the player's held cards", () => {
    expect(player1.getOutOfJailFreeCards).toBe(0);
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.GetOutOfJailFree](
      engine,
      player1,
    );
    expect(player1.getOutOfJailFreeCards).toBe(1);
  });

  test("Go to Jail: sends the player directly to jail", () => {
    player1.tileId = 17;

    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.GoToJail](
      engine,
      player1,
    );

    expect(player1.tileId).toBe(10);
    expect(player1.jailTurnsRemaining).toBe(3);
  });

  test("Grand Opera Night: collects $50 from every player", () => {
    engine = new GameEngine({ numPlayers: 3 });
    const [p1, p2, p3] = engine.getState().players;

    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.GrandOperaNight](
      engine,
      p1,
    );

    expect(p1.balance).toBe(1500 + 100);
    expect(p2.balance).toBe(1500 - 50);
    expect(p3.balance).toBe(1500 - 50);
  });

  test("Holiday Fund matures: receive $100", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.HolidayFundMatures](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance + 100);
  });

  test("Income tax refund: collect $20", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.IncomeTaxRefund](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance + 20);
  });

  test("It is your birthday: collect $10 from each player", () => {
    engine = new GameEngine({ numPlayers: 3 });
    const [p1, p2, p3] = engine.getState().players;

    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.Birthday](engine, p1);

    expect(p1.balance).toBe(1500 + 20);
    expect(p2.balance).toBe(1500 - 10);
    expect(p3.balance).toBe(1500 - 10);
  });

  test("Life insurance matures: collect $100", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.LifeInsuranceMatures](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance + 100);
  });

  test("Pay hospital fees of $100", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.HospitalFees](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance - 100);
  });

  test("Pay school fees of $50", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.SchoolFees](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance - 50);
  });

  test("Receive $25 consultancy fee", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.ConsultancyFee](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance + 25);
  });

  test("You are assessed for street repairs: $40 per house, $115 per hotel", () => {
    const okr = engine.getTile(TileCode.OldKentRoad, StreetBoardTileState);
    const whitechapel = engine.getTile(
      TileCode.WhitechapelRoad,
      StreetBoardTileState,
    );
    okr.owner = player1;
    okr.houseCount = 2;
    whitechapel.owner = player1;
    whitechapel.houseCount = 5; // Hotel
    const initialBalance = player1.balance;

    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.StreetRepairs](
      engine,
      player1,
    );

    expect(player1.balance).toBe(initialBalance - (2 * 40 + 115));
  });

  test("You have won second prize in a beauty contest: collect $10", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.BeautyContest](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance + 10);
  });

  test("You inherit $100", () => {
    const initialBalance = player1.balance;
    COMMUNITY_CHEST_CARD_EFFECTS[CommunityChestCardCode.Inheritance](
      engine,
      player1,
    );
    expect(player1.balance).toBe(initialBalance + 100);
  });
});
