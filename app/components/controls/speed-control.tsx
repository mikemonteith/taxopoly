import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "../ui/toggle-group";

export const SIMULATION_SPEEDS = ["1x", "2x", "4x"] as const;
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

type SpeedControlProps = {
  speed: SimulationSpeed;
  onSpeedChange: (speed: SimulationSpeed) => void;
};

export function SpeedControl({ speed, onSpeedChange }: SpeedControlProps) {
  return (
    <ToggleGroup
      type="single"
      value={speed}
      onValueChange={(value) => {
        if (value) onSpeedChange(value as SimulationSpeed);
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
