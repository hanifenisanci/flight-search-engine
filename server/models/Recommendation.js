const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    countryCode: {
      type: String,
      required: true,
    },
  },
  visaRequired: {
    type: Boolean,
    required: true,
  },
  visaType: {
    type: String,
  },
  visaEligibility: {
    type: String,
    enum: ['eligible', 'visa_on_arrival', 'evisa', 'visa_required', 'not_eligible'],
  },
  reason: {
    type: String,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  basedOn: {
    citizenship: Boolean,
    existingVisas: Boolean,
    seasonality: Boolean,
    popularity: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800, // Documents expire after 7 days
  },
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);
