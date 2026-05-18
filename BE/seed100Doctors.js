const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Bill = require('./models/Bill');
const Prescription = require('./models/Prescription');
const LabRequest = require('./models/LabRequest');
const LabResult = require('./models/LabResult');
const Medicine = require('./models/Medicine');
require('dotenv').config();

// 15 Departments & their specific specialties from Screenshot 1
const medicalDepartments = {
  'Khoa Nội tổng quát': ['Nội tim mạch', 'Nội hô hấp', 'Nội tiêu hóa', 'Nội tiết', 'Nội thần kinh'],
  'Khoa Ngoại tổng quát': ['Ngoại tiêu hóa', 'Ngoại gan mật', 'Ngoại thần kinh', 'Ngoại lồng ngực'],
  'Khoa Nhi': ['Nhi sơ sinh', 'Nhi hô hấp', 'Nhi tiêu hóa', 'Nhi tim mạch'],
  'Khoa Sản': ['Sản thường', 'Sản bệnh lý', 'Hỗ trợ sinh sản', 'Chăm sóc sau sinh'],
  'Khoa Cấp cứu': ['Cấp cứu nội khoa', 'Cấp cứu ngoại khoa', 'Hồi sức cấp cứu'],
  'Khoa Hồi sức tích cực (ICU)': ['ICU nội', 'ICU ngoại', 'Chống độc'],
  'Khoa Tim mạch': ['Can thiệp tim mạch', 'Điện tim', 'Siêu âm tim'],
  'Khoa Ung bướu': ['Hóa trị', 'Xạ trị', 'Ung thư nội khoa', 'Chăm sóc giảm nhẹ'],
  'Khoa Chấn thương chỉnh hình': ['Chỉnh hình', 'Cột sống', 'Thay khớp', 'Phục hồi chấn thương'],
  'Khoa Tai Mũi Họng': ['Tai học', 'Mũi xoang', 'Thanh quản'],
  'Khoa Răng Hàm Mặt': ['Nha tổng quát', 'Chỉnh nha', 'Cấy ghép Implant'],
  'Khoa Da liễu': ['Điều trị da', 'Laser thẩm mỹ', 'Dị ứng da'],
  'Khoa Mắt': ['Khúc xạ', 'Phẫu thuật mắt', 'Glaucoma'],
  'Khoa Xét nghiệm': ['Huyết học', 'Sinh hóa', 'Vi sinh'],
  'Khoa Chẩn đoán hình ảnh': ['X-quang', 'CT Scan', 'MRI', 'Siêu âm']
};

const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];

// Gender-specific Middle Names and First Names
const maleMiddles = ['Văn', 'Hữu', 'Minh', 'Quang', 'Đức', 'Gia', 'Trọng', 'Thế', 'Quốc', 'Ngọc'];
const maleFirsts = ['Hùng', 'Tuấn', 'Nam', 'Sơn', 'Dũng', 'Phong', 'Quân', 'Long', 'Thành', 'Phúc', 'Lộc', 'Phát', 'Trọng', 'Bình', 'Hải', 'Khoa', 'Tú', 'Khánh'];

const femaleMiddles = ['Thị', 'Thanh', 'Thu', 'Hồng', 'Hương', 'Ngọc', 'Mai', 'Xuân', 'Kim', 'Bích'];
const femaleFirsts = ['Mai', 'Hương', 'Linh', 'Nga', 'Hà', 'Hiền', 'Thảo', 'Trang', 'Yến', 'Anh', 'Châu', 'Giang', 'Nhi', 'Quyên', 'Vy', 'Lan', 'Phượng', 'Cúc'];

const generateMaleName = () => {
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middle = maleMiddles[Math.floor(Math.random() * maleMiddles.length)];
  const first = maleFirsts[Math.floor(Math.random() * maleFirsts.length)];
  return `BS. ${last} ${middle} ${first}`;
};

const generateFemaleName = () => {
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middle = femaleMiddles[Math.floor(Math.random() * femaleMiddles.length)];
  const first = femaleFirsts[Math.floor(Math.random() * femaleFirsts.length)];
  return `BS. ${last} ${middle} ${first}`;
};

