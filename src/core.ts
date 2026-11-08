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
