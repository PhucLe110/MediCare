const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const LabRequest = require('../models/LabRequest');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const ShiftRequest = require('../models/ShiftRequest');
const HttpError = require('../utils/httpError');
const { getEffectiveTimesForDate, getDayOfWeek } = require('../utils/schedule');
const { isAppointmentTimeReached } = require('../utils/dateTime');
const { createMedicineBill } = require('../utils/billHelper');

const getDoctorProfileByUserId = async (userId) => {
  const doctor = await Doctor.findOne({ userId })
    .populate('userId', 'fullName email phone gender status');
  if (!doctor) throw new HttpError(404, 'Không tìm thấy hồ sơ bác sĩ');
  return doctor;
};

const getDoctors = async () => {
  return Doctor.find().populate('userId', 'fullName email phone');
};

const getDoctorProfile = async (userId) => {
  const doctor = await getDoctorProfileByUserId(userId);

  const appointments = await Appointment.find({ doctor: doctor._id, status: 'completed' });
  const totalPatients = appointments.length;
  const appIds = appointments.map(a => a._id);
  const paidBills = await Bill.find({ appointment: { $in: appIds }, status: 'paid' });
  const totalEarnings = paidBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return {
    profile: doctor,
    stats: { totalPatients, totalEarnings }
  };
};

const getDoctorAppointments = async (userId) => {
  const doctorProfile = await getDoctorProfileByUserId(userId);
  return Appointment.find({
    doctor: doctorProfile._id,
    status: { $nin: ['pending_payment', 'cancelled'] }
  })
    .populate('patient', 'fullName email phone gender dateOfBirth')
    .sort({ date: 1, time: 1 });
};

const startExamination = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new HttpError(404, 'Không tìm thấy ca khám');
  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    throw new HttpError(400, 'Không thể bắt đầu ca khám đã hoàn thành hoặc đã hủy');
  }
  if (!isAppointmentTimeReached(appointment)) {
    throw new HttpError(400, 'Chưa đến giờ khám. Vui lòng bắt đầu khi đến đúng giờ hẹn của bệnh nhân.');
  }
  appointment.status = 'examining';
  await appointment.save();
  return appointment;
};

const saveDraft = async (appointmentId, draftData) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new HttpError(404, 'Không tìm thấy ca khám');
  if (appointment.status !== 'examining') {
    throw new HttpError(400, 'Ca khám không ở trạng thái đang khám');
  }

  const { diagnosis, doctorNotes, medicines, labTests, requireFollowUp, followUpDate, followUpTime, followUpNotes } = draftData;
  appointment.draft = {
    diagnosis: diagnosis || '',
    doctorNotes: doctorNotes || '',
    medicines: medicines || [],
    labTests: labTests || [],
    requireFollowUp: requireFollowUp || false,
    followUpDate: followUpDate || '',
    followUpTime: followUpTime || '',
    followUpNotes: followUpNotes || '',
    savedAt: new Date()
  };
  await appointment.save();
};

const completeDiagnosis = async (appointmentId, doctorUserId, { diagnosis, doctorNotes, medicines, followUp }) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new HttpError(404, 'Không tìm thấy ca khám');

  const labRequests = await LabRequest.find({ appointment: appointmentId });
  const pendingLabs = labRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  if (pendingLabs.length > 0) {
    throw new HttpError(
      400,
      'Còn xét nghiệm chưa có kết quả. Vui lòng chờ nhân viên xét nghiệm trả kết quả hoặc chỉ định thêm sau khi đã nhận đủ kết quả.'
    );
  }

  appointment.status = 'completed';
  appointment.draft = undefined;
  await appointment.save();

  let prescription = null;
  if (diagnosis || (medicines && medicines.length > 0)) {
    prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: doctorUserId,
      medicines: medicines || [],
      diagnosis: diagnosis || 'Khám chuyên khoa',
      doctorNotes: doctorNotes || '',
      status: 'issued'
    });

    if (medicines?.length > 0) {
      for (const med of medicines) {
        const m = await Medicine.findById(med.medicineId);
        if (m) {
          m.stock = Math.max(0, m.stock - med.quantity);
          if (m.stock < 10 && m.status !== 'expiring') m.status = 'low';
          await m.save();
        }
      }
    }
  }

  let bill = null;
  if (prescription?.totalMedicineCost > 0) {
    bill = await createMedicineBill(appointmentId, appointment.patient, prescription);
  }

  let followUpAppointment = null;
  if (followUp?.date && followUp?.time) {
    followUpAppointment = await Appointment.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      date: followUp.date,
      time: followUp.time,
      symptoms: followUp.notes || 'Tái khám theo chỉ định',
      status: 'confirmed',
      paymentStatus: 'paid',
      ticketNumber: `TK-${Math.floor(Math.random() * 10000)}`,
      queueNumber: Math.floor(Math.random() * 50) + 1,
      parentAppointment: appointmentId
    });
  }

  return { appointment, prescription, bill, followUpAppointment };
};

const getPatientHistory = async (patientId) => {
  const patient = await User.findById(patientId).select('-password');
  const appointments = await Appointment.find({ patient: patientId, status: 'completed' })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'fullName' } })
    .sort({ date: -1, time: -1 });

  const history = [];
  for (const app of appointments) {
    const prescription = await Prescription.findOne({ appointment: app._id });
    const labRequests = await LabRequest.find({ appointment: app._id }).populate('result');
    const followUpAppointment = await Appointment.findOne({ parentAppointment: app._id });
    history.push({ appointment: app, prescription, labRequests, followUpAppointment });
  }

  return { patient, history };
};

const getMedicines = async () => Medicine.find().sort({ name: 1 });

const createShiftRequest = async (userId, { type, date, times }) => {
  const doctorProfile = await getDoctorProfileByUserId(userId);

  if (!date) throw new HttpError(400, 'Vui lòng chọn ngày');
  if (!times?.length) throw new HttpError(400, 'Vui lòng chọn ít nhất một khung giờ');
  if (getDayOfWeek(date) === 0) {
    throw new HttpError(400, 'Bệnh viện không làm việc Chủ Nhật');
  }

  const currentTimes = await getEffectiveTimesForDate(doctorProfile._id, date, doctorProfile, 'shift');

  if (type === 'add') {
    const conflicts = times.filter(t => currentTimes.includes(t));
    if (conflicts.length > 0) {
      throw new HttpError(400, `Các khung giờ sau đã có trong lịch trực: ${conflicts.join(', ')}. Không thể thêm trùng.`);
    }
  }

  if (type === 'cancel') {
    const notExist = times.filter(t => !currentTimes.includes(t));
    if (notExist.length > 0) {
      throw new HttpError(400, `Các khung giờ sau không có trong lịch trực ngày này: ${notExist.join(', ')}. Không thể hủy.`);
    }
  }

  return ShiftRequest.create({
    doctor: doctorProfile._id,
    type,
    date,
    times,
    status: 'pending'
  });
};

const getMyShiftRequests = async (userId) => {
  const doctorProfile = await getDoctorProfileByUserId(userId);
  return ShiftRequest.find({ doctor: doctorProfile._id }).sort({ createdAt: -1 });
};

module.exports = {
  getDoctors,
  getDoctorProfile,
  getDoctorAppointments,
  startExamination,
  saveDraft,
  completeDiagnosis,
  getPatientHistory,
  getMedicines,
  createShiftRequest,
  getMyShiftRequests
};
