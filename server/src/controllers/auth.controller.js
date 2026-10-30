const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const memoryStore = require('../services/memoryStore');
const bcrypt = require('bcryptjs');

const isMongoConnected = () => mongoose.connection.readyState === 1;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!isMongoConnected()) {
      try {
        const user = await memoryStore.createUser({ username, email, password });
        const token = signToken(user._id);
        return res.status(201).json({
          success: true,
          message: 'Account created successfully',
          data: { token, user: { id: user._id, username: user.username, email: user.email } },
        });
      } catch (err) {
        return res.status(409).json({ success: false, message: err.message });
      }
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} already in use` });
    }

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { token, user: { id: user._id, username: user.username, email: user.email } },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (!isMongoConnected()) {
      const user = await memoryStore.findUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      const token = signToken(user._id);
      return res.json({
        success: true,
        message: 'Logged in successfully',
        data: { token, user: { id: user._id, username: user.username, email: user.email, bestScore: user.bestScore } },
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { token, user: { id: user._id, username: user.username, email: user.email, bestScore: user.bestScore } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id || req.user.id,
        username: req.user.username,
        email: req.user.email,
        bestScore: req.user.bestScore || 0,
        totalGames: req.user.totalGames || 0,
        createdAt: req.user.createdAt,
      },
    },
  });
};

module.exports = { register, login, getMe };
