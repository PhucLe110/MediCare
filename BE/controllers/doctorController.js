const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const LabRequest = require('../models/LabRequest');
const Bill = require('../models/Bill');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'fullName email phone');
    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// @desc    Get logged in doctor profile and statistics
// @route   GET /api/doctors/profile
// @access  Private/Doctor
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'fullName email phone gender status');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ bác sĩ' });
    }

    // Stats: Completed appointments count
    const appointments = await Appointment.find({ doctor: doctor._id, status: 'completed' });
    const totalPatients = appointments.length;

    // Stats: Total consultation revenue (Paid bills)
    const appIds = appointments.map(a => a._id);
    const paidBills = await Bill.find({ appointment: { $in: appIds }, status: 'paid' });
    const totalEarnings = paidBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        profile: doctor,
        stats: {
          totalPatients,
          totalEarnings
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments assigned to logged in doctor
// @route   GET /api/doctors/appointments
// @access  Private/Doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ bác sĩ' });
    }

    const appointments = await Appointment.find({ doctor: doctorProfile._id })
      .populate('patient', 'fullName email phone gender dateOfBirth')
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete diagnosis, prescribe medicine and issue lab requests
// @route   POST /api/doctors/diagnose/:appointmentId
// @access  Private/Doctor
exports.completeDiagnosis = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { diagnosis, doctorNotes, medicines, labTests } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ca khám' });
    }

    // Update appointment status
    appointment.status = 'completed';
    await appointment.save();

    // Create prescription if there are medicines or a diagnosis
    let prescription = null;
    if (diagnosis || (medicines && medicines.length > 0)) {
      prescription = await Prescription.create({
        appointment: appointmentId,
        patient: appointment.patient,
        doctor: req.user._id,
        medicines: medicines || [],
        diagnosis: diagnosis || 'Khám chuyên khoa',
        doctorNotes: doctorNotes || '',
        status: 'issued'
      });
    }

    // Create lab requests if specified
    const createdLabRequests = [];
    if (labTests && labTests.length > 0) {
      for (const test of labTests) {
        const lr = await LabRequest.create({
          patient: appointment.patient,
          doctor: req.user._id,
          appointment: appointmentId,
          testName: test.testName,
          testType: test.testType || 'blood',
          clinicalNotes: test.clinicalNotes || '',
          urgency: test.urgency || 'normal',
          status: 'pending'
        });
        createdLabRequests.push(lr);
      }
    }

    // Find and update the associated bill
    let bill = await Bill.findOne({ appointment: appointmentId });
    if (!bill) {
      bill = await Bill.create({
        appointment: appointmentId,
        patient: appointment.patient,
        items: [],
        status: 'unpaid'
      });
    }

    // Start with consultation fee item
    const consultationItem = bill.items.find(item => item.type === 'consultation') || {
      type: 'consultation',
      description: 'Phí khám tư vấn chuyên khoa',
      amount: 150000
    };

    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (doctorProfile) {
      consultationItem.amount = doctorProfile.consultationFee || 150000;
    }

    const newItems = [consultationItem];

    // Add medicines if prescribed
    if (prescription && prescription.totalMedicineCost > 0) {
      newItems.push({
        type: 'medicine',
        description: `Đơn thuốc ca khám #${appointment.ticketNumber || ''}`,
        amount: prescription.totalMedicineCost
      });
    }

    // Add lab tests if requested
    if (createdLabRequests.length > 0) {
      const totalLabCost = createdLabRequests.length * 150000; // Flat fee 150k per test
      newItems.push({
        type: 'lab_test',
        description: `Chỉ định cận lâm sàng (${createdLabRequests.length} xét nghiệm)`,
        amount: totalLabCost
      });
    }

    bill.items = newItems;
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Hoàn tất chẩn đoán và cập nhật hồ sơ bệnh án thành công!',
      data: {
        appointment,
        prescription,
        labRequests: createdLabRequests,
        bill
      }
    });

  } catch (error) {
    console.error('Complete Diagnosis Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient past medical history
// @route   GET /api/doctors/patient-history/:patientId
// @access  Private/Doctor
exports.getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patient: patientId, status: 'completed' })
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ date: -1, time: -1 });

    const history = [];

    for (const app of appointments) {
      const prescription = await Prescription.findOne({ appointment: app._id });
      const labRequests = await LabRequest.find({ appointment: app._id })
        .populate('result');

      history.push({
        appointment: app,
        prescription,
        labRequests
      });
    }

    res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Patient History Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all medicines for prescribing
// @route   GET /api/doctors/medicines
// @access  Private/Doctor
exports.getMedicines = async (req, res) => {
  try {
    const Medicine = require('../models/Medicine');
    const medicines = await Medicine.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a shift request (add or cancel a slot)
// @route   POST /api/doctors/shift-requests
// @access  Private/Doctor
exports.createShiftRequest = async (req, res) => {
  try {
    const { type, date, times } = req.body;
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ bác sĩ' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày' });
    }

    if (!times || times.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một khung giờ' });
    }

    // ---- Calculate current effective schedule for the requested date ----
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) {
      return res.status(400).json({ success: false, message: 'Bệnh viện không làm việc Chủ Nhật' });
    }

    const pattern = doctorProfile.shiftPattern || 'Cả tuần';
    const baseTimes = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];
    let isWorkingDay = false;
    if (pattern === 'Cả tuần') isWorkingDay = true;
    else if (pattern === 'T2-T3-T4' && [1, 2, 3].includes(dayOfWeek)) isWorkingDay = true;
    else if (pattern === 'T5-T6-T7' && [4, 5, 6].includes(dayOfWeek)) isWorkingDay = true;
    else if (pattern === 'T2-T4-T6' && [1, 3, 5].includes(dayOfWeek)) isWorkingDay = true;
    else if (pattern === 'T3-T5-T7' && [2, 4, 6].includes(dayOfWeek)) isWorkingDay = true;

    let currentTimes = isWorkingDay ? [...baseTimes] : [];

    // Apply already-approved shift requests for that date
    const ShiftRequest = require('../models/ShiftRequest');
    const approvedReqs = await ShiftRequest.find({
      doctor: doctorProfile._id,
      date,
      status: 'approved'
    });

    for (const r of approvedReqs) {
      for (const t of (r.times || [])) {
        if (r.type === 'add' && !currentTimes.includes(t)) currentTimes.push(t);
        else if (r.type === 'cancel') currentTimes = currentTimes.filter(x => x !== t);
      }
    }

    // ---- Validate requested times ----
    if (type === 'add') {
      const conflicts = times.filter(t => currentTimes.includes(t));
      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Các khung giờ sau đã có trong lịch trực: ${conflicts.join(', ')}. Không thể thêm trùng.`
        });
      }
    }

    if (type === 'cancel') {
      const notExist = times.filter(t => !currentTimes.includes(t));
      if (notExist.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Các khung giờ sau không có trong lịch trực ngày này: ${notExist.join(', ')}. Không thể hủy.`
        });
      }
    }

    // ---- Create the request ----
    const newRequest = await ShiftRequest.create({
      doctor: doctorProfile._id,
      type,
      date,
      times,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get logged in doctor's shift requests
// @route   GET /api/doctors/shift-requests
// @access  Private/Doctor
exports.getMyShiftRequests = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ bác sĩ' });
    }

    const ShiftRequest = require('../models/ShiftRequest');
    const requests = await ShiftRequest.find({ doctor: doctorProfile._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
