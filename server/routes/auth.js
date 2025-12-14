const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    session: false
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&provider=google`);
  }
);

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['public_profile'] 
}));

router.get('/facebook/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=facebook_auth_failed`,
    session: false
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&provider=facebook`);
  }
);

module.exports = router;
