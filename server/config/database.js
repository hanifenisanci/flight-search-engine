const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Don't set strictQuery for older mongoose versions
    // mongoose.set('strictQuery', false);
    
    // Use connection string as-is from environment
    const connectionString = process.env.MONGODB_URI;
    
    const conn = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      family: 4,
      // Explicitly set TLS options
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Please check your internet connection and MongoDB URI');
    console.warn('⚠️  Server will continue running without MongoDB. Authentication features will be limited.');
    // Don't exit - let the server run without MongoDB for basic functionality
  }
};

module.exports = connectDB;
