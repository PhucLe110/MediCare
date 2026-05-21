const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}${process.env.DATABASE_NAME}`);
    console.log('✅ Connected to MongoDB');

    // Remove old account if exists
    await User.deleteOne({ email: 'admin@medicare.vn' });

    // Create admin user
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@medicare.vn',
      password: 'admin123', // Pre-save hook will hash this
      phone: '0901234567',
      role: 'admin',
    });

    console.log('\n👑 Tài khoản Admin đã được tạo thành công!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Họ tên  :', admin.fullName);
    console.log('  Email   : admin@medicare.vn');
    console.log('  Mật khẩu: admin123');
    console.log('  Role    : admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

createAdmin();
