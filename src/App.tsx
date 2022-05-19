import React, { useReducer, useState } from 'react';
import './App.css';
import Board from './board';
import { Help } from './help';

// TODO:
// [X] Adjustable grid size.
// [X] Component for grid of guess letters.
// [X] Add "unknown" state option
// [ ] Use final unfinished guess to filter word choices.
// [x] Only show count of matches by default, toggle to show all.
// [ ] Click on matches to use as guess.
// [ ] Popup help text.
// [ ] Game mode
export default function App() {
  const [wordLength, setWordLength] = useReducer((_s: number, l: any) => Number.parseInt(l), 5);
  const [showHelp, setShowHelp] = useState(false);

  // Use of 'key' in Board below ensures that the board is reset when the wordLength changes.
  return (
    <div className="App">
      <header className="App-header">
        <h1>Wordless</h1>
      </header>

      <div className="App-copyright">
        &copy; Bruno Felaco
      </div>

      <main className="App-main">
        {showHelp ? 
          <Help done={() => setShowHelp(false)} /> 
          :
          <>
          <WordLength wordLength={wordLength} setWordLength={setWordLength} />
          <Board key={wordLength} wordLength={wordLength} />
          <button type="button" onClick={() => setShowHelp(true)}>Help</button>
          </>}
      </main>
    </div>
  );
}

const WordLength = ({ wordLength, setWordLength }: { wordLength: number; setWordLength: (length: any) => void; }) => {
  return <div>Word Length: &nbsp;
    <input type="text" defaultValue={wordLength || ''} onChange={(e) => setWordLength(e.target.value)} id="wordLength" tabIndex={1} />
  </div>;
}

