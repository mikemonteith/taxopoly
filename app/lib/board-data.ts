/**
 * Static board layout data — no game state. Tile order and grid math match
 * the standard 40-space Monopoly board, read clockwise starting at GO.
 */

export type PropertyColorGroup =
  | "brown"
  | "lightblue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "darkblue";

export type BoardGroup =
  | PropertyColorGroup
  | "trainstation"
  | "utility"
  | "chance"
  | "chest"
  | "tax"
  | "corner";

export type BoardSide = "bottom" | "left" | "top" | "right";

export interface BoardTile {
  id: number;
  name: string;
  abbr: string;
  group: BoardGroup;
  /** Which edge of the tile faces the board's interior — null for corners. */
  side: BoardSide | null;
}

export const BOARD_TILES: BoardTile[] = [
  { id: 0, name: "GO", abbr: "GO", group: "corner", side: null },
  {
    id: 1,
    name: "Old Kent Road",
    abbr: "OKR",
    group: "brown",
    side: "bottom",
  },
  {
    id: 2,
    name: "Community Chest",
    abbr: "CC",
    group: "chest",
    side: "bottom",
  },
  {
    id: 3,
    name: "Whitechapel Road",
    abbr: "WCR",
    group: "brown",
    side: "bottom",
  },
  { id: 4, name: "Income Tax", abbr: "TAX", group: "tax", side: "bottom" },
  {
    id: 5,
    name: "King's Cross Station",
    abbr: "KCS",
    group: "trainstation",
    side: "bottom",
  },
  {
    id: 6,
    name: "The Angel Islington",
    abbr: "ANG",
    group: "lightblue",
    side: "bottom",
  },
  { id: 7, name: "Chance", abbr: "?", group: "chance", side: "bottom" },
  {
    id: 8,
    name: "Euston Road",
    abbr: "EUS",
    group: "lightblue",
    side: "bottom",
  },
  {
    id: 9,
    name: "Pentonville Road",
    abbr: "PEN",
    group: "lightblue",
    side: "bottom",
  },
  { id: 10, name: "Jail", abbr: "JAIL", group: "corner", side: null },
  {
    id: 11,
    name: "Pall Mall",
    abbr: "PAL",
    group: "pink",
    side: "left",
  },
  {
    id: 12,
    name: "Electric Company",
    abbr: "ELE",
    group: "utility",
    side: "left",
  },
  { id: 13, name: "Whitechapel", abbr: "WHI", group: "pink", side: "left" },
  {
    id: 14,
    name: "Northumberland Avenue",
    abbr: "NOR",
    group: "pink",
    side: "left",
  },
  {
    id: 15,
    name: "Marylebone Station",
    abbr: "MRY",
    group: "trainstation",
    side: "left",
  },
  {
    id: 16,
    name: "Bow Street",
    abbr: "BOW",
    group: "orange",
    side: "left",
  },
  { id: 17, name: "Community Chest", abbr: "CC", group: "chest", side: "left" },
  {
    id: 18,
    name: "Marlborough Street",
    abbr: "MAR",
    group: "orange",
    side: "left",
  },
  {
    id: 19,
    name: "Vine Street",
    abbr: "VIN",
    group: "orange",
    side: "left",
  },
  { id: 20, name: "Free Parking", abbr: "FREE", group: "corner", side: null },
  { id: 21, name: "Strand", abbr: "STR", group: "red", side: "top" },
  { id: 22, name: "Chance", abbr: "?", group: "chance", side: "top" },
  { id: 23, name: "Fleet Street", abbr: "FLE", group: "red", side: "top" },
  { id: 24, name: "Trafalgar Square", abbr: "TRF", group: "red", side: "top" },
  {
    id: 25,
    name: "Fenchurch St. Station",
    abbr: "FEN",
    group: "trainstation",
    side: "top",
  },
  {
    id: 26,
    name: "Leicester Square",
    abbr: "LEI",
    group: "yellow",
    side: "top",
  },
  {
    id: 27,
    name: "Coventry Street",
    abbr: "COV",
    group: "yellow",
    side: "top",
  },
  { id: 28, name: "Water Works", abbr: "H2O", group: "utility", side: "top" },
  { id: 29, name: "Piccadilly", abbr: "PIC", group: "yellow", side: "top" },
  { id: 30, name: "Go To Jail", abbr: "GTJ", group: "corner", side: null },
  {
    id: 31,
    name: "Regent Street",
    abbr: "REG",
    group: "green",
    side: "right",
  },
  {
    id: 32,
    name: "Oxford Street",
    abbr: "OXF",
    group: "green",
    side: "right",
  },
  {
    id: 33,
    name: "Community Chest",
    abbr: "CC",
    group: "chest",
    side: "right",
  },
  {
    id: 34,
    name: "Bond Street",
    abbr: "BON",
    group: "green",
    side: "right",
  },
  {
    id: 35,
    name: "Liverpool Street Station",
    abbr: "LIV",
    group: "trainstation",
    side: "right",
  },
  { id: 36, name: "Chance", abbr: "?", group: "chance", side: "right" },
  {
    id: 37,
    name: "Park Lane",
    abbr: "PRK",
    group: "darkblue",
    side: "right",
  },
  { id: 38, name: "Luxury Tax", abbr: "LUX", group: "tax", side: "right" },
  { id: 39, name: "Mayfair", abbr: "MAY", group: "darkblue", side: "right" },
];

/** Flat fill for the color band on each of the 8 ownable property groups. Fixed across themes — these are the game's own palette, not app chrome. */
export const PROPERTY_GROUP_BAND: Record<PropertyColorGroup, string> = {
  brown: "bg-amber-800",
  lightblue: "bg-sky-400",
  pink: "bg-pink-400",
  orange: "bg-orange-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
  green: "bg-emerald-600",
  darkblue: "bg-blue-900",
};

export function isPropertyColorGroup(
  group: BoardGroup,
): group is PropertyColorGroup {
  return group in PROPERTY_GROUP_BAND;
}

/** 1-indexed CSS grid line placement for a tile on the 11×11 board grid. */
export function tileGridPosition(id: number): { row: number; col: number } {
  if (id === 0) return { row: 11, col: 11 };
  if (id <= 9) return { row: 11, col: 11 - id };
  if (id === 10) return { row: 11, col: 1 };
  if (id <= 19) return { row: 21 - id, col: 1 };
  if (id === 20) return { row: 1, col: 1 };
  if (id <= 29) return { row: 1, col: id - 19 };
  if (id === 30) return { row: 1, col: 11 };
  return { row: id - 29, col: 11 };
}

/** A tile's center, as a percentage of the board's own width/height — for absolutely-positioned overlays (player tokens) rather than grid placement. */
export function tileCenterPercent(id: number): { left: number; top: number } {
  const { row, col } = tileGridPosition(id);
  return { left: ((col - 0.5) / 11) * 100, top: ((row - 0.5) / 11) * 100 };
}
