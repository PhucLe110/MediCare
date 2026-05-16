const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');

const CONSULTATION_FEE = 150000;

const POPULATE_PRESCRIPTION = [
  { path: 'appointment', populate: { path: 'doctor', populate: { path: 'userId', select: 'fullName' } } },
  { path: 'doctor', select: 'fullName' }
];

// Sync bill whenever prescription or lab result changes
const syncBill = async (appointmentId, patientId) => {
  const prescription = await Prescription.findOne({ appointment: appointmentId });
  const medicineCost = prescription?.totalMedicineCost || 0;

  let bill = await Bill.findOne({ appointment: appointmentId });

  const items = [
    { type: 'consultation', description: 'Phí khám bệnh', amount: CONSULTATION_FEE }
  ];

  if (medicineCost > 0 && prescription) {
    const medicineNames = prescription.medicines.map(m => m.name).join(', ');
    items.push({
      type: 'medicine',
      description: `Đơn thuốc: ${medicineNames}`,
      amount: medicineCost
    });
  }

  if (bill) {
    // Keep any existing lab_test items
    const existingLabItems = bill.items.filter(i => i.type === 'lab_test');
    bill.items = [...items, ...existingLabItems];
    await bill.save();
  } else {
    bill = await Bill.create({ appointment: appointmentId, patient: patientId, items });
  }

  return bill;
};

// @desc    Patient views own prescriptions
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate(POPULATE_PRESCRIPTION)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Doctor creates/updates prescription for an appointment
const createPrescription = async (req, res) => {
  try {
    const { appointmentId, medicines, diagnosis, doctorNotes } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('patient');
    if (!appointment) return res.status(404).json({ success: false, message: 'Không tìm thấy ca khám.' });

    // Upsert prescription
    let prescription = await Prescription.findOne({ appointment: appointmentId });
    if (prescription) {
      prescription.medicines = medicines;
      prescription.diagnosis = diagnosis;
      prescription.doctorNotes = doctorNotes;
    } else {
      prescription = new Prescription({
        appointment: appointmentId,
        patient: appointment.patient._id,
        doctor: req.user._id,
        medicines,
        diagnosis,
        doctorNotes
      });
    }
    await prescription.save();

    // Sync Bill — update or create medicine line item
    await syncBill(appointmentId, appointment.patient._id);

    await prescription.populate(POPULATE_PRESCRIPTION);
    res.status(201).json({ success: true, message: 'Đã lưu đơn thuốc thành công.', data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Patient views own bills
const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ patient: req.user._id })
      .populate({
        path: 'appointment',
        populate: { path: 'doctor', select: 'department specialty', populate: { path: 'userId', select: 'fullName' } }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a bill as paid (admin/cashier action)
const markBillAsPaid = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date() },
      { new: true }
    );
    if (!bill) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });
    if (bill.appointment) {
      await Appointment.findByIdAndUpdate(bill.appointment, { paymentStatus: 'paid' });
    }
    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create initial bill when appointment is booked (consultation fee only)
const createInitialBill = async (appointmentId, patientId) => {
  const existing = await Bill.findOne({ appointment: appointmentId });
  if (existing) return existing;

  return await Bill.create({
    appointment: appointmentId,
    patient: patientId,
    items: [{ type: 'consultation', description: 'Phí khám bệnh', amount: CONSULTATION_FEE }]
  });
};

// Add lab fee to an existing bill (called when lab request is completed)
const addLabFeeToBill = async (appointmentId, testName, fee) => {
  const bill = await Bill.findOne({ appointment: appointmentId });
  if (!bill) return;
  // Avoid duplicate entries
  const alreadyExists = bill.items.some(i => i.type === 'lab_test' && i.description.includes(testName));
  if (!alreadyExists) {
    bill.items.push({ type: 'lab_test', description: `Xét nghiệm: ${testName}`, amount: fee });
    await bill.save();
  }
};

// Get hospital bank info for payment
const getPaymentInfo = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      bankId: process.env.BANK_ID || 'MB',
      accountNo: process.env.BANK_ACCOUNT || '0973566159',
      accountName: process.env.BANK_ACCOUNT_NAME || 'ModernHospital'
    }
  });
};

module.exports = {
  getMyPrescriptions,
  createPrescription,
  getMyBills,
  markBillAsPaid,
  createInitialBill,
  addLabFeeToBill,
  syncBill,
  getPaymentInfo
};
