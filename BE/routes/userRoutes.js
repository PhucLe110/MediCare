const express = require("express");
const {
  getHealthProfile,
  updateHealthProfile,
  updateProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router
  .route("/health-profile")
  .get(protect, getHealthProfile)
  .put(protect, updateHealthProfile);

router.put("/profile", protect, updateProfile);

module.exports = router;
