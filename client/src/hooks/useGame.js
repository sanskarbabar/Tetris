import { useEffect, useRef, useCallback, useState } from 'react';
import { createGameState, GamePhase } from '../engine/gameState';

export const useGame = () => {
  const gameRef = useRef(null);
  const [state, setState] = useState(null);
  const gravityTimerRef = useRef(null);
  const dasTimerRef = useRef(null);
  const arrTimerRef = useRef(null);
  const heldKeyRef = useRef(null);

  const getGame = () => {
    if (!gameRef.current) gameRef.current = createGameState();
    return gameRef.current;
  };

  const syncState = useCallback(() => {
    setState({ ...getGame().getState() });
  }, []);

  const startGravity = useCallback((gravityMs) => {
    clearInterval(gravityTimerRef.current);
    gravityTimerRef.current = setInterval(() => {
      const game = getGame();
      game.gravityTick();
      syncState();
    }, gravityMs);
  }, [syncState]);

  const stopGravity = useCallback(() => {
    clearInterval(gravityTimerRef.current);
  }, []);

  // Start a new game
  const startGame = useCallback(() => {
    const game = getGame();
    game.start();
    const s = game.getState();
    syncState();
    startGravity(s.gravityMs);
  }, [syncState, startGravity]);

  const restartGame = useCallback(() => startGame(), [startGame]);

  // Sync gravity speed whenever level changes
  useEffect(() => {
    if (state?.phase === GamePhase.PLAYING) {
      startGravity(state.gravityMs);
    } else {
      stopGravity();
    }
  }, [state?.level, state?.phase, startGravity, stopGravity]);

  // Actions
  const action = useCallback((fn) => {
    const game = getGame();
    const prevPhase = game.getState().phase;
    fn(game);
    syncState();
  }, [syncState]);

  const handleKeyDown = useCallback((e) => {
    const game = getGame();
    if (!game.getState) return;
    const { phase } = game.getState();

    // Prevent page scroll
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'KeyP' || e.code === 'Escape') {
      action(g => g.togglePause());
      return;
    }
    if (e.code === 'KeyR') {
      restartGame();
      return;
    }
    if (phase !== GamePhase.PLAYING) return;

    if (e.code === 'ArrowLeft' && heldKeyRef.current !== 'left') {
      heldKeyRef.current = 'left';
      action(g => g.moveLeft());
    }
    if (e.code === 'ArrowRight' && heldKeyRef.current !== 'right') {
      heldKeyRef.current = 'right';
      action(g => g.moveRight());
    }
    if (e.code === 'ArrowDown') action(g => g.softDrop());
    if (e.code === 'Space') action(g => g.hardDrop());
    if (e.code === 'ArrowUp' || e.code === 'KeyX') action(g => g.rotateCW());
    if (e.code === 'KeyZ') action(g => g.rotateCCW());
    if (e.code === 'KeyC' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') action(g => g.hold());
    if (e.code === 'KeyU') action(g => g.undo());
  }, [action, restartGame]);

  const handleKeyUp = useCallback((e) => {
    if (e.code === 'ArrowLeft' && heldKeyRef.current === 'left') heldKeyRef.current = null;
    if (e.code === 'ArrowRight' && heldKeyRef.current === 'right') heldKeyRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopGravity();
    };
  }, [handleKeyDown, handleKeyUp, stopGravity]);

  return {
    state,
    startGame,
    restartGame,
    moveLeft: () => action(g => g.moveLeft()),
    moveRight: () => action(g => g.moveRight()),
    softDrop: () => action(g => g.softDrop()),
    hardDrop: () => action(g => g.hardDrop()),
    rotateCW: () => action(g => g.rotateCW()),
    rotateCCW: () => action(g => g.rotateCCW()),
    hold: () => action(g => g.hold()),
    undo: () => action(g => g.undo()),
    togglePause: () => action(g => g.togglePause()),
    GamePhase,
  };
};

