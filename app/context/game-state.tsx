import { createContext, useContext, useSyncExternalStore } from "react";
import { GameEngine } from "~/engine";

export const GameStateContext = createContext<GameEngine | null>(null);

export function useGameEngine() {
  const engine = useContext(GameStateContext);
  if (!engine) {
    throw new Error("useGameEngine must be used within a GameStateProvider");
  }
  return engine;
}

export function useGameState() {
  const engine = useGameEngine();
  return useSyncExternalStore(
    (callback) => engine.subscribe(callback),
    () => engine.getState(),
    () => engine.getState(),
  );
}

export const GameStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const gameEngine = new GameEngine();

  return (
    <GameStateContext.Provider value={gameEngine}>
      {children}
    </GameStateContext.Provider>
  );
};
