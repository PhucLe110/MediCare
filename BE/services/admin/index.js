const dashboard = require('./dashboardService');
const users = require('./userAdminService');
const doctors = require('./doctorAdminService');
const appointments = require('./appointmentAdminService');
const medicines = require('./medicineAdminService');
const shifts = require('./shiftAdminService');

module.exports = {
  getDashboardStats: dashboard.getDashboardStats,
  getUsers: users.getUsers,
  updateUser: users.updateUser,
  getDoctors: doctors.getDoctors,
  createDoctor: doctors.createDoctor,
  updateDoctor: doctors.updateDoctor,
  deleteDoctor: doctors.deleteDoctor,
  getAppointments: appointments.getAppointments,
  updateAppointmentStatus: appointments.updateAppointmentStatus,
  getBills: appointments.getBills,
  getRecords: appointments.getRecords,
  getAvailableDoctorsForReschedule: appointments.getAvailableDoctorsForReschedule,
  rescheduleAppointment: appointments.rescheduleAppointment,
  getMedicines: medicines.getMedicines,
  createMedicine: medicines.createMedicine,
  updateMedicine: medicines.updateMedicine,
  deleteMedicine: medicines.deleteMedicine,
  getAllShiftRequests: shifts.getAllShiftRequests,
  getDoctorSchedule: shifts.getDoctorSchedule,
  updateShiftRequestStatus: shifts.updateShiftRequestStatus
};
