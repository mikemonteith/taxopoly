import { useGameControls } from "~/context/game-controls";
import { Stepper } from "../ui/stepper";

export function TaxControls() {
  const { taxRate, setTaxRate } = useGameControls();

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Stepper
        label="Income Tax"
        value={taxRate.income}
        min={0}
        max={100}
        step={5}
        suffix="%"
        onChange={(income) => setTaxRate({ ...taxRate, income })}
      />
      <Stepper
        label="Wealth Tax"
        value={taxRate.wealth}
        min={0}
        max={10}
        step={0.5}
        decimals={1}
        suffix="%"
        onChange={(wealth) => setTaxRate({ ...taxRate, wealth })}
      />
    </div>
  );
}
