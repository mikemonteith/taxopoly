import { createContext, useContext, useState } from "react";

export const SIMULATION_SPEEDS = ["1x", "2x", "4x"] as const;
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

interface GameControls {
  playing: boolean;
  speed: SimulationSpeed;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: SimulationSpeed) => void;
}

export const GameControlsContext = createContext<GameControls | null>(null);

export function useGameControls() {
  const controls = useContext(GameControlsContext);
  if (!controls) {
    throw new Error(
      "useGameControls must be used within a GameControlsProvider",
    );
  }
  return controls;
}

export const GameControlsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>("1x");

  const value = {
    playing,
    setPlaying,
    speed,
    setSpeed,
  };

  return (
    <GameControlsContext.Provider value={value}>
      {children}
    </GameControlsContext.Provider>
  );
};
