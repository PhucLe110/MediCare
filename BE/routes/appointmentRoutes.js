const express = require('express');
const { getDoctors, bookAppointment, getMyAppointments } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, bookAppointment)
  .get(protect, getMyAppointments);

router.get('/doctors', protect, getDoctors);

module.exports = router;
