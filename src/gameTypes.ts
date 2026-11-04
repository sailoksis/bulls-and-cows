export type GameSettings = {
  length: number;
  base: number;
};

export type GuessEntry = {
  guess: string;
  bulls: number;
  cows: number;
};

export type GameState = {
  secret: string;
  length: number;
  base: number;
  status: 'playing' | 'won';
  history: GuessEntry[];
  startedAt: number;
};
