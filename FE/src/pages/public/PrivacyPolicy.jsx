import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const trans = {
  vi: {
    backHome: "Về trang chủ",
    title: "Chính sách bảo mật",
    description:
      "Chúng tôi cam kết bảo vệ thông tin cá nhân và dữ liệu y tế của bạn",
    lastUpdated: "Cập nhật lần cuối: Tháng 5, 2024",
    intro:
      "Tại MediCare, chúng tôi hiểu rằng thông tin y tế của bạn là cực kỳ quan trọng và nhạy cảm. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, bảo vệ và chia sẻ thông tin của bạn. Bằng cách sử dụng dịch vụ của chúng tôi, bạn đồng ý với các thực tiễn được mô tả trong chính sách này.",
    contactTitle: "Câu hỏi về bảo mật?",
    contactDesc:
      "Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật của chúng tôi, vui lòng liên hệ:",
    sections: [
      {
        icon: <Shield className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Thông tin chúng tôi thu thập",
        content: [
          "Thông tin cá nhân: Họ tên, ngày sinh, giới tính, địa chỉ, số điện thoại, email",
          "Thông tin y tế: Lịch sử bệnh án, kết quả xét nghiệm, đơn thuốc, chẩn đoán",
          "Thông tin tài khoản: Tên đăng nhập, mật khẩu (được mã hóa), lịch sử đăng nhập",
          "Thông tin thanh toán: Thông tin thẻ (được mã hóa), lịch sử giao dịch",
          "Thông tin sử dụng: Lịch sử truy cập, tương tác với dịch vụ, sở thích cá nhân",
        ],
      },
      {
        icon: <Lock className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Cách chúng tôi bảo vệ thông tin",
        content: [
          "Mã hóa dữ liệu: Tất cả thông tin được mã hóa bằng chuẩn SSL/TLS 256-bit",
          "Xác thực đa yếu tố: Bảo vệ tài khoản bằng lớp bảo mật bổ sung",
          "Kiểm soát truy cập: Chỉ nhân viên được ủy quyền mới có thể truy cập dữ liệu",
          "Sao lưu thường xuyên: Dữ liệu được sao lưu và lưu trữ tại nhiều địa điểm",
          "Giám sát 24/7: Hệ thống được giám sát liên tục để phát hiện và ngăn chặn xâm nhập",
        ],
      },
      {
        icon: <Eye className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Chúng tôi sử dụng thông tin như thế nào",
        content: [
          "Cung cấp dịch vụ y tế: Đặt lịch, chẩn đoán, điều trị và theo dõi sức khỏe",
          "Cải thiện dịch vụ: Phân tích dữ liệu để nâng cao chất lượng trải nghiệm",
          "Giao tiếp: Gửi thông báo, nhắc nhở và cập nhật quan trọng",
          "Nghiên cứu: Nghiên cứu y tế ẩn danh để cải thiện chăm sóc sức khỏe",
          "Tuân thủ pháp luật: Đáp ứng các yêu cầu pháp lý và quy định y tế",
        ],
      },
      {
        icon: <Database className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Quyền của bạn",
        content: [
          "Quyền truy cập: Xem và tải xuống thông tin cá nhân của bạn",
          "Quyền chỉnh sửa: Cập nhật hoặc sửa đổi thông tin không chính xác",
          "Quyền xóa: Yêu cầu xóa thông tin khi không còn cần thiết",
          "Quyền hạn chế: Yêu cầu hạn chế xử lý thông tin trong một số trường hợp",
          "Quyền khiếu nại: Khiếu nại với cơ quan bảo vệ dữ liệu nếu cần thiết",
        ],
      },
      {
        icon: <UserCheck className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Chia sẻ thông tin",
        content: [
          "Bác sĩ và nhân viên y tế: Chỉ những người cần thiết để cung cấp dịch vụ",
          "Đối tác bảo hiểm: Khi bạn sử dụng bảo hiểm y tế để thanh toán",
          "Cơ quan y tế: Khi được yêu cầu bởi pháp luật hoặc quy định",
          "Nhà cung cấp dịch vụ: Các bên thứ ba được kiểm soát chặt chẽ",
          "Không bao giờ bán: Chúng tôi không bán thông tin của bạn cho bên thứ ba",
        ],
      },
      {
        icon: <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Cookie và theo dõi",
        content: [
          "Cookie thiết yếu: Cần thiết để hoạt động của trang web",
          "Cookie hiệu suất: Giúp chúng tôi cải thiện tốc độ và trải nghiệm",
          "Cookie chức năng: Ghi nhớ preferences và cài đặt của bạn",
          "Cookie quảng cáo: Hiển thị quảng cáo phù hợp (có thể tắt)",
          "Bạn có thể quản lý cookie trong cài đặt trình duyệt của mình",
        ],
      },
    ],
  },
  en: {
    backHome: "Back to Home",
    title: "Privacy Policy",
    description:
      "We are committed to protecting your personal information and medical data",
    lastUpdated: "Last updated: May 2024",
    intro:
      "At MediCare, we understand that your medical information is extremely important and sensitive. This privacy policy explains how we collect, use, protect and share your information. By using our services, you agree to the practices described in this policy.",
    contactTitle: "Questions about privacy?",
    contactDesc:
      "If you have any questions about our privacy policy, please contact:",
    sections: [
      {
        icon: <Shield className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Information we collect",
        content: [
          "Personal information: Name, date of birth, gender, address, phone number, email",
          "Medical information: Medical history, test results, prescriptions, diagnoses",
          "Account information: Username, password (encrypted), login history",
          "Payment information: Card information (encrypted), transaction history",
          "Usage information: Access history, service interactions, personal preferences",
        ],
      },
      {
        icon: <Lock className="w-5 h-5 md:w-6 md:h-6" />,
        title: "How we protect your information",
        content: [
          "Data encryption: All information is encrypted using SSL/TLS 256-bit standard",
          "Multi-factor authentication: Additional security layer for account protection",
          "Access control: Only authorized personnel can access data",
          "Regular backups: Data is backed up and stored at multiple locations",
          "24/7 monitoring: System is continuously monitored to detect and prevent intrusions",
        ],
      },
      {
        icon: <Eye className="w-5 h-5 md:w-6 md:h-6" />,
        title: "How we use your information",
        content: [
          "Provide medical services: Booking, diagnosis, treatment and health monitoring",
          "Improve services: Analyze data to enhance experience quality",
          "Communication: Send notifications, reminders and important updates",
          "Research: Anonymous medical research to improve healthcare",
          "Legal compliance: Meet legal requirements and medical regulations",
        ],
      },
      {
        icon: <Database className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Your rights",
        content: [
          "Access right: View and download your personal information",
          "Edit right: Update or modify inaccurate information",
          "Delete right: Request deletion when no longer needed",
          "Restrict right: Request to limit processing in certain cases",
          "Complaint right: File complaint with data protection authority if necessary",
        ],
      },
      {
        icon: <UserCheck className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Information sharing",
        content: [
          "Doctors and medical staff: Only those necessary to provide services",
          "Insurance partners: When you use health insurance for payment",
          "Medical authorities: When required by law or regulations",
          "Service providers: Carefully controlled third parties",
          "Never sold: We never sell your information to third parties",
        ],
      },
      {
        icon: <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Cookies and tracking",
        content: [
          "Essential cookies: Necessary for website operation",
          "Performance cookies: Help us improve speed and experience",
          "Functional cookies: Remember your preferences and settings",
          "Advertising cookies: Display relevant ads (can be disabled)",
          "You can manage cookies in your browser settings",
        ],
      },
    ],
  },
};

