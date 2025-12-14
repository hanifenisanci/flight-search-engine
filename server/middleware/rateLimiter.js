const rateLimit = require('express-rate-limit');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many login/register attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Flight search rate limiter
const flightSearchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 flight searches per minute
  message: {
    success: false,
    error: 'Too many flight searches, please wait a moment before searching again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chatbot rate limiters - tiered system
const guestChatbotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: 'You\'ve used your 3 free messages. Login for more!'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const userChatbotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: 'You\'ve reached your message limit. Upgrade to premium for unlimited chatbot access!'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id.toString(),
});

const chatbotLimiter = (req, res, next) => {
  // Premium users: unlimited
  if (req.user?.isPremium) {
    return next();
  }
  
  // Logged-in users: 5 per hour
  if (req.user) {
    return userChatbotLimiter(req, res, next);
  }
  
  // Guest users: 3 per hour
  return guestChatbotLimiter(req, res, next);
};

// Payment rate limiter
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment attempts per hour
  message: {
    success: false,
    error: 'Too many payment attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  flightSearchLimiter,
  chatbotLimiter,
  paymentLimiter
};
