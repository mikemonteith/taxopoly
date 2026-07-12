import * as React from "react";
import {
  Dices,
  Info,
  Minus,
  Moon,
  Pause,
  Play,
  Plus,
  Sun,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Slider } from "~/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress";
import { Toggle } from "~/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

export function meta() {
  return [
    { title: "Styleguide — Monopoly Sim" },
    { name: "description", content: "Component and design token reference." },
  ];
}

const NAV = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons & toggles" },
  { id: "badges", label: "Badges" },
  { id: "forms", label: "Form controls" },
  { id: "tabs", label: "Tabs" },
  { id: "feedback", label: "Avatars, progress, tooltips" },
  { id: "overlays", label: "Dialog" },
  { id: "composed", label: "Composed example" },
];

export default function Styleguide() {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <aside className="sticky top-10 hidden h-fit w-44 shrink-0 lg:block">
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          On this page
        </p>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="mb-12 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Styleguide
            </h1>
            <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
              Every UI primitive the simulator is built from, in one place.
              Built on Radix UI primitives for accessibility (keyboard nav,
              focus management, ARIA) and Tailwind CSS for styling — see{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                app/components/ui
              </code>
              .
            </p>
          </div>
          <ThemeToggle />
        </header>

        <Section
          id="colors"
          title="Colors"
          description="Semantic tokens — swap the values in app.css and every component below updates."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <Swatch
              name="Background"
              className="bg-background text-foreground border border-border"
            />
            <Swatch
              name="Card"
              className="bg-card text-card-foreground border border-border"
            />
            <Swatch
              name="Primary"
              className="bg-primary text-primary-foreground"
            />
            <Swatch
              name="Secondary"
              className="bg-secondary text-secondary-foreground"
            />
            <Swatch name="Muted" className="bg-muted text-muted-foreground" />
            <Swatch
              name="Accent"
              className="bg-accent text-accent-foreground"
            />
            <Swatch
              name="Destructive"
              className="bg-destructive text-destructive-foreground"
            />
            <Swatch
              name="Success"
              className="bg-success text-success-foreground"
            />
            <Swatch
              name="Warning"
              className="bg-warning text-warning-foreground"
            />
            <Swatch name="Border" className="bg-border text-foreground" />
          </div>
        </Section>

        <Section
          id="typography"
          title="Typography"
          description="One scale, used consistently — headings stay in the body sans, numerals stay tabular where they line up in columns."
        >
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Heading 1 — Monopoly Simulator
            </h1>
            <h2 className="text-2xl font-semibold tracking-tight">
              Heading 2 — Turn 42
            </h2>
            <h3 className="text-xl font-semibold tracking-tight">
              Heading 3 — Player standings
            </h3>
            <h4 className="text-lg font-semibold">
              Heading 4 — Recent activity
            </h4>
            <p className="max-w-prose text-sm leading-relaxed text-foreground">
              Body text. Iron Fist bought St. James Place for $180, leaving them
              cash-poor but property-rich — a deliberate trade AI players make
              when a strategy favors board control over liquidity.
            </p>
            <p className="text-sm text-muted-foreground">
              Muted text, for secondary detail and captions.
            </p>
            <p className="font-mono text-sm tabular-nums">
              $1,920.00 — tabular figures for columns of numbers.
            </p>
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons & toggles"
          description="Six intents, four sizes, plus the icon-toggle pattern used for play/pause and speed controls."
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add player">
                <Plus />
              </Button>
              <Button disabled>Disabled</Button>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-6">
              <Field label="Play / pause">
                <PlayPauseToggleDemo />
              </Field>
              <Field label="Speed">
                <ToggleGroup
                  type="single"
                  defaultValue="1x"
                  aria-label="Simulation speed"
                >
                  <ToggleGroupItem value="1x">1×</ToggleGroupItem>
                  <ToggleGroupItem value="2x">2×</ToggleGroupItem>
                  <ToggleGroupItem value="4x">4×</ToggleGroupItem>
                </ToggleGroup>
              </Field>
              <Field label="Players">
                <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6"
                    aria-label="Remove player"
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-4 text-center text-sm font-medium tabular-nums">
                    4
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6"
                    aria-label="Add player"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </Field>
            </div>
          </div>
        </Section>

        <Section
          id="badges"
          title="Badges"
          description="Status and identity chips. Semantic colors (success/warning/destructive) are reserved — never reused for arbitrary categories."
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Cash positive</Badge>
            <Badge variant="warning">Low liquidity</Badge>
            <Badge variant="destructive">Bankrupt</Badge>
          </div>
        </Section>

        <Section
          id="forms"
          title="Form controls"
          description="Every field pairs with a <Label>, carries a visible focus state, and supports disabled / invalid states."
        >
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Simulation name" htmlFor="sim-name">
              <Input id="sim-name" placeholder="e.g. Balanced ruleset v3" />
            </Field>
            <Field label="Starting cash" htmlFor="cash">
              <Input id="cash" type="number" defaultValue={1500} />
            </Field>
            <Field label="Disabled input" htmlFor="disabled-input">
              <Input id="disabled-input" placeholder="Not editable" disabled />
            </Field>
            <Field label="Invalid input" htmlFor="invalid-input">
              <Input id="invalid-input" aria-invalid defaultValue="-200" />
            </Field>
            <Field label="Board theme" htmlFor="board-theme">
              <Select defaultValue="arcade">
                <SelectTrigger id="board-theme" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ledger">The Ledger</SelectItem>
                  <SelectItem value="arcade">Boardwalk Arcade</SelectItem>
                  <SelectItem value="terminal">Trading Floor</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Notes" htmlFor="notes">
              <Textarea
                id="notes"
                placeholder="Anything to remember about this run…"
              />
            </Field>

            <div className="flex flex-col gap-4 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Checkbox id="auto-mortgage" defaultChecked />
                <Label htmlFor="auto-mortgage">
                  Auto-mortgage when cash runs out
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="unlimited-houses" />
                <Label htmlFor="unlimited-houses">
                  Unlimited houses (ignore bank supply)
                </Label>
              </div>
            </div>

            <fieldset className="flex flex-col gap-3 sm:col-span-2">
              <legend className="text-sm font-medium">
                Trading between players
              </legend>
              <RadioGroup defaultValue="off" className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="off" id="trade-off" />
                  <Label htmlFor="trade-off">
                    Off — AI players never trade (default for now)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fair" id="trade-fair" disabled />
                  <Label htmlFor="trade-fair">
                    Fair-value only (coming later)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="free" id="trade-free" disabled />
                  <Label htmlFor="trade-free">
                    Unrestricted (coming later)
                  </Label>
                </div>
              </RadioGroup>
            </fieldset>

            <Field
              label={`Tax rate — 12%`}
              htmlFor="tax-rate"
              className="sm:col-span-2"
            >
              <Slider id="tax-rate" defaultValue={[12]} max={50} step={1} />
            </Field>
          </div>
        </Section>

        <Section
          id="tabs"
          title="Tabs"
          description="Used for the Board / Players / Stats screens on mobile."
        >
          <Tabs defaultValue="board" className="max-w-md">
            <TabsList className="w-full">
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            <TabsContent
              value="board"
              className="rounded-lg border border-border p-4 text-sm text-muted-foreground"
            >
              Board view — 40 tiles, live token positions.
            </TabsContent>
            <TabsContent
              value="players"
              className="rounded-lg border border-border p-4 text-sm text-muted-foreground"
            >
              Player list — cash, net worth, strategy.
            </TabsContent>
            <TabsContent
              value="stats"
              className="rounded-lg border border-border p-4 text-sm text-muted-foreground"
            >
              Money-over-time chart for every player.
            </TabsContent>
          </Tabs>
        </Section>

        <Section id="feedback" title="Avatars, progress & tooltips">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>IF</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>BK</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>LS</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>SE</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex max-w-sm flex-col gap-3">
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Cash reserve</span>
                  <span className="font-medium tabular-nums">$1,920</span>
                </div>
                <Progress value={78} />
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Cash reserve</span>
                  <span className="font-medium tabular-nums">$180</span>
                </div>
                <Progress value={9} />
              </div>
            </div>

            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="What is net worth?"
                  >
                    <Info />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Net worth = cash on hand + property value.
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Section>

        <Section id="overlays" title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open settings</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset simulation</DialogTitle>
                <DialogDescription>
                  This clears every player's balance and returns all tokens to
                  GO. This can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">Reset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        <Section
          id="composed"
          title="Composed example"
          description="The primitives above, combined into a player card — the kind of thing the board screen is built from."
        >
          <Card className="max-w-sm">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>IF</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Iron Fist</CardTitle>
                  <CardDescription>Aggressive buyer</CardDescription>
                </div>
              </div>
              <Badge variant="warning">Low cash</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums">
                  $180
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                  <TrendingDown className="size-3.5" /> $340 this turn
                </span>
              </div>
              <Progress value={9} />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Dices className="size-3.5" /> Rolled 6 + 4 · landed on St.
                James Place
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Users className="size-3.5" /> View accounts
              </Button>
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <TrendingUp className="size-3.5" /> net $2,410
              </span>
            </CardFooter>
          </Card>
        </Section>
      </main>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-5">{children}</div>
      <Separator className="mt-14" />
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex h-16 items-end rounded-lg p-2 text-xs font-medium",
          className,
        )}
      >
        {name}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function PlayPauseToggleDemo() {
  const [playing, setPlaying] = React.useState(false);
  return (
    <Toggle
      aria-label={playing ? "Pause the simulation" : "Play the simulation"}
      size="lg"
      variant="outline"
      className="rounded-full"
      pressed={playing}
      onPressedChange={setPlaying}
    >
      {playing ? <Pause /> : <Play />}
    </Toggle>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const root = document.documentElement;
    setIsDark(
      root.classList.contains("dark") ||
        (!root.classList.contains("light") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = !isDark;
    root.classList.toggle("dark", next);
    root.classList.toggle("light", !next);
    setIsDark(next);
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Toggle color theme"
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
