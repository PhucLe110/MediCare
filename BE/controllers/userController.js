const User = require('../models/User');

// @desc    Get current user's health profile
// @route   GET /api/users/health-profile
// @access  Private
exports.getHealthProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('healthProfile');
    res.status(200).json({ success: true, data: user.healthProfile || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user's health profile
// @route   PUT /api/users/health-profile
// @access  Private
exports.updateHealthProfile = async (req, res) => {
  try {
    const { bloodType, height, weight, bloodPressure, allergies, medicalHistory } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        healthProfile: {
          bloodType,
          height,
          weight,
          bloodPressure,
          allergies,
          medicalHistory,
          isFilled: true
        }
      },
      { new: true, runValidators: false }
    ).select('healthProfile');

    res.status(200).json({ success: true, data: user.healthProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
