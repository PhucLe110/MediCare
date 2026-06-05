const Appointment = require("../../models/Appointment");
const Doctor = require("../../models/Doctor");
const Bill = require("../../models/Bill");
const Prescription = require("../../models/Prescription");
const LabResult = require("../../models/LabResult");
const HttpError = require("../../utils/httpError");
const {
  MAX_PATIENTS_PER_SLOT,
  RESCHEDULE_MAX_PER_DOCTOR,
} = require("../../constants/appointment");

const getAppointments = async () => {
  return Appointment.find()
    .populate("patient", "fullName email phone")
    .populate({
      path: "doctor",
      populate: { path: "userId", select: "fullName" },
    })
    .sort({ createdAt: -1 });
};

const updateAppointmentStatus = async (id, body) => {
  const { status, date, time } = body;
  const updates = {};
  if (status) updates.status = status;
  if (date) updates.date = date;
  if (time) updates.time = time;

  const appointment = await Appointment.findByIdAndUpdate(id, updates, {
    new: true,
  })
    .populate("patient", "fullName email phone")
    .populate({
      path: "doctor",
      populate: { path: "userId", select: "fullName" },
    });

  if (!appointment) throw new HttpError(404, "Không tìm thấy lịch khám");
  return appointment;
};

const getBills = async () => {
  return Bill.find()
    .populate("patient", "fullName email phone")
    .populate({
      path: "appointment",
      populate: {
        path: "doctor",
        populate: { path: "userId", select: "fullName" },
      },
    })
    .sort({ createdAt: -1 });
};

const getRecords = async () => {
  const prescriptions = await Prescription.find()
    .populate("patient", "fullName email patientId")
    .populate({
      path: "appointment",
      populate: {
        path: "doctor",
        populate: { path: "userId", select: "fullName" },
      },
    });

  const labResults = await LabResult.find()
    .populate("patient", "fullName email patientId")
    .populate("appointment", "date time");

  return { prescriptions, labResults };
};

const getAvailableDoctorsForReschedule = async (id, query) => {
  const appointment = await Appointment.findById(id).populate("doctor");
  if (!appointment) throw new HttpError(404, "Không tìm thấy ca khám");

  const date = query.date || appointment.date;
  const time = query.time || appointment.time;
  const currentDoctor = appointment.doctor;
  if (!currentDoctor)
    throw new HttpError(400, "Ca khám này chưa có bác sĩ phụ trách");

  const { department, specialty } = currentDoctor;
  const doctors = await Doctor.find({ department, specialty }).populate(
    "userId",
    "fullName email phone",
  );

  const result = [];
  for (const doc of doctors) {
    const apptCount = await Appointment.countDocuments({
      doctor: doc._id,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    result.push({
      _id: doc._id,
      fullName: doc.userId?.fullName || "BS. Ẩn danh",
      department: doc.department,
      specialty: doc.specialty,
      currentAppointmentsCount: apptCount,
      isAvailable: apptCount < RESCHEDULE_MAX_PER_DOCTOR,
    });
  }

  return { date, time, department, specialty, doctors: result };
};

const rescheduleAppointment = async (id, body) => {
  const { doctorId, date, time } = body;
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new HttpError(404, "Không tìm thấy ca khám");

  const targetDoctorId = doctorId || appointment.doctor;
  const targetDate = date || appointment.date;
  const targetTime = time || appointment.time;

  const apptCount = await Appointment.countDocuments({
    doctor: targetDoctorId,
    date: targetDate,
    time: targetTime,
    status: { $ne: "cancelled" },
  });

  if (apptCount >= MAX_PATIENTS_PER_SLOT) {
    throw new HttpError(
      400,
      "Khung giờ của bác sĩ này đã vượt quá giới hạn 5 bệnh nhân!",
    );
  }

  appointment.doctor = targetDoctorId;
  appointment.date = targetDate;
  appointment.time = targetTime;
  appointment.queueNumber = apptCount + 1;
  appointment.status = "confirmed";
  await appointment.save();

  return Appointment.findById(appointment._id)
    .populate("patient", "fullName email phone")
    .populate({
      path: "doctor",
      populate: { path: "userId", select: "fullName" },
    });
};

module.exports = {
  getAppointments,
  updateAppointmentStatus,
  getBills,
  getRecords,
  getAvailableDoctorsForReschedule,
  rescheduleAppointment,
};
