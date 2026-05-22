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

  // Tính tổng doanh thu từ hóa đơn đã thanh toán bằng MongoDB aggregation
  const revenueStats = await Bill.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueStats[0]?.total || 0;

  // Khởi tạo bản đồ ngày trong tuần
  const chartMap = {};
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  daysOfWeek.forEach(day => {
    chartMap[day] = { name: day, revenue: 0, appointments: 0 };
  });

  const daysMap = { 1: 'CN', 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6', 7: 'T7' };

  // Gom nhóm lịch hẹn theo thứ trong tuần sử dụng Aggregation
  const appointmentDays = await Appointment.aggregate([
    {
      $project: {
        dayOfWeek: {
          $dayOfWeek: { $dateFromString: { dateString: '$date' } }
        }
      }
    },
    {
      $group: {
        _id: '$dayOfWeek',
        count: { $sum: 1 }
      }
    }
  ]);

  appointmentDays.forEach(item => {
    const dayName = daysMap[item._id];
    if (chartMap[dayName]) {
      chartMap[dayName].appointments = item.count;
    }
  });

  // Gom nhóm doanh thu theo thứ trong tuần sử dụng Aggregation
  const revenueDays = await Bill.aggregate([
    { $match: { status: 'paid' } },
    {
      $lookup: {
        from: 'appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appointmentInfo'
      }
    },
    { $unwind: '$appointmentInfo' },
    {
      $project: {
        totalAmount: 1,
        dayOfWeek: {
          $dayOfWeek: { $dateFromString: { dateString: '$appointmentInfo.date' } }
        }
      }
    },
    {
      $group: {
        _id: '$dayOfWeek',
        revenue: { $sum: '$totalAmount' }
      }
    }
  ]);

  revenueDays.forEach(item => {
    const dayName = daysMap[item._id];
    if (chartMap[dayName]) {
      chartMap[dayName].revenue = item.revenue;
    }
  });

  const revenueData = daysOfWeek.map(day => chartMap[day]);

  // Gom nhóm lịch hẹn theo chuyên khoa (department) sử dụng Aggregation
  const deptStats = await Appointment.aggregate([
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctor',
        foreignField: '_id',
        as: 'doctorInfo'
      }
    },
    { $unwind: '$doctorInfo' },
    {
      $group: {
        _id: '$doctorInfo.department',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        name: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
  const departmentData = deptStats.filter(item => item.name);

  // Thống kê lịch hẹn theo từng bác sĩ sử dụng Aggregation
  const docStats = await Appointment.aggregate([
    {
      $group: {
        _id: '$doctor',
        count: { $sum: 1 }
      }
    }
  ]);

  const docMap = {};
  docStats.forEach(item => {
    if (item._id) {
      docMap[item._id.toString()] = item.count;
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
