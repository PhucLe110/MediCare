const User = require('../../models/User');
const HttpError = require('../../utils/httpError');

const getUsers = async () => User.find().sort({ createdAt: -1 });

const updateUser = async (id, body) => {
  const { role, status, fullName, email, phone } = body;
  const updates = {};
  if (role) updates.role = role;
  if (status) updates.status = status;
  if (fullName) updates.fullName = fullName;
  if (email) updates.email = email;
  if (phone) updates.phone = phone;

  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  if (!user) throw new HttpError(404, 'Không tìm thấy người dùng');
  return user;
};

module.exports = { getUsers, updateUser };
