import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';

export const Leaderboard = ({ refreshTrigger }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchScores = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getLeaderboard({ page: p, limit: 10 });
      if (res.data?.success) {
        setScores(res.data.data.leaderboard || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
        setPage(p);
      }
    } catch (err) {
      setError('Backend leaderboard offline (playing in standalone mode)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores(page);
  }, [refreshTrigger, page]);

  return (
    <div className="panel leaderboard-panel">
      <div className="leaderboard-header">
        <h3>GLOBAL LEADERBOARD</h3>
        <button className="refresh-btn" onClick={() => fetchScores(page)} title="Refresh">↻</button>
      </div>

      {loading && <div className="loading-state">Loading rankings...</div>}
      {error && <div className="offline-state">{error}</div>}

      {!loading && !error && scores.length === 0 && (
        <div className="empty-state">No scores recorded yet. Be the first!</div>
      )}

      {!loading && scores.length > 0 && (
        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Score</th>
                <th>Lvl</th>
                <th>Lines</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, idx) => (
                <tr key={idx} className={s.rank === 1 ? 'rank-1' : s.rank <= 3 ? 'rank-top' : ''}>
                  <td className="rank-col">{s.rank || idx + 1}</td>
                  <td className="player-col">{s.playerName}</td>
                  <td className="score-col">{Number(s.score).toLocaleString()}</td>
                  <td>{s.level}</td>
                  <td>{s.lines}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

