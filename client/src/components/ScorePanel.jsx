import React from 'react';

export const ScorePanel = ({ score = 0, lines = 0, level = 1, combo = -1, backToBack = false }) => {
  return (
    <div className="panel score-panel">
      <h3>STATISTICS</h3>
      <div className="stat-group">
        <label>SCORE</label>
        <div className="stat-value highlight">{score.toLocaleString()}</div>
      </div>
      <div className="stat-group">
        <label>LINES CLEARED</label>
        <div className="stat-value">{lines}</div>
      </div>
      <div className="stat-group">
        <label>LEVEL</label>
        <div className="stat-value">{level}</div>
      </div>
      {combo > 0 && (
        <div className="badge combo-badge">
          COMBO x{combo}
        </div>
      )}
      {backToBack && (
        <div className="badge b2b-badge">
          BACK-TO-BACK
        </div>
      )}
    </div>
  );
};

