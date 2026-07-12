import { useGameState } from "~/context/game-state";
import { OwnableBoardTileState } from "~/engine/tiles/ownable-tile";

export const Stats = () => {
  const gameState = useGameState();
  const currentPlayer = gameState.players[gameState.turn];
  const getOwnedProperties = (playerId: string) => {
    const properties = gameState.board.filter(
      (tile) =>
        tile instanceof OwnableBoardTileState && tile.owner?.id === playerId,
    );
    return properties.map((p) => p.props.abbr).join(", ");
  };

  return (
    <div>
      {gameState.players.map((player) => (
        <div
          className={`text-sm ${player.id === currentPlayer.id ? "font-bold" : ""}`}
          key={player.id}
        >
          {player.name}: ${player.balance} ({getOwnedProperties(player.id)})
        </div>
      ))}
    </div>
  );
};
