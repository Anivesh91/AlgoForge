const express = require('express');
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
