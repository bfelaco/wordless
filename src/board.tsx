import React, { useState, useEffect, useRef } from 'react';
import { LetterGuess, GuessResult } from './solver';
import useWordGuessState, { WordGuessState } from './word-guess-state';
import { Position, moveRight, moveLeft, moveUp, moveDown } from './position-utils';
import WordResults from './word-results';
import { Keyboard } from './keyboard';

const ColorSequence: GuessResult[] = [
  GuessResult.UNKNOWN,
  GuessResult.ABSENT,
  GuessResult.PRESENT,
  GuessResult.CORRECT,
];
const nextColor = (guessResult: GuessResult) =>
  ColorSequence[(ColorSequence.indexOf(guessResult) + 1) % ColorSequence.length];

//
// Components
//

/**
 * Board containing WordGrid (guesses) and WordResults (matches).
 */
export const Board = ({ wordLength }: { wordLength: number }) => {
  const wordGuessState = useWordGuessState(wordLength);

  // Using onMouseDown to capture the event before the focus change event.
  return (
    <>
      <WordGrid wordGuessState={wordGuessState} />
      <Keyboard />
      <WordResults
        wordGuesses={wordGuessState.wordGuesses}
        wordLength={wordGuessState.wordLength}
      />
    </>
  );
};

// TabIndex to use for all tiles.
const tileTabIndex = 2;

const WordGrid = ({ wordGuessState }: { wordGuessState: WordGuessState }) => {
  const [position, setPosition] = useState<Position | null>(null);

  // Reference to board element for scoping events.
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (position) {
      const currentTile = boardRef.current?.children[position.row]?.children[
        position.column
      ] as HTMLElement;
      if (currentTile?.focus) {
        currentTile.focus();
      }

      const onTileKey = tileKeyHandler(wordGuessState, position, setPosition);

      window.addEventListener('keydown', onTileKey);
      // Remove event listeners on cleanup
      return () => {
        window.removeEventListener('keydown', onTileKey);
      };
    }
  }, [position, wordGuessState]);

  if (wordGuessState.wordLength < 3)
    return <div className='App-error'>Enter a word length of 3 or more.</div>;

  const onTileClick = tileClickHandler(wordGuessState, position, setPosition);
  const onFocus = tileFocusHandler(setPosition);
  const onBlur = tileBlurHandler(setPosition);

  const style = boardStyle(wordGuessState);

  return (
    <div
      ref={boardRef}
      className='App-board'
      style={style}
      onMouseDown={onTileClick}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {wordGuessState.wordGuesses.map((wordGuess, index) => (
        <WordRow key={index} row={index} wordGuessState={wordGuessState} tabIndex={tileTabIndex} />
      ))}
    </div>
  );
};

/**
 * Row of LetterTile.
 */
const WordRow = ({
  wordGuessState,
  row = 0,
  tabIndex = 2,
}: {
  wordGuessState: WordGuessState;
  row: number;
  tabIndex: number;
}) => {
  const wordGuess = wordGuessState.wordGuesses[row];
  const wordErrorClass = wordGuessState.wordError(row) ? 'word-error' : '';
  return (
    <div className={`App-row ${wordErrorClass}`}>
      {wordGuess?.map((letterGuess, column) => (
        <LetterTile
          error={wordGuessState.guessError({ row, column })}
          letterGuess={letterGuess}
          key={column}
          tabIndex={tabIndex}
        />
      ))}
    </div>
  );
};

/**
 * Tile for a guessed letter.
 */
const LetterTile = ({
  error,
  letterGuess,
  tabIndex,
}: {
  error: boolean;
  letterGuess?: LetterGuess;
  tabIndex?: number;
}) => (
  <span
    className={`App-tile ${error ? 'letter-error' : ''}`}
    data-color={letterGuess?.result.toLocaleLowerCase() || GuessResult.UNKNOWN.toLowerCase()}
    tabIndex={tabIndex}
  >
    {letterGuess?.letter}
  </span>
);

