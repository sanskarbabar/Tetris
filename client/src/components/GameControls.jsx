import React from 'react';

export const GameControls = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  onUndo,
  onTogglePause,
  onRestart,
  isPaused,
  isPlaying,
}) => {
  return (
    <div className="panel controls-panel">
      <h3>CONTROLS</h3>
      <div className="keyboard-guide">
        <div><span>← / →</span><span>Move</span></div>
        <div><span>↓</span><span>Soft Drop</span></div>
        <div><span>Space</span><span>Hard Drop</span></div>
        <div><span>↑ / X</span><span>Rotate CW</span></div>
        <div><span>Z</span><span>Rotate CCW</span></div>
        <div><span>C / Shift</span><span>Hold Piece</span></div>
        <div><span>U</span><span>Undo (Stack)</span></div>
        <div><span>P / Esc</span><span>Pause</span></div>
        <div><span>R</span><span>Restart</span></div>
      </div>

      <div className="mobile-touch-pad">
        <div className="btn-row">
          <button className="touch-btn" onClick={onHold} title="Hold">HOLD</button>
          <button className="touch-btn" onClick={onRotateCCW} title="Rotate CCW">⟲</button>
          <button className="touch-btn" onClick={onRotateCW} title="Rotate CW">⟳</button>
          <button className="touch-btn" onClick={onUndo} title="Undo">UNDO</button>
        </div>
        <div className="btn-row">
          <button className="touch-btn dir-btn" onClick={onMoveLeft}>◀</button>
          <button className="touch-btn dir-btn" onClick={onSoftDrop}>▼</button>
          <button className="touch-btn dir-btn" onClick={onMoveRight}>▶</button>
        </div>
        <div className="btn-row">
          <button className="touch-btn hard-drop-btn" onClick={onHardDrop}>HARD DROP (SPACE)</button>
        </div>
      </div>

      <div className="btn-row sys-btns">
        <button className="sys-btn" onClick={onTogglePause}>
          {isPaused ? 'RESUME (P)' : 'PAUSE (P)'}
        </button>
        <button className="sys-btn restart" onClick={onRestart}>
          RESTART (R)
        </button>
      </div>
    </div>
  );
};

