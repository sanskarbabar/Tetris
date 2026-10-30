// DSA: Queue + Fisher-Yates Shuffle — Seven-Bag Randomizer
// Guarantees every piece appears exactly once before any repeat
// Queue data structure: FIFO — pieces consumed from front

import { PIECE_TYPES } from './pieces';

// Fisher-Yates shuffle — O(n) = O(7) = O(1) for fixed bag size
const shuffleBag = (rng = Math.random) => {
  const bag = [...PIECE_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

const PREVIEW_SIZE = 5;

export const createRandomizer = () => {
  // Queue implementation using Array — O(1) push_back, O(n) shift
  // For small fixed sizes (preview of 5) this is acceptable
  let queue = [];

  const refill = () => {
    queue = [...queue, ...shuffleBag()];
  };

  // Seed the queue with 2 bags to guarantee preview visibility
  refill();
  refill();

  return {
    // Dequeue next piece — FIFO: O(n) for array shift, O(1) for true queue
    next() {
      if (queue.length < PREVIEW_SIZE + 1) refill();
      return queue.shift();
    },
    // Peek at next N pieces without consuming — O(N)
    peek(n = PREVIEW_SIZE) {
      return queue.slice(0, n);
    },
    // Serialize state for undo/replay snapshots
    getState() {
      return [...queue];
    },
    // Restore from snapshot
    setState(savedQueue) {
      queue = [...savedQueue];
    },
  };
};

