const asyncHandler = require('../utils/asyncHandler');
const doctorService = require('../services/doctorService');

exports.getDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorService.getDoctors();
  res.json({ success: true, count: doctors.length, data: doctors });
});

exports.getDoctorProfile = asyncHandler(async (req, res) => {
  const data = await doctorService.getDoctorProfile(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.getDoctorAppointments = asyncHandler(async (req, res) => {
  const data = await doctorService.getDoctorAppointments(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.startExamination = asyncHandler(async (req, res) => {
  const data = await doctorService.startExamination(req.params.appointmentId);
  res.status(200).json({ success: true, data, message: 'Bắt đầu ca khám' });
});

exports.saveDraft = asyncHandler(async (req, res) => {
  await doctorService.saveDraft(req.params.appointmentId, req.body);
  res.status(200).json({ success: true, message: 'Đã lưu nháp ca khám' });
});

exports.completeDiagnosis = asyncHandler(async (req, res) => {
  const data = await doctorService.completeDiagnosis(req.params.appointmentId, req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Hoàn tất chẩn đoán và cập nhật hồ sơ bệnh án thành công!',
    data
  });
});

exports.getPatientHistory = asyncHandler(async (req, res) => {
  const data = await doctorService.getPatientHistory(req.params.patientId);
  res.status(200).json({ success: true, data });
});

exports.getMedicines = asyncHandler(async (req, res) => {
  const medicines = await doctorService.getMedicines();
  res.status(200).json({ success: true, count: medicines.length, data: medicines });
});

exports.createShiftRequest = asyncHandler(async (req, res) => {
  const data = await doctorService.createShiftRequest(req.user._id, req.body);
  res.status(201).json({ success: true, data });
});

exports.getMyShiftRequests = asyncHandler(async (req, res) => {
  const data = await doctorService.getMyShiftRequests(req.user._id);
  res.status(200).json({ success: true, data });
});
