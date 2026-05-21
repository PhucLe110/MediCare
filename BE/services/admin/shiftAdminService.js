const Doctor = require('../../models/Doctor');
const ShiftRequest = require('../../models/ShiftRequest');
const HttpError = require('../../utils/httpError');
const { buildMonthlySchedule } = require('../../utils/schedule');

const getAllShiftRequests = async () => {
  return ShiftRequest.find()
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'fullName email' } })
    .sort({ createdAt: -1 });
};

const getDoctorSchedule = async (doctorId, query) => {
  const year = parseInt(query.year) || new Date().getFullYear();
  const month = parseInt(query.month) || (new Date().getMonth() + 1);

  const doctor = await Doctor.findById(doctorId).populate('userId', 'fullName');
  if (!doctor) throw new HttpError(404, 'Không tìm thấy bác sĩ');

  const schedule = await buildMonthlySchedule(doctorId, doctor, year, month, 'shift');

  return {
    doctor: {
      name: doctor.userId?.fullName,
      department: doctor.department,
      shiftPattern: doctor.shiftPattern
    },
    schedule
  };
};

const updateShiftRequestStatus = async (id, body) => {
  const { status } = body;
  const request = await ShiftRequest.findByIdAndUpdate(id, { status }, { new: true })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'fullName' } });

  if (!request) throw new HttpError(404, 'Không tìm thấy yêu cầu');
  return request;
};

module.exports = { getAllShiftRequests, getDoctorSchedule, updateShiftRequestStatus };
