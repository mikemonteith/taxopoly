import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { SimulationSpeedIcon } from "../ui/simulation-speed-icon";
import type { SimulationSpeed } from "~/context/game-controls";
import { SIMULATION_SPEEDS, useGameControls } from "~/context/game-controls";

const SPEED_ICONS: Record<SimulationSpeed, ReactNode> = {
  "1x": <SimulationSpeedIcon arrows={1} />,
  "5x": <SimulationSpeedIcon arrows={2} />,
  "20x": <SimulationSpeedIcon arrows={3} />,
};

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
        <ToggleGroupItem
          key={value}
          value={value}
          aria-label={`${value} speed`}
        >
          {SPEED_ICONS[value]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
