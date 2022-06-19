import dictionary from './dictionary';

import { answers } from './answers';

export enum GuessResult {
  UNKNOWN = 'BLACK',
  ABSENT = 'GREY',
  CORRECT = 'GREEN',
  PRESENT = 'YELLOW',
}

export type LetterGuess = Readonly<{
  letter: string;
  result: GuessResult;
}>;

export type WordGuess = readonly LetterGuess[];

export function parseGuess(guess: string): WordGuess {
  const results: Array<LetterGuess> = [];

  let result: GuessResult = GuessResult.ABSENT;
  for (const letter of guess.toUpperCase()) {
    if (/\s+/.test(letter)) {
      continue;
    } else if (letter === '+') {
      result = GuessResult.PRESENT;
    } else if (letter === '=') {
      result = GuessResult.CORRECT;
    } else if (/[A-Z]/.test(letter)) {
      results.push({ letter, result });
      result = GuessResult.ABSENT;
    } else {
      throw new Error(`Invalid guess string ${guess}.`);
    }
  }
  if (result !== GuessResult.ABSENT) {
    throw new Error('Invalid guess - dangling modifier.');
  }
  return results;
}

export function buildMatchState(guesses: readonly WordGuess[], wordLength: number) {
  // Array of CORRECT (green) letters in word position, or 'undefined'.
  const correctMatches: string[] = [];

  // Set of all PRESENT (yellow) letters found.
  let presentLetters: string[] = [];

  // Array of ABSENT (grey) letters
  const absentMatches: string[][] = Array(wordLength).fill([]);

  for (const wordGuess of guesses) {
    for (let i = 0; i < wordGuess.length; i++) {
      const letterGuess = wordGuess[i];

      if (letterGuess.result === GuessResult.ABSENT) {
        // Check for other PRESENT letters in word - if none, then mark all positions as absent
        if (!presentLetters.find((letter) => letter === letterGuess.letter)) {
          for (let j = 0; j < wordGuess.length; j++) {
            absentMatches[j] = [...absentMatches[j], letterGuess.letter];
          }
        } else {
          // If the letter is PRESENT, then only mark it ABSENT from this position
          absentMatches[i] = [...absentMatches[i], letterGuess.letter];
        }
      }

      if (letterGuess.result === GuessResult.CORRECT) {
        if (correctMatches[i] && correctMatches[i] !== letterGuess.letter) {
          console.error('Invalid guesses input - multiple GREEN letters in same position.');
        }
        correctMatches[i] = letterGuess.letter;
      }
      if (letterGuess.result === GuessResult.PRESENT) {
        presentLetters = [...presentLetters, letterGuess.letter];

        // PRESENT implies the letter is ABSENT from this particular position
        absentMatches[i] = [...absentMatches[i], letterGuess.letter];
      }
    }
  }
  return { correctMatches, absentMatches, presentLetters };
}

export function buildMatcher(guesses: readonly WordGuess[], wordLength = 5) {
  const { correctMatches, absentMatches, presentLetters } = buildMatchState(guesses, wordLength);

  function charPattern(i: number) {
    if (correctMatches[i]) {
      return correctMatches[i];
    } else {
      return '[^' + absentMatches[i].sort().join('') + ']';
    }
  }

  let positionalAssertions = '(?=';
  for (let i = 0; i < wordLength; i++) {
    positionalAssertions += charPattern(i);
  }
  positionalAssertions += ')';

  // The PRESENT letters are used to create a series of lookahead matches to assert that the word contains
  // all of the PRESENT letters somewhere.
  // TODO: This does not handle multiple occurrences of the same PRESENT letter in the word.
  let containsLetterAssertions = '';
  for (const letter of presentLetters) {
    containsLetterAssertions += '(?=\\w*' + letter + ')';
  }

  const basicPattern = `\\w{${wordLength}}`;

  // Wrap expression in word boundaries to ensure correct length.
  // Use global modifier in order to get the complete list of matches in 1 step.
  return new RegExp(
    '\\b' + positionalAssertions + containsLetterAssertions + basicPattern + '\\b',
    'g'
  );
}

export function findWords(guesses?: readonly WordGuess[], wordLength = 5) {
  if (!guesses || guesses.length === 0) {
    return [];
  }
  const matcher = buildMatcher(guesses, wordLength);

  return dictionary.match(matcher) || [];
}

// Find all possible words that could be answers.
export function findAnswers(guesses?: readonly WordGuess[], wordLength = 5) {
  if (!guesses || guesses.length === 0) {
    return [];
  }
  const matcher = buildMatcher(guesses, wordLength);

  return answers[wordLength - 5].match(matcher) || [];
}

export const isWord = (word: string) => new RegExp('\\b' + word + '\\b', 'g').test(dictionary);
