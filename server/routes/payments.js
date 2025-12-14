const express = require('express');
const router = express.Router();
const {
  createSubscription,
  verifySubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionStatus,
  handleWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.post('/create-subscription', protect, paymentLimiter, createSubscription);
router.post('/verify-subscription', protect, paymentLimiter, verifySubscription);
router.post('/cancel-subscription', protect, cancelSubscription);
router.post('/reactivate-subscription', protect, reactivateSubscription);
router.get('/subscription-status', protect, getSubscriptionStatus);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
