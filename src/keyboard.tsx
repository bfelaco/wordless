import { WordGuessState } from './word-guess-state';
import { Position, moveRight } from './position-utils';
import { GuessResult } from './solver';

interface KeyboardProps {
  wordGuessState: WordGuessState;
  position: Position | null;
  setPosition: (position: Position | null) => void;
}

const Letter = ({ children, isSpecial = false }: { children: string; isSpecial?: boolean }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Store current focus
    const focused = document.activeElement;

    // Create and dispatch a keyboard event
    const event = new KeyboardEvent('keydown', {
      key: children === 'Del' ? 'Backspace' : children,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    // Restore focus if it was on an element
    if (focused instanceof HTMLElement) {
      focused.focus();
    }
  };

  return (
    <button
      type='button'
      data-key={children}
      className={`App-key ${isSpecial ? 'App-key-special' : ''}`}
      onMouseDown={(e) => e.preventDefault()} // Prevent focus on mousedown
      onClick={handleClick}
      tabIndex={-1}
      aria-label={
        children === 'Del' ? 'Delete' : children === 'Enter' ? 'Enter' : `Letter ${children}`
      }
    >
      {children}
    </button>
  );
};

const LetterRow = ({ children }: { children: string }) => (
  <div className='App-keyboard'>
    {children.split(' ').map((letter) => (
      <Letter key={letter} isSpecial={letter === 'Del' || letter === 'Enter'}>
        {letter}
      </Letter>
    ))}
  </div>
);

export const Keyboard = ({ wordGuessState, position, setPosition }: KeyboardProps) => {
  const handleKeyClick = (key: string) => {
    if (!position) {
      return;
    }

    const wordLength = wordGuessState.wordLength;
    const rowCount = wordGuessState.wordGuesses.length;

    if (key === 'Del') {
      wordGuessState.setLetter(position, '');
      const newPosition =
        position.column > 0 ? { row: position.row, column: position.column - 1 } : position;
      setPosition(newPosition);
    } else if (key === 'Enter') {
      // Handle enter key - could trigger word submission
      if (position.column === wordLength - 1) {
        const newPosition = { row: position.row + 1, column: 0 };
        setPosition(newPosition);
        // Trigger creation of next row if necessary
        wordGuessState.setResult(
          newPosition,
          wordGuessState.getResult(newPosition) || GuessResult.UNKNOWN
        );
      }
    } else {
      wordGuessState.setLetter(position, key);
      const newPosition = moveRight(position, wordGuessState.wordLength, rowCount);
      setPosition(newPosition);
      // Trigger creation of next row if necessary
      wordGuessState.setResult(
        newPosition,
        wordGuessState.getResult(newPosition) || GuessResult.UNKNOWN
      );
    }
  };

  return (
    <div className='App-keyboard-container'>
      <LetterRow>Q W E R T Y U I O P</LetterRow>
      <LetterRow>A S D F G H J K L</LetterRow>
      <LetterRow>Del Z X C V B N M Enter</LetterRow>
    </div>
  );
};
