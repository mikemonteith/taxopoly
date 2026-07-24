import { RotateCcwIcon as RestartIcon } from "lucide-react";
import { Toggle } from "../ui/toggle";
import { useGameControls } from "~/context/game-controls";

export function Restart() {
  const { restart } = useGameControls();

  return (
    <Toggle
      aria-label={"Restart the simulation"}
      size="lg"
      variant="outline"
      className="rounded-full"
      pressed={false}
      onPressedChange={() => restart()}
    >
      <RestartIcon className="h-6 w-6" />
    </Toggle>
  );
}
