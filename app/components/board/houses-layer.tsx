import { useMemo } from "react";
import { useGameState } from "~/context/game-state";
import type { GameState } from "~/engine";
import { StreetBoardTileState } from "~/engine/tiles";
import type { BoardSide } from "~/engine/static-data";
import { cn } from "~/lib/utils";
import { bandPositionClasses, tileGridPosition } from "./monopoly-board";

type BuildingTile = {
  id: number;
  side: Exclude<BoardSide, "corner">;
  /** 1-4 houses, or "hotel" once a street has all 4 (represented as houseCount 5). */
  building: { kind: "houses"; count: 1 | 2 | 3 | 4 } | { kind: "hotel" };
};

/** Every street with at least one house/hotel built, ready to render on its tile's color band. */
export function computeBuildingTiles(state: GameState): BuildingTile[] {
  const tiles: BuildingTile[] = [];
  for (const tile of state.board) {
    if (!(tile instanceof StreetBoardTileState)) continue;
    if (tile.houseCount === 0) continue;
    if (!tile.props.side || tile.props.side === "corner") continue;

    tiles.push({
      id: tile.props.id,
      side: tile.props.side,
      building:
        tile.houseCount === 5
          ? { kind: "hotel" }
          : { kind: "houses", count: tile.houseCount },
    });
  }
  return tiles;
}

/** Row direction follows the band's own orientation: a horizontal strip gets a horizontal row of houses, a vertical strip gets a vertical one. */
const rowDirectionClasses: Record<Exclude<BoardSide, "corner">, string> = {
  bottom: "flex-row",
  top: "flex-row",
  left: "flex-col",
  right: "flex-col",
};

/** Houses/hotels are sized off whichever dimension of the band strip is fixed (its short axis). */
const buildingSizeClasses: Record<Exclude<BoardSide, "corner">, string> = {
  bottom: "h-[55%]",
  top: "h-[55%]",
  left: "w-[55%]",
  right: "w-[55%]",
};

const hotelSizeClasses: Record<Exclude<BoardSide, "corner">, string> = {
  bottom: "h-[75%]",
  top: "h-[75%]",
  left: "w-[75%]",
  right: "w-[75%]",
};

/**
 * Overlay that draws little green houses (up to 4, in a row) or a single
 * larger red hotel on a street's color band once it has been built up —
 * just like the physical board. Purely presentational: house counts live on
 * the engine's tile state, this only reads and places them.
 */
export function HousesLayer() {
  const state = useGameState();
  const tiles = useMemo(() => computeBuildingTiles(state), [state]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(11,1fr)] grid-rows-[repeat(11,1fr)] gap-[2px] sm:gap-1"
    >
      {tiles.map((tile) => {
        const { row, col } = tileGridPosition(tile.id);
        return (
          <div
            key={tile.id}
            className="relative"
            style={{ gridRow: row, gridColumn: col }}
          >
            <div
              className={cn(
                "absolute flex items-center justify-center gap-[6%]",
                bandPositionClasses[tile.side],
                rowDirectionClasses[tile.side],
              )}
            >
              {tile.building.kind === "hotel" ? (
                <span
                  className={cn(
                    "aspect-square rounded-[1px] bg-red-600 shadow-sm ring-1 ring-black/40",
                    hotelSizeClasses[tile.side],
                  )}
                />
              ) : (
                Array.from({ length: tile.building.count }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "aspect-square rounded-[1px] bg-green-400 shadow-sm ring-1 ring-black/40",
                      buildingSizeClasses[tile.side],
                    )}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
