export function generateSecret(
  length: number,
  base: number,
  random: () => number = Math.random,
): string {
  const availableDigits = Array.from({ length: base }, (_, index) =>
    index.toString(16),
  );

  if (length < 1 || length > base) {
    throw new RangeError('Invalid secret length');
  }

  let secret = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(random() * availableDigits.length);

    const [digit] = availableDigits.splice(randomIndex, 1);

    secret += digit;
  }

  return secret;
}
