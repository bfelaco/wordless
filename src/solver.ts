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

function processAbsentLetter(
  letter: string,
  position: number,
  wordLength: number,
  presentLetters: string[],
  absentMatches: string[][]
): string[][] {
  const newAbsentMatches = [...absentMatches];
  const hasPresent = presentLetters.includes(letter);

  if (!hasPresent) {
    // Mark all positions as absent
    for (let j = 0; j < wordLength; j++) {
      newAbsentMatches[j] = [...absentMatches[j], letter];
    }
  } else {
    // Only mark this position as absent
    newAbsentMatches[position] = [...absentMatches[position], letter];
  }

  return newAbsentMatches;
}

function processCorrectLetter(
  letter: string,
  position: number,
  correctMatches: string[]
): string[] {
  const newCorrectMatches = [...correctMatches];

  if (correctMatches[position] && correctMatches[position] !== letter) {
    console.error('Invalid guesses input - multiple GREEN letters in same position.');
  }
  newCorrectMatches[position] = letter;

  return newCorrectMatches;
}

function processPresentLetter(
  letter: string,
  position: number,
  presentLetters: string[],
  absentMatches: string[][]
): [string[], string[][]] {
  const newPresentLetters = [...presentLetters, letter];
  const newAbsentMatches = [...absentMatches];

  // PRESENT implies the letter is ABSENT from this particular position
  newAbsentMatches[position] = [...absentMatches[position], letter];

  return [newPresentLetters, newAbsentMatches];
}

export function buildMatchState(guesses: readonly WordGuess[], wordLength: number) {
  let correctMatches: string[] = [];
  let presentLetters: string[] = [];
  let absentMatches: string[][] = Array(wordLength)
    .fill([])
    .map(() => []);

  for (const wordGuess of guesses) {
    for (let i = 0; i < wordGuess.length; i++) {
      const { letter, result } = wordGuess[i];

      switch (result) {
        case GuessResult.ABSENT:
          absentMatches = processAbsentLetter(letter, i, wordLength, presentLetters, absentMatches);
          break;
        case GuessResult.CORRECT:
          correctMatches = processCorrectLetter(letter, i, correctMatches);
          break;
        case GuessResult.PRESENT:
          [presentLetters, absentMatches] = processPresentLetter(
            letter,
            i,
            presentLetters,
            absentMatches
          );
          break;
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
      const matches = absentMatches[i].slice().sort((a, b) => a.localeCompare(b));
      return '[^' + matches.join('') + ']';
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

// Find all possible words that could match from the dictionary
export function findWords(guesses?: readonly WordGuess[], wordLength = 5): string[] {
  if (!guesses || guesses.length === 0) {
    return [];
  }
  const matcher = buildMatcher(guesses, wordLength);
  const results: string[] = [];
  let match;
  while ((match = matcher.exec(String(dictionary))) !== null) {
    results.push(match[0]);
  }
  return results;
}

// Find all possible words that could be answers.
export function findAnswers(guesses?: readonly WordGuess[], wordLength = 5): string[] {
  if (!guesses || guesses.length === 0) {
    return [];
  }
  const matcher = buildMatcher(guesses, wordLength);
  const answerList = answers[wordLength - 5];
  const results: string[] = [];
  let match;
  while ((match = matcher.exec(String(answerList))) !== null) {
    results.push(match[0]);
  }
  return results;
}

export const isWord = (word: string): boolean => {
  const pattern = new RegExp('\\b' + word + '\\b', 'g');
  return pattern.test(String(dictionary));
};
