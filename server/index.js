const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('./config/passport');
const session = require('express-session');

// Load env vars
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'CLIENT_URL'
];

const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'AMADEUS_API_KEY',
  'AMADEUS_API_SECRET',
  'OPENAI_API_KEY'
];

const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);
const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);

if (missingRequired.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingRequired.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease create a .env file based on .env.example');
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.warn('⚠️  Missing optional environment variables (some features may be limited):');
  missingOptional.forEach(varName => console.warn(`   - ${varName}`));
  console.warn('');
}

console.log('✅ Environment variables validated');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const flightRoutes = require('./routes/flights');
const paymentRoutes = require('./routes/payments');
const chatbotRoutes = require('./routes/chatbot');

// Import rate limiters
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy for rate limiting (needed when behind reverse proxies)
app.set('trust proxy', 1);

// Apply general rate limiter to all requests
app.use(generalLimiter);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'withpass-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB (non-blocking)
const connectDB = require('./config/database');
connectDB().catch(err => {
  console.error('MongoDB connection failed, but server will continue:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
