const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for guest players
  },
  playerName: {
    type: String,
    default: 'Guest',
    trim: true,
    maxlength: [30, 'Player name cannot exceed 30 characters'],
  },
  score: {
    type: Number,
    required: true,
    min: [0, 'Score cannot be negative'],
    max: [9999999, 'Score exceeds maximum allowed value'],
  },
  level: {
    type: Number,
    required: true,
    min: [1, 'Level must be at least 1'],
    max: [30, 'Level exceeds maximum allowed value'],
  },
  lines: {
    type: Number,
    required: true,
    min: [0, 'Lines cannot be negative'],
    max: [9999, 'Lines exceeds maximum allowed value'],
  },
  durationSeconds: {
    type: Number,
    required: true,
    min: [0, 'Duration cannot be negative'],
    max: [86400, 'Game duration exceeds 24 hours'],
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for leaderboard queries
gameResultSchema.index({ score: -1, completedAt: -1 });
gameResultSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('GameResult', gameResultSchema);

