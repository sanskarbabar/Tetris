const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const scoresRoutes = require('./routes/scores.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

const app = express();

// CORS
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many requests, please try again later' });
const scoreLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: 'Too many score submissions' });

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/scores', scoreLimiter, scoresRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;

