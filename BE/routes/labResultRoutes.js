const express = require('express');
const { uploadLabResult, getMyLabResults, getPatientLabResults, getAllLabResults } = require('../controllers/labResultController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Patient: view own results
router.get('/my', protect, getMyLabResults);

// Lab staff only: upload a result
router.post('/', protect, (req, res, next) => {
  if (req.user.role !== 'lab_staff' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ nhân viên xét nghiệm mới có quyền tải lên kết quả.' });
  }
  next();
}, upload.single('file'), uploadLabResult);

// Doctor/Admin: view specific patient's results
router.get('/patient/:patientUserId', protect, getPatientLabResults);

// Admin/Lab: view all results
router.get('/', protect, getAllLabResults);

module.exports = router;
