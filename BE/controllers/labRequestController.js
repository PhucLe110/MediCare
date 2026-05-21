const asyncHandler = require('../utils/asyncHandler');
const labRequestService = require('../services/labRequestService');

exports.createLabRequest = asyncHandler(async (req, res) => {
  const data = await labRequestService.createLabRequest(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Đã gửi yêu cầu xét nghiệm thành công!', data });
});

exports.getPendingRequests = asyncHandler(async (req, res) => {
  const data = await labRequestService.getPendingRequests();
  res.status(200).json({ success: true, data });
});

exports.getAllRequests = asyncHandler(async (req, res) => {
  const data = await labRequestService.getAllRequests(req.user, req.query.appointmentId);
  res.status(200).json({ success: true, data });
});

exports.startRequest = asyncHandler(async (req, res) => {
  const data = await labRequestService.startRequest(req.params.id);
  res.status(200).json({ success: true, data });
});

exports.completeRequest = asyncHandler(async (req, res) => {
  const { request, patientName } = await labRequestService.completeRequest(
    req.params.id,
    req.user._id,
    { notes: req.body.notes, files: req.files }
  );
  res.status(200).json({
    success: true,
    message: `Kết quả xét nghiệm đã được gửi tới bệnh nhân ${patientName}.`,
    data: request
  });
});

exports.cancelLabRequest = asyncHandler(async (req, res) => {
  const data = await labRequestService.cancelLabRequest(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'Đã hủy yêu cầu xét nghiệm.', data });
});
