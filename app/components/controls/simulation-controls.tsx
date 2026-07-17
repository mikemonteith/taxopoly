import { useEffect } from "react";
import { useGameEngine } from "~/context/game-state";
import { getRoll } from "~/engine/dice";
import { PlayPause } from "./play-pause";
import { SpeedControl } from "./speed-control";
import { useGameControls } from "~/context/game-controls";
import type { SimulationSpeed } from "~/context/game-controls";

const TICK_INTERVAL_MS: Record<SimulationSpeed, number> = {
  "1x": 200,
  "2x": 100,
  "4x": 50,
};

/** Drives the game engine forward on an interval while playing, at the selected speed. */
export function SimulationControls() {
  const gameEngine = useGameEngine();
  const { playing, setPlaying, speed } = useGameControls();

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      gameEngine.tick(getRoll());
    }, TICK_INTERVAL_MS[speed]);
    return () => clearInterval(interval);
  }, [playing, speed, gameEngine]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <PlayPause />
      <SpeedControl />
    </div>
  );
}
