const asyncHandler = require('../utils/asyncHandler');
const labResultService = require('../services/labResultService');

exports.uploadLabResult = asyncHandler(async (req, res) => {
  const { labResult, patientName } = await labResultService.uploadLabResult(req.user._id, req.file, req.body);
  res.status(201).json({
    success: true,
    message: `Đã gửi kết quả xét nghiệm tới bệnh nhân ${patientName} thành công.`,
    data: labResult
  });
});

exports.getMyLabResults = asyncHandler(async (req, res) => {
  const data = await labResultService.getMyLabResults(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.getPatientLabResults = asyncHandler(async (req, res) => {
  const data = await labResultService.getPatientLabResults(req.params.patientUserId);
  res.status(200).json({ success: true, data });
});

exports.getAllLabResults = asyncHandler(async (req, res) => {
  const data = await labResultService.getAllLabResults();
  res.status(200).json({ success: true, data });
});
