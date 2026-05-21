const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');
const LabRequest = require('../models/LabRequest');
const HttpError = require('./httpError');
const { CONSULTATION_FEE, LAB_FEE_PER_TEST } = require('../constants/billing');

const getBill = (appointmentId, billType) => {
  return Bill.findOne({ appointment: appointmentId, billType });
};

const getAmountDue = (bill) => {
  if (!bill) return 0;
  const total = bill.totalAmount || 0;
  const paid = bill.paidAmount || 0;
  return Math.max(0, total - paid);
};

const createBill = async (appointmentId, patientId, billType, items) => {
  const existing = await getBill(appointmentId, billType);
  if (existing) return existing;

  return Bill.create({
    appointment: appointmentId,
    patient: patientId,
    billType,
    items,
    status: 'unpaid',
    paidAmount: 0
  });
};

const createConsultationBill = (appointmentId, patientId) => {
  return createBill(appointmentId, patientId, 'consultation', [{
    type: 'consultation',
    description: 'Phí khám bệnh',
    amount: CONSULTATION_FEE
  }]);
};

/** Thêm đợt XN vào bill lab — kể cả khi đã trả đợt trước (mở thêm khoản cần trả) */
const createLabBill = async (appointmentId, patientId, tests) => {
  const totalFee = tests.length * LAB_FEE_PER_TEST;
  const testNames = tests.map(t => t.testName).join(', ');
  const batchTag = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const description = `Xét nghiệm (${batchTag}): ${testNames}`;

  let bill = await getBill(appointmentId, 'lab');
  if (bill) {
    if (!bill.items.some(i => i.description === description)) {
      bill.items.push({ type: 'lab_test', description, amount: totalFee });
      if (bill.status === 'paid') {
        bill.status = 'unpaid';
      }
      await bill.save();
    }
    return bill;
  }

  return createBill(appointmentId, patientId, 'lab', [{
    type: 'lab_test',
    description,
    amount: totalFee
  }]);
};

const createMedicineBill = async (appointmentId, patientId, prescription) => {
  const medicineCost = prescription?.totalMedicineCost || 0;
  if (medicineCost <= 0) return null;

  const medicineNames = prescription.medicines?.map(m => m.name).join(', ') || 'Đơn thuốc';
  return createBill(appointmentId, patientId, 'medicine', [{
    type: 'medicine',
    description: `Đơn thuốc: ${medicineNames}`,
    amount: medicineCost
  }]);
};

const onBillPaid = async (bill) => {
  if (bill.billType === 'consultation' && bill.appointment) {
    await Appointment.findByIdAndUpdate(bill.appointment, {
      status: 'confirmed',
      paymentStatus: 'paid'
    });
  }

  if (bill.billType === 'lab' && bill.appointment) {
    await LabRequest.updateMany(
      { appointment: bill.appointment, paymentStatus: 'unpaid' },
      { $set: { paymentStatus: 'paid' } }
    );
  }
};

/** Ghi nhận thanh toán (webhook / thủ công) — hỗ trợ trả bổ sung phí XN */
const applyBillPayment = async (bill, amountReceived) => {
  const due = getAmountDue(bill);
  if (Math.abs(due - amountReceived) > 500) {
    return false;
  }

  bill.paidAmount = (bill.paidAmount || 0) + amountReceived;
  if (bill.paidAmount >= bill.totalAmount - 1) {
    bill.paidAmount = bill.totalAmount;
    bill.status = 'paid';
    bill.paidAt = new Date();
  }
  await bill.save();
  await onBillPaid(bill);
  return true;
};

const isBillPaid = async (appointmentId, billType) => {
  const bill = await getBill(appointmentId, billType);
  return bill?.status === 'paid' && getAmountDue(bill) <= 0;
};

module.exports = {
  getBill,
  getAmountDue,
  createBill,
  createConsultationBill,
  createLabBill,
  createMedicineBill,
  onBillPaid,
  applyBillPayment,
  isBillPaid
};