// 10 Male Doctor Portraits from Unsplash
const maleAvatars = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&q=80',
  'https://images.unsplash.com/photo-1612276527156-05459f0f9db3?w=500&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127d09e?w=500&q=80',
  'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=500&q=80',
  'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=500&q=80',
  'https://images.unsplash.com/photo-1624561172888-530b1eb1b4bb?w=500&q=80',
  'https://images.unsplash.com/photo-1623854767648-e72fa7462fa4?w=500&q=80',
  'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=500&q=80',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=500&q=80'
];

// 10 Female Doctor Portraits from Unsplash
const femaleAvatars = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80',
  'https://images.unsplash.com/photo-1594824401831-2ff3282eb10e?w=500&q=80',
  'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=500&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500&q=80',
  'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=500&q=80',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=500&q=80',
  'https://images.unsplash.com/photo-1605684954998-685c79d6a018?w=500&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80'
];

// Helper to get array of YYYY-MM-DD for next week Monday to Saturday
const getNextWeekMonToSat = () => {
  const dates = [];
  const today = new Date();
  const currentDay = today.getDay(); // 0: Sun, 1: Mon, etc.
  
  // Calculate days to next Monday
  const daysToMon = currentDay === 0 ? 1 : 8 - currentDay;
  
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysToMon);
  
  for (let i = 0; i < 6; i++) { // Monday (0) to Saturday (5)
    const slotDate = new Date(nextMonday);
    slotDate.setDate(nextMonday.getDate() + i);
    dates.push(slotDate.toISOString().split('T')[0]);
  }
  return dates;
};

