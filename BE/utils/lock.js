const activeLocks = new Set();

/**
 * Đợi và chiếm giữ khoá (lock) dựa trên một khoá chuỗi (key).
 * @param {string} key Khoá duy nhất đại diện cho tài nguyên cần đồng bộ (VD: "doctor_id:date:time")
 * @param {number} delayMs Khoảng thời gian chờ giữa các lần kiểm tra khoá (mặc định 50ms)
 * @param {number} timeoutMs Thời gian tối đa để từ bỏ việc chờ đợi (tránh kẹt vĩnh viễn, mặc định 5000ms)
 */
const acquireLock = async (key, delayMs = 50, timeoutMs = 5000) => {
  const startTime = Date.now();
  while (activeLocks.has(key)) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`[lock] Hết thời gian chờ giữ khoá cho tài nguyên: ${key}`);
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  activeLocks.add(key);
};

/**
 * Giải phóng khoá.
 * @param {string} key Khoá cần giải phóng
 */
const releaseLock = (key) => {
  activeLocks.delete(key);
};

module.exports = {
  acquireLock,
  releaseLock
};
