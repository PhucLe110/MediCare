import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const trans = {
  vi: {
    backHome: "Về trang chủ",
    title: "Điều khoản sử dụng",
    description: "Quy định và điều kiện khi sử dụng dịch vụ MediCare",
    lastUpdated: "Cập nhật lần cuối: Tháng 5, 2024",
    importantNotice: "Lưu ý quan trọng",
    importantNoticeDesc:
      "MediCare không phải là dịch vụ cấp cứu khẩn cấp. Trong trường hợp nguy kịch, hãy gọi 115 hoặc đến cơ sở y tế gần nhất ngay lập tức.",
    agreementTitle: "Đồng ý điều khoản",
    agreementDesc:
      "Bằng cách tiếp tục sử dụng dịch vụ MediCare, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ các điều khoản sử dụng này. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi trước khi sử dụng dịch vụ.",
    contactSupport: "Liên hệ hỗ trợ",
    viewPrivacy: "Xem chính sách bảo mật",
    sections: [
      {
        icon: <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Chấp nhận điều khoản",
        content: [
          "Bằng cách truy cập và sử dụng dịch vụ MediCare, bạn đồng ý tuân thủ các điều khoản sử dụng này",
          "Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ",
          "Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào với thông báo trước",
          "Việc tiếp tục sử dụng dịch vụ sau khi thay đổi được coi là chấp nhận các điều khoản mới",
        ],
      },
      {
        icon: <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Trách nhiệm của người dùng",
        content: [
          "Cung cấp thông tin chính xác và cập nhật khi đăng ký và sử dụng dịch vụ",
          "Bảo mật thông tin đăng nhập và không chia sẻ với người khác",
          "Không sử dụng dịch vụ cho bất kỳ mục đích bất hợp pháp hoặc trái phép",
          "Không cố gắng can thiệp, làm hỏng hoặc làm gián đoạn hoạt động của hệ thống",
          "Tôn trọng bác sĩ và nhân viên y tế trong tất cả các tương tác",
        ],
      },
      {
        icon: <XCircle className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Hạn chế sử dụng",
        content: [
          "Không sử dụng dịch vụ để chẩn đoán hoặc điều trị khẩn cấp - hãy gọi 115",
          "Không cung cấp thông tin sai lệch hoặc giả mạo về bản thân hoặc người khác",
          "Không đăng tải nội dung vi phạm bản quyền, thô tục hoặc gây hại",
          "Không thu thập thông tin của người dùng khác mà không được phép",
          "Không sử dụng dịch vụ để spam, quảng cáo hoặc tiếp thị không được ủy quyền",
        ],
      },
      {
        icon: <Scale className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Dịch vụ y tế",
        content: [
          "MediCare cung cấp nền tảng kết nối giữa bệnh nhân và bác sĩ",
          "Bác sĩ trên nền tảng là những chuyên gia được cấp phép và có kinh nghiệm",
          "Chẩn đoán và điều trị trực tuyến không thay thế hoàn toàn khám trực tiếp",
          "Trong trường hợp khẩn cấp, hãy đến cơ sở y tế gần nhất hoặc gọi cấp cứu",
          "Chúng tôi không chịu trách nhiệm cho các quyết định y tế dựa trên thông tin trên nền tảng",
        ],
      },
      {
        icon: <Globe className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Sở hữu trí tuệ",
        content: [
          "Tất cả nội dung, thiết kế và chức năng của MediCare là tài sản của chúng tôi",
          "Bạn không được sao chép, sửa đổi hoặc phân phối lại mà không có sự cho phép",
          "Logo, tên thương hiệu và các yếu tố nhận dạng được bảo vệ bởi luật bản quyền",
          "Thông tin y tế được cung cấp chỉ dành cho mục đích cá nhân, không thương mại",
        ],
      },
      {
        icon: <FileText className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Giới hạn trách nhiệm",
        content: [
          "MediCare không đảm bảo dịch vụ sẽ không bị gián đoạn hoặc không có lỗi",
          "Chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp hoặc hậu quả",
          "Dịch vụ được cung cấp 'như hiện có' và 'như có sẵn'",
          "Chúng tôi không chịu trách nhiệm cho hành động của bác sĩ hoặc người dùng khác",
          "Trong phạm vi tối đa cho phép bởi pháp luật, trách nhiệm của chúng tôi được giới hạn",
        ],
      },
    ],
  },
  en: {
    backHome: "Back to Home",
    title: "Terms of Use",
    description: "Terms and conditions for using MediCare services",
    lastUpdated: "Last updated: May 2024",
    importantNotice: "Important Notice",
    importantNoticeDesc:
      "MediCare is not an emergency medical service. In life-threatening situations, call 115 or go to the nearest medical facility immediately.",
    agreementTitle: "Agreement to Terms",
    agreementDesc:
      "By continuing to use MediCare services, you confirm that you have read, understood and agree to abide by these terms of use. If you have any questions, please contact us before using the service.",
    contactSupport: "Contact Support",
    viewPrivacy: "View Privacy Policy",
    sections: [
      {
        icon: <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Acceptance of Terms",
        content: [
          "By accessing and using MediCare services, you agree to comply with these terms of use",
          "If you do not agree with any part of these terms, please do not use the service",
          "We reserve the right to change these terms at any time with prior notice",
          "Continued use of the service after changes constitutes acceptance of the new terms",
        ],
      },
      {
        icon: <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />,
        title: "User Responsibilities",
        content: [
          "Provide accurate and updated information when registering and using the service",
          "Protect your login information and do not share it with others",
          "Do not use the service for any illegal or unauthorized purposes",
          "Do not attempt to interfere, damage or disrupt system operations",
          "Respect doctors and medical staff in all interactions",
        ],
      },
      {
        icon: <XCircle className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Usage Restrictions",
        content: [
          "Do not use the service for emergency diagnosis or treatment - call 115",
          "Do not provide false or misleading information about yourself or others",
          "Do not post content that is infringing, obscene or harmful",
          "Do not collect information from other users without permission",
          "Do not use the service for spam, advertising or unauthorized marketing",
        ],
      },
      {
        icon: <Scale className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Medical Services",
        content: [
          "MediCare provides a platform connecting patients and doctors",
          "Doctors on the platform are licensed and experienced professionals",
          "Online diagnosis and treatment do not completely replace in-person visits",
          "In emergencies, go to the nearest medical facility or call emergency services",
          "We are not responsible for medical decisions based on platform information",
        ],
      },
      {
        icon: <Globe className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Intellectual Property",
        content: [
          "All content, design and functionality of MediCare are our property",
          "You may not copy, modify or redistribute without permission",
          "Logo, brand name and identifying elements are protected by copyright law",
          "Medical information provided is for personal, non-commercial purposes only",
        ],
      },
      {
        icon: <FileText className="w-5 h-5 md:w-6 md:h-6" />,
        title: "Limitation of Liability",
        content: [
          "MediCare does not guarantee the service will be uninterrupted or error-free",
          "We are not responsible for indirect or consequential damages",
          "Service is provided 'as is' and 'as available'",
          "We are not responsible for actions of doctors or other users",
          "To the maximum extent permitted by law, our liability is limited",
        ],
      },
    ],
  },
};

const TermsOfUse = () => {
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
            <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
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

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-2xl p-6 md:p-8 border border-orange-500/20 mb-8 md:mb-12">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-2">
                {t.importantNotice}
              </h3>
              <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                {t.importantNoticeDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
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

        {/* Agreement Section */}
        <div className="mt-12 md:mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">
            {t.agreementTitle}
          </h2>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6 leading-relaxed">
            {t.agreementDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@medicare.vn"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
            >
              <span>{t.contactSupport}</span>
            </a>
            <a
              href="/privacy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
              <span>{t.viewPrivacy}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
