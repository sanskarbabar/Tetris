// DSA: Heap / Priority Queue — In-memory leaderboard
// Top-K score tracking using a min-heap so we can efficiently maintain
// the top N scores without sorting the entire list each time

// Min-Heap implementation
// Parent at i → children at 2i+1 and 2i+2
// O(log n) insert, O(log n) extract-min, O(1) peek-min
class MinHeap {
  constructor(compareFn = (a, b) => a.score - b.score) {
    this.heap = [];
    this.compare = compareFn;
  }

  get size() { return this.heap.length; }

  peek() { return this.heap[0]; }

  insert(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(this.heap[i], this.heap[parent]) < 0) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else break;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      } else break;
    }
  }

  toSortedDesc() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}

// Top-K leaderboard using a min-heap of capacity K
// To get top K highest scores: keep a min-heap of size K
// If new score > heap.min, replace min with new score → O(log K)
export const createLocalLeaderboard = (maxSize = 10) => {
  const heap = new MinHeap();

  return {
    addScore(entry) {
      if (heap.size < maxSize) {
        heap.insert(entry);
      } else if (heap.peek() && entry.score > heap.peek().score) {
        heap.extractMin();
        heap.insert(entry);
      }
    },
    getTopScores() {
      return heap.toSortedDesc();
    },
    get size() { return heap.size; },
  };
};

// DSA: Sorting + Binary Search — utility functions for leaderboard data
// Sorts descending by score, uses date as tiebreaker (O(n log n))
export const sortLeaderboard = (records) =>
  [...records].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.completedAt) - new Date(a.completedAt);
  });

// Binary search — find player rank in sorted leaderboard: O(log n)
export const binarySearchRank = (sorted, targetScore) => {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid].score === targetScore) return mid;
    if (sorted[mid].score > targetScore) lo = mid + 1;
    else hi = mid - 1;
  }
  return lo; // Insertion point = rank position
};

