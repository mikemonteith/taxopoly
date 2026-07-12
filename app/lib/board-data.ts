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
  | "railroad"
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
  { id: 1, name: "Mediterranean Avenue", abbr: "MED", group: "brown", side: "bottom" },
  { id: 2, name: "Community Chest", abbr: "CC", group: "chest", side: "bottom" },
  { id: 3, name: "Baltic Avenue", abbr: "BLT", group: "brown", side: "bottom" },
  { id: 4, name: "Income Tax", abbr: "TAX", group: "tax", side: "bottom" },
  { id: 5, name: "Reading Railroad", abbr: "RDG", group: "railroad", side: "bottom" },
  { id: 6, name: "Oriental Avenue", abbr: "ORI", group: "lightblue", side: "bottom" },
  { id: 7, name: "Chance", abbr: "?", group: "chance", side: "bottom" },
  { id: 8, name: "Vermont Avenue", abbr: "VER", group: "lightblue", side: "bottom" },
  { id: 9, name: "Connecticut Avenue", abbr: "CON", group: "lightblue", side: "bottom" },
  { id: 10, name: "Jail", abbr: "JAIL", group: "corner", side: null },
  { id: 11, name: "St. Charles Place", abbr: "STC", group: "pink", side: "left" },
  { id: 12, name: "Electric Company", abbr: "ELC", group: "utility", side: "left" },
  { id: 13, name: "States Avenue", abbr: "STA", group: "pink", side: "left" },
  { id: 14, name: "Virginia Avenue", abbr: "VIR", group: "pink", side: "left" },
  { id: 15, name: "Pennsylvania Railroad", abbr: "PRR", group: "railroad", side: "left" },
  { id: 16, name: "St. James Place", abbr: "STJ", group: "orange", side: "left" },
  { id: 17, name: "Community Chest", abbr: "CC", group: "chest", side: "left" },
  { id: 18, name: "Tennessee Avenue", abbr: "TEN", group: "orange", side: "left" },
  { id: 19, name: "New York Avenue", abbr: "N.Y.", group: "orange", side: "left" },
  { id: 20, name: "Free Parking", abbr: "FREE", group: "corner", side: null },
  { id: 21, name: "Kentucky Avenue", abbr: "KEN", group: "red", side: "top" },
  { id: 22, name: "Chance", abbr: "?", group: "chance", side: "top" },
  { id: 23, name: "Indiana Avenue", abbr: "IND", group: "red", side: "top" },
  { id: 24, name: "Illinois Avenue", abbr: "ILL", group: "red", side: "top" },
  { id: 25, name: "B&O Railroad", abbr: "B&O", group: "railroad", side: "top" },
  { id: 26, name: "Atlantic Avenue", abbr: "ATL", group: "yellow", side: "top" },
  { id: 27, name: "Ventnor Avenue", abbr: "VEN", group: "yellow", side: "top" },
  { id: 28, name: "Water Works", abbr: "H2O", group: "utility", side: "top" },
  { id: 29, name: "Marvin Gardens", abbr: "MRV", group: "yellow", side: "top" },
  { id: 30, name: "Go To Jail", abbr: "GTJ", group: "corner", side: null },
  { id: 31, name: "Pacific Avenue", abbr: "PAC", group: "green", side: "right" },
  { id: 32, name: "North Carolina Avenue", abbr: "N.C.", group: "green", side: "right" },
  { id: 33, name: "Community Chest", abbr: "CC", group: "chest", side: "right" },
  { id: 34, name: "Pennsylvania Avenue", abbr: "P.A.", group: "green", side: "right" },
  { id: 35, name: "Short Line", abbr: "SHL", group: "railroad", side: "right" },
  { id: 36, name: "Chance", abbr: "?", group: "chance", side: "right" },
  { id: 37, name: "Park Place", abbr: "PARK", group: "darkblue", side: "right" },
  { id: 38, name: "Luxury Tax", abbr: "LUX", group: "tax", side: "right" },
  { id: 39, name: "Boardwalk", abbr: "BDWK", group: "darkblue", side: "right" },
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

export function isPropertyColorGroup(group: BoardGroup): group is PropertyColorGroup {
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
