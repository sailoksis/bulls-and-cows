import { describe, expect, it } from 'vitest';
import { generateSecret } from './generateSecret';

describe('generateSecret', () => {
  it('generates a secret with the requested length', () => {
    const secret = generateSecret(4, 10, () => 0.5);

    expect(secret).toHaveLength(4);
  });
  it('generates a secret with unique digits', () => {
    const secret = generateSecret(4, 10, () => 0.5);

    const uniqueDigits = new Set(secret);

    expect(uniqueDigits.size).toBe(4);
  });
  it('uses only digits allowed by the base', () => {
    const secret = generateSecret(4, 8, () => 0.5);

    expect(secret).toMatch(/^[0-7]{4}$/);
  });
  it('allows a leading zero', () => {
    const secret = generateSecret(4, 10, () => 0);

    expect(secret[0]).toBe('0');
    expect(secret).toHaveLength(4);
  });
  it('generates the same secret with the same random source', () => {
    const firstSecret = generateSecret(4, 10, () => 0.5);
    const secondSecret = generateSecret(4, 10, () => 0.5);

    expect(firstSecret).toBe(secondSecret);
    expect(firstSecret).toHaveLength(4);
  });
});
