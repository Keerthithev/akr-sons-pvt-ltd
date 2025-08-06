const express = require('express');
const router = express.Router();
const { login, verify } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify - Protected route
router.get('/verify', protect, verify);

module.exports = router; 