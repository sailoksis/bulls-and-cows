import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from './countPossibleSecrets';

describe('countPossibleSecrets', () => {
  it('counts binary secrets of length 2', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('counts octal secrets of length 2', () => {
    expect(countPossibleSecrets(2, 8)).toBe(56);
  });

  it('counts decimal secrets of length 3', () => {
    expect(countPossibleSecrets(3, 10)).toBe(720);
  });

  it('counts decimal secrets of length 4', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
  });

  it('counts hexadecimal secrets of length 4', () => {
    expect(countPossibleSecrets(4, 16)).toBe(43680);
  });

  it('counts secrets when length equals base', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('returns one for an empty secret', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns zero when length exceeds base', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });
});
