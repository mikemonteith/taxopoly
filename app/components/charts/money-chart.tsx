import { PlayerLineChart } from "./player-line-chart";

/** Cash in hand for each player over the course of the game. */
export function MoneyChart() {
  return (
    <PlayerLineChart
      title="Player money"
      description="Balance after every turn"
      ariaLabel="Line chart of each player's cash balance over the course of the game"
      field="balances"
    />
  );
}
