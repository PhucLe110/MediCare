const LabRequest = require('../models/LabRequest');
const LabResult = require('../models/LabResult');
const Bill = require('../models/Bill');
const HttpError = require('../utils/httpError');
const { resolvePatient } = require('../utils/patient');
const { createLabBill, getAmountDue } = require('../utils/billHelper');
const { LAB_FEE_PER_TEST } = require('../constants/billing');

const POPULATE_REQUEST = [
  { path: 'patient', select: 'fullName patientId phone' },
  { path: 'doctor', select: 'fullName' },
  { path: 'appointment', select: 'date time' },
  { path: 'result' },
  { path: 'bill', select: 'status totalAmount billType paidAmount' }
];

const createLabRequest = async (doctorId, { patientId, appointmentId, tests }) => {
  if (!tests?.length) {
    throw new HttpError(400, 'Danh sách xét nghiệm không được trống.');
  }

  const patient = await resolvePatient(patientId);

  let bill = null;
  if (appointmentId) {
    bill = await createLabBill(appointmentId, patient._id, tests);
  }

  const request = await LabRequest.create({
    patient: patient._id,
    doctor: doctorId,
    appointment: appointmentId || null,
    bill: bill?._id || null,
    tests,
    status: 'pending',
    paymentStatus: 'unpaid'
  });

  await request.populate(POPULATE_REQUEST);
  return request;
};

const getPendingRequests = async () => {
  return LabRequest.find({ status: { $in: ['pending', 'in_progress'] } })
    .populate(POPULATE_REQUEST)
    .sort({ createdAt: 1 });
};

const getAllRequests = async (user, appointmentId) => {
  const filter = user.role === 'doctor' ? { doctor: user._id } : {};
  if (appointmentId) filter.appointment = appointmentId;

  return LabRequest.find(filter)
    .populate(POPULATE_REQUEST)
    .sort({ createdAt: -1 });
};

const startRequest = async (requestId) => {
  const request = await LabRequest.findById(requestId).populate('bill');
  if (!request) throw new HttpError(404, 'Không tìm thấy yêu cầu.');

  if (request.paymentStatus !== 'paid') {
    throw new HttpError(402, 'Bệnh nhân chưa thanh toán phí xét nghiệm cho đợt chỉ định này. Vui lòng nhắc bệnh nhân thanh toán trước khi tiến hành.');
  }

  request.status = 'in_progress';
  await request.save();
  await request.populate(POPULATE_REQUEST);
  return request;
};

const completeRequest = async (requestId, uploadedBy, { notes, files }) => {
  if (!files?.length) {
    throw new HttpError(400, 'Vui lòng đính kèm ít nhất 1 file kết quả.');
  }

  const request = await LabRequest.findById(requestId).populate('patient doctor bill');
  if (!request) throw new HttpError(404, 'Không tìm thấy yêu cầu.');

  if (request.paymentStatus !== 'paid') {
    throw new HttpError(402, 'Bệnh nhân chưa thanh toán phí xét nghiệm cho đợt chỉ định này.');
  }

  const filesData = files.map(file => ({
    fileUrl: `/uploads/lab-results/${file.filename}`,
    fileName: file.originalname
  }));

  const labResult = await LabResult.create({
    patient: request.patient._id,
    appointment: request.appointment,
    uploadedBy,
    tests: request.tests,
    notes: notes || '',
    files: filesData
  });

  request.status = 'completed';
  request.result = labResult._id;
  await request.save();
  await request.populate(POPULATE_REQUEST);

  return { request, patientName: request.patient.fullName };
};

const removeLabBillItemsForRequest = async (bill, request) => {
  if (!bill || bill.billType !== 'lab') return;

  const testNames = (request.tests || []).map(t => t.testName).join(', ');
  const fee = (request.tests?.length || 0) * LAB_FEE_PER_TEST;
  const before = bill.items.length;

  bill.items = bill.items.filter((item) => {
    const desc = item.description || '';
    return !(item.type === 'lab_test' && item.amount === fee && desc.includes(testNames));
  });

  if (bill.items.length === before && bill.items.length > 0) {
    const idx = bill.items.map(i => i.type).lastIndexOf('lab_test');
    if (idx >= 0) bill.items.splice(idx, 1);
  }

  if (bill.items.length === 0) {
    await Bill.deleteOne({ _id: bill._id });
    return;
  }

  if (getAmountDue(bill) <= 0) {
    bill.status = 'paid';
    bill.paidAmount = bill.totalAmount;
  } else if ((bill.paidAmount || 0) > 0) {
    bill.status = 'unpaid';
  }
  await bill.save();
};

/** Hủy / xóa phiếu XN dư (chưa có kết quả) */
const cancelLabRequest = async (requestId, user) => {
  const request = await LabRequest.findById(requestId);
  if (!request) throw new HttpError(404, 'Không tìm thấy yêu cầu.');

  if (user.role === 'doctor' && request.doctor.toString() !== user._id.toString()) {
    throw new HttpError(403, 'Bạn không có quyền hủy phiếu xét nghiệm này.');
  }
  if (!['doctor', 'admin', 'lab_staff'].includes(user.role)) {
    throw new HttpError(403, 'Không có quyền hủy yêu cầu xét nghiệm.');
  }
  if (request.status === 'completed') {
    throw new HttpError(400, 'Phiếu đã có kết quả, không thể hủy.');
  }

  if (request.bill && request.paymentStatus !== 'paid') {
    const bill = await Bill.findById(request.bill);
    await removeLabBillItemsForRequest(bill, request);
  }

  await LabRequest.deleteOne({ _id: requestId });
  return { deletedId: requestId };
};

module.exports = {
  createLabRequest,
  getPendingRequests,
  getAllRequests,
  startRequest,
  completeRequest,
  cancelLabRequest
};
