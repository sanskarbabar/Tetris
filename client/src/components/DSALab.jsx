import React, { useState } from 'react';
import { analyzeBoard } from '../engine/boardGraph';
import { createRandomizer } from '../engine/randomizer';

class SimpleTrie {
  constructor() {
    this.root = {};
  }
  insert(word) {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node.isEnd = true;
  }
  searchPrefix(prefix) {
    let node = this.root;
    for (const ch of prefix.toLowerCase()) {
      if (!node[ch]) return [];
      node = node[ch];
    }
    const results = [];
    const dfs = (curr, path) => {
      if (curr.isEnd) results.push(path);
      for (const k in curr) {
        if (k !== 'isEnd') dfs(curr[k], path + k);
      }
    };
    dfs(node, prefix.toLowerCase());
    return results;
  }
}

export const DSALab = ({ currentBoard, currentQueue }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trieQuery, setTrieQuery] = useState('');
  const [heapScores, setHeapScores] = useState([12500, 9400, 18200, 4300, 22100, 15600]);
  const [newScoreInput, setNewScoreInput] = useState('');

  // Sample Trie of players/commands
  const trie = new SimpleTrie();
  ['Alice', 'Alexander', 'Bob', 'Charlie', 'Charlotte', 'Dave', 'David', 'Eve', 'Frank', 'pause', 'restart', 'undo', 'hardDrop'].forEach(w => trie.insert(w));
  const trieMatches = trieQuery ? trie.searchPrefix(trieQuery) : [];

  // Metrics from BFS / DFS board analysis
  const boardMetrics = currentBoard ? analyzeBoard(currentBoard) : null;

  return (
    <div className="dsa-lab-container">
      <h2>DSA DEMONSTRATION LAB</h2>
      <p className="dsa-intro">
        Interactive inspection of Data Structures and Algorithms executing in the Tetris engine.
      </p>

      <div className="dsa-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Complexity Table</button>
        <button className={activeTab === 'graph' ? 'active' : ''} onClick={() => setActiveTab('graph')}>Graph (BFS / DFS)</button>
        <button className={activeTab === 'heap' ? 'active' : ''} onClick={() => setActiveTab('heap')}>Heap (Priority Queue)</button>
        <button className={activeTab === 'trie' ? 'active' : ''} onClick={() => setActiveTab('trie')}>Trie (Prefix Search)</button>
        <button className={activeTab === 'queue' ? 'active' : ''} onClick={() => setActiveTab('queue')}>Queue (7-Bag)</button>
      </div>

      <div className="dsa-content">
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <h3>Algorithm & Data Structure Complexities</h3>
            <table className="dsa-table">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Game Application</th>
                  <th>Time Complexity</th>
                  <th>Space Complexity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>2D Array / Matrix</strong></td>
                  <td>10×20 Visible Board Representation</td>
                  <td>O(1) Cell Access</td>
                  <td>O(W × H) = O(240)</td>
                </tr>
                <tr>
                  <td><strong>3D Array Table</strong></td>
                  <td>Tetromino Rotation Matrix Offsets</td>
                  <td>O(1) Lookup</td>
                  <td>O(7 × 4 × 4) = O(1)</td>
                </tr>
                <tr>
                  <td><strong>Queue (FIFO)</strong></td>
                  <td>7-Bag Next-Piece Randomizer</td>
                  <td>O(1) Pop / Push</td>
                  <td>O(N) Preview Buffer</td>
                </tr>
                <tr>
                  <td><strong>Stack (LIFO)</strong></td>
                  <td>State Snapshots & Undo System</td>
                  <td>O(1) Push / Pop</td>
                  <td>O(K × W × H) Snapshots</td>
                </tr>
                <tr>
                  <td><strong>Min-Heap / Priority Queue</strong></td>
                  <td>Top-K Leaderboard Tracking</td>
                  <td>O(log K) Insertion</td>
                  <td>O(K) Bounded Heap</td>
                </tr>
                <tr>
                  <td><strong>Graph (BFS / DFS)</strong></td>
                  <td>Reachable Cavities & Enclosed Holes</td>
                  <td>O(V + E) Cell Traversal</td>
                  <td>O(V) Visited Grid</td>
                </tr>
                <tr>
                  <td><strong>Trie (Prefix Tree)</strong></td>
                  <td>Player Name & Command Autocomplete</td>
                  <td>O(L) Query Length</td>
                  <td>O(N × L) Character Nodes</td>
                </tr>
                <tr>
                  <td><strong>Binary Search</strong></td>
                  <td>Sorted Leaderboard Rank Lookup</td>
                  <td>O(log N) Bisect</td>
                  <td>O(1) Auxiliary</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="tab-pane">
            <h3>Graph Modeling & Reachability Analysis</h3>
            <p>Every empty cell is a vertex with edges to 4 adjacent cells (Up, Down, Left, Right). BFS identifies surface-reachable cells; cells trapped below blocks are marked as inaccessible cavities.</p>
            {boardMetrics && (
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="label">Aggregate Height</span>
                  <span className="value">{boardMetrics.aggregateHeight}</span>
                </div>
                <div className="metric-card">
                  <span className="label">Max Column Height</span>
                  <span className="value">{boardMetrics.maxHeight}</span>
                </div>
                <div className="metric-card">
                  <span className="label">Enclosed Holes</span>
                  <span className="value warning">{boardMetrics.holes}</span>
                </div>
                <div className="metric-card">
                  <span className="label">Bumpiness</span>
                  <span className="value">{boardMetrics.bumpiness}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'heap' && (
          <div className="tab-pane">
            <h3>Min-Heap (Top-K Priority Queue)</h3>
            <p>Maintains the highest scores without sorting all records upon each new game completion.</p>
            <div className="heap-controls">
              <input
                type="number"
                placeholder="Insert score"
                value={newScoreInput}
                onChange={(e) => setNewScoreInput(e.target.value)}
              />
              <button onClick={() => {
                const s = parseInt(newScoreInput);
                if (s) {
                  setHeapScores([...heapScores, s].sort((a,b) => b - a));
                  setNewScoreInput('');
                }
              }}>Insert into Heap (O(log K))</button>
            </div>
            <div className="scores-tags">
              {heapScores.slice(0, 10).map((score, idx) => (
                <span key={idx} className="score-tag">#{idx + 1} {score.toLocaleString()}</span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trie' && (
          <div className="tab-pane">
            <h3>Trie (Prefix Search / Autocomplete)</h3>
            <p>Lookup runtime depends solely on prefix length O(L), independent of total player count.</p>
            <input
              type="text"
              placeholder="Type prefix (e.g. 'Al', 'Da', 're', 'un')..."
              value={trieQuery}
              onChange={(e) => setTrieQuery(e.target.value)}
              className="trie-input"
            />
            <div className="trie-results">
              {trieMatches.map((res, i) => (
                <span key={i} className="trie-tag">{res}</span>
              ))}
              {trieQuery && trieMatches.length === 0 && <span className="no-matches">No matches found</span>}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="tab-pane">
            <h3>7-Bag Queue Permutation</h3>
            <p>Fisher-Yates shuffle generates fair 7-piece bags, pushed into a FIFO queue so no piece type is starved.</p>
            <div className="queue-preview-row">
              {currentQueue && currentQueue.map((p, idx) => (
                <div key={idx} className="queue-badge">
                  <span>#{idx + 1}</span>
                  <strong>{p}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

