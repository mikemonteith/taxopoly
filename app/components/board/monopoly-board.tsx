import {
  BOARD_TILES,
  StreetGroup,
  TileType,
  type BoardSide,
  type BoardTile as BoardTileData,
  type BuildableBoardTile,
} from "~/engine/static-data";
import { cn } from "~/lib/utils";
import { PlayerTokensLayer } from "./player-tokens";

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

/**
 * Pure presentational board — no game logic. Sizes itself off its own
 * rendered width via container queries so tile labels stay legible from a
 * narrow phone up to a full desktop column. `players`, if given, is just
 * "who's on which tile right now" — a caller elsewhere owns deciding that.
 */
export function MonopolyBoard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "@container mx-auto aspect-square w-full max-w-[720px] rounded-xl border border-border bg-accent p-1 shadow-sm sm:p-2",
        className,
      )}
    >
      <div className="relative grid h-full w-full grid-cols-[repeat(11,1fr)] grid-rows-[repeat(11,1fr)] gap-[2px] sm:gap-1">
        {BOARD_TILES.map((tile) => (
          <BoardTile key={tile.id} tile={tile} />
        ))}

        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-accent-foreground/25 text-center"
          style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}
        >
          <span className="text-[clamp(10px,2.6cqw,20px)] font-semibold tracking-[0.3em] text-accent-foreground uppercase">
            Taxopoly
          </span>
          {children}
        </div>

        <PlayerTokensLayer />
      </div>
    </div>
  );
}

/** Flat fill for the color band on each of the 8 ownable property groups. Fixed across themes — these are the game's own palette, not app chrome. */
export const PROPERTY_GROUP_BAND: Record<StreetGroup, string> = {
  [StreetGroup.Brown]: "bg-amber-800",
  [StreetGroup.LightBlue]: "bg-sky-400",
  [StreetGroup.Pink]: "bg-pink-400",
  [StreetGroup.Orange]: "bg-orange-500",
  [StreetGroup.Red]: "bg-red-500",
  [StreetGroup.Yellow]: "bg-yellow-400",
  [StreetGroup.Green]: "bg-emerald-600",
  [StreetGroup.DarkBlue]: "bg-blue-900",
};

export function isStreet(tile: BoardTileData): tile is BuildableBoardTile {
  return tile.type === TileType.Street;
}

function BoardTile({ tile }: { tile: BoardTileData }) {
  const { row, col } = tileGridPosition(tile.id);
  const isCorner = tile.side === "corner";
  const band = isStreet(tile) ? PROPERTY_GROUP_BAND[tile.street] : null;

  return (
    <div
      style={{ gridRow: row, gridColumn: col }}
      title={tile.name}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-[3px] border",
        isCorner
          ? "border-accent-foreground/25 bg-accent"
          : "border-border bg-card",
      )}
    >
      {band && (
        <span
          aria-hidden
          className={cn("absolute", bandPositionClasses[tile.side!], band)}
        />
      )}
      <span
        className={cn(
          "block w-full min-w-0 text-center leading-[1.05] font-semibold break-words uppercase [overflow-wrap:anywhere]",
          isCorner
            ? "px-[6%] text-[clamp(9px,2.7cqw,17px)] text-accent-foreground"
            : "px-[4%] text-[clamp(6.5px,2cqw,12px)] text-foreground",
          band && bandPaddingClasses[tile.side!],
        )}
      >
        {tile.abbr}
      </span>
    </div>
  );
}

const bandPositionClasses: Record<BoardSide, string> = {
  bottom: "inset-x-0 top-0 h-[26%]",
  top: "inset-x-0 bottom-0 h-[26%]",
  left: "inset-y-0 right-0 w-[26%]",
  right: "inset-y-0 left-0 w-[26%]",
  corner: "",
};

const bandPaddingClasses: Record<BoardSide, string> = {
  bottom: "pt-[26%]",
  top: "pb-[26%]",
  left: "pr-[26%]",
  right: "pl-[26%]",
  corner: "",
};
