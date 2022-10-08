import React, { PropsWithRef } from 'react';

const Letter = ({ children }: { children: string }) => (
  <button type='button' data-key={children} className='App-key'>
    {children}
  </button>
);

const LetterRow = ({ children }: { children: string }) => (
  <div className='App-keyboard'>
    {children.split(' ').map((letter) => (
      <Letter key={letter}>{letter}</Letter>
    ))}
  </div>
);

export const Keyboard = (props: PropsWithRef<object>) => (
  <div>
    <LetterRow>Q W E R T Y U I O P</LetterRow>
    <LetterRow>A S D F G H J K L</LetterRow>
    <LetterRow>Del Z X C V B N M Enter</LetterRow>
  </div>
);
