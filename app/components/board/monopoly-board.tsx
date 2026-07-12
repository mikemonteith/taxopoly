import {
  BOARD_TILES,
  PROPERTY_GROUP_BAND,
  isPropertyColorGroup,
  tileGridPosition,
  type BoardSide,
  type BoardTile as BoardTileData,
} from "~/lib/board-data";
import { cn } from "~/lib/utils";

/**
 * Pure presentational board — no game state, no token positions. Sizes
 * itself off its own rendered width via container queries so tile labels
 * stay legible from a narrow phone up to a full desktop column.
 */
export function MonopolyBoard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container mx-auto aspect-square w-full max-w-[720px] rounded-xl border border-border bg-accent p-1 shadow-sm sm:p-2",
        className,
      )}
    >
      <div className="grid h-full w-full grid-cols-[repeat(11,1fr)] grid-rows-[repeat(11,1fr)] gap-[2px] sm:gap-1">
        {BOARD_TILES.map((tile) => (
          <BoardTile key={tile.id} tile={tile} />
        ))}

        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-accent-foreground/25 text-center"
          style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}
        >
          <span className="text-[clamp(10px,2.6cqw,20px)] font-semibold tracking-[0.3em] text-accent-foreground uppercase">
            Monopoly Simulator
          </span>
          <span className="text-[clamp(8px,1.8cqw,14px)] text-accent-foreground/70">
            40 tiles · 8 property groups
          </span>
        </div>
      </div>
    </div>
  );
}

function BoardTile({ tile }: { tile: BoardTileData }) {
  const { row, col } = tileGridPosition(tile.id);
  const isCorner = tile.group === "corner";
  const band = isPropertyColorGroup(tile.group) ? PROPERTY_GROUP_BAND[tile.group] : null;

  return (
    <div
      style={{ gridRow: row, gridColumn: col }}
      title={tile.name}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-[3px] border",
        isCorner ? "border-accent-foreground/25 bg-accent" : "border-border bg-card",
      )}
    >
      {band && <span aria-hidden className={cn("absolute", bandPositionClasses[tile.side!], band)} />}
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
};

const bandPaddingClasses: Record<BoardSide, string> = {
  bottom: "pt-[26%]",
  top: "pb-[26%]",
  left: "pr-[26%]",
  right: "pl-[26%]",
};
