const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  airline: {
    type: String,
    required: true,
  },
  flightNumber: {
    type: String,
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
  },
  duration: {
    type: String,
  },
  stops: {
    type: Number,
    default: 0,
  },
  class: {
    type: String,
    enum: ['economy', 'premium_economy', 'business', 'first'],
    default: 'economy',
  },
  availableSeats: {
    type: Number,
  },
  externalId: {
    type: String,
  },
  provider: {
    type: String,
    default: 'amadeus',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Documents expire after 24 hours
  },
});

module.exports = mongoose.model('Flight', FlightSchema);
