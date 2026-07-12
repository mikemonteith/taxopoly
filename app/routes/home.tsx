import { MonopolyBoard } from "~/components/board/monopoly-board";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Taxopoly" },
    { name: "description", content: "Monopoly... but with tax" },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Taxopoly
        </h1>
      </header>

      <MonopolyBoard />
    </main>
  );
}
