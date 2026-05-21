const User = require('../models/User');

const getHealthProfile = async (userId) => {
  const user = await User.findById(userId).select('healthProfile');
  return user.healthProfile || {};
};

const updateHealthProfile = async (userId, profile) => {
  const { bloodType, height, weight, bloodPressure, allergies, medicalHistory } = profile;

  const user = await User.findByIdAndUpdate(
    userId,
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

  return user.healthProfile;
};

module.exports = { getHealthProfile, updateHealthProfile };
