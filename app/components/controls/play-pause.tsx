import { Pause, Play } from "lucide-react";
import { Toggle } from "../ui/toggle";
import { useGameEngine } from "~/context/game-state";
import { getRoll } from "~/engine/dice";

export function PlayPause() {
  const gameEngine = useGameEngine();
  const playing = false;
  const setPlaying = () => {
    const diceRoll = getRoll();
    gameEngine.tick(diceRoll);
  };

  return (
    <Toggle
      aria-label={playing ? "Pause the simulation" : "Play the simulation"}
      size="lg"
      variant="outline"
      className="rounded-full"
      pressed={playing}
      onPressedChange={setPlaying}
    >
      {playing ? <Pause /> : <Play />}
    </Toggle>
  );
}
