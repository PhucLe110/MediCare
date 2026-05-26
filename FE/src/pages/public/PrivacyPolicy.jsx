import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <Shield className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Thông tin chúng tôi thu thập",
      content: [
        "Thông tin cá nhân: Họ tên, ngày sinh, giới tính, địa chỉ, số điện thoại, email",
        "Thông tin y tế: Lịch sử bệnh án, kết quả xét nghiệm, đơn thuốc, chẩn đoán",
        "Thông tin tài khoản: Tên đăng nhập, mật khẩu (được mã hóa), lịch sử đăng nhập",
        "Thông tin thanh toán: Thông tin thẻ (được mã hóa), lịch sử giao dịch",
        "Thông tin sử dụng: Lịch sử truy cập, tương tác với dịch vụ, sở thích cá nhân"
      ]
    },
    {
      icon: <Lock className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Cách chúng tôi bảo vệ thông tin",
      content: [
        "Mã hóa dữ liệu: Tất cả thông tin được mã hóa bằng chuẩn SSL/TLS 256-bit",
        "Xác thực đa yếu tố: Bảo vệ tài khoản bằng lớp bảo mật bổ sung",
        "Kiểm soát truy cập: Chỉ nhân viên được ủy quyền mới có thể truy cập dữ liệu",
        "Sao lưu thường xuyên: Dữ liệu được sao lưu và lưu trữ tại nhiều địa điểm",
        "Giám sát 24/7: Hệ thống được giám sát liên tục để phát hiện và ngăn chặn xâm nhập"
      ]
    },
    {
      icon: <Eye className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Chúng tôi sử dụng thông tin như thế nào",
      content: [
        "Cung cấp dịch vụ y tế: Đặt lịch, chẩn đoán, điều trị và theo dõi sức khỏe",
        "Cải thiện dịch vụ: Phân tích dữ liệu để nâng cao chất lượng trải nghiệm",
        "Giao tiếp: Gửi thông báo, nhắc nhở và cập nhật quan trọng",
        "Nghiên cứu: Nghiên cứu y tế ẩn danh để cải thiện chăm sóc sức khỏe",
        "Tuân thủ pháp luật: Đáp ứng các yêu cầu pháp lý và quy định y tế"
      ]
    },
    {
      icon: <Database className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Quyền của bạn",
      content: [
        "Quyền truy cập: Xem và tải xuống thông tin cá nhân của bạn",
        "Quyền chỉnh sửa: Cập nhật hoặc sửa đổi thông tin không chính xác",
        "Quyền xóa: Yêu cầu xóa thông tin khi không còn cần thiết",
        "Quyền hạn chế: Yêu cầu hạn chế xử lý thông tin trong một số trường hợp",
        "Quyền khiếu nại: Khiếu nại với cơ quan bảo vệ dữ liệu nếu cần thiết"
      ]
    },
    {
      icon: <UserCheck className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Chia sẻ thông tin",
      content: [
        "Bác sĩ và nhân viên y tế: Chỉ những người cần thiết để cung cấp dịch vụ",
        "Đối tác bảo hiểm: Khi bạn sử dụng bảo hiểm y tế để thanh toán",
        "Cơ quan y tế: Khi được yêu cầu bởi pháp luật hoặc quy định",
        "Nhà cung cấp dịch vụ: Các bên thứ ba được kiểm soát chặt chẽ",
        "Không bao giờ bán: Chúng tôi không bán thông tin của bạn cho bên thứ ba"
      ]
    },
    {
      icon: <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Cookie và theo dõi",
      content: [
        "Cookie thiết yếu: Cần thiết để hoạt động của trang web",
        "Cookie hiệu suất: Giúp chúng tôi cải thiện tốc độ và trải nghiệm",
        "Cookie chức năng: Ghi nhớ preferences và cài đặt của bạn",
        "Cookie quảng cáo: Hiển thị quảng cáo phù hợp (có thể tắt)",
        "Bạn có thể quản lý cookie trong cài đặt trình duyệt của mình"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 md:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-6 shadow-lg shadow-primary/30">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Chính sách bảo mật
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Chúng tôi cam kết bảo vệ thông tin cá nhân và dữ liệu y tế của bạn
          </p>
          <p className="text-sm md:text-base text-[var(--text-tertiary)] mt-4">
            Cập nhật lần cuối: Tháng 5, 2024
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20 mb-8 md:mb-12">
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            Tại MediCare, chúng tôi hiểu rằng thông tin y tế của bạn là cực kỳ quan trọng và nhạy cảm. 
            Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, bảo vệ và chia sẻ thông tin của bạn. 
            Bằng cách sử dụng dịch vụ của chúng tôi, bạn đồng ý với các thực tiễn được mô tả trong chính sách này.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6 md:space-y-8">
          {sections.map((section, index) => (
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
            Câu hỏi về bảo mật?
          </h2>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6">
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật của chúng tôi, vui lòng liên hệ:
          </p>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 text-sm md:text-base text-[var(--text-secondary)]">
              <span className="text-primary">📧</span>
              <a href="mailto:privacy@medicare.vn" className="text-primary hover:underline">
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
