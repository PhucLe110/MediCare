const express = require('express');
const {
  createLabRequest,
  getPendingRequests,
  getAllRequests,
  startRequest,
  completeRequest,
  cancelLabRequest
} = require('../controllers/labRequestController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Doctor: create a new lab request
router.post('/', protect, (req, res, next) => {
  if (!['doctor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Chỉ bác sĩ mới có thể tạo yêu cầu xét nghiệm.' });
  }
  next();
}, createLabRequest);

// Lab staff: get all pending/in-progress requests
router.get('/pending', protect, (req, res, next) => {
  if (!['lab_staff', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
  }
  next();
}, getPendingRequests);

// All auth: view request history
router.get('/', protect, getAllRequests);

// Doctor / lab staff / admin: cancel duplicate or mistaken request
router.delete('/:id', protect, (req, res, next) => {
  if (!['doctor', 'admin', 'lab_staff'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền hủy yêu cầu.' });
  }
  next();
}, cancelLabRequest);

// Lab staff: mark as in progress
router.patch('/:id/start', protect, startRequest);

// Lab staff: upload result + complete
router.post('/:id/complete', protect, upload.array('files', 5), completeRequest);

module.exports = router;
