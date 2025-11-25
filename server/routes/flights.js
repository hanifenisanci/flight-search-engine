const express = require('express');
const router = express.Router();
const {
  searchFlights,
  getRecommendations,
  saveFlight,
  checkVisaRequirement,
  searchLocations,
} = require('../controllers/flightController');
const { protect, premiumOnly } = require('../middleware/auth');

router.get('/search', protect, searchFlights);
router.get('/recommendations', protect, getRecommendations);
router.post('/save', protect, saveFlight);
router.get('/visa-check', protect, checkVisaRequirement);
router.get('/locations', searchLocations);

module.exports = router;
