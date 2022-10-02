import { useState } from 'react';
import { WordGuess, GuessResult, isWord, buildMatchState, LetterGuess } from './solver';
import type { Position } from "./position-utils";

const emptyLetterGuess: LetterGuess = { letter: '', result: GuessResult.UNKNOWN };
const emptyWordGuess = (wordLength: number) => Array<LetterGuess>(wordLength).fill(emptyLetterGuess);

const useWordGuessState = (wordLength: number) => {
  const [wordGuesses, setWordGuesses] = useState([emptyWordGuess(wordLength)]);

  const initRow = (position: Position) => {
    wordGuesses[position.row] = wordGuesses[position.row] || emptyWordGuess(wordLength);
  };

  return {
    // Override declaration to make entire structure immutable to callers.
    wordGuesses: wordGuesses as readonly WordGuess[],
    wordLength,

    getLetter(position: Position) {
      return this.wordGuesses[position.row][position.column]?.letter;
    },

    setLetter(position: Position, letter: string) {
      initRow(position);

      // If the letter is blank, then override the result to UNKNOWN, otherwise use existing result.
      const result = letter === '' ? GuessResult.UNKNOWN : 
        (this.wordGuesses[position.row][position.column]?.result || GuessResult.UNKNOWN);

      wordGuesses[position.row][position.column] = {
        result,
        letter
      }
      // Force state change by cloning the array
      setWordGuesses([...wordGuesses]);
    },

    getResult(position: Position) {
      return this.wordGuesses[position.row] && this.wordGuesses[position.row][position.column]?.result;
    },

    setResult(position: Position, result: GuessResult) {
      initRow(position);

      // Preserve existing letter, or default to blank.
      const letter = wordGuesses[position.row][position.column]?.letter || '';

      wordGuesses[position.row][position.column] = {
        letter,
        result
      }
      // Force state change by cloning the array
      setWordGuesses([...wordGuesses]);
    },

    getWord(row: number) {
      const word = this.wordGuesses[row]?.map(letterGuess => letterGuess.letter).join('');
      return word.length === wordLength ? word : null;
    },

    wordError(row: number) {
      const word = this.getWord(row);
      return word && !isWord(word);
    },

    guessError(position: Position) {
      const letter = this.getLetter(position);
      if (!letter) {
        return false;
      }

      // Build the match state using only the previous word guesses to check for errors.
      const {absentMatches, correctMatches} = buildMatchState(this.wordGuesses.slice(0, position.row), wordLength);

      // Different letter has already been guessed in this column.
      if (correctMatches[position.column]) {
        return correctMatches[position.column] !== letter;
      }

      // Same letter already marked ABSENT in this column.
      if (absentMatches[position.column].find(l => l === letter)) {
        return true;
      }

      return false;
    },
  
    submit(position: Position) {
      const row = position.row;
      for (let column = 0; column < this.wordLength; column++) {
        const currentPosition = {row, column}, newPosition = {row: row + 1, column};
        const currentResult = this.getResult(currentPosition);

        // Assume any UNKNOWN positions in the current row are invalid guesses
        if (currentResult === GuessResult.UNKNOWN) {
          this.setResult(currentPosition, GuessResult.ABSENT);
        }

        // Trigger creation of next row and fill in any defaults
        if (currentResult === GuessResult.CORRECT) {
          this.setLetter(newPosition, this.getLetter(currentPosition));
          this.setResult(newPosition, GuessResult.CORRECT);
        } else {
          this.setResult(newPosition, this.getResult(newPosition) || GuessResult.UNKNOWN);
        }
      }
    
      return {
        ...position,
        row: position.row + 1,
        column: 0,
      };
    }
  } as const;
};

export type WordGuessState = ReturnType<typeof useWordGuessState>;

export default useWordGuessState;