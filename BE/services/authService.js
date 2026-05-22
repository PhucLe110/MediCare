const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const HttpError = require("../utils/httpError");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_EXPIRES,
} = require("../utils/tokenHelper");

const formatAuthUser = (user, accessToken, refreshToken = null) => {
  const result = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    gender: user.gender,
    patientId: user.patientId,
    token: accessToken,
  };
  if (refreshToken) {
    result.refreshToken = refreshToken;
  }
  return result;
};

const calculateExpiresAt = () => {
  const expiresInMs = parseExpiration(REFRESH_EXPIRES);
  return new Date(Date.now() + expiresInMs);
};

const parseExpiration = (exp) => {
  if (!exp) return 7 * 24 * 60 * 60 * 1000; // Default 7 days
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
};

const issueTokenPair = async (user, deviceInfo = {}) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in database
  const expiresAt = calculateExpiresAt();
  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    deviceInfo,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

const register = async (
  { fullName, email, password, phone, gender },
  deviceInfo = {}
) => {
  const userExists = await User.findOne({ email });
  if (userExists) throw new HttpError(400, "Email đã được sử dụng");

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    gender: gender || "Nam",
  });

  const tokens = await issueTokenPair(user, deviceInfo);
  return {
    data: formatAuthUser(user, tokens.accessToken, tokens.refreshToken),
    refreshToken: tokens.refreshToken,
  };
};

const login = async ({ email, password }, deviceInfo = {}) => {
  if (!email || !password) {
    throw new HttpError(400, "Vui lòng cung cấp email và mật khẩu");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new HttpError(401, "Thông tin đăng nhập không hợp lệ");
  if (user.status === "blocked") {
    throw new HttpError(
      403,
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!"
    );
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new HttpError(401, "Thông tin đăng nhập không hợp lệ");

  const tokens = await issueTokenPair(user, deviceInfo);
  return {
    data: formatAuthUser(user, tokens.accessToken, tokens.refreshToken),
    refreshToken: tokens.refreshToken,
  };
};

const refresh = async ({ refreshToken }, deviceInfo = {}) => {
  if (!refreshToken) {
    throw new HttpError(400, "Thiếu refresh token");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new HttpError(401, "Refresh token không hợp lệ hoặc đã hết hạn");
  }

  // Check if refresh token exists in database and is not revoked
  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken) {
    throw new HttpError(401, "Refresh token không tồn tại");
  }
  if (storedToken.isRevoked) {
    // Breach detection: Revoke all tokens for this user and increment version to force logout
    await RefreshToken.updateMany(
      { userId: storedToken.userId },
      { isRevoked: true, revokedAt: new Date() }
    );
    await User.findByIdAndUpdate(storedToken.userId, {
      $inc: { refreshTokenVersion: 1 },
    });
    throw new HttpError(
      401,
      "Refresh token đã bị thu hồi. Phát hiện dấu hiệu xâm nhập, tất cả các phiên đăng nhập khác đã bị vô hiệu hóa."
    );
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new HttpError(401, "Người dùng không tồn tại");
  if (user.status === "blocked") {
    throw new HttpError(403, "Tài khoản đã bị khóa");
  }
  if ((user.refreshTokenVersion ?? 0) !== (decoded.v ?? 0)) {
    throw new HttpError(
      401,
      "Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại"
    );
  }

  // Revoke old refresh token (token rotation)
  await RefreshToken.findByIdAndUpdate(storedToken._id, {
    isRevoked: true,
    revokedAt: new Date(),
  });

  // Issue new token pair
  const tokens = await issueTokenPair(user, deviceInfo);

  // Link new token to old token for audit trail
  await RefreshToken.findOneAndUpdate(
    { token: tokens.refreshToken },
    { replacedBy: storedToken._id }
  );

  return {
    data: formatAuthUser(user, tokens.accessToken, tokens.refreshToken),
    refreshToken: tokens.refreshToken,
  };
};

const logout = async (refreshToken = null) => {
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const userId = decoded.id;

      // Revoke specific refresh token if provided
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken, userId },
        { isRevoked: true, revokedAt: new Date() }
      );

      // Increment refresh token version to invalidate all other tokens
      await User.findByIdAndUpdate(userId, {
        $inc: { refreshTokenVersion: 1 },
      });
    } catch (err) {
      // If token is expired or invalid, search the DB to revoke and increment version if document is found
      const storedToken = await RefreshToken.findOne({ token: refreshToken });
      if (storedToken) {
        storedToken.isRevoked = true;
        storedToken.revokedAt = new Date();
        await storedToken.save();

        await User.findByIdAndUpdate(storedToken.userId, {
          $inc: { refreshTokenVersion: 1 },
        });
      }
    }
  }

  return { success: true };
};

const getMe = async (userId) => User.findById(userId);

module.exports = { register, login, refresh, logout, getMe };