const tileKeyHandler = (
  wordGuessState: WordGuessState,
  position: Position,
  setPosition: (position: Position) => void
) => {
  return (e: KeyboardEvent) => {
    // Ignore all key events if not in focus
    if (!position) {
      return;
    }

    const wordLength = wordGuessState.wordLength;
    const rowCount = wordGuessState.wordGuesses.length;

    if (/^[A-Z]$/.test(e.key.toUpperCase())) {
      wordGuessState.setLetter(position, e.key.toUpperCase());
      const newPosition = moveRight(position, wordGuessState.wordLength, rowCount);
      setPosition(newPosition);
      // Trigger creation of next row if necessary.
      wordGuessState.setResult(
        newPosition,
        wordGuessState.getResult(newPosition) || GuessResult.UNKNOWN
      );
    } else {
      switch (e.key) {
        case ' ':
          // Cycle the guess result state.
          wordGuessState.setResult(position, nextColor(wordGuessState.getResult(position)));
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
        case '=':
          wordGuessState.setResult(position, GuessResult.CORRECT);
          break;
        case '+':
          wordGuessState.setResult(position, GuessResult.PRESENT);
          break;
        case '-':
          wordGuessState.setResult(position, GuessResult.ABSENT);
          break;
        case '_':
          wordGuessState.setResult(position, GuessResult.UNKNOWN);
          break;
        case 'Backspace':
          wordGuessState.setLetter(position, '');
          setPosition(moveLeft(position, wordLength, rowCount));
          break;
        case 'Delete':
          wordGuessState.setLetter(position, '');
          break;
        case 'ArrowLeft':
          setPosition(moveLeft(position, wordLength, rowCount));
          e.preventDefault();
          break;
        case 'ArrowRight':
          setPosition(moveRight(position, wordLength, rowCount));
          e.preventDefault();
          break;
        case 'ArrowUp':
          setPosition(moveUp(position, wordLength, rowCount));
          e.preventDefault();
          break;
        case 'ArrowDown':
          setPosition(moveDown(position, wordLength, rowCount));
          e.preventDefault();
          e.stopPropagation();
          break;
        case 'Enter':
          setPosition(wordGuessState.submit(position));
          break;
      }
    }
  };
};

/**
 * Utility function to get index of element within parent.
 * @param node
 * @returns index within parent container
 */
export const getChildIndex = (node: Element) => {
  return node.parentNode ? Array.prototype.indexOf.call(node.parentNode.childNodes, node) : -1;
};

const tileFocusHandler = (
  setPosition: (position: Position) => void
): React.FocusEventHandler<HTMLDivElement> => {
  return (e) => {
    const element = e.target;

    const newPosition = {
      column: getChildIndex(element),
      row: getChildIndex(element.parentNode as Element),
    };
    setPosition(newPosition);
  };
};

const tileBlurHandler = (
  setPosition: (position: Position | null) => void
): React.FocusEventHandler<HTMLDivElement> => {
  return (e) => {
    // Test if focus left the board.
    if (!e.currentTarget.contains(e.relatedTarget)) {
      // Clear the position so that keyboard and other events
      // can be ignored.
      setPosition(null);
    }
  };
};

const tileClickHandler = (
  wordGuessState: WordGuessState,
  position: Position | null,
  setPosition: (position: Position | null) => void
) => {
  return (e: React.MouseEvent<unknown>) => {
    console.log('click');
    const element = e.target as HTMLElement;

    const newPosition = {
      column: getChildIndex(element),
      row: getChildIndex(element.parentNode as Element),
    };

    if (position && position.row === newPosition.row && position.column === newPosition.column) {
      // If clicking on the position that was already selected, toggle the guess result state.
      const guessResult = nextColor(wordGuessState.getResult(position));
      wordGuessState.setResult(position, guessResult);
    } else {
      // Just let the element gain focus, and update the position.
      setPosition(newPosition);
    }
  };
};

const boardStyle = (wordGuessState: WordGuessState) => {
  return {
    '--row-count': wordGuessState.wordGuesses.length,
    '--column-count': wordGuessState.wordLength,
  } as React.CSSProperties;
};

export default Board;
