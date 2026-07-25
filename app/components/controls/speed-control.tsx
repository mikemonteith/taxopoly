import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import type { SimulationSpeed } from "~/context/game-controls";
import { SIMULATION_SPEEDS, useGameControls } from "~/context/game-controls";
import { FastForward, Play } from "lucide-react";

function TripleFastForwardIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 6L7.5 12L2 18V6ZM9.25 6L14.75 12L9.25 18V6ZM16.5 6L22 12L16.5 18V6Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
