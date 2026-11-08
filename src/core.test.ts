import { describe, expect, it } from 'vitest';
import {
  createDigitValidator,
  countPossibleSecrets,
  evaluateGuess,
  generateSecret,
  isValidGuess,
  submitGuess,
  type GameState,
} from './core.js';

describe('generateSecret', () => {
  it('selects unique digits predictably and permits a leading zero', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
  });

  it('uses the alphabet for the requested base', () => {
    expect(generateSecret(3, 16, () => 0)).toBe('012');
  });
});

describe('evaluateGuess', () => {
  it('counts exact-position bulls and misplaced cows', () => {
    expect(evaluateGuess('1234', '1325')).toEqual({ bulls: 1, cows: 2 });
  });

  it('compares hexadecimal letters without case sensitivity', () => {
    expect(evaluateGuess('aF12', 'Af21')).toEqual({ bulls: 2, cows: 2 });
  });
});

describe('createDigitValidator', () => {
  it('returns a predicate scoped to the selected base', () => {
    const isBinaryDigit = createDigitValidator(2);
    expect(isBinaryDigit('0')).toBe(true);
    expect(isBinaryDigit('1')).toBe(true);
    expect(isBinaryDigit('2')).toBe(false);
  });

  it('accepts hexadecimal letters without case sensitivity', () => {
    const isHexDigit = createDigitValidator(16);
    expect(isHexDigit('A')).toBe(true);
    expect(isHexDigit('f')).toBe(true);
    expect(isHexDigit('g')).toBe(false);
  });
});

describe('isValidGuess', () => {
  it('requires the configured length, valid digits, and unique digits', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
    expect(isValidGuess('011', 3, 2)).toBe(false);
    expect(isValidGuess('0', 2, 2)).toBe(false);
    expect(isValidGuess('02', 2, 2)).toBe(false);
  });

  it('treats upper and lower case hexadecimal digits as duplicates', () => {
    expect(isValidGuess('aF', 2, 16)).toBe(true);
    expect(isValidGuess('aA', 2, 16)).toBe(false);
  });
});

describe('countPossibleSecrets', () => {
  it('counts permutations without excluding a leading zero', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('returns zero when the alphabet cannot supply enough unique digits', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });
});

describe('submitGuess', () => {
  const initialState: GameState = {
    length: 3,
    base: 10,
    secret: '123',
    history: [],
    status: 'playing',
  };

  it('adds an entry immutably and leaves the old state unchanged', () => {
    const nextState = submitGuess(initialState, '132');
    expect(nextState.history).toEqual([{ guess: '132', bulls: 1, cows: 2 }]);
    expect(nextState.history).not.toBe(initialState.history);
    expect(initialState.history).toEqual([]);
  });

  it('ignores invalid and duplicate guesses', () => {
    const submitted = submitGuess(initialState, '132');
    expect(submitGuess(submitted, '132')).toBe(submitted);
    expect(submitGuess(initialState, '111')).toBe(initialState);
  });

  it('ends the round after a fully correct guess', () => {
    expect(submitGuess(initialState, '123').status).toBe('won');
  });
});
