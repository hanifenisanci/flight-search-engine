const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addVisa,
  removeVisa,
  getSavedFlights,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/visa', protect, addVisa);
router.delete('/visa/:id', protect, removeVisa);
router.get('/saved-flights', protect, getSavedFlights);

module.exports = router;
