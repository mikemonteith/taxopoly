import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import type { SimulationSpeed } from "~/context/game-controls";
import { SIMULATION_SPEEDS, useGameControls } from "~/context/game-controls";
import { FastForward, Play } from "lucide-react";

const SPEED_ICONS: Record<SimulationSpeed, ReactNode> = {
  "1x": <Play className="size-4" aria-hidden="true" />,
  "5x": <FastForward className="size-4" aria-hidden="true" />,
  "20x": (
    <span className="flex items-center" aria-hidden="true">
      <FastForward className="size-4" />
      <FastForward className="-ml-1 size-4" />
    </span>
  ),
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
