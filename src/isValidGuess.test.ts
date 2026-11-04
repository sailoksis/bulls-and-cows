import { describe, expect, it } from 'vitest';
import { isValidGuess } from './isValidGuess';

describe('isValidGuess', () => {
  it('accepts a valid decimal guess', () => {
    expect(isValidGuess('1234', 4, 10)).toBe(true);
  });

  it('rejects a guess with incorrect length', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
  });

  it('rejects digits outside the selected base', () => {
    expect(isValidGuess('128', 3, 8)).toBe(false);
  });

  it('rejects repeated digits', () => {
    expect(isValidGuess('1123', 4, 10)).toBe(false);
  });

  it('accepts a leading zero', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('accepts uppercase hexadecimal digits', () => {
    expect(isValidGuess('A3F1', 4, 16)).toBe(true);
  });

  it('rejects hexadecimal duplicates regardless of case', () => {
    expect(isValidGuess('aA12', 4, 16)).toBe(false);
  });

  it('accepts valid binary guesses', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
  });

  it('rejects invalid characters', () => {
    expect(isValidGuess('12-4', 4, 10)).toBe(false);
  });
});
