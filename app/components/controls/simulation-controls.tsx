import { useEffect, useState } from "react";
import { useGameEngine } from "~/context/game-state";
import { getRoll } from "~/engine/dice";
import { PlayPause } from "./play-pause";
import { SpeedControl, type SimulationSpeed } from "./speed-control";

const TICK_INTERVAL_MS: Record<SimulationSpeed, number> = {
  "1x": 1000,
  "2x": 500,
  "4x": 250,
};

/** Drives the game engine forward on an interval while playing, at the selected speed. */
export function SimulationControls() {
  const gameEngine = useGameEngine();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>("1x");

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      gameEngine.tick(getRoll());
    }, TICK_INTERVAL_MS[speed]);
    return () => clearInterval(interval);
  }, [playing, speed, gameEngine]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
      <SpeedControl speed={speed} onSpeedChange={setSpeed} />
    </div>
  );
}
