const mongoose = require('mongoose');

const shiftRequestSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  type: {
    type: String,
    enum: ['add', 'cancel'],
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  times: {
    type: [String], // Array of HH:mm
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ShiftRequest', shiftRequestSchema);