// 100 Essential Medical Drugs
const medicineNames = [
  { name: 'Paracetamol', dosage: '500mg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Ibuprofen', dosage: '400mg', unit: 'Viên', unitPrice: 2000 },
  { name: 'Amoxicillin', dosage: '500mg', unit: 'Viên', unitPrice: 3500 },
  { name: 'Cefuroxime', dosage: '500mg', unit: 'Viên', unitPrice: 8500 },
  { name: 'Azithromycin', dosage: '500mg', unit: 'Viên', unitPrice: 15000 },
  { name: 'Metformin', dosage: '850mg', unit: 'Viên', unitPrice: 2500 },
  { name: 'Atorvastatin', dosage: '20mg', unit: 'Viên', unitPrice: 6000 },
  { name: 'Amlodipine', dosage: '5mg', unit: 'Viên', unitPrice: 1800 },
  { name: 'Losartan', dosage: '50mg', unit: 'Viên', unitPrice: 3000 },
  { name: 'Omeprazole', dosage: '20mg', unit: 'Viên', unitPrice: 2200 },
  { name: 'Pantoprazole', dosage: '40mg', unit: 'Viên', unitPrice: 4500 },
  { name: 'Esomeprazole', dosage: '40mg', unit: 'Viên', unitPrice: 9000 },
  { name: 'Salbutamol', dosage: '2mg', unit: 'Viên', unitPrice: 1200 },
  { name: 'Cetirizine', dosage: '10mg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Loratadine', dosage: '10mg', unit: 'Viên', unitPrice: 1600 },
  { name: 'Fexofenadine', dosage: '180mg', unit: 'Viên', unitPrice: 5500 },
  { name: 'Montelukast', dosage: '10mg', unit: 'Viên', unitPrice: 8000 },
  { name: 'Prednisolone', dosage: '5mg', unit: 'Viên', unitPrice: 1000 },
  { name: 'Methylprednisolone', dosage: '16mg', unit: 'Viên', unitPrice: 7000 },
  { name: 'Clopidogrel', dosage: '75mg', unit: 'Viên', unitPrice: 12000 },
  { name: 'Aspirin', dosage: '81mg', unit: 'Viên', unitPrice: 1000 },
  { name: 'Rosuvastatin', dosage: '10mg', unit: 'Viên', unitPrice: 7500 },
  { name: 'Gliclazide', dosage: '60mg', unit: 'Viên', unitPrice: 3500 },
  { name: 'Insulin Glargine', dosage: '100 IU', unit: 'Lọ', unitPrice: 320000 },
  { name: 'Levothyroxine', dosage: '50mcg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Spironolactone', dosage: '25mg', unit: 'Viên', unitPrice: 2800 },
  { name: 'Furosemide', dosage: '40mg', unit: 'Viên', unitPrice: 1200 },
  { name: 'Bisoprolol', dosage: '5mg', unit: 'Viên', unitPrice: 4000 },
  { name: 'Nebivolol', dosage: '5mg', unit: 'Viên', unitPrice: 6500 },
  { name: 'Captopril', dosage: '25mg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Enalapril', dosage: '10mg', unit: 'Viên', unitPrice: 1800 },
  { name: 'Lisinopril', dosage: '10mg', unit: 'Viên', unitPrice: 2200 },
  { name: 'Valsartan', dosage: '80mg', unit: 'Viên', unitPrice: 6000 },
  { name: 'Telmisartan', dosage: '40mg', unit: 'Viên', unitPrice: 7000 },
  { name: 'Nifedipine', dosage: '30mg', unit: 'Viên', unitPrice: 3200 },
  { name: 'Diltiazem', dosage: '60mg', unit: 'Viên', unitPrice: 4000 },
  { name: 'Verapamil', dosage: '80mg', unit: 'Viên', unitPrice: 3500 },
  { name: 'Digoxin', dosage: '0.25mg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Amiodarone', dosage: '200mg', unit: 'Viên', unitPrice: 8000 },
  { name: 'Nitroglycerin', dosage: '2.5mg', unit: 'Viên', unitPrice: 5000 },
  { name: 'Simvastatin', dosage: '20mg', unit: 'Viên', unitPrice: 2400 },
  { name: 'Fenofibrate', dosage: '200mg', unit: 'Viên', unitPrice: 5200 },
  { name: 'Gemfibrozil', dosage: '600mg', unit: 'Viên', unitPrice: 6500 },
  { name: 'Glimepiride', dosage: '2mg', unit: 'Viên', unitPrice: 2800 },
  { name: 'Pioglitazone', dosage: '15mg', unit: 'Viên', unitPrice: 4200 },
  { name: 'Sitagliptin', dosage: '100mg', unit: 'Viên', unitPrice: 18500 },
  { name: 'Vildagliptin', dosage: '50mg', unit: 'Viên', unitPrice: 9500 },
  { name: 'Empagliflozin', dosage: '10mg', unit: 'Viên', unitPrice: 22000 },
  { name: 'Dapagliflozin', dosage: '10mg', unit: 'Viên', unitPrice: 20000 },
  { name: 'Liraglutide', dosage: '6mg/ml', unit: 'Ống', unitPrice: 980000 },
  { name: 'Domperidone', dosage: '10mg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Metoclopramide', dosage: '10mg', unit: 'Viên', unitPrice: 1800 },
  { name: 'Ondansetron', dosage: '8mg', unit: 'Viên', unitPrice: 12000 },
  { name: 'Ranitidine', dosage: '150mg', unit: 'Viên', unitPrice: 2000 },
  { name: 'Famotidine', dosage: '20mg', unit: 'Viên', unitPrice: 2500 },
  { name: 'Rabeprazole', dosage: '20mg', unit: 'Viên', unitPrice: 6800 },
  { name: 'Sucralfate', dosage: '1g', unit: 'Gói', unitPrice: 8000 },
  { name: 'Phosphalugel', dosage: '20g', unit: 'Gói', unitPrice: 7500 },
  { name: 'Gaviscon', dosage: '10ml', unit: 'Gói', unitPrice: 11000 },
  { name: 'Loperamide', dosage: '2mg', unit: 'Viên', unitPrice: 1000 },
  { name: 'Smecta', dosage: '3g', unit: 'Gói', unitPrice: 5000 },
  { name: 'Duphalac', dosage: '15ml', unit: 'Gói', unitPrice: 9500 },
  { name: 'Bisacodyl', dosage: '5mg', unit: 'Viên', unitPrice: 1200 },
  { name: 'Activated Charcoal', dosage: '250mg', unit: 'Viên', unitPrice: 2000 },
  { name: 'Ursodeoxycholic Acid', dosage: '250mg', unit: 'Viên', unitPrice: 14000 },
  { name: 'Silymarin', dosage: '140mg', unit: 'Viên', unitPrice: 4800 },
  { name: 'Essentiale Forte', dosage: '300mg', unit: 'Viên', unitPrice: 9000 },
  { name: 'Multivitamin', dosage: 'Standard', unit: 'Viên', unitPrice: 2500 },
  { name: 'Vitamin C', dosage: '500mg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Vitamin D3', dosage: '20000 IU', unit: 'Lọ', unitPrice: 125000 },
  { name: 'Vitamin B Complex', dosage: 'Standard', unit: 'Viên', unitPrice: 1800 },
  { name: 'Calcium Carbonate', dosage: '500mg', unit: 'Viên', unitPrice: 2000 },
  { name: 'Iron Sulfate', dosage: '200mg', unit: 'Viên', unitPrice: 2200 },
  { name: 'Folic Acid', dosage: '5mg', unit: 'Viên', unitPrice: 1000 },
  { name: 'Zinc Sulfate', dosage: '20mg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Magnesium B6', dosage: 'Standard', unit: 'Viên', unitPrice: 2400 },
  { name: 'Glucosamine Sulfate', dosage: '1500mg', unit: 'Gói', unitPrice: 18000 },
  { name: 'Paracetamol + Codeine', dosage: '500/30mg', unit: 'Viên', unitPrice: 5000 },
  { name: 'Tramadol', dosage: '50mg', unit: 'Viên', unitPrice: 4500 },
  { name: 'Diclofenac', dosage: '50mg', unit: 'Viên', unitPrice: 2000 },
  { name: 'Meloxicam', dosage: '15mg', unit: 'Viên', unitPrice: 4000 },
  { name: 'Celecoxib', dosage: '200mg', unit: 'Viên', unitPrice: 9000 },
  { name: 'Etoricoxib', dosage: '90mg', unit: 'Viên', unitPrice: 14000 },
  { name: 'Allopurinol', dosage: '300mg', unit: 'Viên', unitPrice: 3200 },
  { name: 'Colchicine', dosage: '1mg', unit: 'Viên', unitPrice: 2500 },
  { name: 'Alendronic Acid', dosage: '70mg', unit: 'Viên', unitPrice: 24000 },
  { name: 'Betahistine', dosage: '16mg', unit: 'Viên', unitPrice: 3500 },
  { name: 'Piracetam', dosage: '800mg', unit: 'Viên', unitPrice: 4200 },
  { name: 'Ginkgo Biloba', dosage: '120mg', unit: 'Viên', unitPrice: 5000 },
  { name: 'Citicoline', dosage: '500mg', unit: 'Viên', unitPrice: 16000 },
  { name: 'Donepezil', dosage: '5mg', unit: 'Viên', unitPrice: 18000 },
  { name: 'Memantine', dosage: '10mg', unit: 'Viên', unitPrice: 22000 },
  { name: 'Diazepam', dosage: '5mg', unit: 'Viên', unitPrice: 1500 },
  { name: 'Alprazolam', dosage: '0.5mg', unit: 'Viên', unitPrice: 3000 },
  { name: 'Sertraline', dosage: '50mg', unit: 'Viên', unitPrice: 11000 },
  { name: 'Escitalopram', dosage: '10mg', unit: 'Viên', unitPrice: 12000 },
  { name: 'Fluoxetine', dosage: '20mg', unit: 'Viên', unitPrice: 6000 },
  { name: 'Amitriptyline', dosage: '25mg', unit: 'Viên', unitPrice: 2000 },
  { name: 'Haloperidol', dosage: '2mg', unit: 'Viên', unitPrice: 1800 },
  { name: 'Olanzapine', dosage: '5mg', unit: 'Viên', unitPrice: 8500 }
];

