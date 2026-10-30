import React, { useRef, useEffect } from 'react';
import { PIECES, getCells } from '../engine/pieces';

const CELL_SIZE = 20;

export const HoldPiece = ({ holdType, canHold }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f121a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!holdType || !PIECES[holdType]) return;

    const cells = getCells(holdType, 0);
    const color = canHold ? PIECES[holdType].color : '#666';

    // Center in 4x4 mini grid (80x80)
    let minX = 4, maxX = 0, minY = 4, maxY = 0;
    cells.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    const pieceWidth = (maxX - minX + 1) * CELL_SIZE;
    const pieceHeight = (maxY - minY + 1) * CELL_SIZE;
    const offsetX = (canvas.width - pieceWidth) / 2 - minX * CELL_SIZE;
    const offsetY = (canvas.height - pieceHeight) / 2 - minY * CELL_SIZE;

    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff2';
    cells.forEach(([x, y]) => {
      const px = offsetX + x * CELL_SIZE;
      const py = offsetY + y * CELL_SIZE;
      ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      ctx.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  }, [holdType, canHold]);

  return (
    <div className="panel hold-panel">
      <h3>HOLD (C)</h3>
      <canvas ref={canvasRef} width={80} height={80} className="mini-canvas" />
      <span className="sub-label">{canHold ? 'READY' : 'LOCKED'}</span>
    </div>
  );
};

