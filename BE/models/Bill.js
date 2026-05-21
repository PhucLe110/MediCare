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
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  /** consultation | lab | medicine — tối đa 3 hóa đơn / ca khám */
  billType: {
    type: String,
    enum: ['consultation', 'lab', 'medicine'],
    required: true
  },
  items: [billItemSchema],
  totalAmount: { type: Number, default: 0 },
  /** Số tiền đã thanh toán (dùng khi bổ sung thêm mục XN sau lần trả trước) */
  paidAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paidAt: { type: Date, default: null },
  paymentDetails: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

billSchema.index({ appointment: 1, billType: 1 }, { unique: true });

billSchema.pre('save', function() {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
});

module.exports = mongoose.model('Bill', billSchema);
