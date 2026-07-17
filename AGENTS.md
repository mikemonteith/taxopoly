# AGENTS.md

Guidance for AI agents working on **Taxopoly** — a Monopoly simulation where the
user can adjust tax variables to see how they affect the game over many turns.
The end goal is a running simulation (players auto-play; no human moves) with
controls to tune tax rules and visualise the outcome.

## Tech stack

- **React Router 8** in framework mode, but **SSR is off** — the app is a fully
  prerendered SPA (`react-router.config.ts`: `ssr: false`, `prerender: true`).
  It's built to be cheap to host: static files on GitHub Pages, no backend.
- **React 19**, **TypeScript** (strict), **Vite 8**.
- **Tailwind CSS v4** + **shadcn/ui** (new-york style, components in
  `app/components/ui/`) + **lucide-react** icons.
- **Vitest** for tests.

## Commands

- `npm run dev` — local dev server.
- `npm run test` — run the vitest suite.
- `npm run typecheck` — `react-router typegen && tsc`. Run after route/type changes.
- `npm run lint` — prettier `--check` (CI runs this; a formatting slip fails CI).
- `npm run format` — prettier `--write`. **Always run before committing.**

CI (`.github/workflows/deploy-pages.yml`) runs lint → typecheck → build, then
deploys to GitHub Pages on push to `main`. There are no other test/CI gates.

## Architecture

The codebase splits cleanly into a **framework-agnostic game engine** and a
**React UI** that observes it. Keep game logic in the engine, not in components.

### Engine (`app/engine/`) — the core

- `index.ts` — `GameEngine` class owns the whole `GameState` (players, board,
  turn, wealth history). `tick(diceRoll)` is the heartbeat: it moves the current
  player, advances the turn, snapshots wealth, and notifies subscribers.
- **Observer pattern**: `subscribe(cb)` / `notifySubscribers()`. React binds to
  this via `useSyncExternalStore` (see `app/context/game-state.tsx`). `tick`
  reassigns `this.state` to a new object so identity-based reactivity fires.
- `static-data.ts` — **all static board config**: `TileType`, `StreetGroup`,
  `TileCode` enums, the typed `BoardTile` interfaces, and the `BOARD_TILES`
  array. This is immutable game data; per-game mutable state lives on the tile
  _state_ classes and `Player` objects. Board/property changes go here.
- `dice.ts` — dice rolls. Note `tick` takes the roll as an argument, so tests
  drive deterministic rolls directly (e.g. `engine.tick(3)`).

### Tiles (`app/engine/tiles/`) — behaviour via polymorphism

Each tile type is a subclass of `BoardTileState` with a `landedOn(player)` hook.

- `base.ts` — `BoardTileState<T>`: holds `props` (its static `BoardTile`) and a
  reference to the `engine`. Default `landedOn` is a no-op.
- `ownable-tile.ts` — `OwnableBoardTileState`: owner tracking, buy-if-affordable,
  and pay-rent logic; subclasses implement the abstract `rent` getter.
- `street-tile.ts`, `train-station-tile.ts`, `utilities-tile.ts` — differ only in
  how `rent` is computed (monopoly doubling, station count, utility multiplier ×
  `engine.currentRoll`).
- `tax-tile.ts`, `go-tile.ts`, `jail-tile.ts` — special-square behaviour.
- `index.ts` re-exports every tile state class.

**To add a new tile behaviour**: create the subclass, export it from
`tiles/index.ts`, and add a `case` to `GameEngine.createTileState`'s switch
(`index.ts`) so it's instantiated for the right `TileType`.

### React layer

- `app/context/` — providers bridging engine → React:
  - `game-state.tsx` — `GameStateProvider` constructs the `GameEngine`;
    `useGameEngine()` / `useGameState()` are the access hooks.
  - `game-controls.tsx` — play/pause + simulation speed (`1x/2x/4x`) UI state.
  - `debug.tsx` — `useDebug()` is `import.meta.env.DEV`.
- `app/components/` — `board/` (presentational board, ownership + token layers),
  `charts/` (wealth over time), `controls/` (play/pause, speed), `ui/` (shadcn).
  The board in `monopoly-board.tsx` is **pure/presentational** — no game logic.
- `app/routes/` — `home.tsx` (the app) and `styleguide.tsx`; wired in `routes.ts`.

## Conventions

- **Import alias**: `~/*` → `app/*`. Configured in three places that must stay in
  sync — `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`.
- **Tests** live in `app/engine/tests/`, colocated by scenario (single-player,
  multi-player, cards, trade). vitest `globals` is on, so `test`/`expect` need no
  import. The engine is tested directly (no React). Unimplemented features are
  scaffolded with `test.todo(...)` — check these for the intended roadmap before
  building new game rules; implement the rule and flesh out the matching todo.
- Keep new game rules in the engine and covered by an engine test; keep
  components presentational.
- shadcn components (`app/components/ui/`) are generated — see `components.json`.
  Prefer adding/regenerating via shadcn over hand-editing.
