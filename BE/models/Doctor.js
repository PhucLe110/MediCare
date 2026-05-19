const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 5.0
  },
  consultationFee: {
    type: Number,
    default: 150000
  },
  availableSlots: [{
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    times: [{ type: String, required: true }] // Format: HH:mm
  }],
  shiftPattern: {
    type: String,
    enum: ['T2-T3-T4', 'T5-T6-T7', 'T2-T4-T6', 'T3-T5-T7', 'Cả tuần'],
    default: 'Cả tuần'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
