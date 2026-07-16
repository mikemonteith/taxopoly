import { Pause, Play } from "lucide-react";
import { Toggle } from "../ui/toggle";

export function PlayPause({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <Toggle
      aria-label={playing ? "Pause the simulation" : "Play the simulation"}
      size="lg"
      variant="outline"
      className="rounded-full"
      pressed={playing}
      onPressedChange={onToggle}
    >
      {playing ? <Pause /> : <Play />}
    </Toggle>
  );
}
