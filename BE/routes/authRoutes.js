const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  verifyCode,
  resetPassword,
  firebaseAuth,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Cấu hình giới hạn tần suất yêu cầu (Rate Limiting) cho các endpoint nhạy cảm
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 15, // Tối đa 15 lượt yêu cầu trên mỗi IP trong 15 phút
  message: {
    success: false,
    message:
      "Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);

// Firebase Auth route
router.post("/firebase-auth", firebaseAuth);

module.exports = router;
