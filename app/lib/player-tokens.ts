/**
 * Player token data — just an id, a label and a board position. No game
 * state (money, properties, turn order) lives here; a caller elsewhere is
 * responsible for deciding what `tileId` is on each render.
 */

export const colors = [
  "violet",
  "cyan",
  "rose",
  "lime",
  "fuchsia",
  "slate",
  "teal",
  "amber",
] as const;

export type PlayerTokenColor = (typeof colors)[number];

export interface PlayerToken {
  id: string;
  name: string;
  tileId: number;
  color: PlayerTokenColor;
}

/** Fixed order, assigned by position — never reassigned based on player count or state, so a token's color never changes as other players join or move. */
export const PLAYER_TOKEN_COLORS: PlayerTokenColor[] = [
  "violet",
  "cyan",
  "rose",
  "lime",
  "fuchsia",
  "slate",
  "teal",
  "amber",
];

/** Flat token fill per color. Fixed across themes, same reasoning as the board's own property colors. */
export const PLAYER_TOKEN_FILL: Record<PlayerTokenColor, string> = {
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
  rose: "bg-rose-500",
  lime: "bg-lime-500",
  fuchsia: "bg-fuchsia-500",
  slate: "bg-slate-600",
  teal: "bg-teal-500",
  amber: "bg-amber-400",
};

/** Light fills (lime, amber, cyan) need dark ink; the rest read fine in white. */
export const PLAYER_TOKEN_TEXT: Record<PlayerTokenColor, string> = {
  violet: "text-white",
  cyan: "text-neutral-900",
  rose: "text-white",
  lime: "text-neutral-900",
  fuchsia: "text-white",
  slate: "text-white",
  teal: "text-white",
  amber: "text-neutral-900",
};

/** Line stroke per token color, stepped for the dark chart surface where the light 500 step reads too light (cyan, lime). */
export const PLAYER_LINE_COLOR: Record<
  PlayerTokenColor,
  { light: string; dark: string }
> = {
  violet: { light: "#8b5cf6", dark: "#8b5cf6" },
  cyan: { light: "#06b6d4", dark: "#0891b2" },
  rose: { light: "#f43f5e", dark: "#f43f5e" },
  lime: { light: "#84cc16", dark: "#65a30d" },
  fuchsia: { light: "#d946ef", dark: "#d946ef" },
  slate: { light: "#475569", dark: "#64748b" },
  teal: { light: "#14b8a6", dark: "#0d9488" },
  amber: { light: "#f59e0b", dark: "#d97706" },
};

/**
 * Dash pattern per token color — a secondary, color-independent identity
 * channel so lines stay distinguishable under color-vision deficiency even
 * where two adjacent hues (e.g. rose/lime) sit close in CVD-simulated space.
 */
export const PLAYER_LINE_DASH: Record<PlayerTokenColor, string | undefined> = {
  violet: undefined,
  cyan: "7 4",
  rose: "1.5 4",
  lime: "10 3 2 3",
  fuchsia: "7 4",
  slate: "1.5 4",
  teal: "10 3 2 3",
  amber: undefined,
};

export function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
