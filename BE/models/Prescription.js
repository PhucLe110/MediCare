const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: '' },         // VD: 500mg
  frequency: { type: String, default: '' },      // VD: 2 lần/ngày
  duration: { type: String, default: '' },       // VD: 7 ngày
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },       // đơn giá (VNĐ)
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true  // 1 ca khám -> 1 đơn thuốc
  },
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
  medicines: [medicineSchema],
  diagnosis: { type: String, default: '' },       // Chẩn đoán
  doctorNotes: { type: String, default: '' },      // Lời dặn bác sĩ
  totalMedicineCost: { type: Number, default: 0 }, // Tổng tiền thuốc
  status: {
    type: String,
    enum: ['draft', 'issued'],
    default: 'issued'
  }
}, { timestamps: true });

// Auto-calculate total cost before saving
prescriptionSchema.pre('save', function() {
  this.totalMedicineCost = this.medicines.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
