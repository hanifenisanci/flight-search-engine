import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';

// Validate required environment variables
const requiredEnvVars = ['REACT_APP_API_URL'];
const optionalEnvVars = ['REACT_APP_GOOGLE_CLIENT_ID', 'REACT_APP_STRIPE_PUBLISHABLE_KEY'];

const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);
const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);

if (missingRequired.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingRequired.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease create a .env file in the client folder based on .env.example');
}

if (missingOptional.length > 0 && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Missing optional environment variables (some features may be limited):');
  missingOptional.forEach(varName => console.warn(`   - ${varName}`));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
