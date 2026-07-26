import { MonopolyBoard } from "~/components/board/monopoly-board";
import type { Route } from "./+types/home";
import { SimulationControls } from "~/components/controls/simulation-controls";
import { GameStateProvider } from "~/context/game-state";
import { WealthChart } from "~/components/charts/wealth-chart";
import { IncomeChart } from "~/components/charts/income-chart";
import { GameControlsProvider } from "~/context/game-controls";
import { Overview } from "~/components/controls/overview";
import { Footer } from "~/components/footer";
import { TaxControls } from "~/components/controls/tax-controls";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Taxopoly" },
    { name: "description", content: "Monopoly... but with tax" },
  ];
}

export default function Home() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <GameStateProvider>
          <GameControlsProvider>
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <MonopolyBoard>
                  <Overview />
                  <SimulationControls />
                </MonopolyBoard>
                <TaxControls />
              </div>
              <div className="flex flex-col gap-6">
                <WealthChart />
                <IncomeChart />
              </div>
            </div>
          </GameControlsProvider>
        </GameStateProvider>
      </main>
      <Footer />
    </>
  );
}
