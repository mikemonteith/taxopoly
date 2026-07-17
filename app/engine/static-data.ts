/**
 * All static data for the Monopoly board game, including the board layout, card decks, and color groups.
 * This data is used by the game engine and UI components to render the board and manage game state.
 */

export enum TileType {
  Street,
  TrainStation,
  Utility,
  Tax,
  Chance,
  Chest,
  Go,
  Jail,
  FreeParking,
  GoToJail,
}

export enum StreetGroup {
  Brown = "brown",
  LightBlue = "lightblue",
  Pink = "pink",
  Orange = "orange",
  Red = "red",
  Yellow = "yellow",
  Green = "green",
  DarkBlue = "darkblue",
}

export type BoardSide = "bottom" | "left" | "top" | "right" | "corner";

export enum TileCode {
  Go = "GO",
  OldKentRoad = "OldKentRoad",
  CommunityChest = "CommunityChest",
  WhitechapelRoad = "WhitechapelRoad",
  IncomeTax = "IncomeTax",
  KingsCrossStation = "KingsCrossStation",
  TheAngelIslington = "TheAngelIslington",
  Chance = "Chance",
  EustonRoad = "EustonRoad",
  PentonvilleRoad = "PentonvilleRoad",
  Jail = "Jail",
  PallMall = "PallMall",
  ElectricCompany = "ElectricCompany",
  Whitehall = "Whitehall",
  NorthumberlandAvenue = "NorthumberlandAvenue",
  MaryleboneStation = "MaryleboneStation",
  BowStreet = "BowStreet",
  MarlboroughStreet = "MarlboroughStreet",
  VineStreet = "VineStreet",
  FreeParking = "FreeParking",
  Strand = "Strand",
  FleetStreet = "FleetStreet",
  TrafalgarSquare = "TrafalgarSquare",
  FenchurchStStation = "FenchurchStStation",
  LeicesterSquare = "LeicesterSquare",
  CoventryStreet = "CoventryStreet",
  WaterWorks = "WaterWorks",
  Piccadilly = "Piccadilly",
  GoToJail = "GoToJail",
  RegentStreet = "RegentStreet",
  OxfordStreet = "OxfordStreet",
  BondStreet = "BondStreet",
  LiverpoolStStation = "LiverpoolStStation",
  ParkLane = "ParkLane",
  LuxuryTax = "LuxuryTax",
  Mayfair = "Mayfair",
}

export interface BoardTileBase {
  id: number;
  name: string;
  /** Short name (2, 3 or 4 chars) */
  abbr: string;
  code: TileCode;
  /** Which edge of the tile faces the board's interior — null for corners. */
  side: BoardSide | null;
}

export interface BuildableBoardTile extends BoardTileBase {
  type: TileType.Street;

  /** Which street this property belongs to. */
  street: StreetGroup;

  /**
   * For buildable properties, specify the rent for 0, 1, 2, 3, 4 houses and a hotel.
   */
  rent: [number, number, number, number, number, number];
  price: number;
  houseCost: number;
}

export interface TrainStationBoardTile extends BoardTileBase {
  type: TileType.TrainStation;
  rent: number;
  price: number;
}

export interface UtilityBoardTile extends BoardTileBase {
  type: TileType.Utility;
  price: number;
}

export interface TaxBoardTile extends BoardTileBase {
  type: TileType.Tax;
  /** The amount of tax to be paid when landing on this tile. */
  tax: number;
}

export interface CornerBoardTile extends BoardTileBase {
  type: TileType.Go | TileType.Jail | TileType.FreeParking | TileType.GoToJail;
}

export interface CardBoardTile extends BoardTileBase {
  type: TileType.Chance | TileType.Chest;
}

export type BoardTile =
  | BuildableBoardTile
  | TrainStationBoardTile
  | UtilityBoardTile
  | TaxBoardTile
  | CornerBoardTile
  | CardBoardTile;

