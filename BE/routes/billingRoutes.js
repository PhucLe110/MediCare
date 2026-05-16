const express = require('express');
const {
  getMyPrescriptions, createPrescription,
  getMyBills, markBillAsPaid, getPaymentInfo
} = require('../controllers/billingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Payment Info
router.get('/payment-info', getPaymentInfo);

// Prescriptions
router.get('/prescriptions/my', protect, getMyPrescriptions);
router.post('/prescriptions', protect, createPrescription);

// Bills
router.get('/bills/my', protect, getMyBills);
router.patch('/bills/:id/pay', protect, markBillAsPaid);

module.exports = router;
