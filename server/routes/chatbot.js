const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getSuggestions,
  clearSession,
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

router.post('/message', protect, sendMessage);
router.get('/suggestions', protect, getSuggestions);
router.delete('/session', protect, clearSession);

module.exports = router;
