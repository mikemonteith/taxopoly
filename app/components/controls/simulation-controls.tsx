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

const TICK_INTERVAL_MS: Record<SimulationSpeed, number> = {
  "1x": 8 * 16,
  "2x": 8 * 8,
  "4x": 8 * 4,
  "16x": 8,
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
    <div className="flex flex-wrap items-center justify-center gap-6">
      {isDebug && (
        <>
          <Button className="btn" onClick={() => gameEngine.tick(1)}>
            Tick +1
          </Button>
          <Button
            className="btn"
            variant="outline"
            onClick={() => gameEngine.loadDevScenario()}
          >
            Load dev scenario
          </Button>
        </>
      )}
      <Restart />
      <PlayPause />
      <SpeedControl />
    </div>
  );
}
