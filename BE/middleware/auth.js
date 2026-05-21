const User = require('../models/User');
const { verifyAccessToken } = require('../utils/tokenHelper');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không có quyền truy cập, vui lòng đăng nhập' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
    }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Phiên đăng nhập đã hết hạn, vui lòng làm mới token',
      });
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò tài khoản (${req.user?.role || 'none'}) không được phép truy cập tài nguyên này`,
      });
    }
    next();
  };
};
