export type Position = {
  row: number;
  column: number;
};

export function moveRight(position: Position, wordLength: number, rowCount: number) {
  return {
    ...position,
    row: position.row + (position.column === wordLength - 1 && position.row < rowCount - 1 ? 1 : 0),
    column: (((position.column + 1) % wordLength) + wordLength) % wordLength,
  };
}

export function moveLeft(position: Position, wordLength: number, _rowCount: number) {
  return {
    ...position,
    row: position.row - (position.column === 0 && position.row !== 0 ? 1 : 0),
    column: position.column === 0 ? wordLength - 1 : position.column - 1,
  };
}

export function moveUp(position: Position, _wordLength: number, _rowCount: number) {
  if (position.row === 0) return position;
  return {
    ...position,
    row: position.row - 1,
  };
}

export function moveDown(position: Position, wordLength: number, rowCount: number) {
  if (position.row >= rowCount - 1) return position;
  return {
    ...position,
    row: position.row + 1,
  };
}

export function getPositionKey(x: number, y: number) {
  return `${x},${y}`;
}

export function parsePositionKey(key: string) {
  const [x, y] = key.split(',');
  return { x: parseInt(x), y: parseInt(y) };
}

export function getPositionFromIndex(index: number, width: number) {
  return { x: index % width, y: Math.floor(index / width) };
}

export function getIndexFromPosition(x: number, y: number, width: number) {
  return y * width + x;
}
