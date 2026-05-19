const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAppointments,
  updateAppointmentStatus,
  getAvailableDoctorsForReschedule,
  rescheduleAppointment,
  getBills,
  getRecords,
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllShiftRequests,
  updateShiftRequestStatus,
  getDoctorSchedule
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection and admin authorization to all admin routes
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/dashboard-stats', getDashboardStats);

// Users
router.route('/users')
  .get(getUsers);
router.route('/users/:id')
  .put(updateUser);

// Doctors
router.route('/doctors')
  .get(getDoctors)
  .post(createDoctor);
router.route('/doctors/:id')
  .put(updateDoctor)
  .delete(deleteDoctor);

// Appointments
router.route('/appointments')
  .get(getAppointments);
router.route('/appointments/:id/status')
  .put(updateAppointmentStatus);
router.get('/appointments/:id/available-doctors', getAvailableDoctorsForReschedule);
router.put('/appointments/:id/reschedule', rescheduleAppointment);

// Bills
router.route('/bills')
  .get(getBills);

// Medical Records
router.route('/records')
  .get(getRecords);

// Medicines
router.route('/medicines')
  .get(getMedicines)
  .post(createMedicine);
router.route('/medicines/:id')
  .put(updateMedicine)
  .delete(deleteMedicine);

// Shift Requests
router.route('/shift-requests')
  .get(getAllShiftRequests);
router.route('/shift-requests/:id/status')
  .put(updateShiftRequestStatus);
router.route('/doctors/:doctorId/schedule')
  .get(getDoctorSchedule);

module.exports = router;
