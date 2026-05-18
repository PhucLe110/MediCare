const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thuốc'],
    unique: true
  },
  dosage: {
    type: String,
    required: [true, 'Vui lòng nhập hàm lượng/liều lượng']
  },
  unit: {
    type: String,
    default: 'Viên',
    enum: ['Viên', 'Lọ', 'Tuýp', 'Gói', 'Ống', 'Chai']
  },
  stock: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng tồn kho'],
    default: 100
  },
  expiry: {
    type: String,
    required: [true, 'Vui lòng nhập hạn sử dụng']
  },
  status: {
    type: String,
    enum: ['normal', 'low', 'expiring'],
    default: 'normal'
  },
  unitPrice: {
    type: Number,
    required: [true, 'Vui lòng nhập đơn giá'],
    default: 1000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
