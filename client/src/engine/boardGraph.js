// DSA: BFS / Flood Fill — Board analysis for cavities and connected regions
// Models empty cells as graph vertices with edges to 4-directional neighbors

import { BOARD_WIDTH, TOTAL_HEIGHT } from './board';

const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // Up, Down, Left, Right

// BFS to find all reachable empty cells from top row
// O(V + E) where V = W*H and E ≤ 4*W*H
// Returns 2D boolean grid of reachable cells
export const computeReachability = (board) => {
  const visited = Array.from({ length: TOTAL_HEIGHT }, () =>
    new Array(BOARD_WIDTH).fill(false)
  );
  const queue = []; // BFS queue — FIFO via index pointer (O(1) amortized)
  let head = 0;

  // Seed: all empty cells in row 0
  for (let x = 0; x < BOARD_WIDTH; x++) {
    if (board[0][x] === 0) {
      visited[0][x] = true;
      queue.push([x, 0]);
    }
  }

  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < TOTAL_HEIGHT) {
        if (!visited[ny][nx] && board[ny][nx] === 0) {
          visited[ny][nx] = true;
          queue.push([nx, ny]);
        }
      }
    }
  }
  return visited;
};

// Flood-fill (DFS iterative) from a starting cell — finds connected region
// O(V + E) bounded by grid size
export const floodFill = (board, startX, startY) => {
  const region = [];
  const targetVal = board[startY]?.[startX];
  if (targetVal === undefined) return region;

  const visited = Array.from({ length: TOTAL_HEIGHT }, () =>
    new Array(BOARD_WIDTH).fill(false)
  );
  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cx >= BOARD_WIDTH || cy < 0 || cy >= TOTAL_HEIGHT) continue;
    if (visited[cy][cx] || board[cy][cx] !== targetVal) continue;
    visited[cy][cx] = true;
    region.push([cx, cy]);
    for (const [dx, dy] of DIRS) stack.push([cx + dx, cy + dy]);
  }
  return region;
};

// Analyze board metrics for AI heuristics
// Returns { aggregateHeight, maxHeight, holes, bumpiness, cavities, columnHeights }
export const analyzeBoard = (board) => {
  const reachable = computeReachability(board);
  const columnHeights = new Array(BOARD_WIDTH).fill(0);

  for (let x = 0; x < BOARD_WIDTH; x++) {
    for (let y = 0; y < TOTAL_HEIGHT; y++) {
      if (board[y][x] !== 0) {
        columnHeights[x] = TOTAL_HEIGHT - y;
        break;
      }
    }
  }

  const aggregateHeight = columnHeights.reduce((a, b) => a + b, 0);
  const maxHeight = Math.max(...columnHeights);

  let bumpiness = 0;
  for (let x = 0; x < BOARD_WIDTH - 1; x++) {
    bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1]);
  }

  let holes = 0;
  let cavities = 0;
  for (let y = 0; y < TOTAL_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x] === 0) {
        if (reachable[y][x]) continue;
        cavities++;
        // Count as hole if directly under a filled cell
        if (y > 0 && board[y - 1][x] !== 0) holes++;
      }
    }
  }

  return { aggregateHeight, maxHeight, holes, bumpiness, cavities, columnHeights };
};

// Greedy AI: find best placement for current piece type
// Evaluates all rotations × columns → O(4 * W * H) bounded search
export const findBestMove = (board, type, rotations, x0) => {
  const weights = { height: -0.51, lines: 0.76, holes: -0.86, bumpiness: -0.18 };
  let best = null;
  let bestScore = -Infinity;

  for (let rot = 0; rot < 4; rot++) {
    const cells = rotations[rot];
    for (let tx = -2; tx < BOARD_WIDTH; tx++) {
      // Drop simulation
      let ty = 0;
      while (true) {
        // Check if can move down one more
        let canDown = true;
        for (const [cx, cy] of cells) {
          const bx = tx + cx;
          const by = ty + 1 + cy;
          if (by >= TOTAL_HEIGHT || bx < 0 || bx >= BOARD_WIDTH || (by >= 0 && board[by][bx] !== 0)) {
            canDown = false; break;
          }
        }
        if (!canDown) break;
        ty++;
      }

      // Validate placement
      let valid = true;
      for (const [cx, cy] of cells) {
        const bx = tx + cx;
        const by = ty + cy;
        if (bx < 0 || bx >= BOARD_WIDTH || by < 0 || by >= TOTAL_HEIGHT || board[by][bx] !== 0) {
          valid = false; break;
        }
      }
      if (!valid) continue;

      // Simulate lock and clear
      const simBoard = board.map(r => [...r]);
      for (const [cx, cy] of cells) simBoard[ty + cy][tx + cx] = 1;
      let linesCleared = 0;
      for (let y = TOTAL_HEIGHT - 1; y >= 0; y--) {
        if (simBoard[y].every(c => c !== 0)) linesCleared++;
      }

      const m = analyzeBoard(simBoard);
      const evalScore =
        weights.height * m.aggregateHeight +
        weights.lines * linesCleared +
        weights.holes * m.holes +
        weights.bumpiness * m.bumpiness;

      if (evalScore > bestScore) {
        bestScore = evalScore;
        best = { rotation: rot, x: tx, y: ty };
      }
    }
  }

  return best;
};

