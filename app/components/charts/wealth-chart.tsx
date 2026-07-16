import { useRef, useState } from "react";
import { useGameState } from "~/context/game-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  colors,
  PLAYER_LINE_COLOR,
  PLAYER_LINE_DASH,
} from "~/lib/player-tokens";
import { cn } from "~/lib/utils";

const VIEWBOX_WIDTH = 640;
const VIEWBOX_HEIGHT = 280;
const PLOT = {
  left: 56,
  right: VIEWBOX_WIDTH - 92,
  top: 12,
  bottom: VIEWBOX_HEIGHT - 40,
};
const END_LABEL_GAP = 14; // minimum vertical spacing between stacked end-labels

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Rounds a raw axis step up to a "nice" 1/2/5 × 10^n value. */
function niceStep(rawStep: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const niceResidual =
    residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
  return niceResidual * magnitude;
}

function niceTicks(min: number, max: number, targetCount: number) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const step = niceStep((max - min) / targetCount);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(v);
  return { min: niceMin, max: niceMax, ticks };
}

/** Nudges label y-positions apart, in y-sorted order, so stacked end-labels never overlap. */
function declutter(values: number[], gap: number): number[] {
  const order = values.map((_, i) => i).sort((a, b) => values[a] - values[b]);
  const placed = [...values];
  for (let i = 1; i < order.length; i++) {
    const prev = placed[order[i - 1]];
    const current = placed[order[i]];
    if (current - prev < gap) placed[order[i]] = prev + gap;
  }
  return placed;
}