export const BOARD_TILES: BoardTile[] = [
  {
    id: 0,
    name: "GO",
    code: TileCode.Go,
    type: TileType.Go,
    side: null,
    abbr: "GO",
  },
  {
    id: 1,
    name: "Old Kent Road",
    code: TileCode.OldKentRoad,
    street: StreetGroup.Brown,
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    houseCost: 50,
    type: TileType.Street,
    abbr: "OKR",
    side: "bottom",
  },
  {
    id: 2,
    name: "Community Chest",
    code: TileCode.CommunityChest,
    type: TileType.Chest,
    side: "bottom",
    abbr: "CC",
  },
  {
    id: 3,
    name: "Whitechapel Road",
    code: TileCode.WhitechapelRoad,
    street: StreetGroup.Brown,
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    houseCost: 50,
    type: TileType.Street,
    abbr: "WCR",
    side: "bottom",
  },
  {
    id: 4,
    name: "Income Tax",
    code: TileCode.IncomeTax,
    type: TileType.Tax,
    side: "bottom",
    abbr: "TAX",
    tax: 200,
  },
  {
    id: 5,
    name: "King's Cross Station",
    code: TileCode.KingsCrossStation,
    type: TileType.TrainStation,
    price: 200,
    rent: 25,
    side: "bottom",
    abbr: "KCS",
  },
  {
    id: 6,
    name: "The Angel, Islington",
    code: TileCode.TheAngelIslington,
    type: TileType.Street,
    street: StreetGroup.LightBlue,
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    side: "bottom",
    abbr: "ANG",
  },
  {
    id: 7,
    name: "Chance",
    code: TileCode.Chance,
    type: TileType.Chance,
    side: "bottom",
    abbr: "?",
  },
  {
    id: 8,
    name: "Euston Road",
    code: TileCode.EustonRoad,
    street: StreetGroup.LightBlue,
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    type: TileType.Street,
    side: "bottom",
    abbr: "EUS",
  },
  {
    id: 9,
    name: "Pentonville Road",
    code: TileCode.PentonvilleRoad,
    street: StreetGroup.LightBlue,
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    houseCost: 50,
    type: TileType.Street,
    side: "bottom",
    abbr: "PEN",
  },
  {
    id: 10,
    name: "Jail",
    code: TileCode.Jail,
    type: TileType.Jail,
    side: null,
    abbr: "JAIL",
  },
  {
    id: 11,
    name: "Pall Mall",
    code: TileCode.PallMall,
    street: StreetGroup.Pink,
    type: TileType.Street,
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    side: "left",
    abbr: "PAL",
  },
  {
    id: 12,
    name: "Electric Company",
    code: TileCode.ElectricCompany,
    type: TileType.Utility,
    price: 150,
    side: "left",
    abbr: "EC",
  },
  {
    id: 13,
    name: "Whitehall",
    code: TileCode.Whitehall,
    street: StreetGroup.Pink,
    type: TileType.Street,
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    side: "left",
    abbr: "WHI",
  },
  {
    id: 14,
    name: "Northumberland Avenue",
    code: TileCode.NorthumberlandAvenue,
    street: StreetGroup.Pink,
    type: TileType.Street,
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    houseCost: 100,
    side: "left",
    abbr: "NOR",
  },
  {
    id: 15,
    name: "Marylebone Station",
    code: TileCode.MaryleboneStation,
    type: TileType.TrainStation,
    price: 200,
    rent: 25,
    side: "left",
    abbr: "MAR",
  },
  {
    id: 16,
    name: "Bow Street",
    code: TileCode.BowStreet,
    street: StreetGroup.Orange,
    type: TileType.Street,
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    side: "left",
    abbr: "BOW",
  },
  {
    id: 17,
    name: "Community Chest",
    code: TileCode.CommunityChest,
    type: TileType.Chest,
    side: "left",
    abbr: "CC",
  },
  {
    id: 18,
    name: "Marlborough Street",
    code: TileCode.MarlboroughStreet,
    street: StreetGroup.Orange,
    type: TileType.Street,
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    side: "left",
    abbr: "MAR",
  },
  {
    id: 19,
    name: "Vine Street",
    code: TileCode.VineStreet,
    street: StreetGroup.Orange,
    type: TileType.Street,
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    houseCost: 100,
    side: "left",
    abbr: "VIN",
  },
  {
    id: 20,
    name: "Free Parking",
    code: TileCode.FreeParking,
    type: TileType.FreeParking,
    side: null,
    abbr: "FREE",
  },
  {
    id: 21,
    name: "Strand",
    code: TileCode.Strand,
    street: StreetGroup.Red,
    type: TileType.Street,
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    side: "top",
    abbr: "STR",
  },
  {
    id: 22,
    name: "Chance",
    code: TileCode.Chance,
    type: TileType.Chance,
    side: "top",
    abbr: "CH",
  },
  {
    id: 23,
    name: "Fleet Street",
    code: TileCode.FleetStreet,
    street: StreetGroup.Red,
    type: TileType.Street,
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    side: "top",
    abbr: "FLT",
  },
  {
    id: 24,
    name: "Trafalgar Square",
    code: TileCode.TrafalgarSquare,
    street: StreetGroup.Red,
    type: TileType.Street,
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    houseCost: 150,
    side: "top",
    abbr: "TRF",
  },
  {
    id: 25,
    name: "Fenchurch St. Station",
    code: TileCode.FenchurchStStation,
    type: TileType.TrainStation,
    price: 200,
    rent: 25,
    side: "top",
    abbr: "FEN",
  },
  {
    id: 26,
    name: "Leicester Square",
    code: TileCode.LeicesterSquare,
    street: StreetGroup.Yellow,
    type: TileType.Street,
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    side: "top",
    abbr: "LES",
  },
  {
    id: 27,
    name: "Coventry Street",
    code: TileCode.CoventryStreet,
    street: StreetGroup.Yellow,
    type: TileType.Street,
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    side: "top",
    abbr: "COV",
  },
  {
    id: 28,
    name: "Water Works",
    code: TileCode.WaterWorks,
    type: TileType.Utility,
    price: 150,
    side: "top",
    abbr: "H2O",
  },
  {
    id: 29,
    name: "Piccadilly",
    code: TileCode.Piccadilly,
    street: StreetGroup.Yellow,
    type: TileType.Street,
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    houseCost: 150,
    side: "top",
    abbr: "PIC",
  },
  {
    id: 30,
    name: "Go To Jail",
    code: TileCode.GoToJail,
    type: TileType.GoToJail,
    side: null,
    abbr: "GTJ",
  },
  {
    id: 31,
    name: "Regent Street",
    code: TileCode.RegentStreet,
    street: StreetGroup.Green,
    type: TileType.Street,
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    side: "right",
    abbr: "REG",
  },
  {
    id: 32,
    name: "Oxford Street",
    code: TileCode.OxfordStreet,
    street: StreetGroup.Green,
    type: TileType.Street,
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    side: "right",
    abbr: "OXF",
  },
  {
    id: 33,
    name: "Community Chest",
    code: TileCode.CommunityChest,
    type: TileType.Chest,
    side: "right",
    abbr: "CC",
  },
  {
    id: 34,
    name: "Bond Street",
    code: TileCode.BondStreet,
    street: StreetGroup.Green,
    type: TileType.Street,
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
    side: "right",
    abbr: "BND",
  },
  {
    id: 35,
    name: "Liverpool Street Station",
    code: TileCode.LiverpoolStStation,
    type: TileType.TrainStation,
    price: 200,
    rent: 25,
    side: "right",
    abbr: "LIV",
  },
  {
    id: 36,
    name: "Chance",
    code: TileCode.Chance,
    type: TileType.Chance,
    side: "right",
    abbr: "?",
  },
  {
    id: 37,
    name: "Park Lane",
    code: TileCode.ParkLane,
    street: StreetGroup.DarkBlue,
    type: TileType.Street,
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
    side: "right",
    abbr: "PL",
  },
  {
    id: 38,
    name: "Luxury Tax",
    code: TileCode.LuxuryTax,
    type: TileType.Tax,
    side: "right",
    abbr: "LUX",
    tax: 100,
  },
  {
    id: 39,
    name: "Mayfair",
    code: TileCode.Mayfair,
    street: StreetGroup.DarkBlue,
    type: TileType.Street,
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
    side: "right",
    abbr: "MAY",
  },
] as const;

