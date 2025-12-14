const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getSuggestions,
  clearSession,
} = require('../controllers/chatbotController');
const { chatbotLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

// Optional auth middleware - adds user to req if token provided
const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    return protect(req, res, next);
  }
  next();
};

router.post('/message', optionalAuth, chatbotLimiter, sendMessage);
router.get('/suggestions', getSuggestions);
router.delete('/session', optionalAuth, clearSession);

module.exports = router;
