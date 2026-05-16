const express = require('express');
const { predictSpecialty } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/predict', protect, predictSpecialty);

module.exports = router;
