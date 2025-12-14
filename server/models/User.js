const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VisaSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  visaType: {
    type: String,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  citizenship: {
    type: String,
    required: [true, 'Please add citizenship'],
  },
  passportNumber: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  visas: [VisaSchema],
  isPremium: {
    type: Boolean,
    default: false,
  },
  stripeCustomerId: {
    type: String,
  },
  stripeSubscriptionId: {
    type: String,
  },
  subscriptionStartDate: {
    type: Date,
  },
  subscriptionEndDate: {
    type: Date,
  },
  savedFlights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
  }],
  searchHistory: [{
    origin: String,
    destination: String,
    departureDate: Date,
    returnDate: Date,
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  // Skip password hashing for OAuth users
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