const seed100DoctorsAndData = async () => {
  try {
    const uri = `${process.env.MONGODB_URI}${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
    await mongoose.connect(uri);
    console.log('⚡ Connected to MongoDB. Initiating gender-inclusive full-day schedule seed...');

    // 1. CLEAR ALL PREVIOUS DATA
    await Appointment.deleteMany({});
    await Bill.deleteMany({});
    await Prescription.deleteMany({});
    await LabRequest.deleteMany({});
    await LabResult.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    await Medicine.deleteMany({});

    console.log('🗑️ Completely cleaned Users, Doctors, Appts, Bills, Prescriptions, LabRequests, LabResults & Medicines.');

    // 2. SEED ADMIN USER (MALE)
    const admin = await User.create({
      fullName: 'Quản trị viên',
      email: 'admin@medicare.vn',
      password: 'admin123',
      phone: '0901234567',
      role: 'admin',
      gender: 'Nam'
    });
    console.log('👑 Admin seeded successfully (admin@medicare.vn / admin123)');

    // 3. SEED LAB STAFF (FEMALE)
    const labStaff = await User.create({
      fullName: 'Nguyễn Thị Lan Anh',
      email: 'labstaff@medicare.vn',
      password: 'labstaff123',
      phone: '0909123456',
      role: 'lab_staff',
      gender: 'Nữ'
    });
    console.log('🧪 Lab Staff seeded successfully (labstaff@medicare.vn / labstaff123)');

    // 4. PREPARE 6 WORKING DAYS: MONDAY TO SATURDAY OF NEXT WEEK
    const workingDays = getNextWeekMonToSat();
    console.log('📅 Working days generated successfully from Mon to Sat:', workingDays);

    // Full Day working slots (excl. 12h - 13h)
    const fullDayTimeSlots = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30'];

    // 5. SEED 100 DOCTORS (50 MALE, 50 FEMALE)
    const departments = Object.keys(medicalDepartments);
    const doctorsData = [];

    for (let i = 1; i <= 100; i++) {
      // Pick department sequentially to keep it even
      const department = departments[(i - 1) % departments.length];
      const deptSpecialties = medicalDepartments[department];
      const specialty = deptSpecialties[Math.floor(Math.random() * deptSpecialties.length)];

      // 50% Male, 50% Female
      const isMale = i <= 50;
      const gender = isMale ? 'Nam' : 'Nữ';
      const fullName = isMale ? generateMaleName() : generateFemaleName();
      const email = `doctor${i}@medicare.vn`;
      const phone = `09${String(10000000 + Math.floor(Math.random() * 90000000))}`;

      // Create core user account with gender
      const docUser = await User.create({
        fullName,
        email,
        password: 'password123',
        phone,
        role: 'doctor',
        gender
      });

      // Generate complete slots spanning ALL 6 working days (Mon-Sat), all containing the full day time slots!
      const availableSlots = workingDays.map(date => ({
        date,
        times: [...fullDayTimeSlots] // full-day working hours
      }));

      // Pick avatar corresponding to gender
      const avatarList = isMale ? maleAvatars : femaleAvatars;
      const avatar = avatarList[(i - 1) % avatarList.length];

      doctorsData.push({
        userId: docUser._id,
        department,
        specialty,
        experience: Math.floor(Math.random() * 25) + 3, // 3 to 28 years
        consultationFee: 150000, // Consultation fee set to exactly 150k
        availableSlots,
        avatar
      });
    }

    await Doctor.insertMany(doctorsData);
    console.log(`👨‍⚕️ Seeded exactly 100 gender-inclusive Doctors (50 Nam, 50 Nữ) with 150k fee, spanning Mon-Sat with 8-slot daily schedules!`);

    // 6. SEED 100 MEDICINES
    const medicinesData = [];
    for (let i = 0; i < medicineNames.length; i++) {
      const med = medicineNames[i];
      const stock = Math.floor(Math.random() * 1400) + 100;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 500 + Math.floor(Math.random() * 500));
      const expiry = expDate.toISOString().split('T')[0];

      medicinesData.push({
        name: med.name,
        dosage: med.dosage,
        unit: med.unit,
        stock,
        expiry,
        status: stock < 150 ? 'low' : 'normal',
        unitPrice: med.unitPrice
      });
    }

    await Medicine.insertMany(medicinesData);
    console.log('💊 Seeded exactly 100 master Medicines into hospital inventory!');

    console.log('\n🌟 SUCCESS: Database reset, gender division and full-day schedules successfully implemented! 🌟\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seed:', error);
    process.exit(1);
  }
};

seed100DoctorsAndData();
