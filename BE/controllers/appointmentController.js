const asyncHandler = require("../utils/asyncHandler");
const appointmentService = require("../services/appointmentService");

exports.getDoctors = asyncHandler(async (req, res) => {
  const data = await appointmentService.getDoctors();
  res.status(200).json({ success: true, data });
});

exports.getDoctorAvailability = asyncHandler(async (req, res) => {
  const data = await appointmentService.getDoctorAvailability(
    req.params.doctorId,
    req.query.date,
  );
  res.status(200).json({ success: true, data });
});

exports.bookAppointment = asyncHandler(async (req, res) => {
  const { appointment, consultationBill } =
    await appointmentService.bookAppointment(req.user._id, req.body);
  res.status(201).json({
    success: true,
    data: { appointment, consultationBill },
  });
});

exports.getMyAppointments = asyncHandler(async (req, res) => {
  const data = await appointmentService.getMyAppointments(req.user._id);
  res.status(200).json({ success: true, data });
});