const PrivacyPolicy = () => {
  const { t } = useTranslation(trans);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 md:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-primary hover:border-primary transition-all mb-6 md:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t.backHome}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-6 shadow-lg shadow-primary/30">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
            {t.title}
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.description}
          </p>
          <p className="text-sm md:text-base text-[var(--text-tertiary)] mt-4">
            {t.lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20 mb-8 md:mb-12">
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            {t.intro}
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6 md:space-y-8">
          {t.sections.map((section, index) => (
            <div
              key={index}
              className="bg-[var(--card-bg)] rounded-2xl p-6 md:p-8 border border-[var(--border-color)] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  {section.icon}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-start gap-3 text-sm md:text-base text-[var(--text-secondary)]"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full mt-2 md:mt-2.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 md:mt-16 bg-[var(--card-bg)] rounded-2xl p-6 md:p-8 border border-[var(--border-color)]">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">
            {t.contactTitle}
          </h2>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6">
            {t.contactDesc}
          </p>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 text-sm md:text-base text-[var(--text-secondary)]">
              <span className="text-primary">📧</span>
              <a
                href="mailto:privacy@medicare.vn"
                className="text-primary hover:underline"
              >
                privacy@medicare.vn
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm md:text-base text-[var(--text-secondary)]">
              <span className="text-primary">📞</span>
              <span>(028) 1234 5678</span>
            </div>
            <div className="flex items-center gap-3 text-sm md:text-base text-[var(--text-secondary)]">
              <span className="text-primary">📍</span>
              <span>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
