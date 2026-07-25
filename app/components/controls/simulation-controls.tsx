import { useEffect } from "react";
import { useGameEngine, useGameState } from "~/context/game-state";
import { getRoll } from "~/engine/dice";
import { PlayPause } from "./play-pause";
import { SpeedControl } from "./speed-control";
import { useGameControls } from "~/context/game-controls";
import type { SimulationSpeed } from "~/context/game-controls";
import { useDebug } from "~/context/debug";
import { Button } from "../ui/button";
import { Restart } from "./restart";
import { TaxControls } from "./tax-controls";

export const TICK_INTERVAL_MS: Record<SimulationSpeed, number> = {
  "1x": 128,
  "5x": 26,
  "20x": 6,
};

/** Drives the game engine forward on an interval while playing, at the selected speed. */
export function SimulationControls() {
  const gameEngine = useGameEngine();
  const gameState = useGameState();
  const { playing, speed, setPlaying } = useGameControls();
  const isDebug = useDebug();

  const shouldGameEnd = gameState.players.some(
    (player) => player.ownedProperties.length >= 28,
  );

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      if (shouldGameEnd) {
        setPlaying(false);
        clearInterval(interval);
        return;
      }
      gameEngine.tick(getRoll());
    }, TICK_INTERVAL_MS[speed]);
    return () => clearInterval(interval);
  }, [playing, speed, gameEngine, shouldGameEnd]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Restart />
        <PlayPause />
        <SpeedControl />
      </div>
      <div className="flex flex-col items-center gap-2">
        <TaxControls />
      </div>
    </>
  );
}
