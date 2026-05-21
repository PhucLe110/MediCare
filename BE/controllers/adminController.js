const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/admin');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardStats();
  res.status(200).json({ success: true, data });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const data = await adminService.getUsers();
  res.status(200).json({ success: true, data });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const data = await adminService.updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

exports.getDoctors = asyncHandler(async (req, res) => {
  const data = await adminService.getDoctors();
  res.status(200).json({ success: true, data });
});

exports.createDoctor = asyncHandler(async (req, res) => {
  const data = await adminService.createDoctor(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateDoctor = asyncHandler(async (req, res) => {
  const data = await adminService.updateDoctor(req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

exports.deleteDoctor = asyncHandler(async (req, res) => {
  const result = await adminService.deleteDoctor(req.params.id);
  res.status(200).json({ success: true, message: result.message });
});

exports.getAppointments = asyncHandler(async (req, res) => {
  const data = await adminService.getAppointments();
  res.status(200).json({ success: true, data });
});

exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const data = await adminService.updateAppointmentStatus(req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

exports.getBills = asyncHandler(async (req, res) => {
  const data = await adminService.getBills();
  res.status(200).json({ success: true, data });
});

exports.getRecords = asyncHandler(async (req, res) => {
  const data = await adminService.getRecords();
  res.status(200).json({ success: true, data });
});

exports.getAvailableDoctorsForReschedule = asyncHandler(async (req, res) => {
  const data = await adminService.getAvailableDoctorsForReschedule(req.params.id, req.query);
  res.status(200).json({ success: true, data });
});

exports.rescheduleAppointment = asyncHandler(async (req, res) => {
  const data = await adminService.rescheduleAppointment(req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

exports.getMedicines = asyncHandler(async (req, res) => {
  const { medicines, count } = await adminService.getMedicines();
  res.status(200).json({ success: true, count, data: medicines });
});

exports.createMedicine = asyncHandler(async (req, res) => {
  const data = await adminService.createMedicine(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateMedicine = asyncHandler(async (req, res) => {
  const data = await adminService.updateMedicine(req.params.id, req.body);
  res.status(200).json({ success: true, data });
});

exports.deleteMedicine = asyncHandler(async (req, res) => {
  const result = await adminService.deleteMedicine(req.params.id);
  res.status(200).json({ success: true, message: result.message });
});

exports.getAllShiftRequests = asyncHandler(async (req, res) => {
  const data = await adminService.getAllShiftRequests();
  res.status(200).json({ success: true, data });
});

exports.getDoctorSchedule = asyncHandler(async (req, res) => {
  const data = await adminService.getDoctorSchedule(req.params.doctorId, req.query);
  res.status(200).json({ success: true, data });
});

exports.updateShiftRequestStatus = asyncHandler(async (req, res) => {
  const data = await adminService.updateShiftRequestStatus(req.params.id, req.body);
  res.status(200).json({ success: true, data });
});
