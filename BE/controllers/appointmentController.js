const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors and their available slots
// @route   GET /api/appointments/doctors
// @access  Private
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'fullName email phone gender');
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor availability for a specific date
// @route   GET /api/appointments/doctors/:doctorId/availability?date=YYYY-MM-DD
// @access  Private
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ngày khám' });

    // Check if date is in the past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(200).json({ success: true, data: [] });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ' });

    // Determine weekday of the date
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Bệnh viện không làm việc chủ nhật
    if (dayOfWeek === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Map shiftPattern to working days
    // 'T2-T3-T4' -> 1, 2, 3
    // 'T5-T6-T7' -> 4, 5, 6
    // 'T2-T4-T6' -> 1, 3, 5
    // 'T3-T5-T7' -> 2, 4, 6
    // 'Cả tuần' -> 1, 2, 3, 4, 5, 6 (exclude 0)
    const pattern = doctor.shiftPattern || 'Cả tuần';
    let isWorkingDay = false;
    if (pattern === 'Cả tuần') isWorkingDay = true;
    else if (pattern === 'T2-T3-T4' && [1, 2, 3].includes(dayOfWeek)) isWorkingDay = true;
    else if (pattern === 'T5-T6-T7' && [4, 5, 6].includes(dayOfWeek)) isWorkingDay = true;
    else if (pattern === 'T2-T4-T6' && [1, 3, 5].includes(dayOfWeek)) isWorkingDay = true;
    else if (pattern === 'T3-T5-T7' && [2, 4, 6].includes(dayOfWeek)) isWorkingDay = true;

    let baseTimes = isWorkingDay ? ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] : [];

    // Check ShiftRequests for this date
    const ShiftRequest = require('../models/ShiftRequest');
    const shiftRequests = await ShiftRequest.find({ doctor: doctorId, date, status: 'approved' });

    for (const req of shiftRequests) {
      for (const t of (req.times || [])) {
        if (req.type === 'cancel') {
          baseTimes = baseTimes.filter(bt => bt !== t);
        } else if (req.type === 'add') {
          if (!baseTimes.includes(t)) baseTimes.push(t);
        }
      }
    }
    
    // Sort times
    baseTimes.sort();

    // Check capacity for each time
    const Appointment = require('../models/Appointment');
    const availableTimes = [];
    for (const time of baseTimes) {
      const count = await Appointment.countDocuments({ doctor: doctorId, date, time, status: { $ne: 'cancelled' } });
      if (count < 5) {
        availableTimes.push({ time, currentBookings: count }); // Return count if needed for frontend, but mainly just return valid ones
      }
    }

    res.status(200).json({ success: true, data: availableTimes.map(t => t.time) });
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
