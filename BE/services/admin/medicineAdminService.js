const Medicine = require('../../models/Medicine');
const HttpError = require('../../utils/httpError');

const getMedicines = async () => {
  const medicines = await Medicine.find().sort({ name: 1 });
  return { medicines, count: medicines.length };
};

const createMedicine = async (body) => Medicine.create(body);

const updateMedicine = async (id, body) => {
  const medicine = await Medicine.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!medicine) throw new HttpError(404, 'Không tìm thấy thuốc');
  return medicine;
};

const deleteMedicine = async (id) => {
  const medicine = await Medicine.findByIdAndDelete(id);
  if (!medicine) throw new HttpError(404, 'Không tìm thấy thuốc');
  return { message: 'Đã xóa thuốc thành công' };
};

module.exports = { getMedicines, createMedicine, updateMedicine, deleteMedicine };
