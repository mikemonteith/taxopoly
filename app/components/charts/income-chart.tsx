import { useGameState } from "~/context/game-state";
import { PlayerLineChart } from "./player-line-chart";

/**
 * Each player's true net worth over the course of the game: cash in hand
 * plus the price paid for every property and house/hotel they own (not what
 * could be recouped by selling back to the Bank).
 */
export function IncomeChart() {
  const gameState = useGameState();
  const { wealthHistory } = gameState;

  const data = wealthHistory.map((snapshot) => snapshot.income);

  const windowSize = 100;
  // Find a rolling average income over the last `windowSize` turns.
  // data is an array of {player: income} objects, so we need to map it to an array of numbers first.
  const rollingAverageIncome = data.map((income, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const end = index + 1;
    const slice = data.slice(start, end);
    const averageIncome = slice.reduce(
      (acc, curr) => {
        Object.keys(curr).forEach((player) => {
          acc[player] = (acc[player] || 0) + curr[player];
        });
        return acc;
      },
      {} as Record<string, number>,
    );
    Object.keys(averageIncome).forEach((player) => {
      averageIncome[player] /= slice.length;
    });
    return averageIncome;
  });

  return (
    <PlayerLineChart
      title="Player income (rolling average)"
      description="Income after every turn"
      ariaLabel="Line chart of each player's income over the course of the game"
      data={rollingAverageIncome}
    />
  );
}
