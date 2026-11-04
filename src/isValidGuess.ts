import { createDigitValidator } from './createDigitValidator.js';

export function isValidGuess(
  guess: string,
  length: number,
  base: number,
): boolean {
  if (guess.length !== length) {
    return false;
  }

  const isDigitValid = createDigitValidator(base);

  const digits = guess.toLowerCase().split('');

  const allDigitsValid = digits.every(isDigitValid);

  const allDigitsUnique = new Set(digits).size === digits.length;

  return allDigitsValid && allDigitsUnique;
}
