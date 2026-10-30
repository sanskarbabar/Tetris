import React, { useState } from 'react';
import { saveScore } from '../services/api';

export const GameOverModal = ({ score, level, lines, durationSeconds, replayHash, onRestart }) => {
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await saveScore({
        playerName: playerName.trim() || 'Guest',
        score,
        level,
        lines,
        durationSeconds,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit score to server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>GAME OVER</h2>
        <div className="modal-stats">
          <div className="stat-line"><span>Final Score:</span><strong>{score.toLocaleString()}</strong></div>
          <div className="stat-line"><span>Lines Cleared:</span><strong>{lines}</strong></div>
          <div className="stat-line"><span>Level Reached:</span><strong>{level}</strong></div>
          <div className="stat-line"><span>Duration:</span><strong>{durationSeconds}s</strong></div>
          {replayHash && (
            <div className="stat-line hash-line">
              <span>FNV-1a Replay Hash:</span><code>{replayHash.slice(0, 16)}...</code>
            </div>
          )}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="save-score-form">
            <input
              type="text"
              placeholder="Enter player name"
              value={playerName}
              maxLength={20}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" className="submit-score-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Save to Leaderboard'}
            </button>
            {error && <p className="error-text">{error}</p>}
          </form>
        ) : (
          <p className="success-text">Score recorded to leaderboard!</p>
        )}

        <div className="modal-actions">
          <button className="restart-btn" onClick={onRestart}>Play Again (R)</button>
        </div>
      </div>
    </div>
  );
};

