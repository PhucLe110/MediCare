const express = require('express');
const { getDoctors, bookAppointment, getMyAppointments, getDoctorAvailability } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, bookAppointment)
  .get(protect, getMyAppointments);

router.get('/doctors', protect, getDoctors);
router.get('/doctors/:doctorId/availability', protect, getDoctorAvailability);

module.exports = router;
