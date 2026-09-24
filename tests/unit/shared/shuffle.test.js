/**
 * Fisher-Yates shuffle algorithm tests.
 * The implementation is used in matching/script.js and puzzle/script.js.
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

describe('Fisher-Yates shuffle', () => {
  test('returns an array of the same length', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffle([...original]);
    expect(result).toHaveLength(original.length);
  });

  test('contains all original elements', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffle([...original]);
    expect(result.sort()).toEqual(original.sort());
  });

  test('does not add or remove elements', () => {
    const original = ['a', 'b', 'c'];
    const result = shuffle([...original]);
    expect(result).toHaveLength(3);
    for (const item of original) {
      expect(result).toContain(item);
    }
  });

  test('shuffles a non-trivial array (not always identical)', () => {
    const original = Array.from({ length: 20 }, (_, i) => i);
    const results = new Set();
    for (let run = 0; run < 10; run++) {
      results.add(shuffle([...original]).join(','));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  test('handles empty array', () => {
    const result = shuffle([]);
    expect(result).toEqual([]);
  });

  test('handles single-element array', () => {
    const result = shuffle([42]);
    expect(result).toEqual([42]);
  });
});
