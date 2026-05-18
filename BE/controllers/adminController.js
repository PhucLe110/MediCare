const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Prescription = require('../models/Prescription');
const LabResult = require('../models/LabResult');
const LabRequest = require('../models/LabRequest');
const bcrypt = require('bcryptjs');

// Helper to get weekday name from date
const getWeekdayName = (dateStr) => {
  const date = new Date(dateStr);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const paidBills = await Bill.find({ status: 'paid' });
    const totalRevenue = paidBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

    // Weekly Chart Data
    // Get last 7 days starting from today
    const chartMap = {};
    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    
    // Initialize days
    daysOfWeek.forEach(day => {
      chartMap[day] = { name: day, revenue: 0, appointments: 0 };
    });

    const appointments = await Appointment.find();
    appointments.forEach(app => {
      const day = getWeekdayName(app.date);
      if (chartMap[day]) {
        chartMap[day].appointments += 1;
      }
    });

    const bills = await Bill.find({ status: 'paid' }).populate('appointment');
    bills.forEach(bill => {
      if (bill.appointment && bill.appointment.date) {
        const day = getWeekdayName(bill.appointment.date);
        if (chartMap[day]) {
          chartMap[day].revenue += bill.totalAmount || 0;
        }
      }
    });

    const revenueData = daysOfWeek.map(day => chartMap[day]);

    // Department Stats
    const deptMap = {};
    const populatedApps = await Appointment.find().populate({
      path: 'doctor',
      select: 'department'
    });

    populatedApps.forEach(app => {
      if (app.doctor && app.doctor.department) {
        const dept = app.doctor.department;
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      }
    });

    const departmentData = Object.keys(deptMap).map(name => ({
      name,
      count: deptMap[name]
    })).sort((a, b) => b.count - a.count);

    // Top Doctors Performance
    const docMap = {};
    populatedApps.forEach(app => {
      if (app.doctor) {
        const docId = app.doctor._id.toString();
        docMap[docId] = (docMap[docId] || 0) + 1;
      }
    });

    const doctors = await Doctor.find().populate('userId', 'fullName');
    const doctorPerformances = doctors.map(doc => {
      const count = docMap[doc._id.toString()] || 0;
      return {
        id: doc._id,
        fullName: doc.userId?.fullName || 'Bác sĩ ẩn danh',
        department: doc.department,
        count: count,
        rating: doc.rating || 5.0
      };
    }).sort((a, b) => b.count - a.count).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          patients: totalPatients,
          doctors: totalDoctors,
          appointments: totalAppointments,
          revenue: totalRevenue
        },
        revenueData,
        departmentData,
        doctorPerformances
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { role, status, fullName, email, phone } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'fullName email phone status gender');
    
    // Get all appointments to count
    const appointments = await Appointment.find({ status: { $ne: 'cancelled' } });
    
    // Map doctor appointments count
    const doctorApptCounts = {};
    appointments.forEach(app => {
      if (app.doctor) {
        const docId = app.doctor.toString();
        doctorApptCounts[docId] = (doctorApptCounts[docId] || 0) + 1;
      }
    });

    const doctorsWithCount = doctors.map(doc => {
      const docObj = doc.toObject();
      docObj.monthlyAppointmentsCount = doctorApptCounts[doc._id.toString()] || 0;
      return docObj;
    });

    res.status(200).json({ success: true, data: doctorsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a doctor
// @route   POST /api/admin/doctors
// @access  Private/Admin
exports.createDoctor = async (req, res) => {
  try {
    const { fullName, email, password, phone, department, specialty, experience, consultationFee } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: 'doctor'
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      userId: user._id,
      department,
      specialty,
      experience,
      consultationFee: consultationFee || 150000,
      availableSlots: [
        {
          date: new Date().toISOString().split('T')[0],
          times: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00']
        }
      ]
    });

    await doctor.populate('userId', 'fullName email phone status');

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    console.error('Create Doctor Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private/Admin
exports.updateDoctor = async (req, res) => {
  try {
    const { fullName, email, phone, department, specialty, experience, consultationFee, status } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ' });

    // Update Doctor profile
    doctor.department = department || doctor.department;
    doctor.specialty = specialty || doctor.specialty;
    doctor.experience = experience || doctor.experience;
    doctor.consultationFee = consultationFee || doctor.consultationFee;
    await doctor.save();

    // Update User profile
    const userUpdates = {};
    if (fullName) userUpdates.fullName = fullName;
    if (email) userUpdates.email = email;
    if (phone) userUpdates.phone = phone;
    if (status) userUpdates.status = status;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(doctor.userId, userUpdates);
    }

    await doctor.populate('userId', 'fullName email phone status');

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ' });

    // Remove doctor profile
    await Doctor.findByIdAndDelete(req.params.id);

    // Update associated user role to patient, or delete? Change to patient so they can still login as patient
    await User.findByIdAndUpdate(doctor.userId, { role: 'patient' });

    res.status(200).json({ success: true, message: 'Đã xóa bác sĩ thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private/Admin
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'fullName email phone')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/admin/appointments/:id/status
// @access  Private/Admin
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, date, time } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (date) updates.date = date;
    if (time) updates.time = time;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('patient', 'fullName email phone')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'fullName' }
      });

    if (!appointment) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khám' });

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bills
// @route   GET /api/admin/bills
// @access  Private/Admin
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('patient', 'fullName email phone')
      .populate({
        path: 'appointment',
        populate: {
          path: 'doctor',
          populate: { path: 'userId', select: 'fullName' }
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all medical records (prescriptions + lab results)
// @route   GET /api/admin/records
// @access  Private/Admin
exports.getRecords = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient', 'fullName email patientId')
      .populate({
        path: 'appointment',
        populate: { path: 'doctor', populate: { path: 'userId', select: 'fullName' } }
      });

    const labResults = await LabResult.find()
      .populate('patient', 'fullName email patientId')
      .populate('labRequest');

    res.status(200).json({
      success: true,
      data: {
        prescriptions,
        labResults
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available doctors of the same specialty with < 3 appointments for a reschedule slot
// @route   GET /api/admin/appointments/:id/available-doctors
// @access  Private/Admin
exports.getAvailableDoctorsForReschedule = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctor');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ca khám' });
    }

    const date = req.query.date || appointment.date;
    const time = req.query.time || appointment.time;
    const currentDoctor = appointment.doctor;
    if (!currentDoctor) {
      return res.status(400).json({ success: false, message: 'Ca khám này chưa có bác sĩ phụ trách' });
    }

    const { department, specialty } = currentDoctor;

    // Find all doctors of the same department and specialty
    const doctors = await Doctor.find({ department, specialty }).populate('userId', 'fullName email phone');

    const result = [];
    for (const doc of doctors) {
      const apptCount = await Appointment.countDocuments({
        doctor: doc._id,
        date,
        time,
        status: { $ne: 'cancelled' }
      });

      result.push({
        _id: doc._id,
        fullName: doc.userId?.fullName || 'BS. Ẩn danh',
        department: doc.department,
        specialty: doc.specialty,
        currentAppointmentsCount: apptCount,
        isAvailable: apptCount < 3 // "số ca nhận trong khung đó ít hơn 3"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        date,
        time,
        department,
        specialty,
        doctors: result
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reschedule appointment (change doctor or change date/time slot)
// @route   PUT /api/admin/appointments/:id/reschedule
// @access  Private/Admin
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ca khám' });
    }

    const targetDoctorId = doctorId || appointment.doctor;
    const targetDate = date || appointment.date;
    const targetTime = time || appointment.time;

    // Validate that the slot is not full (Max 5 patients per time slot)
    const apptCount = await Appointment.countDocuments({
      doctor: targetDoctorId,
      date: targetDate,
      time: targetTime,
      status: { $ne: 'cancelled' }
    });

    if (apptCount >= 5) {
      return res.status(400).json({ success: false, message: 'Khung giờ của bác sĩ này đã vượt quá giới hạn 5 bệnh nhân!' });
    }

    const newQueueNumber = apptCount + 1;

    appointment.doctor = targetDoctorId;
    appointment.date = targetDate;
    appointment.time = targetTime;
    appointment.queueNumber = newQueueNumber;
    appointment.status = 'confirmed'; // Auto-confirm when coordinated

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'fullName email phone')
      .populate({
        path: 'doctor',
        populate: { path: 'userId', select: 'fullName' }
      });

    res.status(200).json({ success: true, data: populatedAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/admin/medicines
// @access  Private/Admin
exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a medicine
// @route   POST /api/admin/medicines
// @access  Private/Admin
exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a medicine
// @route   PUT /api/admin/medicines/:id
// @access  Private/Admin
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thuốc' });
    }
    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a medicine
// @route   DELETE /api/admin/medicines/:id
// @access  Private/Admin
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thuốc' });
    }
    res.status(200).json({ success: true, message: 'Đã xóa thuốc thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

