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

export const isValidGuess = (
  guess: string,
  length: number,
  base: number,
): boolean => {
  if (guess.length !== length) return false;
  const isDigitValid = createDigitValidator(base);
  const digits = Array.from(guess.toLowerCase());
  return digits.every(isDigitValid) && new Set(digits).size === digits.length;
};

const secretCountCache = new Map<string, number>();

export const countPossibleSecrets = (length: number, base: number): number => {
  if (
    !Number.isInteger(length) ||
    !Number.isInteger(base) ||
    length < 0 ||
    base < 0
  ) {
    return 0;
  }
  if (length === 0) return 1;
  if (length > base) return 0;

  const cacheKey = `${length}:${base}`;
  const cachedCount = secretCountCache.get(cacheKey);
  if (cachedCount !== undefined) return cachedCount;

  const count = base * countPossibleSecrets(length - 1, base - 1);
  secretCountCache.set(cacheKey, count);
  return count;
};

export type GuessEntry = Readonly<{
  guess: string;
  bulls: number;
  cows: number;
}>;

export type GameState = Readonly<{
  length: number;
  base: number;
  secret: string;
  history: readonly GuessEntry[];
  status: 'playing' | 'won';
}>;

export const submitGuess = (state: GameState, guess: string): GameState => {
  void state;
  void guess;
  throw new Error('Not implemented');
};
