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

export function moveLeft(position: Position, wordLength: number, rowCount: number) {
  return {
    ...position,
    row: position.row - (position.column === 0 && position.row !== 0 ? 1 : 0),
    column: (((position.column - 1) % wordLength) + wordLength) % wordLength,
  };
}

export function moveUp(position: Position, wordLength: number, rowCount: number) {
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
