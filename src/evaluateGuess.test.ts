import { describe, expect, it } from 'vitest';
import { evaluateGuess } from './evaluateGuess';

describe('evaluateGuess', () => {
  it('counts bulls when digits are in the correct positions', () => {
    const result = evaluateGuess('1234', '1234');

    expect(result).toEqual({
      bulls: 4,
      cows: 0,
    });
  });

  it('counts cows when digits are in the wrong positions', () => {
    const result = evaluateGuess('1234', '4321');

    expect(result).toEqual({
      bulls: 0,
      cows: 4,
    });
  });

  it('counts bulls and cows in the same guess', () => {
    const result = evaluateGuess('1234', '1243');

    expect(result).toEqual({
      bulls: 2,
      cows: 2,
    });
  });

  it('returns zero when no digits match', () => {
    const result = evaluateGuess('1234', '5678');

    expect(result).toEqual({
      bulls: 0,
      cows: 0,
    });
  });

  it('compares hexadecimal digits case-insensitively', () => {
    const result = evaluateGuess('aB3F', 'AbF3');

    expect(result).toEqual({
      bulls: 2,
      cows: 2,
    });
  });

  it('handles secrets with a leading zero', () => {
    const result = evaluateGuess('0123', '0132');

    expect(result).toEqual({
      bulls: 2,
      cows: 2,
    });
  });
});
