const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // HH:mm
    required: true
  },
  symptoms: {
    type: String
  },
  ticketNumber: {
    type: String
  },
  queueNumber: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending_payment', 'pending', 'confirmed', 'examining', 'completed', 'cancelled'],
    default: 'pending_payment'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  parentAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  draft: {
    diagnosis: { type: String, default: '' },
    doctorNotes: { type: String, default: '' },
    medicines: { type: Array, default: [] },
    labTests: { type: Array, default: [] },
    requireFollowUp: { type: Boolean, default: false },
    followUpDate: { type: String, default: '' },
    followUpTime: { type: String, default: '' },
    followUpNotes: { type: String, default: '' },
    savedAt: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
