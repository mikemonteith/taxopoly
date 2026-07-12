import { MonopolyBoard } from "~/components/board/monopoly-board";
import type { Route } from "./+types/home";
import { PlayPause } from "~/components/controls/play-pause";
import { SpeedControl } from "~/components/controls/speed-control";
import { GameStateProvider } from "~/context/game-state";
import { Stats } from "~/components/board/stats";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Taxopoly" },
    { name: "description", content: "Monopoly... but with tax" },
  ];
}

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

      <GameStateProvider>
        <MonopolyBoard>
          <Stats />
        </MonopolyBoard>
        <div className="flex flex-wrap justify-center items-center gap-6">
          <PlayPause />
          <SpeedControl />
        </div>
      </GameStateProvider>
    </main>
  );
}
