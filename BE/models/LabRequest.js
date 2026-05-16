const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  testName: {
    type: String,
    required: [true, 'Vui lòng nhập tên xét nghiệm'],
    trim: true
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'xray', 'mri', 'ct', 'ultrasound', 'ecg', 'other'],
    default: 'blood'
  },
  clinicalNotes: {
    type: String,  // Ghi chú lâm sàng từ bác sĩ
    default: ''
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  result: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabResult',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabRequest', labRequestSchema);
