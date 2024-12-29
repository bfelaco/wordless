import { useReducer, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
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
  const [wordLength, setWordLength] = useReducer((_s: number, l: string) => Number.parseInt(l), 5);
  const [showHelp, setShowHelp] = useState(false);

  // Use of 'key' in Board below ensures that the board is reset when the wordLength changes.
  return (
    <Container fluid className='App dark'>
      <Row className='justify-content-center'>
        <Col xs={12} className='text-center'>
          <header className='App-header'>
            <h1>Wordless</h1>
          </header>
        </Col>
      </Row>
      <Row className='justify-content-center'>
        <Col xs={12} md={8} lg={6} className='text-center'>
          {showHelp ? (
            <Help done={() => setShowHelp(false)} />
          ) : (
            <>
              <WordLength wordLength={wordLength} setWordLength={setWordLength} />
              <Board key={wordLength} wordLength={wordLength} />
              <button type='button' onClick={() => setShowHelp(true)}>
                Help
              </button>
            </>
          )}
        </Col>
      </Row>
      <Row className='justify-content-center'>
        <Col xs={12} className='text-center'>
          <div className='App-copyright'>&copy; Bruno Felaco</div>
        </Col>
      </Row>
    </Container>
  );
}

const WordLength = ({
  wordLength,
  setWordLength,
}: {
  wordLength: number;
  setWordLength: (length: string) => void;
}) => {
  return (
    <div>
      Word Length: &nbsp;{' '}
      <input
        type='text'
        defaultValue={wordLength || ''}
        onChange={(e) => setWordLength(e.target.value)}
        id='wordLength'
      />
    </div>
  );
};
