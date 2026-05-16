const LabRequest = require('../models/LabRequest');
const LabResult = require('../models/LabResult');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { addLabFeeToBill } = require('./billingController');

const POPULATE_REQUEST = [
  { path: 'patient', select: 'fullName patientId phone' },
  { path: 'doctor', select: 'fullName' },
  { path: 'appointment', select: 'date time' },
  { path: 'result' }
];

// @desc    Doctor creates a lab test request
// @route   POST /api/lab-requests
// @access  Private (doctor/admin)
exports.createLabRequest = async (req, res) => {
  try {
    const { patientId, appointmentId, testName, testType, clinicalNotes, urgency } = req.body;

    // Resolve patient
    let patient = await User.findOne({ patientId }).select('_id fullName patientId');
    if (!patient) patient = await User.findById(patientId).select('_id fullName patientId');
    if (!patient) {
      return res.status(404).json({ success: false, message: `Không tìm thấy bệnh nhân với mã: ${patientId}` });
    }

    const request = await LabRequest.create({
      patient: patient._id,
      doctor: req.user._id,
      appointment: appointmentId || null,
      testName,
      testType: testType || 'blood',
      clinicalNotes,
      urgency: urgency || 'normal'
    });

    await request.populate(POPULATE_REQUEST);

    res.status(201).json({ success: true, message: 'Đã gửi yêu cầu xét nghiệm thành công!', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lab staff gets all pending/in_progress requests
// @route   GET /api/lab-requests/pending
// @access  Private (lab_staff/admin)
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await LabRequest.find({ status: { $in: ['pending', 'in_progress'] } })
      .populate(POPULATE_REQUEST)
      .sort({ urgency: -1, createdAt: 1 }); // urgent first, oldest first

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all requests (history)
// @route   GET /api/lab-requests
// @access  Private (doctor sees own, admin/lab sees all)
exports.getAllRequests = async (req, res) => {
  try {
    const filter = req.user.role === 'doctor' ? { doctor: req.user._id } : {};
    const requests = await LabRequest.find(filter)
      .populate(POPULATE_REQUEST)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lab staff marks a request as in_progress
// @route   PATCH /api/lab-requests/:id/start
// @access  Private (lab_staff)
exports.startRequest = async (req, res) => {
  try {
    const request = await LabRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'in_progress' },
      { new: true }
    ).populate(POPULATE_REQUEST);

    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu.' });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lab staff uploads result and closes the request
// @route   POST /api/lab-requests/:id/complete
// @access  Private (lab_staff)
exports.completeRequest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng đính kèm file kết quả.' });
    }

    const request = await LabRequest.findById(req.params.id).populate('patient doctor');
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu.' });

    const { notes } = req.body;

    // Create LabResult
    const labResult = await LabResult.create({
      patient: request.patient._id,
      appointment: request.appointment,
      uploadedBy: req.user._id,
      testName: request.testName,
      testType: request.testType,
      notes: notes || '',
      fileUrl: `/uploads/lab-results/${req.file.filename}`,
      fileName: req.file.originalname
    });

    // Update request status
    request.status = 'completed';
    request.result = labResult._id;
    await request.save();

    // Add lab fee to bill (Fixed 200,000 VNĐ for lab tests)
    if (request.appointment) {
      await addLabFeeToBill(request.appointment, request.testName, 200000);
    }

    await request.populate(POPULATE_REQUEST);

    res.status(200).json({
      success: true,
      message: `Kết quả xét nghiệm đã được gửi tới bệnh nhân ${request.patient.fullName}.`,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
