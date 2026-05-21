const fs = require('fs');
const Bill = require('../models/Bill');
const { applyBillPayment, getAmountDue } = require('../utils/billHelper');

const handleSePayWebhook = async (authHeader, body) => {
  const { content, amount: rawAmount, transferAmount, gateway, transactionDate } = body;
  const amount = transferAmount || rawAmount;

  fs.appendFileSync('sepay_webhook.log', `[${new Date().toISOString()}] Auth: ${authHeader} | Body: ${JSON.stringify(body)}\n`);

  const expectedAuth = process.env.SEPAY_WEBHOOK_SECRET
    ? `apikey ${process.env.SEPAY_WEBHOOK_SECRET.toLowerCase()}`
    : '';
  const actualAuth = authHeader ? authHeader.toLowerCase() : '';

  if (expectedAuth && actualAuth !== expectedAuth) {
    return { statusCode: 401, body: { success: false, message: 'Unauthorized Webhook' } };
  }

  console.log(`[SePay Webhook] Received payment: ${amount} VND - Content: ${content}`);

  if (!content) {
    return { statusCode: 200, body: { success: true, message: 'No content in webhook' } };
  }

  const match = content.match(/MediCare HD ([A-Z0-9]{6})/i);

  if (match) {
    const shortId = match[1].toUpperCase();
    const bills = await Bill.find({ status: 'unpaid' });
    const targetBill = bills.find(b => b._id.toString().toUpperCase().endsWith(shortId));

    if (targetBill) {
      const due = getAmountDue(targetBill);
      targetBill.paymentDetails = {
        gateway: gateway || 'SePay',
        transactionDate,
        amountReceived: amount
      };
      const ok = await applyBillPayment(targetBill, amount);
      if (ok) {
        console.log(`[SePay Webhook] Bill ${targetBill._id} (${targetBill.billType}) payment applied, due was ${due}.`);
        return { statusCode: 200, body: { success: true, message: 'Bill updated' } };
      }
      console.warn(`[SePay Webhook] Amount mismatch for Bill ${targetBill._id}. Expected due ${due}, got ${amount}`);
    }
  }

  return { statusCode: 200, body: { success: true, message: 'Webhook received but no bill matched' } };
};

module.exports = { handleSePayWebhook };
