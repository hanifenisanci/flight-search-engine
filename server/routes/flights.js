const express = require('express');
const router = express.Router();
const {
  searchFlights,
  getRecommendations,
  saveFlight,
  checkVisaRequirement,
  searchLocations,
  getVisaFreeDestinations,
} = require('../controllers/flightController');
const { protect, premiumOnly } = require('../middleware/auth');
const { flightSearchLimiter } = require('../middleware/rateLimiter');

router.get('/search', flightSearchLimiter, searchFlights);
router.get('/recommendations', protect, flightSearchLimiter, getRecommendations);
router.post('/save', protect, saveFlight);
router.get('/visa-check', protect, checkVisaRequirement);
router.get('/locations', searchLocations);
router.get('/visa-free-destinations', protect, flightSearchLimiter, getVisaFreeDestinations);

module.exports = router;
