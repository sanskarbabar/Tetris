// DSA: O(K) Collision detection — checks 4 cells per piece
import { BOARD_WIDTH, TOTAL_HEIGHT } from './board';
import { getCells } from './pieces';

// Check if a piece can be placed at position (x, y) with given rotation
// O(4) = O(1) since tetrominoes always have exactly 4 cells
export const canPlace = (board, type, rotation, x, y) => {
  const cells = getCells(type, rotation);
  for (const [cx, cy] of cells) {
    const bx = x + cx;
    const by = y + cy;

    if (bx < 0 || bx >= BOARD_WIDTH) return false;    // Left/right boundary
    if (by >= TOTAL_HEIGHT) return false;              // Floor boundary
    if (by >= 0 && board[by][bx] !== 0) return false; // Occupied cell
  }
  return true;
};

// Find the lowest valid Y (ghost piece / hard drop destination)
// O(H) worst case
export const getGhostY = (board, type, rotation, x, y) => {
  let testY = y;
  while (canPlace(board, type, rotation, x, testY + 1)) {
    testY++;
  }
  return testY;
};

// Attempt wall-kicked rotation — returns null if all kicks fail
import { getWallKicks } from './pieces';

export const tryRotate = (board, type, fromRot, toRot, x, y) => {
  const kicks = getWallKicks(type, fromRot, toRot);
  for (const [dx, dy] of kicks) {
    if (canPlace(board, type, toRot, x + dx, y + dy)) {
      return { rotation: toRot, x: x + dx, y: y + dy };
    }
  }
  return null;
};

