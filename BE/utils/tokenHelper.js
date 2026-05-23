const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "[auth] ACCESS_TOKEN_SECRET và REFRESH_TOKEN_SECRET phải được cấu hình trong .env",
  );
}
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

const generateAccessToken = (user) =>
  jwt.sign({ id: user._id }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

const generateRefreshToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      v: user.refreshTokenVersion ?? 0,
      jti: Math.random().toString(36).substring(2) + Date.now(),
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES },
  );

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
};
