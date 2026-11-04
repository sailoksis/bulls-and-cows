import { describe, expect, it } from 'vitest';
import { submitGuess } from './submitGuess';
import type { GameState } from './gameTypes';

const createTestState = (): GameState => ({
  secret: '1234',
  length: 4,
  base: 10,
  status: 'playing',
  history: [],
  startedAt: 1000,
});

describe('submitGuess', () => {
  it('adds a guess with correct bulls and cows', () => {
    const state = createTestState();

    const nextState = submitGuess(state, '1532');

    expect(nextState.history).toEqual([{ guess: '1532', bulls: 2, cows: 1 }]);
  });

  it('does not mutate the original state', () => {
    const state = createTestState();

    const nextState = submitGuess(state, '1532');

    expect(nextState).not.toBe(state);
    expect(nextState.history).not.toBe(state.history);
    expect(state.history).toEqual([]);
  });

  it('marks the game as won when the guess matches', () => {
    const state = createTestState();

    const nextState = submitGuess(state, '1234');

    expect(nextState.status).toBe('won');
    expect(nextState.history).toHaveLength(1);
  });
  it('ignores invalid guesses', () => {
    const state = createTestState();

    expect(submitGuess(state, '1123')).toBe(state);
    expect(submitGuess(state, '123')).toBe(state);
  });

  it('does not add duplicate guesses', () => {
    const state = createTestState();

    const firstState = submitGuess(state, '1532');
    const secondState = submitGuess(firstState, '1532');

    expect(secondState.history).toHaveLength(1);
    expect(secondState).toBe(firstState);
  });

  it('accepts uppercase hexadecimal digits', () => {
    const state: GameState = {
      ...createTestState(),
      secret: 'a1b2',
      base: 16,
    };

    const nextState = submitGuess(state, 'A1B3');

    expect(nextState.history).toEqual([{ guess: 'a1b3', bulls: 3, cows: 0 }]);
  });

  it('ignores guesses after the game is won', () => {
    const state = createTestState();

    const wonState = submitGuess(state, '1234');
    const nextState = submitGuess(wonState, '4321');

    expect(wonState.status).toBe('won');
    expect(nextState).toBe(wonState);
    expect(nextState.history).toHaveLength(1);
  });
});
