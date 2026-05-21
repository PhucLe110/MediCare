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
  tests: [{
    testName: {
      type: String,
      required: [true, 'Vui lòng nhập tên xét nghiệm'],
      trim: true
    },
    testType: {
      type: String,
      enum: ['blood', 'urine', 'xray', 'mri', 'ct', 'ultrasound', 'ecg', 'other'],
      default: 'other'
    }
  }],
  notes: {
    type: String,
    default: ''
  },
  files: [{
    fileUrl: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'ready'],
    default: 'ready'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabResult', labResultSchema);
