const LabResult = require('../models/LabResult');
const HttpError = require('../utils/httpError');
const { resolvePatient } = require('../utils/patient');

const uploadLabResult = async (uploadedBy, file, body) => {
  if (!file) throw new HttpError(400, 'Vui lòng đính kèm file kết quả xét nghiệm.');

  const { patientId, testName, testType, notes, appointmentId } = body;
  const patient = await resolvePatient(patientId);

  const labResult = await LabResult.create({
    patient: patient._id,
    appointment: appointmentId || null,
    uploadedBy,
    testName,
    testType: testType || 'other',
    notes,
    fileUrl: `/uploads/lab-results/${file.filename}`,
    fileName: file.originalname
  });

  await labResult.populate('uploadedBy', 'fullName');
  return { labResult, patientName: patient.fullName };
};

const getMyLabResults = async (patientId) => {
  return LabResult.find({ patient: patientId })
    .populate('uploadedBy', 'fullName')
    .populate('appointment', 'date time')
    .sort({ createdAt: -1 });
};

const getPatientLabResults = async (patientUserId) => {
  return LabResult.find({ patient: patientUserId })
    .populate('uploadedBy', 'fullName')
    .populate('appointment', 'date time')
    .sort({ createdAt: -1 });
};

const getAllLabResults = async () => {
  return LabResult.find()
    .populate('patient', 'fullName patientId')
    .populate('uploadedBy', 'fullName')
    .sort({ createdAt: -1 });
};

module.exports = {
  uploadLabResult,
  getMyLabResults,
  getPatientLabResults,
  getAllLabResults
};
