const express = require('express');
const { getLeaderboard, getMyRank } = require('../controllers/leaderboard.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/me', protect, getMyRank);

module.exports = router;

