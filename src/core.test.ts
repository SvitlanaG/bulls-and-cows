import { describe, expect, it } from 'vitest';
import { evaluateGuess, generateSecret } from './core.js';

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
