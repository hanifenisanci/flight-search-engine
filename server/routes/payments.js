const express = require('express');
const router = express.Router();
const {
  createSubscription,
  verifySubscription,
  cancelSubscription,
  getSubscriptionStatus,
  handleWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-subscription', protect, createSubscription);
router.post('/verify-subscription', protect, verifySubscription);
router.post('/cancel-subscription', protect, cancelSubscription);
router.get('/subscription-status', protect, getSubscriptionStatus);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
