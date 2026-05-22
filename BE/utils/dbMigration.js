const Medicine = require('../models/Medicine');

const migrateMedicineExpiry = async () => {
  try {
    // Tìm các bản ghi mà trường expiry trong MongoDB vẫn đang lưu dưới dạng String (BSON type 2)
    const medicines = await Medicine.find({ expiry: { $type: 'string' } });
    if (medicines.length === 0) return;

    let updatedCount = 0;
    for (const med of medicines) {
      // Do Schema đã đổi sang kiểu Date, Mongoose sẽ tự động ép kiểu chuỗi thành Date trong bộ nhớ.
      // Gọi save() sẽ lưu đè lại vào MongoDB với kiểu dữ liệu BSON Date (type 9) thực tế.
      await med.save();
      updatedCount++;
    }
    console.log(`[migration] Đã cập nhật thành công ${updatedCount} thuốc từ kiểu String sang kiểu Date trong MongoDB.`);
  } catch (err) {
    console.error('[migration] Lỗi khi chạy migration hạn sử dụng thuốc:', err.message);
  }
};

module.exports = { migrateMedicineExpiry };
