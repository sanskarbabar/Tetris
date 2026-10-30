// Central game state machine
import { createBoard, lockCells, clearLines, HIDDEN_ROWS, BOARD_WIDTH } from './board';
import { getCells, PIECES } from './pieces';
import { canPlace, getGhostY, tryRotate } from './collision';
import { createRandomizer } from './randomizer';
import { createScoring } from './scoring';
import { createReplayStack } from './replayStack';

export const GamePhase = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
};

export const createGameState = () => {
  let board = createBoard();
  let phase = GamePhase.IDLE;
  let randomizer = createRandomizer();
  let scoring = createScoring();
  let replay = createReplayStack(100);

  // Active piece state
  let activePiece = null; // { type, rotation, x, y }
  let holdType = null;
  let canHold = true;
  let startTime = null;

  const spawnPiece = () => {
    const type = randomizer.next();
    const spawnX = Math.floor(BOARD_WIDTH / 2) - 2;
    const spawnY = HIDDEN_ROWS - 2;

    if (!canPlace(board, type, 0, spawnX, spawnY)) {
      phase = GamePhase.GAME_OVER;
      return false;
    }
    activePiece = { type, rotation: 0, x: spawnX, y: spawnY };
    canHold = true;
    return true;
  };

  const createSnapshot = () => ({
    board: board.map(r => [...r]),
    activePiece: activePiece ? { ...activePiece } : null,
    holdType,
    canHold,
    scoring: scoring.getState(),
    randomizerState: randomizer.getState(),
  });

  const restoreSnapshot = (snap) => {
    board = snap.board.map(r => [...r]);
    activePiece = snap.activePiece ? { ...snap.activePiece } : null;
    holdType = snap.holdType;
    canHold = snap.canHold;
    scoring.setState(snap.scoring);
    randomizer.setState(snap.randomizerState);
    phase = GamePhase.PLAYING;
  };

  const lockActivePiece = () => {
    const { type, rotation, x, y } = activePiece;
    const cells = getCells(type, rotation);
    board = lockCells(board, cells, x, y, PIECES[type].id);

    const { newBoard, linesCleared } = clearLines(board);
    board = newBoard;
    scoring.addLineClear(linesCleared);

    activePiece = null;
    spawnPiece();
  };

  return {
    start() {
      board = createBoard();
      randomizer = createRandomizer();
      scoring.reset();
      replay.clear();
      holdType = null;
      canHold = true;
      activePiece = null;
      startTime = Date.now();
      phase = GamePhase.PLAYING;
      spawnPiece();
    },

    restart() { this.start(); },

    togglePause() {
      if (phase === GamePhase.PLAYING) phase = GamePhase.PAUSED;
      else if (phase === GamePhase.PAUSED) phase = GamePhase.PLAYING;
    },

    // Gravity tick — called by game loop
    gravityTick() {
      if (phase !== GamePhase.PLAYING || !activePiece) return;
      const { type, rotation, x, y } = activePiece;
      if (canPlace(board, type, rotation, x, y + 1)) {
        activePiece = { ...activePiece, y: y + 1 };
      } else {
        lockActivePiece();
      }
    },

    moveLeft() {
      if (phase !== GamePhase.PLAYING || !activePiece) return false;
      const { type, rotation, x, y } = activePiece;
      if (canPlace(board, type, rotation, x - 1, y)) {
        activePiece = { ...activePiece, x: x - 1 };
        replay.recordAction('moveLeft');
        return true;
      }
      return false;
    },

    moveRight() {
      if (phase !== GamePhase.PLAYING || !activePiece) return false;
      const { type, rotation, x, y } = activePiece;
      if (canPlace(board, type, rotation, x + 1, y)) {
        activePiece = { ...activePiece, x: x + 1 };
        replay.recordAction('moveRight');
        return true;
      }
      return false;
    },

    softDrop() {
      if (phase !== GamePhase.PLAYING || !activePiece) return false;
      const { type, rotation, x, y } = activePiece;
      if (canPlace(board, type, rotation, x, y + 1)) {
        activePiece = { ...activePiece, y: y + 1 };
        scoring.addSoftDrop(1);
        replay.recordAction('softDrop');
        return true;
      }
      lockActivePiece();
      return false;
    },

    hardDrop() {
      if (phase !== GamePhase.PLAYING || !activePiece) return;
      replay.pushSnapshot(createSnapshot());
      const { type, rotation, x, y } = activePiece;
      const ghostY = getGhostY(board, type, rotation, x, y);
      scoring.addHardDrop(ghostY - y);
      activePiece = { ...activePiece, y: ghostY };
      replay.recordAction('hardDrop');
      lockActivePiece();
    },

    rotateCW() {
      if (phase !== GamePhase.PLAYING || !activePiece) return false;
      const { type, rotation, x, y } = activePiece;
      const toRot = (rotation + 1) % 4;
      const result = tryRotate(board, type, rotation, toRot, x, y);
      if (result) {
        activePiece = { ...activePiece, ...result };
        replay.recordAction('rotateCW');
        return true;
      }
      return false;
    },

    rotateCCW() {
      if (phase !== GamePhase.PLAYING || !activePiece) return false;
      const { type, rotation, x, y } = activePiece;
      const toRot = (rotation + 3) % 4;
      const result = tryRotate(board, type, rotation, toRot, x, y);
      if (result) {
        activePiece = { ...activePiece, ...result };
        replay.recordAction('rotateCCW');
        return true;
      }
      return false;
    },

    hold() {
      if (phase !== GamePhase.PLAYING || !activePiece || !canHold) return false;
      replay.pushSnapshot(createSnapshot());
      replay.recordAction('hold');
      const currentType = activePiece.type;
      if (holdType) {
        // Swap
        const swapX = Math.floor(BOARD_WIDTH / 2) - 2;
        const swapY = HIDDEN_ROWS - 2;
        activePiece = { type: holdType, rotation: 0, x: swapX, y: swapY };
      } else {
        activePiece = null;
        spawnPiece();
      }
      holdType = currentType;
      canHold = false;
      return true;
    },

    undo() {
      const snap = replay.popSnapshot();
      if (snap) { restoreSnapshot(snap); return true; }
      return false;
    },

    getGhostY() {
      if (!activePiece) return null;
      const { type, rotation, x, y } = activePiece;
      return getGhostY(board, type, rotation, x, y);
    },

    getState() {
      return {
        board,
        activePiece,
        holdType,
        canHold,
        nextQueue: randomizer.peek(5),
        score: scoring.score,
        lines: scoring.lines,
        level: scoring.level,
        combo: scoring.combo,
        backToBack: scoring.backToBack,
        gravityMs: scoring.gravityMs,
        phase,
        canUndo: replay.canUndo,
        ghostY: this.getGhostY(),
        durationSeconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
        replayHash: replay.replayHash,
      };
    },
  };
};

