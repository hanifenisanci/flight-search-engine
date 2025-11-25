const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      citizenship: req.body.citizenship,
      passportNumber: req.body.passportNumber,
      dateOfBirth: req.body.dateOfBirth,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Add visa to user profile
// @route   POST /api/users/visa
// @access  Private
exports.addVisa = async (req, res) => {
  try {
    const { country, visaType, validUntil, issueDate } = req.body;

    const user = await User.findById(req.user.id);
    user.visas.push({
      country,
      visaType,
      validUntil,
      issueDate,
    });

    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Remove visa from user profile
// @route   DELETE /api/users/visa/:id
// @access  Private
exports.removeVisa = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.visas = user.visas.filter(
      (visa) => visa._id.toString() !== req.params.id
    );

    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get saved flights
// @route   GET /api/users/saved-flights
// @access  Private
exports.getSavedFlights = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedFlights');
    res.json({
      success: true,
      data: user.savedFlights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
