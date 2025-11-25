# Flight Search Engine - Graduation Project

A comprehensive flight search engine with intelligent travel recommendations based on citizenship and visa status, integrated chatbot, and premium membership system.

## Features

- 🔍 **Flight Search**: Search and compare flights from various sources
- 🌍 **Travel Recommendations**: Personalized suggestions based on citizenship and visa requirements
- 💬 **AI Chatbot**: Integrated external chatbot for travel assistance
- 💳 **Premium Membership**: Stripe payment integration for premium features
- 👤 **User Profiles**: Manage citizenship, visas, and travel preferences
- 📊 **Flight Comparison**: Compare prices, routes, and airlines

## Tech Stack

### Frontend
- React.js (with Hooks)
- React Router DOM
- Axios
- Context API / Redux (state management)
- Material-UI / Tailwind CSS
- Stripe.js

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe API
- Flight API Integration (Amadeus/Skyscanner)
- Dialogflow/OpenAI API for chatbot

## Project Structure

```
flight-search-engine/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context API
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── assets/        # Images, icons
│   │   └── App.js
│   └── package.json
│
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── index.js
│
└── package.json
```

## Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install-all
   ```

3. Create `.env` files in both `client` and `server` directories (see `.env.example`)

4. Start development servers:
   ```bash
   npm run dev
   ```

## Environment Variables

### Server (.env)
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe secret key
- `AMADEUS_API_KEY`: Flight API key
- `AMADEUS_API_SECRET`: Flight API secret
- `DIALOGFLOW_PROJECT_ID`: Chatbot project ID
- `DIALOGFLOW_CREDENTIALS`: Chatbot credentials path

### Client (.env)
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_STRIPE_PUBLIC_KEY`: Stripe public key

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/visa` - Add visa information
- `DELETE /api/users/visa/:id` - Remove visa

### Flights
- `GET /api/flights/search` - Search flights
- `GET /api/flights/recommendations` - Get personalized recommendations
- `POST /api/flights/save` - Save flight to favorites

### Payments
- `POST /api/payments/create-subscription` - Create premium subscription
- `POST /api/payments/cancel-subscription` - Cancel subscription
- `GET /api/payments/subscription-status` - Get subscription status

### Chatbot
- `POST /api/chatbot/message` - Send message to chatbot

## License

MIT
