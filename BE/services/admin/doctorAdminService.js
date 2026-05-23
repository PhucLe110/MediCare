const User = require("../../models/User");
const Doctor = require("../../models/Doctor");
const Appointment = require("../../models/Appointment");
const bcrypt = require("bcryptjs");
const HttpError = require("../../utils/httpError");
const { CONSULTATION_FEE } = require("../../constants/billing");
const { SLOT_TIMES_SHIFT } = require("../../constants/appointment");

const getDoctors = async () => {
  const doctors = await Doctor.find().populate(
    "userId",
    "fullName email phone status gender",
  );
  const appointments = await Appointment.find({ status: { $ne: "cancelled" } });

  const doctorApptCounts = {};
  appointments.forEach((app) => {
    if (app.doctor) {
      const docId = app.doctor.toString();
      doctorApptCounts[docId] = (doctorApptCounts[docId] || 0) + 1;
    }
  });

  return doctors.map((doc) => {
    const docObj = doc.toObject();
    docObj.monthlyAppointmentsCount = doctorApptCounts[doc._id.toString()] || 0;
    return docObj;
  });
};

const createDoctor = async (body) => {
  const {
    fullName,
    email,
    password,
    phone,
    department,
    specialty,
    experience,
    consultationFee,
  } = body;

  const userExists = await User.findOne({ email });
  if (userExists) throw new HttpError(400, "Email đã được sử dụng");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
    role: "doctor",
  });

  const doctor = await Doctor.create({
    userId: user._id,
    department,
    specialty,
    experience,
    consultationFee: consultationFee || CONSULTATION_FEE,
  });

  await doctor.populate("userId", "fullName email phone status");
  return doctor;
};

const updateDoctor = async (id, body) => {
  const {
    fullName,
    email,
    phone,
    department,
    specialty,
    experience,
    consultationFee,
    status,
  } = body;

  const doctor = await Doctor.findById(id);
  if (!doctor) throw new HttpError(404, "Không tìm thấy bác sĩ");

  doctor.department = department || doctor.department;
  doctor.specialty = specialty || doctor.specialty;
  doctor.experience = experience || doctor.experience;
  doctor.consultationFee = consultationFee || doctor.consultationFee;
  await doctor.save();

  const userUpdates = {};
  if (fullName) userUpdates.fullName = fullName;
  if (email) userUpdates.email = email;
  if (phone) userUpdates.phone = phone;
  if (status) userUpdates.status = status;

  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(doctor.userId, userUpdates);
  }

  await doctor.populate("userId", "fullName email phone status");
  return doctor;
};

const deleteDoctor = async (id) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new HttpError(404, "Không tìm thấy bác sĩ");

  await Doctor.findByIdAndDelete(id);
  await User.findByIdAndUpdate(doctor.userId, { role: "patient" });
  return { message: "Đã xóa bác sĩ thành công" };
};

module.exports = { getDoctors, createDoctor, updateDoctor, deleteDoctor };
