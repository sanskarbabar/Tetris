const mongoose = require('mongoose');
const GameResult = require('../models/GameResult');
const User = require('../models/User');
const memoryStore = require('../services/memoryStore');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// POST /api/scores — save a completed game
const saveScore = async (req, res) => {
  try {
    const { score, level, lines, durationSeconds, playerName } = req.body;

    // Validate required numeric fields
    const errors = [];
    const validate = (val, name, min, max) => {
      if (val === undefined || val === null) errors.push(`${name} is required`);
      else if (!Number.isFinite(val) || val < min || val > max)
        errors.push(`${name} must be between ${min} and ${max}`);
    };
    validate(score, 'score', 0, 9999999);
    validate(level, 'level', 1, 30);
    validate(lines, 'lines', 0, 9999);
    validate(durationSeconds, 'durationSeconds', 0, 86400);

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join('; ') });
    }

    if (!isMongoConnected()) {
      const rec = await memoryStore.saveScore({
        userId: req.user?.id,
        playerName: req.user?.username || playerName,
        score,
        level,
        lines,
        durationSeconds,
      });
      return res.status(201).json({
        success: true,
        message: 'Game result saved (in-memory mode)',
        data: rec,
      });
    }

    const resultData = {
      score,
      level,
      lines,
      durationSeconds,
    };

    if (req.user) {
      resultData.user = req.user._id;
      resultData.playerName = req.user.username;

      if (score > req.user.bestScore) {
        await User.findByIdAndUpdate(req.user._id, {
          bestScore: score,
          $inc: { totalGames: 1 },
        });
      } else {
        await User.findByIdAndUpdate(req.user._id, { $inc: { totalGames: 1 } });
      }
    } else {
      resultData.playerName = playerName || 'Guest';
    }

    const result = await GameResult.create(resultData);

    res.status(201).json({
      success: true,
      message: 'Game result saved',
      data: {
        score: result.score,
        level: result.level,
        lines: result.lines,
        durationSeconds: result.durationSeconds,
        playerName: result.playerName,
        completedAt: result.completedAt,
      },
    });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ success: false, message: 'Server error saving score' });
  }
};

// GET /api/scores/me — personal game history
const getMyScores = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    if (!isMongoConnected()) {
      const myResults = memoryStore.gameResults.filter(r => r.user === req.user?.id);
      const paged = myResults.slice(skip, skip + limit);
      return res.json({
        success: true,
        data: {
          results: paged,
          pagination: { page, limit, total: myResults.length, totalPages: Math.ceil(myResults.length / limit) },
        },
      });
    }

    const filter = { user: req.user._id };
    if (req.query.from) filter.completedAt = { $gte: new Date(req.query.from) };

    const [results, total] = await Promise.all([
      GameResult.find(filter)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-user'),
      GameResult.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        results,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching history' });
  }
};

module.exports = { saveScore, getMyScores };
