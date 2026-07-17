import { Pause, Play } from "lucide-react";
import { Toggle } from "../ui/toggle";
import { useGameControls } from "~/context/game-controls";

export function PlayPause() {
  const { playing, setPlaying } = useGameControls();

  return (
    <Toggle
      aria-label={playing ? "Pause the simulation" : "Play the simulation"}
      size="lg"
      variant="outline"
      className="rounded-full"
      pressed={playing}
      onPressedChange={() => setPlaying(!playing)}
    >
      {playing ? <Pause /> : <Play />}
    </Toggle>
  );
}
