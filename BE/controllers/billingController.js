const asyncHandler = require('../utils/asyncHandler');
const billingService = require('../services/billingService');

exports.getMyPrescriptions = asyncHandler(async (req, res) => {
  const data = await billingService.getMyPrescriptions(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.createPrescription = asyncHandler(async (req, res) => {
  const data = await billingService.createPrescription(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Đã lưu đơn thuốc thành công.', data });
});

exports.getMyBills = asyncHandler(async (req, res) => {
  const data = await billingService.getMyBills(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.markBillAsPaid = asyncHandler(async (req, res) => {
  const data = await billingService.markBillAsPaid(req.params.id);
  res.status(200).json({ success: true, data });
});

exports.getPaymentInfo = asyncHandler(async (req, res) => {
  const data = billingService.getPaymentInfo();
  res.status(200).json({ success: true, data });
});
