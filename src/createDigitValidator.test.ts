import { describe, expect, it } from 'vitest';
import { createDigitValidator } from './createDigitValidator';

describe('createDigitValidator', () => {
  it('accepts valid binary digits', () => {
    const isValid = createDigitValidator(2);

    expect(isValid('0')).toBe(true);
    expect(isValid('1')).toBe(true);
  });

  it('rejects invalid binary digits', () => {
    const isValid = createDigitValidator(2);

    expect(isValid('2')).toBe(false);
  });

  it('accepts octal digits', () => {
    const isValid = createDigitValidator(8);

    expect(isValid('7')).toBe(true);
    expect(isValid('8')).toBe(false);
  });

  it('accepts decimal digits', () => {
    const isValid = createDigitValidator(10);

    expect(isValid('9')).toBe(true);
    expect(isValid('a')).toBe(false);
  });

  it('accepts hexadecimal letters regardless of case', () => {
    const isValid = createDigitValidator(16);

    expect(isValid('a')).toBe(true);
    expect(isValid('A')).toBe(true);
    expect(isValid('f')).toBe(true);
    expect(isValid('F')).toBe(true);
  });

  it('rejects characters outside hexadecimal digits', () => {
    const isValid = createDigitValidator(16);

    expect(isValid('g')).toBe(false);
    expect(isValid('-')).toBe(false);
    expect(isValid('')).toBe(false);
    expect(isValid('12')).toBe(false);
  });
});
