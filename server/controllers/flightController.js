const Flight = require('../models/Flight');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const amadeusService = require('../services/amadeusService');
const visaService = require('../services/visaService');

// @desc    Search flights
// @route   GET /api/flights/search
// @access  Private
exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults, travelClass } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide origin, destination, and departure date',
      });
    }

    // Save search to user history (optional, don't fail if it doesn't work)
    if (req.user && req.user.id) {
      try {
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            searchHistory: {
              origin,
              destination,
              departureDate,
              returnDate,
            },
          },
        });
      } catch (historyError) {
        console.log('Failed to save search history:', historyError.message);
      }
    }

    // Search flights using Amadeus
    const flights = await amadeusService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: adults || 1,
      travelClass: travelClass || 'ECONOMY',
    });

    res.json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error('Flight Search Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get personalized flight recommendations
// @route   GET /api/flights/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { origin } = req.query;

    if (!origin) {
      return res.status(400).json({
        success: false,
        error: 'Please provide origin airport code',
      });
    }

    // Get visa-based recommendations
    const visaRecommendations = visaService.getRecommendedDestinations(
      user.citizenship,
      user.visas
    );

    // Get seasonal recommendations
    const currentMonth = new Date().getMonth() + 1;
    const seasonalDestinations = visaService.getSeasonalDestinations(currentMonth);

    // Combine and enhance recommendations
    const recommendations = visaRecommendations
      .filter((rec) => seasonalDestinations.includes(rec.country))
      .slice(0, 10);

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      recommendations.map((rec) =>
        Recommendation.create({
          userId: user._id,
          destination: {
            country: rec.country,
            countryCode: rec.country,
          },
          visaRequired: rec.visaRequired,
          visaType: rec.visaType,
          visaEligibility: rec.visaType,
          reason: rec.reason,
          score: rec.score,
          basedOn: {
            citizenship: true,
            existingVisas: user.visas.length > 0,
            seasonality: true,
            popularity: true,
          },
        })
      )
    );

    res.json({
      success: true,
      count: savedRecommendations.length,
      data: savedRecommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Save flight to favorites
// @route   POST /api/flights/save
// @access  Private
exports.saveFlight = async (req, res) => {
  try {
    const flightData = req.body;

    // Validate required fields
    if (!flightData.origin || !flightData.destination || !flightData.departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required flight information',
      });
    }

    // Check if flight already exists for this user
    const existingFlight = await Flight.findOne({
      externalId: flightData.externalId,
    });

    let flight;
    if (existingFlight) {
      flight = existingFlight;
    } else {
      // Create flight document with proper date parsing
      flight = await Flight.create({
        ...flightData,
        departureDate: new Date(flightData.departureDate),
        returnDate: flightData.returnDate ? new Date(flightData.returnDate) : null,
      });
    }

    // Check if already saved by user
    const user = await User.findById(req.user.id);
    const alreadySaved = user.savedFlights.some(
      savedId => savedId.toString() === flight._id.toString()
    );

    if (!alreadySaved) {
      // Add to user's saved flights
      await User.findByIdAndUpdate(req.user.id, {
        $push: { savedFlights: flight._id },
      });
    }

    res.json({
      success: true,
      data: flight,
      message: alreadySaved ? 'Flight already in favorites' : 'Flight saved successfully',
    });
  } catch (error) {
    console.error('Save flight error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save flight',
    });
  }
};

// @desc    Check visa requirement for destination
// @route   GET /api/flights/visa-check
// @access  Private
exports.checkVisaRequirement = async (req, res) => {
  try {
    const { destination } = req.query;
    const user = await User.findById(req.user.id);

    if (!destination) {
      return res.status(400).json({
        success: false,
        error: 'Please provide destination country code',
      });
    }

    const visaInfo = visaService.checkVisaRequirement(
      user.citizenship,
      destination
    );

    res.json({
      success: true,
      data: visaInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Search locations (airports/cities)
// @route   GET /api/flights/locations
// @access  Public
exports.searchLocations = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide search keyword',
      });
    }

    const locations = await amadeusService.searchLocations(keyword);

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