export enum CommunityChestCardCode {
  AdvanceToGo = "AdvanceToGo",
  BankError = "BankError",
  DoctorsFees = "DoctorsFees",
  SaleOfStock = "SaleOfStock",
  GetOutOfJailFree = "GetOutOfJailFree",
  GoToJail = "GoToJail",
  GrandOperaNight = "GrandOperaNight",
  HolidayFundMatures = "HolidayFundMatures",
  IncomeTaxRefund = "IncomeTaxRefund",
  Birthday = "Birthday",
  LifeInsuranceMatures = "LifeInsuranceMatures",
  HospitalFees = "HospitalFees",
  SchoolFees = "SchoolFees",
  ConsultancyFee = "ConsultancyFee",
  StreetRepairs = "StreetRepairs",
  BeautyContest = "BeautyContest",
  Inheritance = "Inheritance",
}

export interface CommunityChestCard {
  code: CommunityChestCardCode;
  description: string;
}

export const COMMUNITY_CHEST_CARDS: CommunityChestCard[] = [
  {
    code: CommunityChestCardCode.AdvanceToGo,
    description: "Advance to GO (Collect $200)",
  },
  {
    code: CommunityChestCardCode.BankError,
    description: "Bank error in your favor – Collect $200",
  },
  {
    code: CommunityChestCardCode.DoctorsFees,
    description: "Doctor's fees – Pay $50",
  },
  {
    code: CommunityChestCardCode.SaleOfStock,
    description: "From sale of stock you get $50",
  },
  {
    code: CommunityChestCardCode.GetOutOfJailFree,
    description:
      "Get Out of Jail Free – This card may be kept until needed or sold",
  },
  {
    code: CommunityChestCardCode.GoToJail,
    description:
      "Go to Jail – Go directly to jail – Do not pass GO – Do not collect $200",
  },
  {
    code: CommunityChestCardCode.GrandOperaNight,
    description:
      "Grand Opera Night – Collect $50 from every player for opening night seats",
  },
  {
    code: CommunityChestCardCode.HolidayFundMatures,
    description: "Holiday Fund matures - Receive $100",
  },
  {
    code: CommunityChestCardCode.IncomeTaxRefund,
    description: "Income tax refund – Collect $20",
  },
  {
    code: CommunityChestCardCode.Birthday,
    description: "It is your birthday - Collect $10 from each player",
  },
  {
    code: CommunityChestCardCode.LifeInsuranceMatures,
    description: "Life insurance matures – Collect $100",
  },
  {
    code: CommunityChestCardCode.HospitalFees,
    description: "Hospital Fees – Pay $100",
  },
  {
    code: CommunityChestCardCode.SchoolFees,
    description: "School fees – Pay $50",
  },
  {
    code: CommunityChestCardCode.ConsultancyFee,
    description: "Receive $25 consultancy fee",
  },
  {
    code: CommunityChestCardCode.StreetRepairs,
    description:
      "You are assessed for street repairs – $40 per house – $115 per hotel",
  },
  {
    code: CommunityChestCardCode.BeautyContest,
    description: "You have won second prize in a beauty contest – Collect $10",
  },
  { code: CommunityChestCardCode.Inheritance, description: "You inherit $100" },
];

