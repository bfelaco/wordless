import { useState } from 'react';
import { WordGuess, GuessResult, isWord } from './solver';
import type { Position } from "./position-utils";

function* generate<P>(count: number, produce: (index: number) => P) {
  for (let i = 0; i < count; i++) {
    yield produce(i);
  }
}

const emptyLetterGuess = () => ({ letter: '', result: GuessResult.UNKNOWN });
const emptyWordGuess = (wordLength: number) => [...generate(wordLength, emptyLetterGuess)];

const useWordGuessState = (wordLength: number) => {
  const [wordGuesses, setWordGuesses] = useState<WordGuess[]>([emptyWordGuess(wordLength)]);

  const init = (position: Position) => {
    wordGuesses[position.row] = wordGuesses[position.row] || emptyWordGuess(wordLength);
    wordGuesses[position.row][position.column] = wordGuesses[position.row][position.column] || emptyLetterGuess();
    return wordGuesses;
  };

  return {
    wordGuesses,
    wordLength,
    getLetter(position: Position) {
      return this.wordGuesses[position.row][position.column]?.letter;
    },
    setLetter(position: Position, letter: string) {
      this.wordGuesses = init(position);
      this.wordGuesses[position.row][position.column].letter = letter;
      if (letter === '') {
        this.wordGuesses[position.row][position.column].result = GuessResult.UNKNOWN;
      }
      setWordGuesses([...this.wordGuesses]);
    },

    getResult(position: Position) {
      return this.wordGuesses[position.row] && this.wordGuesses[position.row][position.column]?.result;
    },
    setResult(position: Position, result: GuessResult) {
      this.wordGuesses = init(position);
      this.wordGuesses[position.row][position.column].result = result;
      setWordGuesses([...this.wordGuesses]);
    },
    getWord(row: number) {
      const word = this.wordGuesses[row]?.map(letterGuess => letterGuess.letter).join('');
      return word.length === wordLength ? word : null;
    },
    wordError(row: number) {
      const word = this.getWord(row);
      return word && !isWord(word);
    },
    submit(position: Position) {
      const row = position.row;
      for (let column = 0; column < this.wordLength; column++) {
        const currentPosition = {row, column}, newPosition = {row: row + 1, column};

        // Trigger creation of next row if necessary.
        if (this.getResult(currentPosition) === GuessResult.CORRECT) {
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
  };
};

// const useWordGuessState2 = (wordLength: number) => {
//   const init = (state: WordGuess[], position: Position) => {
//     state[position.row] = state[position.row] || [];
//     state[position.row][position.column] = state[position.row][position.column] || {
//       letter: '',
//       result: GuessResult.UNKNOWN,
//     };
//     return state;
//   };

//   const reducer = (state: WordGuess[], {position, letterGuess}: {position: Position, letterGuess: LetterGuess}) => {
//     init(state, position);

//   }

//   const [wordGuesses, dispatch] = useReducer(reducer, [[]]);


//   return [
//     wordGuesses,
//     wordLength,
//     getLetter(position: Position) {
//       return this.wordGuesses[position.row][position.column];
//     },
//     setLetter(position: Position, letter: string) {
//       this.wordGuesses = init(position);
//       this.wordGuesses[position.row][position.column].letter = letter;
//       setWordGuesses(this.wordGuesses); 
//     },

//     getResult(position: Position) {
//       return this.wordGuesses[position.row][position.column].result;
//     },
//     setResult(position: Position, result: GuessResult) {
//       this.wordGuesses = init(position);
//       this.wordGuesses[position.row][position.column].result = result;
//       setWordGuesses(this.wordGuesses); 
//     },
//   }
// }

export type WordGuessState = ReturnType<typeof useWordGuessState>;

export default useWordGuessState;