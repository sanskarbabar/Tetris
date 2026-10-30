const mongoose = require('mongoose');
const GameResult = require('../models/GameResult');
const memoryStore = require('../services/memoryStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// GET /api/leaderboard — global ranked scores
const getLeaderboard = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    if (!isMongoConnected()) {
      const data = memoryStore.getLeaderboard(page, limit);
      return res.json({
        success: true,
        data,
      });
    }

    const [results, total] = await Promise.all([
      GameResult.find()
        .sort({ score: -1, completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('playerName score level lines durationSeconds completedAt')
        .lean(),
      GameResult.countDocuments(),
    ]);

    const ranked = results.map((r, i) => ({ rank: skip + i + 1, ...r }));

    res.json({
      success: true,
      data: {
        leaderboard: ranked,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching leaderboard' });
  }
};

// GET /api/leaderboard/me — player's rank
const getMyRank = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!isMongoConnected()) {
      const best = req.user.bestScore || 0;
      const rank = memoryStore.getUserRank(best);
      return res.json({
        success: true,
        data: { rank, bestScore: best },
      });
    }

    const myBest = await GameResult.findOne({ user: req.user._id })
      .sort({ score: -1 })
      .select('score level lines');

    if (!myBest) {
      return res.json({ success: true, data: { rank: null, message: 'No games played yet' } });
    }

    const rank = (await GameResult.countDocuments({ score: { $gt: myBest.score } })) + 1;

    res.json({
      success: true,
      data: { rank, bestScore: myBest.score, level: myBest.level, lines: myBest.lines },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching rank' });
  }
};

module.exports = { getLeaderboard, getMyRank };
