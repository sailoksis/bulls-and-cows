const memo = new Map<string, number>();

export function countPossibleSecrets(length: number, base: number): number {
  if (length < 0 || base < 0 || length > base) {
    return 0;
  }

  if (length === 0) {
    return 1;
  }

  const key = `${length}-${base}`;

  const cachedResult = memo.get(key);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const result = base * countPossibleSecrets(length - 1, base - 1);

  memo.set(key, result);

  return result;
}
