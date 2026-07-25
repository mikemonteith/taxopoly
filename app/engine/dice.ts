/**
 * A simple pseudo-random number generator (PRNG) using the Mulberry32 algorithm.
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const getRandomGenerator = (): (() => number) => {
  if (import.meta.env.DEV) {
    return mulberry32(0);
  }
  return Math.random;
};

const randomDice = getRandomGenerator();

const singleDiceRoll = (): number => {
  return Math.floor(randomDice() * 6) + 1;
};

export const getRoll = (): number => {
  return singleDiceRoll() + singleDiceRoll();
};

const randomShuffle = getRandomGenerator();
/** Returns a shuffled copy of the given array (Fisher-Yates). */
export const shuffle = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomShuffle() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
