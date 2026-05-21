const asyncHandler = require('../utils/asyncHandler');
const webhookService = require('../services/webhookService');

exports.handleSePayWebhook = asyncHandler(async (req, res) => {
  const { statusCode, body } = await webhookService.handleSePayWebhook(
    req.headers['authorization'],
    req.body
  );
  res.status(statusCode).json(body);
});
