import React, { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard';
import { ScorePanel } from './components/ScorePanel';
import { NextQueue } from './components/NextQueue';
import { HoldPiece } from './components/HoldPiece';
import { GameControls } from './components/GameControls';
import { GameOverModal } from './components/GameOverModal';
import { Leaderboard } from './components/Leaderboard';
import { DSALab } from './components/DSALab';
import './App.css';

export function App() {
  const {
    state,
    startGame,
    restartGame,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotateCW,
    rotateCCW,
    hold,
    undo,
    togglePause,
    GamePhase,
  } = useGame();

  const [view, setView] = useState('game'); // 'game' | 'lab'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const handleRestart = () => {
    restartGame();
    setRefreshTrigger(prev => prev + 1);
  };

  if (!state) {
    return <div className="loading-screen">Initializing Tetris DSA Game Engine...</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <span className="tetris-logo">TETRIS</span>
          <span className="dsa-tag">DSA EDITION</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${view === 'game' ? 'active' : ''}`}
            onClick={() => setView('game')}
          >
            Gameplay
          </button>
          <button
            className={`nav-btn ${view === 'lab' ? 'active' : ''}`}
            onClick={() => setView('lab')}
          >
            DSA Lab
          </button>
        </nav>
      </header>

      {view === 'game' ? (
        <main className="game-layout">
          <aside className="left-column">
            <HoldPiece holdType={state.holdType} canHold={state.canHold} />
            <ScorePanel
              score={state.score}
              lines={state.lines}
              level={state.level}
              combo={state.combo}
              backToBack={state.backToBack}
            />
          </aside>

          <section className="center-column">
            <GameBoard
              board={state.board}
              activePiece={state.activePiece}
              ghostY={state.ghostY}
              phase={state.phase}
            />
            {state.phase === GamePhase.GAME_OVER && (
              <GameOverModal
                score={state.score}
                level={state.level}
                lines={state.lines}
                durationSeconds={state.durationSeconds}
                replayHash={state.replayHash}
                onRestart={handleRestart}
              />
            )}
          </section>

          <aside className="right-column">
            <NextQueue queue={state.nextQueue} />
            <Leaderboard refreshTrigger={refreshTrigger} />
          </aside>

          <section className="controls-section">
            <GameControls
              onMoveLeft={moveLeft}
              onMoveRight={moveRight}
              onSoftDrop={softDrop}
              onHardDrop={hardDrop}
              onRotateCW={rotateCW}
              onRotateCCW={rotateCCW}
              onHold={hold}
              onUndo={undo}
              onTogglePause={togglePause}
              onRestart={handleRestart}
              isPaused={state.phase === GamePhase.PAUSED}
              isPlaying={state.phase === GamePhase.PLAYING}
            />
          </section>
        </main>
      ) : (
        <main className="lab-layout">
          <DSALab currentBoard={state.board} currentQueue={state.nextQueue} />
        </main>
      )}
    </div>
  );
}

export default App;
