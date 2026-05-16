const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['consultation', 'medicine', 'lab_test'],
    required: true
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const billSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true  // 1 ca khám -> 1 hóa đơn
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [billItemSchema],
  totalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paidAt: { type: Date, default: null }
}, { timestamps: true });

// Auto-calculate totalAmount
billSchema.pre('save', function() {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
});

module.exports = mongoose.model('Bill', billSchema);
