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
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
