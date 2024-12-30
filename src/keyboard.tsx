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

export const Keyboard = () => {
  return (
    <div className='App-keyboard-container'>
      <LetterRow>Q W E R T Y U I O P</LetterRow>
      <LetterRow>A S D F G H J K L</LetterRow>
      <LetterRow>Del Z X C V B N M Enter</LetterRow>
    </div>
  );
};
