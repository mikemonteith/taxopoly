const singleDiceRoll = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};

export const getRoll = (): number => {
  return singleDiceRoll() + singleDiceRoll();
};
