import { describe, expect, it } from 'vitest';
import { WordGuess, findBestGuess, parseGuess } from './solver';

describe('findBestGuess', () => {
  it('should return the best next guess based on information theory', () => {
    // Given a scenario where we know 'A' is in the middle
    const guesses: WordGuess[] = [
      parseGuess('B=ANDA'), // This tells us 'A' is correct in position 2
    ];

    const bestGuess = findBestGuess(guesses, 5);

    // The best guess should:
    // 1. Be 5 letters long
    expect(bestGuess.length).toBe(5);
    // 2. Be a valid word
    expect(bestGuess).toMatch(/^[A-Z]{5}$/);
    // 3. Not be 'BANDA' (since we already know that's not the answer)
    expect(bestGuess).not.toBe('BANDA');
  });

  it('should return the only possible answer when only one remains', () => {
    // Create a scenario where only one word could possibly match
    const guesses: WordGuess[] = [
      parseGuess('=CRAN=E'), // CRANE with first and last E correct
    ];

    const bestGuess = findBestGuess(guesses, 5);

    // Since there should only be one possible word that:
    // 1. Starts with C
    // 2. Ends with E
    // 3. Is in our word list
    // The function should return that word
    expect(bestGuess).toBeTruthy();
    expect(bestGuess.length).toBe(5);
    expect(bestGuess[0]).toBe('C');
    expect(bestGuess[4]).toBe('E');
  });

  it('should handle empty or invalid input gracefully', () => {
    // Test with empty guesses
    expect(findBestGuess([], 5)).toBe('');

    // Test with invalid word length
    expect(findBestGuess([], 10)).toBe('');
  });

  it('should simulate guesses correctly', () => {
    const guesses: WordGuess[] = [
      parseGuess('STARE'), // Common starting word
    ];

    const bestGuess = findBestGuess(guesses, 5);

    // The best guess should:
    // 1. Be a valid 5-letter word
    expect(bestGuess.length).toBe(5);
    // 2. Not be the same as our previous guess
    expect(bestGuess).not.toBe('STARE');
    // 3. Ideally use different letters to gain more information
    // Count common letters between STARE and bestGuess
    const commonLetters = bestGuess.split('').filter((letter) => 'STARE'.includes(letter));
    // A good guess should minimize common letters to gain more information
    expect(commonLetters.length).toBeLessThanOrEqual(2);
  });
});