export enum ChanceCardCode {
  AdvanceToGo = "AdvanceToGo",
  AdvanceToTrafalgarSquare = "AdvanceToTrafalgarSquare",
  AdvanceToMayfair = "AdvanceToMayfair",
  AdvanceToPallMall = "AdvanceToPallMall",
  AdvanceToNearestStation = "AdvanceToNearestStation",
  AdvanceToNearestUtility = "AdvanceToNearestUtility",
  BankDividend = "BankDividend",
  GetOutOfJailFree = "GetOutOfJailFree",
  GoBackThreeSpaces = "GoBackThreeSpaces",
  GoToJail = "GoToJail",
  GeneralRepairs = "GeneralRepairs",
  PoorTax = "PoorTax",
  AdvanceToMaryleboneStation = "AdvanceToMaryleboneStation",
  ChairmanOfTheBoard = "ChairmanOfTheBoard",
  BuildingLoanMatures = "BuildingLoanMatures",
  CrosswordCompetition = "CrosswordCompetition",
}

export interface ChanceCard {
  code: ChanceCardCode;
  description: string;
}

export const CHANCE_CARDS: ChanceCard[] = [
  {
    code: ChanceCardCode.AdvanceToGo,
    description: "Advance to GO (Collect $200)",
  },
  {
    code: ChanceCardCode.AdvanceToTrafalgarSquare,
    description: "Advance to Trafalgar Square – If you pass GO, collect $200",
  },
  {
    code: ChanceCardCode.AdvanceToMayfair,
    description: "Advance to Mayfair",
  },
  {
    code: ChanceCardCode.AdvanceToPallMall,
    description: "Advance to Pall Mall – If you pass GO, collect $200",
  },
  {
    code: ChanceCardCode.AdvanceToNearestStation,
    description:
      "Advance to the nearest Station. If unowned, you may buy it from the Bank. If owned, pay owner twice the rental to which they are otherwise entitled.",
  },
  {
    code: ChanceCardCode.AdvanceToNearestUtility,
    description:
      "Advance token to the nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.",
  },
  {
    code: ChanceCardCode.BankDividend,
    description: "Bank pays you dividend of $50",
  },
  {
    code: ChanceCardCode.GetOutOfJailFree,
    description:
      "Get out of Jail Free – This card may be kept until needed or sold",
  },
  {
    code: ChanceCardCode.GoBackThreeSpaces,
    description: "Go Back Three Spaces",
  },
  {
    code: ChanceCardCode.GoToJail,
    description:
      "Go to Jail – Go directly to Jail – Do not pass GO, do not collect $200",
  },
  {
    code: ChanceCardCode.GeneralRepairs,
    description:
      "Make general repairs on all your property – For each house pay $25 – For each hotel pay $100",
  },
  {
    code: ChanceCardCode.PoorTax,
    description: "Pay poor tax of $15",
  },
  {
    code: ChanceCardCode.AdvanceToMaryleboneStation,
    description:
      "Take a trip to Marylebone Station – If you pass GO, collect $200",
  },
  {
    code: ChanceCardCode.ChairmanOfTheBoard,
    description:
      "You have been elected Chairman of the Board – Pay each player $50",
  },
  {
    code: ChanceCardCode.BuildingLoanMatures,
    description: "Your building loan matures – Collect $150",
  },
  {
    code: ChanceCardCode.CrosswordCompetition,
    description: "You have won a crossword competition - Collect $100",
  },
];
