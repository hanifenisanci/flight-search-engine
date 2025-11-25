# Flight Search Engine - Setup Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Stripe account (for payments)
- Amadeus API account (for flight data)
- Optional: Dialogflow or OpenAI account (for chatbot)

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Install all dependencies for root, client, and server
npm run install-all
```

Or install individually:

```powershell
# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

#### Server Configuration

Create `server/.env` file:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/flight-search-engine
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flight-search-engine

# JWT
JWT_SECRET=your_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Stripe (Get from https://stripe.com/docs/keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Amadeus Flight API (Register at https://developers.amadeus.com/)
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
AMADEUS_HOSTNAME=test.api.amadeus.com

# Chatbot - Option 1: Dialogflow
DIALOGFLOW_PROJECT_ID=your_dialogflow_project_id
GOOGLE_APPLICATION_CREDENTIALS=./config/dialogflow-credentials.json

# Chatbot - Option 2: OpenAI (Alternative)
OPENAI_API_KEY=sk-your_openai_api_key

# CORS
CLIENT_URL=http://localhost:3000
```

#### Client Configuration

Create `client/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 3. Start Development Servers

#### Option 1: Start Both Servers Together

```powershell
npm run dev
```

#### Option 2: Start Separately

Terminal 1 - Backend:
```powershell
cd server
npm run dev
```

Terminal 2 - Frontend:
```powershell
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 API Keys Setup

### 1. MongoDB Setup

**Local MongoDB:**
```powershell
# Install MongoDB
# Then start MongoDB service
mongod
```

**MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Add to `server/.env` as `MONGODB_URI`

### 2. Amadeus API Setup

1. Register at https://developers.amadeus.com/
2. Create a new app
3. Get API Key and Secret
4. Add to `server/.env`:
   - `AMADEUS_API_KEY`
   - `AMADEUS_API_SECRET`

### 3. Stripe Setup

1. Create account at https://stripe.com
2. Get test API keys from Dashboard → Developers → API keys
3. Add to environment files:
   - `server/.env`: `STRIPE_SECRET_KEY`
   - `client/.env`: `REACT_APP_STRIPE_PUBLIC_KEY`

### 4. Chatbot Setup (Choose One)

**Option A: Dialogflow**
1. Go to https://dialogflow.cloud.google.com/
2. Create a new agent
3. Download credentials JSON
4. Place in `server/config/dialogflow-credentials.json`
5. Add project ID to `server/.env`

**Option B: OpenAI**
1. Get API key from https://platform.openai.com/
2. Add `OPENAI_API_KEY` to `server/.env`

**Option C: Use Built-in Simple Bot**
- No configuration needed
- Works automatically as fallback

## 📦 Project Structure

```
flight-search-engine/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Navbar, Chatbot
│   │   ├── pages/         # Home, Login, Register, etc.
│   │   ├── context/       # Auth context
│   │   ├── services/      # API services
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                # Node.js backend
│   ├── config/           # Database config
│   ├── controllers/      # Business logic
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── services/         # External APIs
│   ├── index.js
│   └── package.json
│
└── package.json          # Root package
```

## 🧪 Testing the Application

### 1. Test User Registration

1. Go to http://localhost:3000/register
2. Create a new account with:
   - Name
   - Email
   - Citizenship (2-letter code: US, TR, GB, etc.)
   - Date of Birth
   - Password

### 2. Test Flight Search

1. Login with your account
2. Go to Search Flights
3. Enter:
   - Origin: JFK (New York)
   - Destination: LAX (Los Angeles)
   - Departure date
   - Optional: Return date
4. Click Search

### 3. Test Travel Recommendations

1. In Search page, enter origin airport
2. Click "Get Recommendations"
3. View personalized recommendations based on citizenship

### 4. Test Chatbot

1. Click the chat icon (bottom right)
2. Ask questions like:
   - "Search for flights to Paris"
   - "What visa do I need for Japan?"
   - "Tell me about premium membership"

### 5. Test Premium Subscription

1. Go to Premium page
2. Click "Subscribe Now"
3. Use Stripe test card: 4242 4242 4242 4242
4. Verify premium features activate

## 🔑 Test Stripe Cards

Use these test cards in development:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Declined payment |

- Use any future expiry date
- Use any 3-digit CVC
- Use any ZIP code

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Flights
- `GET /api/flights/search` - Search flights
- `GET /api/flights/recommendations` - Get recommendations
- `POST /api/flights/save` - Save flight
- `GET /api/flights/visa-check` - Check visa requirements

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/visa` - Add visa
- `DELETE /api/users/visa/:id` - Remove visa

### Payments
- `POST /api/payments/create-subscription` - Create subscription
- `POST /api/payments/verify-subscription` - Verify payment
- `POST /api/payments/cancel-subscription` - Cancel subscription
- `GET /api/payments/subscription-status` - Get status

### Chatbot
- `POST /api/chatbot/message` - Send message
- `GET /api/chatbot/suggestions` - Get suggestions

## 🐛 Troubleshooting

### MongoDB Connection Issues

```powershell
# Check if MongoDB is running
# For local MongoDB
mongod --version

# Test connection
mongo
```

### Port Already in Use

```powershell
# Change ports in .env files
# Server: PORT=5001
# Client: Add to package.json scripts: "start": "set PORT=3001 && react-scripts start"
```

### CORS Issues

Verify `CLIENT_URL` in `server/.env` matches your frontend URL.

### API Key Errors

- Check all API keys are correctly added to .env
- Restart servers after changing .env files
- Verify no extra spaces in API keys

## 🚀 Production Deployment

### Backend (Heroku/Railway/Render)

1. Push code to GitHub
2. Connect repository to hosting service
3. Add environment variables
4. Deploy

### Frontend (Vercel/Netlify)

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables
5. Deploy

### MongoDB Atlas

Already configured for production - just update `MONGODB_URI`

## 📝 Features Checklist

- ✅ User Authentication (Register/Login)
- ✅ Flight Search with Amadeus API
- ✅ Visa-based Travel Recommendations
- ✅ User Profile Management
- ✅ Visa Information Management
- ✅ Premium Membership with Stripe
- ✅ AI Chatbot Integration
- ✅ Responsive Design
- ✅ Search History
- ✅ Saved Flights

## 🤝 Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all API keys are valid
4. Check MongoDB connection

## 📄 License

MIT License - Feel free to use for your graduation project!

---

**Good luck with your graduation project! 🎓**
