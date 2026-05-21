const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');
const HttpError = require('../utils/httpError');
const { createMedicineBill, applyBillPayment, getBill } = require('../utils/billHelper');

const POPULATE_PRESCRIPTION = [
  { path: 'appointment', populate: { path: 'doctor', populate: { path: 'userId', select: 'fullName' } } },
  { path: 'doctor', select: 'fullName' }
];

const getMyPrescriptions = async (patientId) => {
  return Prescription.find({ patient: patientId })
    .populate(POPULATE_PRESCRIPTION)
    .sort({ createdAt: -1 });
};

const createPrescription = async (doctorId, { appointmentId, medicines, diagnosis, doctorNotes }) => {
  const appointment = await Appointment.findById(appointmentId).populate('patient');
  if (!appointment) throw new HttpError(404, 'Không tìm thấy ca khám.');

  let prescription = await Prescription.findOne({ appointment: appointmentId });
  if (prescription) {
    prescription.medicines = medicines;
    prescription.diagnosis = diagnosis;
    prescription.doctorNotes = doctorNotes;
  } else {
    prescription = new Prescription({
      appointment: appointmentId,
      patient: appointment.patient._id,
      doctor: doctorId,
      medicines,
      diagnosis,
      doctorNotes
    });
  }
  await prescription.save();

  if (prescription.totalMedicineCost > 0) {
    await createMedicineBill(appointmentId, appointment.patient._id, prescription);
  }

  await prescription.populate(POPULATE_PRESCRIPTION);
  return prescription;
};

const getMyBills = async (patientId) => {
  return Bill.find({ patient: patientId })
    .populate({
      path: 'appointment',
      populate: { path: 'doctor', select: 'department specialty', populate: { path: 'userId', select: 'fullName' } }
    })
    .sort({ createdAt: -1 });
};

const markBillAsPaid = async (billId) => {
  const bill = await Bill.findById(billId);
  if (!bill) throw new HttpError(404, 'Không tìm thấy hóa đơn.');

  const ok = await applyBillPayment(bill, bill.totalAmount - (bill.paidAmount || 0));
  if (!ok) throw new HttpError(400, 'Số tiền thanh toán không khớp hóa đơn.');
  return bill;
};

const createInitialBill = async (appointmentId, patientId) => {
  const { createConsultationBill } = require('../utils/billHelper');
  return createConsultationBill(appointmentId, patientId);
};

const getPaymentInfo = () => ({
  bankId: process.env.BANK_ID || 'MB',
  accountNo: process.env.BANK_ACCOUNT || '0973566159',
  accountName: process.env.BANK_ACCOUNT_NAME || 'ModernHospital'
});

module.exports = {
  getMyPrescriptions,
  createPrescription,
  getMyBills,
  markBillAsPaid,
  createInitialBill,
  getPaymentInfo,
  getBill
};
