// DSA: Stack — Game state snapshots for Undo system
// LIFO: last pushed snapshot is the first to be popped on undo
// Also acts as replay recorder (action log)

// FNV-1a 64-bit hash for replay determinism verification
// (JavaScript BigInt approximation)
export const fnv1aHash = (actions, seed = 1337) => {
  let hash = BigInt('14695981039346656037');
  const PRIME = BigInt('1099511628211');
  const MASK = BigInt('0xFFFFFFFFFFFFFFFF');

  // Hash seed
  for (let i = 0; i < 4; i++) {
    hash ^= BigInt((seed >> (i * 8)) & 0xff);
    hash = (hash * PRIME) & MASK;
  }

  for (const { tick, action } of actions) {
    for (let i = 0; i < 4; i++) {
      hash ^= BigInt((tick >> (i * 8)) & 0xff);
      hash = (hash * PRIME) & MASK;
    }
    hash ^= BigInt(action.charCodeAt(0));
    hash = (hash * PRIME) & MASK;
  }

  return hash.toString(16);
};

export const createReplayStack = (maxCapacity = 100) => {
  // Stack implemented as array: push = O(1), pop = O(1)
  const stack = [];
  const actionLog = [];
  let tick = 0;

  return {
    pushSnapshot(snapshot) {
      if (stack.length >= maxCapacity) stack.shift(); // Evict oldest
      stack.push(snapshot);
    },
    popSnapshot() {
      return stack.pop() || null;
    },
    recordAction(action) {
      tick++;
      actionLog.push({ tick, action });
    },
    get canUndo() { return stack.length > 0; },
    get size() { return stack.length; },
    get actions() { return [...actionLog]; },
    get replayHash() { return fnv1aHash(actionLog); },
    clear() { stack.length = 0; actionLog.length = 0; tick = 0; },
  };
};

