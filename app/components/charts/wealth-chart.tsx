import { PlayerLineChart } from "./player-line-chart";

/**
 * Each player's true net worth over the course of the game: cash in hand
 * plus the price paid for every property and house/hotel they own (not what
 * could be recouped by selling back to the Bank).
 */
export function WealthChart() {
  return (
    <PlayerLineChart
      title="Player wealth"
      description="Balance plus property and house value, after every turn"
      ariaLabel="Line chart of each player's net worth over the course of the game"
      field="netWorth"
    />
  );
}
