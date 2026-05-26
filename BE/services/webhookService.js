const Bill = require("../models/Bill");
const { applyBillPayment, getAmountDue } = require("../utils/billHelper");

const handleSePayWebhook = async (authHeader, body) => {
  try {
    const {
      content,
      amount: rawAmount,
      transferAmount,
      gateway,
      transactionDate,
    } = body;
    const amount = transferAmount || rawAmount;

    console.log(
      `[SePay Webhook] ${new Date().toISOString()} | Auth: ${authHeader} | Body: ${JSON.stringify(body)}`,
    );

    const expectedAuth = process.env.SEPAY_WEBHOOK_SECRET
      ? `apikey ${process.env.SEPAY_WEBHOOK_SECRET.toLowerCase()}`
      : "";
    const actualAuth = authHeader ? authHeader.toLowerCase() : "";

    if (expectedAuth && actualAuth !== expectedAuth) {
      console.error(
        `[SePay Webhook] Unauthorized - Expected: ${expectedAuth}, Got: ${actualAuth}`,
      );
      return {
        statusCode: 401,
        body: { success: false, message: "Unauthorized Webhook" },
      };
    }

    console.log(
      `[SePay Webhook] Received payment: ${amount} VND - Content: ${content}`,
    );

    if (!content) {
      console.warn("[SePay Webhook] No content in webhook body");
      return {
        statusCode: 200,
        body: { success: true, message: "No content in webhook" },
      };
    }

    const match = content.match(/MediCare HD ([A-Z0-9]{6})/i);

    if (match) {
      const shortId = match[1].toUpperCase();
      console.log(`[SePay Webhook] Matching bill with short ID: ${shortId}`);

      const bills = await Bill.find({ status: "unpaid" });
      const targetBill = bills.find((b) =>
        b._id.toString().toUpperCase().endsWith(shortId),
      );

      if (targetBill) {
        const due = getAmountDue(targetBill);
        console.log(
          `[SePay Webhook] Found bill ${targetBill._id} with due amount: ${due}`,
        );

        targetBill.paymentDetails = {
          gateway: gateway || "SePay",
          transactionDate,
          amountReceived: amount,
        };
        const ok = await applyBillPayment(targetBill, amount);
        if (ok) {
          console.log(
            `[SePay Webhook] ✅ Bill ${targetBill._id} (${targetBill.billType}) payment applied successfully.`,
          );
          return {
            statusCode: 200,
            body: { success: true, message: "Bill updated" },
          };
        }
        console.warn(
          `[SePay Webhook] ❌ Amount mismatch for Bill ${targetBill._id}. Expected due ${due}, got ${amount}`,
        );
      } else {
        console.warn(
          `[SePay Webhook] No unpaid bill found with short ID: ${shortId}`,
        );
      }
    } else {
      console.warn(
        `[SePay Webhook] Content does not match expected pattern "MediCare HD [A-Z0-9]{6}": ${content}`,
      );
    }

    return {
      statusCode: 200,
      body: { success: true, message: "Webhook received but no bill matched" },
    };
  } catch (error) {
    console.error("[SePay Webhook] Error processing webhook:", error);
    return {
      statusCode: 500,
      body: { success: false, message: "Internal server error" },
    };
  }
};

module.exports = { handleSePayWebhook };
