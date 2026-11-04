import { evaluateGuess } from './evaluateGuess';
import { isValidGuess } from './isValidGuess';
import type { GameState, GuessEntry } from './gameTypes';

export function submitGuess(state: GameState, guess: string): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  const normalizedGuess = guess.toLowerCase();

  if (!isValidGuess(normalizedGuess, state.length, state.base)) {
    return state;
  }

  const alreadyGuessed = state.history.some(
    (entry) => entry.guess === normalizedGuess,
  );

  if (alreadyGuessed) {
    return state;
  }

  const result = evaluateGuess(state.secret, normalizedGuess);

  const newEntry: GuessEntry = {
    guess: normalizedGuess,
    bulls: result.bulls,
    cows: result.cows,
  };

  return {
    ...state,
    history: [...state.history, newEntry],
    status: result.bulls === state.length ? 'won' : 'playing',
  };
}
