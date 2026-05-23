const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");
const { issueTokenPair, formatAuthUser } = require("../services/authService");

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
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logout(refreshToken);

  // Blacklist the current access token so it can't be reused
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    const { addTokenToBlacklist } = require("../utils/tokenBlacklist");
    addTokenToBlacklist(token);
  }

  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ success: true, message: "Đăng xuất thành công" });
});

exports.getMe = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const data = await authService.forgotPassword(email);
  res.status(200).json({ success: true, data });
});

exports.verifyCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const data = await authService.verifyCode(email, code);
  res.status(200).json({ success: true, data });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  const data = await authService.resetPassword(email, code, newPassword);
  res.status(200).json({ success: true, data });
});

exports.firebaseAuth = asyncHandler(async (req, res) => {
  const { idToken, email, displayName, photoURL, mode } = req.body;

  if (!idToken) {
    return res
      .status(400)
      .json({ success: false, message: "Firebase ID token is required" });
  }

  // TODO: Implement proper Firebase token verification using Firebase Admin SDK
  // Install firebase-admin: npm install firebase-admin
  // Initialize: const admin = require('firebase-admin');
  // Verify: const decodedToken = await admin.auth().verifyIdToken(idToken);
  // Use decodedToken.uid as googleId instead of idToken
  // This requires Firebase service account credentials in environment variables

  const User = require("../models/User");

  // Check if user exists
  let user = await User.findOne({ email });

  if (mode === "register") {
    // Register mode: user should not exist
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã được đăng ký" });
    }
    // Create new user
    // Note: Using idToken temporarily as googleId - should be Firebase UID after proper verification
    user = await User.create({
      fullName: displayName || "User",
      email,
      googleId: idToken,
      role: "patient",
      profileCompleted: false,
      phone: "",
      gender: "Nam",
      avatar: photoURL || "",
    });
  } else {
    // Login mode: user should exist
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Tài khoản không tồn tại" });
    }
    // Update googleId if not set
    if (!user.googleId) {
      user.googleId = idToken;
      await user.save();
    }
  }

  const deviceInfo = getDeviceInfo(req);

  // Generate tokens
  const tokens = await issueTokenPair(user, deviceInfo);

  // Set refresh token as httpOnly cookie
  if (tokens.refreshToken) {
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  const data = formatAuthUser(user, tokens.accessToken, tokens.refreshToken);

  res.status(200).json({ success: true, data });
});
