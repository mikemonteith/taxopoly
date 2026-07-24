import { createContext, useContext, useState } from "react";
import { useGameEngine } from "./game-state";

export const SIMULATION_SPEEDS = ["1x", "2x", "4x", "16x"] as const;
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

interface GameControls {
  playing: boolean;
  speed: SimulationSpeed;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: SimulationSpeed) => void;
  restart: () => void;
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
  const gameEngine = useGameEngine();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>("1x");
  const [taxRate, setTaxRate] = useState({
    income: 0,
    wealth: 0,
  });

  const value: GameControls = {
    playing,
    setPlaying,
    speed,
    setSpeed,
    //taxRate,
    //setTaxRate,
    restart: () => {
      gameEngine.reset();
      //setPlaying(false);
    },
  };

  return (
    <GameControlsContext.Provider value={value}>
      {children}
    </GameControlsContext.Provider>
  );
};
