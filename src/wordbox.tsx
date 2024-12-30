import { useState } from 'react';
import { parseGuess, WordGuess } from './solver';

// Dead code from first cut using textarea for input.

/**
 * Parses a string containing a sequence of guesses separated by whitespace.
 * @param input
 * @param wordLength
 * @returns array of guesses or undefined
 */
const matchGuesses = (input: string, wordLength = 5) => {
  // Matcher for guesses in input based on wordLength
  const guessPattern = new RegExp(`(?: *[+=]?\\w){${wordLength}}`, 'g');
  const matches: string[] = [];
  let match;
  while ((match = guessPattern.exec(input)) !== null) {
    matches.push(match[0]);
  }
  return matches;
};

export const WordBox = ({ wordLength }: { wordLength: number }) => {
  const [wordGuesses, setWordGuesses] = useState<WordGuess[]>([]);
  const setGuessString = (input: string) =>
    setWordGuesses(matchGuesses(input, wordLength).map(parseGuess));
  const guessString = wordGuesses
    .map((wordGuess) => wordGuess.map((letterGuess) => letterGuess.letter).join(''))
    .join('\n');

  return (
    wordLength > 0 && (
      <textarea
        onChange={(e) => setGuessString(e.target.value)}
        rows={wordLength}
        defaultValue={guessString}
      />
    )
  );
};
