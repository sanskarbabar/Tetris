import React, { useRef, useEffect } from 'react';
import { PIECES, getCells } from '../engine/pieces';

const CELL_SIZE = 18;

const MiniPiece = ({ type }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !type || !PIECES[type]) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cells = getCells(type, 0);
    const color = PIECES[type].color;

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
    cells.forEach(([x, y]) => {
      const px = offsetX + x * CELL_SIZE;
      const py = offsetY + y * CELL_SIZE;
      ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  }, [type]);

  return <canvas ref={canvasRef} width={70} height={50} className="queue-canvas" />;
};

export const NextQueue = ({ queue = [] }) => {
  return (
    <div className="panel next-panel">
      <h3>NEXT (Queue)</h3>
      <div className="queue-list">
        {queue.slice(0, 4).map((type, index) => (
          <div key={index} className="queue-item">
            <MiniPiece type={type} />
          </div>
        ))}
      </div>
    </div>
  );
};

