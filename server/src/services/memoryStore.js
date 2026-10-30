// In-Memory Data Store fallback when MongoDB daemon is not running locally
// Demonstrates in-memory data structures: Hash Maps, Sorted Arrays, Binary Search
const bcrypt = require('bcryptjs');

class MemoryStore {
  constructor() {
    this.users = new Map(); // Hash Map: email/username -> user object
    this.gameResults = [];  // Array of game result records
    this.idCounter = 1;

    // Seed with mock leaderboard records for demonstration
    this.seedMockData();
  }

  seedMockData() {
    const mockScores = [
      { playerName: 'CyberTetris', score: 48200, level: 12, lines: 74, durationSeconds: 610, completedAt: new Date(Date.now() - 3600000) },
      { playerName: 'NeoMatrix', score: 36400, level: 9, lines: 52, durationSeconds: 480, completedAt: new Date(Date.now() - 7200000) },
      { playerName: 'BitMaster', score: 25100, level: 7, lines: 38, durationSeconds: 390, completedAt: new Date(Date.now() - 10800000) },
      { playerName: 'BlockWizard', score: 18900, level: 5, lines: 27, durationSeconds: 290, completedAt: new Date(Date.now() - 14400000) },
      { playerName: 'PixelAce', score: 12500, level: 4, lines: 19, durationSeconds: 210, completedAt: new Date(Date.now() - 18000000) },
    ];
    this.gameResults.push(...mockScores);
  }

  // Hash Map insertion: O(1)
  async createUser({ username, email, password }) {
    for (const u of this.users.values()) {
      if (u.email === email || u.username === username) {
        throw new Error('User already exists');
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: `mem_user_${this.idCounter++}`,
      username,
      email,
      password: hashedPassword,
      bestScore: 0,
      totalGames: 0,
      createdAt: new Date(),
    };
    this.users.set(user._id, user);
    return user;
  }

  // Hash Map lookup: O(1)
  async findUserByEmail(email) {
    for (const u of this.users.values()) {
      if (u.email === email) return u;
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id) || null;
  }

  // Save score and maintain sorted order (O(n log n))
  async saveScore({ userId, playerName, score, level, lines, durationSeconds }) {
    const record = {
      _id: `rec_${this.idCounter++}`,
      user: userId || null,
      playerName: playerName || 'Guest',
      score,
      level,
      lines,
      durationSeconds,
      completedAt: new Date(),
    };

    if (userId && this.users.has(userId)) {
      const u = this.users.get(userId);
      u.totalGames++;
      if (score > u.bestScore) u.bestScore = score;
      record.playerName = u.username;
    }

    this.gameResults.push(record);
    // Sort descending by score
    this.gameResults.sort((a, b) => b.score - a.score);
    return record;
  }

  // Paginated Leaderboard (O(1) slicing after sort)
  getLeaderboard(page = 1, limit = 10) {
    const total = this.gameResults.length;
    const skip = (page - 1) * limit;
    const paged = this.gameResults.slice(skip, skip + limit);
    const ranked = paged.map((r, i) => ({ rank: skip + i + 1, ...r }));
    return {
      leaderboard: ranked,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Binary search rank: O(log N)
  getUserRank(bestScore) {
    let lo = 0;
    let hi = this.gameResults.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this.gameResults[mid].score > bestScore) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return lo + 1;
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;

