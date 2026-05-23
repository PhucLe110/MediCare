const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/userService");
const User = require("../models/User");

exports.getHealthProfile = asyncHandler(async (req, res) => {
  const data = await userService.getHealthProfile(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.updateHealthProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateHealthProfile(req.user._id, req.body);
  res.status(200).json({ success: true, data });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { phone, gender } = req.body;
  const userId = req.user._id;

  console.log("Updating profile for user:", userId);
  console.log("Update data:", { phone, gender });

  const user = await User.findByIdAndUpdate(
    userId,
    { phone, gender, profileCompleted: true },
    { new: true, runValidators: true },
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  console.log("Updated user:", user);

  res.status(200).json({ success: true, data: user });
});
