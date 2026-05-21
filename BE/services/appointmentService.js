const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { getVietnamDateTime } = require('../utils/dateTime');
const HttpError = require('../utils/httpError');
const { getEffectiveTimesForDate } = require('../utils/schedule');
const { MAX_PATIENTS_PER_SLOT } = require('../constants/appointment');
const { createConsultationBill } = require('../utils/billHelper');

const getDoctors = async () => {
  return Doctor.find().populate('userId', 'fullName email phone gender');
};

const getDoctorAvailability = async (doctorId, date) => {
  if (!date) throw new HttpError(400, 'Vui lòng cung cấp ngày khám');

  const vnDateTime = getVietnamDateTime();
  if (date < vnDateTime.date) return [];

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new HttpError(404, 'Không tìm thấy bác sĩ');

  const baseTimes = await getEffectiveTimesForDate(doctorId, date, doctor, 'booking');
  const availableTimes = [];

  for (const time of baseTimes) {
    if (date === vnDateTime.date && time <= vnDateTime.time) continue;
    const count = await Appointment.countDocuments({
      doctor: doctorId,
      date,
      time,
      status: { $nin: ['cancelled'] }
    });
    if (count < MAX_PATIENTS_PER_SLOT) availableTimes.push(time);
  }

  return availableTimes;
};

/** Đặt lịch → chờ thanh toán phí khám mới xác nhận */
const bookAppointment = async (patientId, { doctorId, date, time, symptoms }) => {
  const vnDateTime = getVietnamDateTime();
  if (date < vnDateTime.date) {
    throw new HttpError(400, 'Không thể đặt lịch hẹn cho ngày trong quá khứ');
  }
  if (date === vnDateTime.date && time <= vnDateTime.time) {
    throw new HttpError(400, 'Khung giờ này đã trôi qua. Vui lòng chọn khung giờ khác!');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new HttpError(404, 'Không tìm thấy bác sĩ');

  const appointmentCount = await Appointment.countDocuments({
    doctor: doctorId,
    date,
    time,
    status: { $nin: ['cancelled'] }
  });
  if (appointmentCount >= MAX_PATIENTS_PER_SLOT) {
    throw new HttpError(400, 'Khung giờ này đã đủ 5 bệnh nhân đặt. Vui lòng chọn khung giờ khác!');
  }

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    date,
    time,
    symptoms,
    queueNumber: appointmentCount + 1,
    ticketNumber: `U${Math.floor(100000000 + Math.random() * 900000000)}`,
    status: 'pending_payment',
    paymentStatus: 'unpaid'
  });

  const consultationBill = await createConsultationBill(appointment._id, patientId);

  return { appointment, consultationBill };
};

const getMyAppointments = async (patientId) => {
  return Appointment.find({ patient: patientId })
    .populate({
      path: 'doctor',
      populate: { path: 'userId', select: 'fullName' }
    })
    .sort({ date: 1, time: 1 });
};

module.exports = {
  getDoctors,
  getDoctorAvailability,
  bookAppointment,
  getMyAppointments
};
