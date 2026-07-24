import { useGameState } from "~/context/game-state";

const Overview = () => {
  const gameState = useGameState();

  const netWorths = gameState.players.map((player) => ({
    name: player.name,
    netWorth: player.netWorth,
    ownedProperties: player.ownedProperties.length,
  }));

  const playerOwnsEverything = netWorths.find(
    (player) => player.ownedProperties >= 28,
  );

  const playerWorthMoreThanAllOthers = netWorths.find(
    (player) =>
      player.netWorth >
      netWorths.reduce((total, p) => total + p.netWorth, 0) - player.netWorth,
  );

  return (
    <div>
      {playerOwnsEverything ? (
        <>
          <p>⚠️ Game Over ⚠️</p>
          <p>{playerOwnsEverything.name} owns everything!</p>
          <p>Your taxopoly lasted {gameState.turn} turns.</p>
        </>
      ) : null}
      {playerWorthMoreThanAllOthers && !playerOwnsEverything ? (
        <p>
          ⚠️ {playerWorthMoreThanAllOthers.name} is worth more than all other
          players combined!
        </p>
      ) : null}
    </div>
  );
};

export { Overview };
