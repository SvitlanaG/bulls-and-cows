import { describe, expect, it } from 'vitest';
import { generateSecret } from './core.js';

describe('generateSecret', () => {
  it('selects unique digits predictably and permits a leading zero', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
  });

  it('uses the alphabet for the requested base', () => {
    expect(generateSecret(3, 16, () => 0)).toBe('012');
  });
});
