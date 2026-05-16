const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const seedDoctors = async () => {
  try {
    const uri = `${process.env.MONGODB_URI}${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
    await mongoose.connect(uri);
    console.log('Connected to DB...');

    // 1. Create a doctor User account
    const docUser1 = await User.create({
      fullName: 'BS. Trần Văn Minh',
      email: 'tranvanminh@medicare.vn',
      password: 'password123',
      phone: '0987654321',
      role: 'doctor'
    });

    const docUser2 = await User.create({
      fullName: 'BS. Lê Thị Mai',
      email: 'lethimai@medicare.vn',
      password: 'password123',
      phone: '0912345678',
      role: 'doctor'
    });

    // 2. Create the Doctor profiles
    await Doctor.create({
      userId: docUser1._id,
      specialty: 'Thần kinh',
      experience: 15,
      rating: 4.9,
      availableSlots: [
        { date: '2024-05-24', times: ['08:00', '09:00', '10:00', '14:00'] },
        { date: '2024-05-25', times: ['08:00', '13:00', '15:00'] }
      ]
    });

    await Doctor.create({
      userId: docUser2._id,
      specialty: 'Tai mũi họng',
      experience: 10,
      rating: 4.8,
      availableSlots: [
        { date: '2024-05-24', times: ['09:30', '10:30', '14:30'] },
        { date: '2024-05-26', times: ['08:30', '09:30', '11:00'] }
      ]
    });

    console.log('Doctors seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
