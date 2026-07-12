import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { ToggleGroupItem } from "../ui/toggle-group";

type SpeedControlProps = {};

export function SpeedControl({}: SpeedControlProps) {
  return (
    <ToggleGroup type="single" defaultValue="1x" aria-label="Simulation speed">
      <ToggleGroupItem value="1x">1×</ToggleGroupItem>
      <ToggleGroupItem value="2x">2×</ToggleGroupItem>
      <ToggleGroupItem value="4x">4×</ToggleGroupItem>
    </ToggleGroup>
  );
}
