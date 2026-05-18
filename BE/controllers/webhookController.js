const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');

// @desc    Handle SePay Webhook for automatic payment
// @route   POST /api/webhooks/sepay
// @access  Public (Validated with SePay API Key)
exports.handleSePayWebhook = async (req, res) => {
  try {
    const { content, amount: rawAmount, transferAmount, gateway, transactionDate } = req.body;
    const amount = transferAmount || rawAmount;
    const authHeader = req.headers['authorization'];
    const fs = require('fs');
    fs.appendFileSync('sepay_webhook.log', `[${new Date().toISOString()}] Auth: ${authHeader} | Body: ${JSON.stringify(req.body)}\n`);

    // Validate SePay Webhook Secret
    const expectedAuth = process.env.SEPAY_WEBHOOK_SECRET ? `apikey ${process.env.SEPAY_WEBHOOK_SECRET.toLowerCase()}` : '';
    const actualAuth = authHeader ? authHeader.toLowerCase() : '';
    
    if (expectedAuth && actualAuth !== expectedAuth) {
      console.warn('[SePay Webhook] Unauthorized attempt with header:', authHeader);
      return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
    }

    console.log(`[SePay Webhook] Received payment: ${amount} VND - Content: ${content}`);

    if (!content) {
      return res.status(200).json({ success: true, message: 'No content in webhook' });
    }

    // Parse Bill ID from content (Format: MediCare HD <ShortID>)
    // Using Regex to find the 6-character short ID
    const match = content.match(/MediCare HD ([A-Z0-9]{6})/i);
    
    if (match) {
      const shortId = match[1].toUpperCase();
      
      // Find bills that end with this shortId
      // Note: In production, it's better to store shortId in the Bill model explicitly
      const bills = await Bill.find({ status: 'unpaid' });
      const targetBill = bills.find(b => b._id.toString().toUpperCase().endsWith(shortId));

      if (targetBill) {
        // Validate amount (allow 500 VND difference for rounding/fees)
        if (Math.abs(targetBill.totalAmount - amount) <= 500) {
          targetBill.status = 'paid';
          targetBill.paidAt = new Date();
          targetBill.paymentDetails = {
            gateway: gateway || 'SePay',
            transactionDate: transactionDate,
            amountReceived: amount
          };
          await targetBill.save();
          if (targetBill.appointment) {
            await Appointment.findByIdAndUpdate(targetBill.appointment, { paymentStatus: 'paid' });
          }
          console.log(`[SePay Webhook] Bill ${targetBill._id} marked as PAID.`);
          return res.status(200).json({ success: true, message: 'Bill updated' });
        } else {
          console.warn(`[SePay Webhook] Amount mismatch for Bill ${targetBill._id}. Expected ${targetBill.totalAmount}, got ${amount}`);
        }
      }
    }

    // Always return 200 to SePay unless there's a server error
    res.status(200).json({ success: true, message: 'Webhook received but no bill matched' });
  } catch (error) {
    console.error('[SePay Webhook] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
