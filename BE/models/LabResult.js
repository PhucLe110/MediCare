const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lab staff account
    required: true
  },
  testName: {
    type: String,
    required: [true, 'Vui lòng nhập tên xét nghiệm'],
    trim: true
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'xray', 'mri', 'ct', 'ultrasound', 'ecg', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    required: true  // Path to uploaded PDF
  },
  fileName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'ready'],
    default: 'ready'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabResult', labResultSchema);
