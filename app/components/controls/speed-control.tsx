import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "../ui/toggle-group";
import type { SimulationSpeed } from "~/context/game-controls";
import { SIMULATION_SPEEDS, useGameControls } from "~/context/game-controls";

export function SpeedControl() {
  const gameControls = useGameControls();
  return (
    <ToggleGroup
      type="single"
      value={gameControls.speed}
      onValueChange={(value) => {
        if (value) gameControls.setSpeed(value as SimulationSpeed);
      }}
      aria-label="Simulation speed"
    >
      {SIMULATION_SPEEDS.map((value) => (
        <ToggleGroupItem key={value} value={value}>
          {value}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
