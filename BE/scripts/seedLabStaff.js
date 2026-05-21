const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

const createLabStaff = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}${process.env.DATABASE_NAME}`);
    console.log('✅ Connected to MongoDB');

    // Remove old account if exists (to avoid double-hash bug)
    await User.deleteOne({ email: 'labstaff@medicare.vn' });

    // Pass plain password — User model pre-save hook will hash it once
    const labStaff = await User.create({
      fullName: 'Nguyễn Thị Lan Anh',
      email: 'labstaff@medicare.vn',
      password: 'labstaff123',
      phone: '0909123456',
      role: 'lab_staff',
    });

    console.log('\n🧪 Tài khoản NV Xét nghiệm đã được tạo thành công!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Họ tên  :', labStaff.fullName);
    console.log('  Email   : labstaff@medicare.vn');
    console.log('  Mật khẩu: labstaff123');
    console.log('  Role    : lab_staff');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

createLabStaff();
