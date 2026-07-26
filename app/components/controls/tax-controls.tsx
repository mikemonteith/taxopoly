import type { TaxBracket } from "~/engine";
import { useGameControls } from "~/context/game-controls";
import { Stepper } from "../ui/stepper";

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

export function TaxControls() {
  const { taxRate, setTaxRate } = useGameControls();

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-5">
      <TaxSection
        title="Income Tax"
        bracket={taxRate.income}
        rateMax={100}
        rateStep={5}
        thresholdMax={2000}
        thresholdStep={100}
        onChange={(income) => setTaxRate({ ...taxRate, income })}
      />
      <TaxSection
        title="Wealth Tax"
        bracket={taxRate.wealth}
        rateMax={10}
        rateStep={0.5}
        rateDecimals={1}
        thresholdMax={10000}
        thresholdStep={500}
        onChange={(wealth) => setTaxRate({ ...taxRate, wealth })}
      />
    </div>
  );
}

interface TaxSectionProps {
  title: string;
  bracket: TaxBracket;
  rateMax: number;
  rateStep: number;
  rateDecimals?: number;
  thresholdMax: number;
  thresholdStep: number;
  onChange: (bracket: TaxBracket) => void;
}

/** A single tax's controls: the rate charged, and the amount it only applies above. */
function TaxSection({
  title,
  bracket,
  rateMax,
  rateStep,
  rateDecimals,
  thresholdMax,
  thresholdStep,
  onChange,
}: TaxSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold">{title}</div>
      <Stepper
        label="Rate"
        value={bracket.rate}
        min={0}
        max={rateMax}
        step={rateStep}
        decimals={rateDecimals}
        formatValue={(value) => `${value.toFixed(rateDecimals ?? 0)}%`}
        onChange={(rate) => onChange({ ...bracket, rate })}
      />
      <Stepper
        label="Above"
        value={bracket.threshold}
        min={0}
        max={thresholdMax}
        step={thresholdStep}
        formatValue={formatCurrency}
        onChange={(threshold) => onChange({ ...bracket, threshold })}
      />
    </div>
  );
}
