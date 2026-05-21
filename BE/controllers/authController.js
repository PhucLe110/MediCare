const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

const getDeviceInfo = (req) => ({
  userAgent: req.headers["user-agent"],
  ip: req.ip || req.connection.remoteAddress,
});

exports.register = asyncHandler(async (req, res) => {
  const deviceInfo = getDeviceInfo(req);
  const { data, refreshToken } = await authService.register(
    req.body,
    deviceInfo,
  );

  // Set refresh token as httpOnly cookie
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  res.status(201).json({ success: true, data });
});

exports.login = asyncHandler(async (req, res) => {
  const deviceInfo = getDeviceInfo(req);
  const { data, refreshToken } = await authService.login(req.body, deviceInfo);

  // Set refresh token as httpOnly cookie
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  res.status(200).json({ success: true, data });
});

exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const deviceInfo = getDeviceInfo(req);

  const { data, refreshToken: newRefreshToken } = await authService.refresh(
    { refreshToken },
    deviceInfo,
  );

  // Set new refresh token as httpOnly cookie
  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  res.status(200).json({ success: true, data });
});

exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await authService.logout(req.user._id, refreshToken);

  // Clear refresh token cookie
  res.clearCookie("refreshToken");

  res.status(200).json({ success: true, message: "Đăng xuất thành công" });
});

exports.getMe = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user._id);
  res.status(200).json({ success: true, data });
});
