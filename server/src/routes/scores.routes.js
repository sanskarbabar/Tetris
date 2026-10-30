const express = require('express');
const { saveScore, getMyScores } = require('../controllers/scores.controller');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, saveScore);
router.get('/me', protect, getMyScores);

module.exports = router;

