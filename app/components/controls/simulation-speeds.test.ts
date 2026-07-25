import { animationSpeeds } from "~/components/board/player-tokens";
import { TICK_INTERVAL_MS } from "~/components/controls/simulation-controls";
import { SIMULATION_SPEEDS } from "~/context/game-controls";

test("uses the three supported simulation speeds", () => {
  expect(SIMULATION_SPEEDS).toEqual(["1x", "5x", "20x"]);
});

test("uses matching tick intervals for each speed", () => {
  expect(TICK_INTERVAL_MS).toEqual({
    "1x": 128,
    "5x": 26,
    "20x": 6,
  });
});

test("uses matching token animation speeds for each speed", () => {
  expect(animationSpeeds).toEqual({
    "1x": 500,
    "5x": 100,
    "20x": 10,
  });
});
