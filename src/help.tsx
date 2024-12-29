export function Help({ done }: { done: () => void }) {
  return (
    <>
      <h3 className='App-help-header'>Help</h3>
      <form onSubmit={done}>
        <div className='App-help'>
          <ul>
            <li>Click or use tab key to select a tile, and type in a guess letter.</li>
            <li>Click selected tile or press spacebar repeatedly to toggle the result state.</li>
            <li>Use the arrow keys to move within the grid.</li>
            <li>
              Use <code>Backspace</code> to delete the current letter and backup.
            </li>
            <li>
              Use <code>Delete</code> to just delete the current letter.
            </li>
            <li>
              Use <code>=</code> to mark as a correct letter (<span>green</span>
              ).
            </li>
            <li>
              Use <code>+</code> to mark as a present letter (<span>yellow</span>).
            </li>
            <li>
              Use <code>-</code> to mark as an absent letter (<span>grey</span>
              ).
            </li>
            <li>
              Use <code>_</code> to mark as an unknown letter (<span>black</span>).
            </li>
          </ul>
        </div>
        <button type='submit'>Done</button>
      </form>
    </>
  );
}
