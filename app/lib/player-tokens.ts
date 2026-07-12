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

export function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
