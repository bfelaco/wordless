import React, { useState } from 'react';
import { findAnswers, WordGuess } from './solver';

/**
 * Words from match results.
 */
export const WordResults = ({
  wordGuesses,
  wordLength,
}: {
  wordGuesses: readonly WordGuess[];
  wordLength: number;
}) => {
  const [showWords, setShowWords] = useState(false);

  const matchedWords = findAnswers(wordGuesses, wordLength);

  return (
    <>
      <div>Match Count: {matchedWords?.length || 0}</div>

      <div>
        Show Words:{' '}
        <input
          type='checkbox'
          checked={showWords}
          onChange={(e) => setShowWords(e.target.checked)}
          tabIndex={3}
        />
      </div>
      {matchedWords && showWords && (
        <div className='App-words'>
          {matchedWords?.map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </div>
      )}
    </>
  );
};

export default WordResults;
