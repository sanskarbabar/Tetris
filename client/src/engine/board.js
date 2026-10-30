// DSA: 2D Array — Board representation
// board[row][col] = 0 (empty) or 1-7 (locked piece type id)

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const HIDDEN_ROWS = 4; // Hidden spawn zone above visible board
export const TOTAL_HEIGHT = BOARD_HEIGHT + HIDDEN_ROWS;

// Create an empty board: 2D array of zeros
// O(W * H) time and space
export const createBoard = () =>
  Array.from({ length: TOTAL_HEIGHT }, () => new Array(BOARD_WIDTH).fill(0));

// Deep copy the board for snapshot/simulation
export const copyBoard = (board) => board.map((row) => [...row]);

// Check if a row (1D array) is completely filled
// O(W) per row
export const isRowFull = (row) => row.every((cell) => cell !== 0);

// Check if a row is completely empty
export const isRowEmpty = (row) => row.every((cell) => cell === 0);

// Lock piece cells into the board at final position
// O(K) = O(4) = O(1) for tetrominoes
export const lockCells = (board, cells, x, y, pieceId) => {
  const newBoard = copyBoard(board);
  for (const [cx, cy] of cells) {
    const bx = x + cx;
    const by = y + cy;
    if (by >= 0 && by < TOTAL_HEIGHT && bx >= 0 && bx < BOARD_WIDTH) {
      newBoard[by][bx] = pieceId;
    }
  }
  return newBoard;
};

// Clear full rows and compact downward
// DSA: Array compaction — two-pointer technique
// Returns { newBoard, linesCleared }
// O(W * H) time complexity
export const clearLines = (board) => {
  let linesCleared = 0;
  let writeRow = TOTAL_HEIGHT - 1;
  const newBoard = createBoard();

  for (let readRow = TOTAL_HEIGHT - 1; readRow >= 0; readRow--) {
    if (isRowFull(board[readRow])) {
      linesCleared++;
    } else {
      newBoard[writeRow] = [...board[readRow]];
      writeRow--;
    }
  }
  return { newBoard, linesCleared };
};

// Check if any cell is occupied in the hidden rows (game over condition)
export const hasBlocksAboveVisible = (board) => {
  for (let y = 0; y < HIDDEN_ROWS; y++) {
    if (!isRowEmpty(board[y])) return true;
  }
  return false;
};

