const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const medicalDepartments = {
  'Khoa Nội': ['Nội tim mạch', 'Nội thần kinh', 'Nội tiêu hóa', 'Nội hô hấp', 'Nội tiết', 'Nội cơ xương khớp'],
  'Khoa Ngoại': ['Ngoại tổng quát', 'Ngoại thần kinh', 'Chấn thương chỉnh hình', 'Ngoại tiết niệu'],
  'Khoa Sản': ['Sản khoa', 'Phụ khoa', 'Hỗ trợ sinh sản'],
  'Khoa Nhi': ['Nhi sơ sinh', 'Nhi hô hấp', 'Nhi tiêu hóa', 'Nhi thần kinh'],
  'Khoa Chuyên Khoa': ['Tai mũi họng', 'Răng hàm mặt', 'Nhãn khoa (Mắt)', 'Da liễu'],
  'Khoa Tâm thần': ['Tâm lý học lâm sàng', 'Tâm thần học'],
  'Khoa Ung bướu': ['Hóa trị', 'Xạ trị', 'Phẫu thuật ung bướu'],
  'Khoa Truyền nhiễm': ['Bệnh nhiệt đới', 'Bệnh lây truyền']
};

const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const middleNames = ['Thị', 'Văn', 'Thanh', 'Hữu', 'Minh', 'Ngọc', 'Xuân', 'Thu', 'Hải', 'Quang', 'Hồng', 'Đức', 'Gia'];
const firstNames = ['Anh', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hiền', 'Hùng', 'Hương', 'Khoa', 'Linh', 'Mai', 'Nam', 'Nga', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Thảo', 'Trang', 'Tuấn', 'Tú', 'Yến', 'Long', 'Thành', 'Phúc', 'Lộc', 'Phát', 'Trọng'];

const generateRandomName = () => {
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middle = middleNames[Math.floor(Math.random() * middleNames.length)];
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  return `BS. ${last} ${middle} ${first}`;
};

const seed100Doctors = async () => {
  try {
    const uri = `${process.env.MONGODB_URI}${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
    await mongoose.connect(uri);
    console.log('Connected to DB...');

    // Delete ONLY existing doctors to prevent bloating if run multiple times, 
    // BUT we keep the existing patient users.
    const doctorUsers = await User.find({ role: 'doctor' });
    const doctorIds = doctorUsers.map(u => u._id);
    await Doctor.deleteMany({ userId: { $in: doctorIds } });
    await User.deleteMany({ role: 'doctor' });
    console.log('Cleaned up old doctor data. Generating 100 new doctors...');

    const doctorsData = [];
    const baseDate = new Date();

    for (let i = 1; i <= 100; i++) {
      const departments = Object.keys(medicalDepartments);
      const department = departments[Math.floor(Math.random() * departments.length)];
      const deptSpecialties = medicalDepartments[department];
      const specialty = deptSpecialties[Math.floor(Math.random() * deptSpecialties.length)];
      
      const fullName = generateRandomName();
      const email = `doctor${i}_${Date.now()}@medicare.vn`;
      const phone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      const newDocUser = await User.create({
        fullName,
        email,
        password: 'password123',
        phone,
        role: 'doctor'
      });

      // Generate 2-4 random available days
      const availableSlots = [];
      const numDays = Math.floor(Math.random() * 3) + 2; 
      for (let d = 0; d < numDays; d++) {
        const slotDate = new Date(baseDate);
        slotDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 14)); // Sometime in the next 14 days
        
        // Random 3-5 timeslots
        const times = [];
        const possibleTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
        const numTimes = Math.floor(Math.random() * 3) + 3;
        
        for (let t = 0; t < numTimes; t++) {
          const time = possibleTimes[Math.floor(Math.random() * possibleTimes.length)];
          if (!times.includes(time)) times.push(time);
        }

        availableSlots.push({
          date: slotDate.toISOString().split('T')[0],
          times: times.sort()
        });
      }

      const doctorImages = [
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80',
        'https://images.unsplash.com/photo-1594824401831-2ff3282eb10e?w=500&q=80',
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&q=80',
        'https://images.unsplash.com/photo-1612276527156-05459f0f9db3?w=500&q=80',
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&q=80',
        'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=500&q=80',
        'https://images.unsplash.com/photo-1582750433449-648ed127d09e?w=500&q=80',
        'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=500&q=80',
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80',
        'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=500&q=80',
        'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500&q=80',
        'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=500&q=80',
        'https://images.unsplash.com/photo-1624561172888-530b1eb1b4bb?w=500&q=80',
        'https://images.unsplash.com/photo-1623854767648-e72fa7462fa4?w=500&q=80',
        'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=500&q=80',
        'https://images.unsplash.com/photo-1605684954998-685c79d6a018?w=500&q=80',
        'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=500&q=80',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80',
        'https://images.unsplash.com/photo-1582750433449-648ed127d09e?w=500&q=80'
      ];
      const avatar = doctorImages[Math.floor(Math.random() * doctorImages.length)];

      doctorsData.push({
        userId: newDocUser._id,
        department,
        specialty,
        experience: Math.floor(Math.random() * 25) + 5, // 5 to 30 years
        rating: parseFloat((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)), // 4.0 to 5.0
        consultationFee: (Math.floor(Math.random() * 8) + 3) * 50000, // 150k to 500k
        availableSlots,
        avatar
      });
    }

    await Doctor.insertMany(doctorsData);
    
    console.log('Successfully generated 100 doctors across all specialties!');
    process.exit();
  } catch (error) {
    console.error('Error seeding 100 doctors:', error);
    process.exit(1);
  }
};

seed100Doctors();
