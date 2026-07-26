import { useCallback, useRef } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Label } from "./label";

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Decimal places used for both rounding and display. Defaults to 0. */
  decimals?: number;
  /** Unit appended to the displayed value, e.g. "%". Ignored when `formatValue` is set. */
  suffix?: string;
  /** Overrides how the value is rendered, e.g. as currency. */
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
}

/**
 * A touch-friendly numeric stepper: a joined pill with hold-to-repeat "−" / "+"
 * buttons flanking the current value. Purely presentational — the owner decides
 * what the value means and where it's stored.
 */
export function Stepper({
  label,
  value,
  min,
  max,
  step,
  decimals = 0,
  formatValue,
  onChange,
}: StepperProps) {
  // Round to avoid floating-point drift from repeated fractional additions.
  const factor = 10 ** decimals;
  const clamp = useCallback(
    (next: number) => {
      const rounded = Math.round(next * factor) / factor;
      return Math.min(max, Math.max(min, rounded));
    },
    [factor, max, min],
  );

  // Keep the latest value in a ref so the hold-to-repeat interval always
  // steps from the current value without re-registering the timer.
  const valueRef = useRef(value);
  valueRef.current = value;
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRepeat = useCallback(() => {
    if (delayRef.current) clearTimeout(delayRef.current);
    if (repeatRef.current) clearInterval(repeatRef.current);
    delayRef.current = null;
    repeatRef.current = null;
  }, []);

  const startRepeat = useCallback(
    (direction: 1 | -1) => {
      const stepOnce = () =>
        onChange(clamp(valueRef.current + direction * step));
      stepOnce();
      // Hold to keep stepping: short pause, then repeat.
      delayRef.current = setTimeout(() => {
        repeatRef.current = setInterval(stepOnce, 80);
      }, 350);
    },
    [clamp, onChange, step],
  );

  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-muted-foreground">{label}</Label>
      {/* A single joined pill so the two buttons and the readout read as one
          control rather than three floating boxes. */}
      <div className="flex items-stretch overflow-hidden rounded-full border border-input bg-background shadow-sm">
        <StepperButton
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onStart={() => startRepeat(-1)}
          onStop={stopRepeat}
        >
          <MinusIcon className="size-4" />
        </StepperButton>
        <div className="flex min-w-16 items-center justify-center px-2 text-base font-semibold tabular-nums">
          {formatValue(value)}
        </div>
        <StepperButton
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onStart={() => startRepeat(1)}
          onStop={stopRepeat}
        >
          <PlusIcon className="size-4" />
        </StepperButton>
      </div>
    </div>
  );
}

interface StepperButtonProps {
  children: React.ReactNode;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
  "aria-label": string;
}

function StepperButton({
  children,
  disabled,
  onStart,
  onStop,
  ...props
}: StepperButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      // Pointer events cover both touch and mouse; releasing or leaving the
      // button stops the hold-to-repeat.
      onPointerDown={(event) => {
        // Keep the pointer captured so we still receive pointerup even if the
        // finger drifts off the button while held.
        event.currentTarget.setPointerCapture(event.pointerId);
        onStart();
      }}
      onPointerUp={onStop}
      onPointerCancel={onStop}
      onPointerLeave={onStop}
      onContextMenu={(event) => event.preventDefault()}
      className={cn(
        "flex size-11 shrink-0 touch-none items-center justify-center select-none",
        "text-foreground transition-colors hover:bg-accent active:bg-accent",
        "disabled:pointer-events-none disabled:opacity-30",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
