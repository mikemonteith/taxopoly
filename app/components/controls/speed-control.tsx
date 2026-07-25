import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import type { SimulationSpeed } from "~/context/game-controls";
import { SIMULATION_SPEEDS, useGameControls } from "~/context/game-controls";
import { FastForward, Play } from "lucide-react";
import { TripleFastForwardIcon } from "./triple-fast-forward-icon";

const SPEED_ICONS: Record<SimulationSpeed, ReactNode> = {
  "1x": <Play className="size-4" aria-hidden="true" />,
  "5x": <FastForward className="size-4" aria-hidden="true" />,
  "20x": <TripleFastForwardIcon />,
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
