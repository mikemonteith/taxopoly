import * as React from "react";
import { Dices } from "lucide-react";

import { MonopolyBoard } from "~/components/board/monopoly-board";
import { Button } from "~/components/ui/button";
import type { PlayerToken } from "~/lib/player-tokens";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Taxopoly" },
    { name: "description", content: "Monopoly... but with tax" },
  ];
}

const INITIAL_PLAYERS: PlayerToken[] = [
  { id: "p1", name: "Player 1", tileId: 0, color: "violet" },
  { id: "p2", name: "Player 2", tileId: 5, color: "cyan" },
  { id: "p3", name: "Player 3", tileId: 18, color: "rose" },
  { id: "p4", name: "Player 4", tileId: 29, color: "lime" },
];

export default function Home() {
  const [players, setPlayers] = React.useState(INITIAL_PLAYERS);

  function movePlayers() {
    setPlayers((prev) =>
      prev.map((player) => ({
        ...player,
        tileId: (player.tileId + 1 + Math.floor(Math.random() * 6)) % 40,
      })),
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Taxopoly
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo — moves each token 1–6 spaces. No game rules yet.
          </p>
        </div>
        <Button onClick={movePlayers}>
          <Dices /> Move players
        </Button>
      </header>

      <MonopolyBoard players={players} />
    </main>
  );
}
