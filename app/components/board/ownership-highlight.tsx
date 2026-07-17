import { useMemo } from "react";
import { useGameState } from "~/context/game-state";
import type { GameState } from "~/engine";
import { OwnableBoardTileState, StreetBoardTileState } from "~/engine/tiles";
import type { StreetGroup } from "~/engine/static-data";
import {
  colors,
  PLAYER_LINE_COLOR,
  type PlayerTokenColor,
} from "~/lib/player-tokens";
import { tileGridPosition } from "./monopoly-board";

/** An owned tile and whose it is, flagged if it sits inside a full monopoly. */
type OwnedTile = {
  id: number;
  /** The owning player's token color — the identity channel for the glow. */
  color: PlayerTokenColor;
  ownerName: string;
  /** True when every tile of this tile's street group shares this owner. */
  monopoly: boolean;
};

/**
 * Every owned tile on the board and whose it is, with the ones sitting inside
 * a full street monopoly flagged for stronger emphasis. Derived display state
 * — no game logic lives here; ownership is decided in the engine.
 */
export function computeOwnedTiles(state: GameState): OwnedTile[] {
  const ownerMeta = new Map<
    string,
    { color: PlayerTokenColor; name: string }
  >();
  state.players.forEach((player, i) => {
    ownerMeta.set(player.id, {
      color: colors[i % colors.length],
      name: player.name,
    });
  });

  // Street groups held in full by a single player — the monopolies.
  const streetGroups = new Map<StreetGroup, StreetBoardTileState[]>();
  for (const tile of state.board) {
    if (tile instanceof StreetBoardTileState) {
      const group = streetGroups.get(tile.props.street) ?? [];
      group.push(tile);
      streetGroups.set(tile.props.street, group);
    }
  }
  const monopolyGroups = new Set<StreetGroup>();
  for (const [group, tiles] of streetGroups) {
    const owner = tiles[0].owner;
    if (owner && tiles.every((tile) => tile.owner?.id === owner.id)) {
      monopolyGroups.add(group);
    }
  }

  const owned: OwnedTile[] = [];
  for (const tile of state.board) {
    if (!(tile instanceof OwnableBoardTileState) || !tile.owner) continue;
    const meta = ownerMeta.get(tile.owner.id);
    if (!meta) continue;
    owned.push({
      id: tile.props.id,
      color: meta.color,
      ownerName: meta.name,
      monopoly:
        tile instanceof StreetBoardTileState &&
        monopolyGroups.has(tile.props.street),
    });
  }
  return owned;
}

/** The frame + glow for an owned tile, keyed by whether it's part of a monopoly. */
function tileGlow(hex: string, monopoly: boolean): React.CSSProperties {
  const properties = {
    // The glow is a combination of an inset border and a soft halo. The halo is
    // a semi-transparent version of the player's color, so it doesn't overwhelm
    // the board's colors.
    boxShadow: `inset 0 0 0 2px ${hex}, 0 0 8px 2px ${hex}80`,
    backgroundColor: "transparent",
  };

  if (monopoly) {
    // faint color wash.
    properties.backgroundColor = `${hex}1f`;
  }

  return properties;
}

/**
 * Overlay that glows every owned tile in its owner's token color, so at a
 * glance you can read who holds what. Tiles inside a full street monopoly
 * glow more prominently (thicker ring, brighter halo, faint wash). Purely
 * presentational — it mirrors the board's tile grid (same columns, rows and
 * gap) so each cell lands exactly on its tile, and sits above the tiles but
 * below the player tokens.
 */
export function OwnershipHighlightLayer() {
  const state = useGameState();
  const tiles = useMemo(() => computeOwnedTiles(state), [state]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(11,1fr)] grid-rows-[repeat(11,1fr)] gap-[2px] sm:gap-1"
    >
      {tiles.map((tile) => {
        const { row, col } = tileGridPosition(tile.id);
        const hex = PLAYER_LINE_COLOR[tile.color].light;
        return (
          <div
            key={tile.id}
            className="rounded-[3px]"
            style={{
              gridRow: row,
              gridColumn: col,
              ...tileGlow(hex, tile.monopoly),
            }}
          />
        );
      })}
    </div>
  );
}
