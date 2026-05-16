const express = require('express');
const { getHealthProfile, updateHealthProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/health-profile')
  .get(protect, getHealthProfile)
  .put(protect, updateHealthProfile);

module.exports = router;
