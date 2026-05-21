const User = require('../models/User');
const HttpError = require('./httpError');

const resolvePatient = async (patientId) => {
  let patient = await User.findOne({ patientId }).select('_id fullName patientId');
  if (!patient) patient = await User.findById(patientId).select('_id fullName patientId');
  if (!patient) throw new HttpError(404, `Không tìm thấy bệnh nhân với mã: ${patientId}`);
  return patient;
};

module.exports = { resolvePatient };
