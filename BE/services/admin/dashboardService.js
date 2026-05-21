const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Bill = require('../../models/Bill');

const getWeekdayName = (dateStr) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[new Date(dateStr).getDay()];
};

const getDashboardStats = async () => {
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const totalDoctors = await Doctor.countDocuments();
  const totalAppointments = await Appointment.countDocuments();

  const paidBills = await Bill.find({ status: 'paid' });
  const totalRevenue = paidBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

  const chartMap = {};
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  daysOfWeek.forEach(day => {
    chartMap[day] = { name: day, revenue: 0, appointments: 0 };
  });

  const appointments = await Appointment.find();
  appointments.forEach(app => {
    const day = getWeekdayName(app.date);
    if (chartMap[day]) chartMap[day].appointments += 1;
  });

  const bills = await Bill.find({ status: 'paid' }).populate('appointment');
  bills.forEach(bill => {
    if (bill.appointment?.date) {
      const day = getWeekdayName(bill.appointment.date);
      if (chartMap[day]) chartMap[day].revenue += bill.totalAmount || 0;
    }
  });

  const revenueData = daysOfWeek.map(day => chartMap[day]);

  const deptMap = {};
  const populatedApps = await Appointment.find().populate({ path: 'doctor', select: 'department' });
  populatedApps.forEach(app => {
    if (app.doctor?.department) {
      deptMap[app.doctor.department] = (deptMap[app.doctor.department] || 0) + 1;
    }
  });

  const departmentData = Object.keys(deptMap)
    .map(name => ({ name, count: deptMap[name] }))
    .sort((a, b) => b.count - a.count);

  const docMap = {};
  populatedApps.forEach(app => {
    if (app.doctor) {
      const docId = app.doctor._id.toString();
      docMap[docId] = (docMap[docId] || 0) + 1;
    }
  });

  const doctors = await Doctor.find().populate('userId', 'fullName');
  const doctorPerformances = doctors
    .map(doc => ({
      id: doc._id,
      fullName: doc.userId?.fullName || 'Bác sĩ ẩn danh',
      department: doc.department,
      count: docMap[doc._id.toString()] || 0,
      rating: doc.rating || 5.0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    stats: { patients: totalPatients, doctors: totalDoctors, appointments: totalAppointments, revenue: totalRevenue },
    revenueData,
    departmentData,
    doctorPerformances
  };
};

module.exports = { getDashboardStats };
