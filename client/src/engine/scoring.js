// DSA: Scoring system with level progression

// Base points per lines-cleared-at-once multiplied by level
const BASE_SCORE = { 1: 100, 2: 300, 3: 500, 4: 800 };

export const createScoring = () => {
  let score = 0;
  let lines = 0;
  let level = 1;
  let combo = -1;
  let backToBack = false;

  return {
    // Called after piece locks; linesCleared is 0-4
    addLineClear(linesCleared) {
      if (linesCleared === 0) {
        combo = -1;
        return 0;
      }

      combo++;
      lines += linesCleared;
      level = 1 + Math.floor(lines / 10);

      let pts = (BASE_SCORE[linesCleared] || 1000) * level;
      const isTetris = linesCleared === 4;

      // Back-to-Back bonus: consecutive difficult clears (Tetris)
      if (isTetris) {
        if (backToBack) pts = Math.floor(pts * 1.5);
        backToBack = true;
      } else {
        backToBack = false;
      }

      // Combo bonus
      if (combo > 0) pts += 50 * combo * level;

      score += pts;
      return pts;
    },

    addSoftDrop(cells) { score += cells; },
    addHardDrop(cells) { score += cells * 2; },

    get score() { return score; },
    get lines() { return lines; },
    get level() { return level; },
    get combo() { return combo; },
    get backToBack() { return backToBack; },

    // Gravity interval in ms based on level (guideline formula)
    get gravityMs() {
      const base = 0.8 - (level - 1) * 0.007;
      return Math.max(40, Math.pow(Math.max(0.1, base), level - 1) * 1000);
    },

    getState() {
      return { score, lines, level, combo, backToBack };
    },
    setState(s) {
      score = s.score; lines = s.lines; level = s.level;
      combo = s.combo; backToBack = s.backToBack;
    },

    reset() {
      score = 0; lines = 0; level = 1; combo = -1; backToBack = false;
    },
  };
};

