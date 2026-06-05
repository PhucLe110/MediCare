const asyncHandler = require("../utils/asyncHandler");
const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Force IPv4 to avoid IPv6 issues on Render
    tls: {
      rejectUnauthorized: false,
    },
  });
};

exports.sendContactEmail = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  console.log("Contact form submission:", { name, email, subject });

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền đầy đủ thông tin bắt buộc",
    });
  }

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials not configured");
    return res.status(500).json({
      success: false,
      message: "Email service not configured. Please contact administrator.",
    });
  }

  try {
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || "23521199@gm.uit.edu.vn",
      subject: `[Liên hệ từ MediCare] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #102A63; margin-bottom: 20px;">Thắc mắc mới từ MediCare</h2>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Họ tên:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${phone || "Không cung cấp"}</p>
            <p style="margin: 5px 0;"><strong>Chủ đề:</strong> ${subject}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #102A63; margin-bottom: 10px;">Nội dung:</h3>
            <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, "<br>")}</p>
          </div>
          
          <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 12px;">
            <p>Email này được gửi từ trang liên hệ MediCare</p>
          </div>
        </div>
      `,
    };

    console.log("Sending email to admin...");
    // Send email
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    console.log("Admin email sent successfully");

    // Send confirmation email to user
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác nhận đã nhận thắc mắc - MediCare",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #102A63; margin: 0;">MediCare</h1>
          </div>
          
          <h2 style="color: #102A63; margin-bottom: 20px;">Cảm ơn bạn đã liên hệ!</h2>
          
          <p style="line-height: 1.6; color: #333; margin-bottom: 20px;">
            Chào ${name},<br><br>
            Chúng tôi đã nhận được thắc mắc của bạn với chủ đề "<strong>${subject}</strong>". 
            Đội ngũ hỗ trợ sẽ xem xét và phản hồi cho bạn trong thời gian sớm nhất (thường trong vòng 24-48 giờ).
          </p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Chi tiết thắc mắc:</strong></p>
            <p style="margin: 5px 0; color: #666;">${message.substring(0, 200)}${message.length > 200 ? "..." : ""}</p>
          </div>
          
          <p style="line-height: 1.6; color: #333; margin-bottom: 20px;">
            Nếu bạn có câu hỏi thêm, vui lòng trả lời email này hoặc liên hệ qua:<br>
            📞 (028) 1234 5678<br>
            📧 support@medicare.vn
          </p>
          
          <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 MediCare. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      `,
    };

    console.log("Sending confirmation email to user...");
    await transporter.sendMail(confirmationMailOptions);
    console.log("Confirmation email sent successfully");

    res.status(200).json({
      success: true,
      message: "Thắc mắc đã được gửi thành công!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
