import { MonopolyBoard } from "~/components/board/monopoly-board";
import type { PlayerToken } from "~/lib/player-tokens";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Taxopoly" },
    { name: "description", content: "Monopoly... but with tax" },
  ];
}

const players: PlayerToken[] = [
  { id: "p1", name: "Player 1", tileId: 0, color: "violet" },
  { id: "p2", name: "Player 2", tileId: 5, color: "cyan" },
  { id: "p3", name: "Player 3", tileId: 18, color: "rose" },
  { id: "p4", name: "Player 4", tileId: 29, color: "lime" },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Taxopoly
          </h1>
        </div>
      </header>

      <MonopolyBoard players={players} />
    </main>
  );
}
