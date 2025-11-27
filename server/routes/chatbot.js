const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getSuggestions,
  clearSession,
} = require('../controllers/chatbotController');

router.post('/message', sendMessage);
router.get('/suggestions', getSuggestions);
router.delete('/session', clearSession);

module.exports = router;
