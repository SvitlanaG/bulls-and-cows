import { describe, expect, it } from 'vitest';
import {
  createDigitValidator,
  evaluateGuess,
  generateSecret,
  isValidGuess,
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
