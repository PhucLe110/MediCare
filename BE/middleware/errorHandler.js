const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Lỗi server';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
