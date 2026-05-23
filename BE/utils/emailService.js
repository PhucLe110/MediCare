const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send verification code email
 * @param {string} email - Recipient email
 * @param {string} code - Verification code
 * @returns {Promise<void>}
 */
const sendVerificationCode = async (email, code) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác nhận đặt lại mật khẩu - MediCare",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">MediCare</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Hệ thống quản lý bệnh viện thông minh</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #333; margin-top: 0;">Mã xác nhận của bạn</h2>
            <p style="color: #666; line-height: 1.6;">
              Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản MediCare của mình. 
              Vui lòng sử dụng mã xác nhận dưới đây để tiếp tục:
            </p>
            <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              <strong>Lưu ý:</strong>
            </p>
            <ul style="color: #666; line-height: 1.6; font-size: 14px;">
              <li>Mã này có hiệu lực trong <strong>5 phút</strong></li>
              <li>Vui lòng không chia sẻ mã này với bất kỳ ai</li>
              <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
            </ul>
            <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
              Đây là email tự động, vui lòng không trả lời.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Không thể gửi email xác nhận");
  }
};

module.exports = { sendVerificationCode };