export function WealthChart() {
  const gameState = useGameState();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { players, wealthHistory, turn } = gameState;
  const currentPlayerId = players[turn]?.id;

  const balances = wealthHistory.flatMap((snapshot) =>
    players.map((player) => snapshot.balances[player.id] ?? player.balance),
  );
  const rawMin = Math.min(0, ...balances);
  const rawMax = Math.max(...balances, 1);
  const padding = Math.max((rawMax - rawMin) * 0.1, 1);
  const y = niceTicks(rawMin - padding, rawMax + padding, 5);
  const lastIndex = wealthHistory.length - 1;
  const rawX = niceTicks(0, Math.max(lastIndex, 1), 6);
  // Turns are discrete integers — round ticks to whole turns and drop duplicates.
  const x = {
    ...rawX,
    ticks: Array.from(new Set(rawX.ticks.map((tick) => Math.round(tick)))),
  };

  const xScale = (index: number) =>
    PLOT.left +
    (lastIndex === 0 ? 0 : (index / lastIndex) * (PLOT.right - PLOT.left));
  const yScale = (value: number) =>
    PLOT.bottom -
    ((value - y.min) / (y.max - y.min)) * (PLOT.bottom - PLOT.top);

  const series = players.map((player, i) => {
    const color = colors[i % colors.length];
    const points = wealthHistory.map((snapshot, index) => ({
      x: xScale(index),
      y: yScale(snapshot.balances[player.id] ?? player.balance),
    }));
    return { player, color, points };
  });

  const endLabelYs = declutter(
    series.map((s) => s.points.at(-1)?.y ?? PLOT.bottom),
    END_LABEL_GAP,
  );

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || lastIndex < 0) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(ctm.inverse());
    const fraction =
      PLOT.right === PLOT.left
        ? 0
        : (local.x - PLOT.left) / (PLOT.right - PLOT.left);
    const index = Math.round(fraction * lastIndex);
    setHoverIndex(Math.min(lastIndex, Math.max(0, index)));
  }

  const hoverSnapshot = hoverIndex !== null ? wealthHistory[hoverIndex] : null;
  const hoverX = hoverIndex !== null ? xScale(hoverIndex) : null;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Player wealth</CardTitle>
        <CardDescription>Balance after every turn</CardDescription>
      </CardHeader>
      <CardContent>
        <style>{`
          .wealth-chart {
            ${Object.entries(PLAYER_LINE_COLOR)
              .map(([name, { light }]) => `--wc-line-${name}: ${light};`)
              .join("\n")}
          }
          @media (prefers-color-scheme: dark) {
            :root:not(.light) .wealth-chart {
              ${Object.entries(PLAYER_LINE_COLOR)
                .map(([name, { dark }]) => `--wc-line-${name}: ${dark};`)
                .join("\n")}
            }
          }
          .dark .wealth-chart {
            ${Object.entries(PLAYER_LINE_COLOR)
              .map(([name, { dark }]) => `--wc-line-${name}: ${dark};`)
              .join("\n")}
          }
        `}</style>

        <div className="wealth-chart relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="h-auto w-full touch-none"
            role="img"
            aria-label="Line chart of each player's balance over the course of the game"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(null)}
          >
            {/* Gridlines + y-axis labels */}
            {y.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PLOT.left}
                  x2={PLOT.right}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
                <text
                  x={PLOT.left - 8}
                  y={yScale(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[10px] tabular-nums"
                >
                  {currencyFormatter.format(tick)}
                </text>
              </g>
            ))}

            {/* x-axis labels */}
            {x.ticks
              .filter((tick) => tick <= lastIndex)
              .map((tick) => (
                <text
                  key={tick}
                  x={xScale(tick)}
                  y={PLOT.bottom + 18}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] tabular-nums"
                >
                  {tick}
                </text>
              ))}
            <text
              x={(PLOT.left + PLOT.right) / 2}
              y={VIEWBOX_HEIGHT - 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              Turn
            </text>

            {/* Hover crosshair */}
            {hoverX !== null && (
              <line
                x1={hoverX}
                x2={hoverX}
                y1={PLOT.top}
                y2={PLOT.bottom}
                stroke="var(--color-muted-foreground)"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
            )}

            {/* Series lines */}
            {series.map(({ player, color, points }) => (
              <path
                key={player.id}
                d={points
                  .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
                  .join(" ")}
                fill="none"
                stroke={`var(--wc-line-${color})`}
                strokeWidth={player.id === currentPlayerId ? 3 : 2}
                strokeDasharray={PLAYER_LINE_DASH[color]}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* End markers + direct labels */}
            {series.map(({ player, color, points }, i) => {
              const last = points.at(-1);
              if (!last) return null;
              const labelY = endLabelYs[i];
              return (
                <g key={player.id}>
                  <circle
                    cx={last.x}
                    cy={last.y}
                    r={4}
                    fill={`var(--wc-line-${color})`}
                    stroke="var(--color-card)"
                    strokeWidth={2}
                  />
                  {labelY !== last.y && (
                    <line
                      x1={last.x + 6}
                      y1={last.y}
                      x2={last.x + 12}
                      y2={labelY}
                      stroke="var(--color-muted-foreground)"
                      strokeWidth={1}
                    />
                  )}
                  <text
                    x={last.x + 14}
                    y={labelY}
                    dominantBaseline="middle"
                    className="fill-foreground text-[10px] font-medium"
                  >
                    {player.name}
                  </text>
                </g>
              );
            })}

            {/* Hover hit area, drawn last so it sits above the lines */}
            <rect
              x={PLOT.left}
              y={PLOT.top}
              width={Math.max(PLOT.right - PLOT.left, 0)}
              height={Math.max(PLOT.bottom - PLOT.top, 0)}
              fill="transparent"
            />
          </svg>

          {hoverSnapshot && (
            <div
              className="pointer-events-none absolute top-3 -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
              style={{
                left: `${((hoverX ?? 0) / VIEWBOX_WIDTH) * 100}%`,
              }}
            >
              <div className="mb-1 font-medium text-popover-foreground">
                Turn {hoverSnapshot.tick}
              </div>
              <div className="flex flex-col gap-0.5">
                {series
                  .slice()
                  .sort(
                    (a, b) =>
                      (hoverSnapshot.balances[b.player.id] ?? 0) -
                      (hoverSnapshot.balances[a.player.id] ?? 0),
                  )
                  .map(({ player, color }) => (
                    <div key={player.id} className="flex items-center gap-1.5">
                      <span
                        className="h-0.5 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: `var(--wc-line-${color})` }}
                      />
                      <span className="text-popover-foreground tabular-nums font-semibold">
                        {currencyFormatter.format(
                          hoverSnapshot.balances[player.id] ?? 0,
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        {player.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {series.map(({ player, color }) => (
            <div
              key={player.id}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                player.id === currentPlayerId
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span
                className="h-0.5 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: `var(--wc-line-${color})` }}
              />
              {player.name} · {currencyFormatter.format(player.balance)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
