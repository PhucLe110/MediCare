const express = require('express');
const { handleSePayWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/sepay', handleSePayWebhook);

// Add GET handler for testing reachability via browser
router.get('/sepay', (req, res) => {
  res.status(200).send('MediCare SePay Webhook is ready for POST requests!');
});

module.exports = router;
