const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors and their available slots
// @route   GET /api/appointments/doctors
// @access  Private
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'fullName email phone');
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, symptoms } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ' });
    }

    // Check if the slot is full (Max 5 patients per time slot)
    const appointmentCount = await Appointment.countDocuments({ doctor: doctorId, date, time });
    if (appointmentCount >= 5) {
      return res.status(400).json({ success: false, message: 'Khung giờ này đã đủ 5 bệnh nhân đặt. Vui lòng chọn khung giờ khác!' });
    }

    const queueNumber = appointmentCount + 1;
    const ticketNumber = `U${Math.floor(100000000 + Math.random() * 900000000)}`;

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
      symptoms,
      queueNumber,
      ticketNumber,
      status: 'confirmed'
    });

    // Auto-create initial bill (consultation fee only)
    // Use lazy require to avoid circular dependency
    const { createInitialBill } = require('./billingController');
    await createInitialBill(appointment._id, req.user._id);

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ date: 1, time: 1 });
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
