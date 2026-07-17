const singleDiceRoll = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};

export const getRoll = (): number => {
  return singleDiceRoll() + singleDiceRoll();
};

/** Returns a shuffled copy of the given array (Fisher-Yates). */
export const shuffle = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
