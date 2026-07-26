import { createContext, useContext, useState } from "react";
import { GameStateContext, useGameEngine, useGameState } from "./game-state";

export const SIMULATION_SPEEDS = ["1x", "5x", "20x"] as const;
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

interface GameControls {
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  speed: SimulationSpeed;
  setSpeed: (speed: SimulationSpeed) => void;
  taxRate: { income: number; wealth: number };
  setTaxRate: (taxRate: { income: number; wealth: number }) => void;
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
  const gameState = useGameState();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>("1x");

  const value: GameControls = {
    playing,
    setPlaying,
    speed,
    setSpeed,
    taxRate: gameState.taxRate,
    setTaxRate: (newTaxRate) => {
      gameEngine.setTaxRate(newTaxRate);
    },
    restart: () => {
      gameEngine.reset();
    },
  };

  return (
    <GameControlsContext.Provider value={value}>
      {children}
    </GameControlsContext.Provider>
  );
};
