export const generateSecret = (
  _length: number,
  _base: number,
  _random: () => number = Math.random,
): string => {
  if (
    !Number.isInteger(_length) ||
    _length < 1 ||
    _length > _base ||
    _base > 36
  ) {
    throw new RangeError(
      'Length must be between 1 and base, and base cannot exceed 36',
    );
  }

  const availableDigits = Array.from({ length: _base }, (_, digit) =>
    digit.toString(36),
  );
  return Array.from({ length: _length }, () => {
    const index = Math.floor(_random() * availableDigits.length);
    return availableDigits.splice(index, 1)[0] ?? '0';
  }).join('');
};

export const evaluateGuess = (
  secret: string,
  guess: string,
): { bulls: number; cows: number } => {
  const normalizedSecret = Array.from(secret.toLowerCase());
  const normalizedGuess = Array.from(guess.toLowerCase());
  const matches = normalizedGuess.map((digit) =>
    normalizedSecret.includes(digit),
  );
  const bulls = matches.reduce(
    (total, matchesPosition, index) =>
      total +
      Number(
        matchesPosition && normalizedSecret[index] === normalizedGuess[index],
      ),
    0,
  );
  const matchingDigits = matches.filter(Boolean).length;
  return { bulls, cows: matchingDigits - bulls };
};

export const createDigitValidator = (
  base: number,
): ((char: string) => boolean) => {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, base);
  return (char: string): boolean =>
    char.length === 1 && alphabet.includes(char.toLowerCase());
};
