import {
  colors,
  PLAYER_TOKEN_FILL,
  PLAYER_TOKEN_TEXT,
  playerInitials,
  type PlayerToken,
} from "~/lib/player-tokens";
import { cn } from "~/lib/utils";
import { tileGridPosition } from "./monopoly-board";
import { useGameState } from "~/context/game-state";
import type { SimulationSpeed } from "~/context/game-controls";
import { useGameControls } from "~/context/game-controls";

const TILE_SIZE_PCT = 100 / 11;
/** Ring radius for tokens sharing a tile, as a fraction of one tile's width. */
const STACK_RADIUS_FRACTION = 0.24;

/**
 * Absolutely-positioned overlay for player tokens. Purely presentational —
 * it reads `tileId` off each token and places it there; a parent owns
 * deciding what that value is on any given render. Moving a token between
 * renders (a `tileId` change) animates via the CSS transition on position,
 * rather than snapping.
 */
export function PlayerTokensLayer() {
  const gameState = useGameState();
  console.log("RENDERING PLAYER TOKEN LAYER", gameState?.players);
  const players = gameState?.players.map((player, i) => ({
    id: player.id,
    name: player.name,
    tileId: player.tileId,
    color: colors[i % colors.length],
  }));

  const byTile = new Map<number, PlayerToken[]>();
  for (const player of players) {
    const group = byTile.get(player.tileId);
    if (group) group.push(player);
    else byTile.set(player.tileId, [player]);
  }
  for (const group of byTile.values()) {
    group.sort((a, b) => a.id.localeCompare(b.id));
  }

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden={players.length === 0}
    >
      {players.map((player) => {
        const group = byTile.get(player.tileId)!;
        const slot = group.indexOf(player);
        const { left, top } = tokenPosition(player.tileId, slot, group.length);
        return (
          <PlayerTokenDot
            key={player.id}
            player={player}
            left={left}
            top={top}
          />
        );
      })}
    </div>
  );
}

/** A tile's center, as a percentage of the board's own width/height — for absolutely-positioned overlays (player tokens) rather than grid placement. */
export function tileCenterPercent(id: number): { left: number; top: number } {
  const { row, col } = tileGridPosition(id);
  return { left: ((col - 0.5) / 11) * 100, top: ((row - 0.5) / 11) * 100 };
}

function tokenPosition(tileId: number, slot: number, groupSize: number) {
  const center = tileCenterPercent(tileId);
  if (groupSize <= 1) return center;

  const angle = (2 * Math.PI * slot) / groupSize - Math.PI / 2;
  const radius = TILE_SIZE_PCT * STACK_RADIUS_FRACTION;
  return {
    left: center.left + radius * Math.cos(angle),
    top: center.top + radius * Math.sin(angle),
  };
}

const animationSpeeds: Record<SimulationSpeed, number> = {
  "1x": 500,
  "2x": 250,
  "4x": 100,
};

function PlayerTokenDot({
  player,
  left,
  top,
}: {
  player: PlayerToken;
  left: number;
  top: number;
}) {
  const gameControls = useGameControls();
  const animationMs = animationSpeeds[gameControls.speed];

  return (
    <div
      role="img"
      aria-label={`${player.name}'s token`}
      title={player.name}
      className={cn(
        "absolute flex items-center justify-center rounded-full font-bold uppercase",
        "size-[clamp(14px,6.5cqw,34px)] text-[clamp(6px,2.6cqw,12px)]",
        "shadow-[0_1px_3px_rgb(0,0,0,0.35)] ring-2 ring-background",
        PLAYER_TOKEN_FILL[player.color],
        PLAYER_TOKEN_TEXT[player.color],
      )}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: "translate(-50%, -50%)",
        transition: `left ${animationMs}ms ease-in-out, top ${animationMs}ms ease-in-out`,
      }}
    >
      {playerInitials(player.name)}
    </div>
  );
}
