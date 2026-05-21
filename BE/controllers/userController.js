const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

exports.getHealthProfile = asyncHandler(async (req, res) => {
  const data = await userService.getHealthProfile(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.updateHealthProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateHealthProfile(req.user._id, req.body);
  res.status(200).json({ success: true, data });
});
