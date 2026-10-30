import React, { useRef, useEffect } from 'react';
import { PIECES, getCells } from '../engine/pieces';
import { BOARD_WIDTH, BOARD_HEIGHT, HIDDEN_ROWS, TOTAL_HEIGHT } from '../engine/board';

const CELL_SIZE = 30;

const PIECE_COLORS = {
  0: '#111',
  1: PIECES.I.color, 2: PIECES.O.color, 3: PIECES.T.color,
  4: PIECES.S.color, 5: PIECES.Z.color, 6: PIECES.J.color, 7: PIECES.L.color,
};

const PIECE_SHADOWS = {
  1: PIECES.I.shadowColor, 2: PIECES.O.shadowColor, 3: PIECES.T.shadowColor,
  4: PIECES.S.shadowColor, 5: PIECES.Z.shadowColor, 6: PIECES.J.shadowColor, 7: PIECES.L.shadowColor,
};

const PIECE_ID_TO_TYPE = {
  1: 'I', 2: 'O', 3: 'T', 4: 'S', 5: 'Z', 6: 'J', 7: 'L'
};

const drawCell = (ctx, x, y, color, shadow, isGhost = false) => {
  const px = x * CELL_SIZE;
  const py = y * CELL_SIZE;

  if (isGhost) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    ctx.fillStyle = color + '22';
    ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    return;
  }

  ctx.fillStyle = color;
  ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

  // Highlight top/left (lighter)
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(px, py, CELL_SIZE, 4);
  ctx.fillRect(px, py, 4, CELL_SIZE);

  // Shadow bottom/right (darker)
  ctx.fillStyle = shadow || 'rgba(0,0,0,0.4)';
  ctx.fillRect(px, py + CELL_SIZE - 4, CELL_SIZE, 4);
  ctx.fillRect(px + CELL_SIZE - 4, py, 4, CELL_SIZE);
};

export const GameBoard = ({ board, activePiece, ghostY, phase }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !board) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1a2030';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // Draw locked cells (skip hidden rows)
    for (let r = HIDDEN_ROWS; r < TOTAL_HEIGHT; r++) {
      const visY = r - HIDDEN_ROWS;
      for (let c = 0; c < BOARD_WIDTH; c++) {
        const cellId = board[r][c];
        if (cellId !== 0) {
          const type = PIECE_ID_TO_TYPE[cellId];
          const color = PIECES[type]?.color || '#aaa';
          const shadow = PIECES[type]?.shadowColor || '#555';
          drawCell(ctx, c, visY, color, shadow);
        }
      }
    }

    // Draw ghost piece
    if (activePiece && ghostY !== null) {
      const { type, rotation, x } = activePiece;
      const cells = getCells(type, rotation);
      const color = PIECES[type].color;
      for (const [cx, cy] of cells) {
        const visY = ghostY + cy - HIDDEN_ROWS;
        if (visY >= 0) drawCell(ctx, x + cx, visY, color, null, true);
      }
    }

    // Draw active piece
    if (activePiece) {
      const { type, rotation, x, y } = activePiece;
      const cells = getCells(type, rotation);
      const color = PIECES[type].color;
      const shadow = PIECES[type].shadowColor;
      for (const [cx, cy] of cells) {
        const visY = y + cy - HIDDEN_ROWS;
        if (visY >= 0) drawCell(ctx, x + cx, visY, color, shadow);
      }
    }

    // Overlays
    if (phase === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 20);
    }

    if (phase === 'game_over') {
      ctx.fillStyle = 'rgba(30,0,0,0.82)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 34px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '15px monospace';
      ctx.fillStyle = '#ccc';
      ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 20);
    }
  }, [board, activePiece, ghostY, phase]);

  return (
    <canvas
      ref={canvasRef}
      width={BOARD_WIDTH * CELL_SIZE}
      height={BOARD_HEIGHT * CELL_SIZE}
      style={{ border: '2px solid #334', borderRadius: 4, display: 'block' }}
    />
  );
};

