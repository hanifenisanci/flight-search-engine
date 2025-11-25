const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token ID:', decoded.id);
    console.log('Token ID type:', typeof decoded.id);
    
    req.user = await User.findById(decoded.id).select('-password');
    console.log('Found user:', req.user ? req.user._id : 'null');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

exports.premiumOnly = (req, res, next) => {
  if (!req.user.isPremium) {
    return res.status(403).json({
      success: false,
      error: 'This feature is only available for premium members',
    });
  }
  next();
};
