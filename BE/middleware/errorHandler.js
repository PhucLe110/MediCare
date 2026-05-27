const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Lỗi server";

  if (status >= 500) {
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      user: req.user?._id,
    });
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
