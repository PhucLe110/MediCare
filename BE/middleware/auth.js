const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không có quyền truy cập, vui lòng đăng nhập' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò tài khoản (${req.user?.role || 'none'}) không được phép truy cập tài nguyên này`
      });
    }
    next();
  };
};
