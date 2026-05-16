const LabResult = require('../models/LabResult');
const User = require('../models/User');
const path = require('path');

// @desc    Lab staff uploads a result for a patient
// @route   POST /api/lab-results
// @access  Private (lab/admin role only)
exports.uploadLabResult = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng đính kèm file kết quả xét nghiệm.' });
    }

    const { patientId, testName, testType, notes, appointmentId } = req.body;

    // Find patient by patientId code (e.g. BN000001) or _id
    let patient = await User.findOne({ patientId }).select('_id fullName patientId');
    if (!patient) {
      patient = await User.findById(patientId).select('_id fullName patientId');
    }
    if (!patient) {
      return res.status(404).json({ success: false, message: `Không tìm thấy bệnh nhân với mã: ${patientId}` });
    }

    const labResult = await LabResult.create({
      patient: patient._id,
      appointment: appointmentId || null,
      uploadedBy: req.user._id,
      testName,
      testType: testType || 'other',
      notes,
      fileUrl: `/uploads/lab-results/${req.file.filename}`,
      fileName: req.file.originalname
    });

    await labResult.populate('uploadedBy', 'fullName');

    res.status(201).json({
      success: true,
      message: `Đã gửi kết quả xét nghiệm tới bệnh nhân ${patient.fullName} thành công.`,
      data: labResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Patient gets their own lab results
// @route   GET /api/lab-results/my
// @access  Private (patient)
exports.getMyLabResults = async (req, res) => {
  try {
    const results = await LabResult.find({ patient: req.user._id })
      .populate('uploadedBy', 'fullName')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Doctor/Admin gets lab results for a specific patient
// @route   GET /api/lab-results/patient/:patientUserId
// @access  Private (doctor/admin)
exports.getPatientLabResults = async (req, res) => {
  try {
    const results = await LabResult.find({ patient: req.params.patientUserId })
      .populate('uploadedBy', 'fullName')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all lab results (admin/lab)
// @route   GET /api/lab-results
// @access  Private (admin/lab)
exports.getAllLabResults = async (req, res) => {
  try {
    const results = await LabResult.find()
      .populate('patient', 'fullName patientId')
      .populate('uploadedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
