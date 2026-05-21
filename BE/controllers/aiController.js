const asyncHandler = require('../utils/asyncHandler');
const aiService = require('../services/aiService');

exports.predictSpecialty = asyncHandler(async (req, res) => {
  const data = aiService.predictSpecialty(req.body.symptoms);
  res.status(200).json({ success: true, data });
});
