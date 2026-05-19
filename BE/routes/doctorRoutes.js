const express = require('express');
const { 
  getDoctors, 
  getDoctorProfile, 
  getDoctorAppointments, 
  completeDiagnosis, 
  getPatientHistory,
  getMedicines
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route
router.route('/').get(getDoctors);

// Private Doctor routes
router.use(protect);
router.use(authorize('doctor'));

router.route('/profile').get(getDoctorProfile);
router.route('/appointments').get(getDoctorAppointments);
router.route('/diagnose/:appointmentId').post(completeDiagnosis);
router.route('/patient-history/:patientId').get(getPatientHistory);
router.route('/medicines').get(getMedicines);

module.exports = router;
