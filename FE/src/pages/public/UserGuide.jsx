import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  Shield,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const trans = {
  vi: {
    backHome: "Về trang chủ",
    title: "Hướng dẫn sử dụng",
    description:
      "Khám phá cách sử dụng MediCare để quản lý sức khỏe của bạn một cách hiệu quả",
    stepsTitle: "Bắt đầu với 5 bước đơn giản",
    featuresTitle: "Tính năng nổi bật",
    tipsTitle: "💡 Mẹo sử dụng hiệu quả",
    steps: [
      {
        icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Đăng ký tài khoản",
        description:
          "Tạo tài khoản MediCare với thông tin cá nhân cơ bản. Xác nhận email để kích hoạt tài khoản và bắt đầu sử dụng dịch vụ.",
        color: "from-blue-500 to-blue-600",
      },
      {
        icon: <Calendar className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Đặt lịch khám",
        description:
          "Chọn bác sĩ, ngày giờ phù hợp và điền thông tin bệnh lý. Nhận xác nhận ngay lập tức qua email và SMS.",
        color: "from-green-500 to-green-600",
      },
      {
        icon: <FileText className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Quản lý hồ sơ",
        description:
          "Lưu trữ và quản lý lịch sử bệnh án, kết quả xét nghiệm và đơn thuốc tất cả trong một nơi an toàn.",
        color: "from-purple-500 to-purple-600",
      },
      {
        icon: <Shield className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Theo dõi sức khỏe",
        description:
          "Theo dõi các chỉ số sức khỏe, nhận nhắc nhở tái khám và cập nhật từ bác sĩ của bạn.",
        color: "from-orange-500 to-orange-600",
      },
      {
        icon: <CreditCard className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Thanh toán tiện lợi",
        description:
          "Thanh toán trực tuyến an toàn, tích hợp bảo hiểm y tế và nhận hóa đơn điện tử chi tiết.",
        color: "from-pink-500 to-pink-600",
      },
    ],
    features: [
      {
        title: "Đặt lịch 24/7",
        description:
          "Đặt lịch khám bất cứ lúc nào, không giới hạn giờ làm việc",
      },
      {
        title: "Nhắc nhở thông minh",
        description: "Nhận thông báo về lịch hẹn, tái khám và uống thuốc",
      },
      {
        title: "Kết quả trực tuyến",
        description: "Xem kết quả xét nghiệm ngay khi có sẵn",
      },
      {
        title: "Chat với bác sĩ",
        description: "Trao đổi trực tiếp với bác sĩ qua tin nhắn",
      },
      {
        title: "Lịch sử y tế",
        description: "Lưu trữ toàn bộ hồ sơ bệnh án số hóa",
      },
      {
        title: "Bảo mật tuyệt đối",
        description: "Dữ liệu được mã hóa và bảo vệ theo chuẩn quốc tế",
      },
    ],
    tips: [
      "Điền đầy đủ thông tin cá nhân để bác sĩ có thể chẩn đoán chính xác hơn",
      "Kích hoạt thông báo để không bỏ lỡ lịch hẹn và kết quả xét nghiệm",
      "Lưu trữ ảnh chụp kết quả xét nghiệm để dễ dàng theo dõi sức khỏe",
      "Sử dụng tính năng chat để hỏi bác sĩ trước khi đến khám",
    ],
  },
  en: {
    backHome: "Back to Home",
    title: "User Guide",
    description:
      "Discover how to use MediCare to manage your health effectively",
    stepsTitle: "Get started in 5 simple steps",
    featuresTitle: "Key Features",
    tipsTitle: "💡 Tips for effective use",
    steps: [
      {
        icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Create Account",
        description:
          "Create a MediCare account with basic personal information. Confirm your email to activate your account and start using the service.",
        color: "from-blue-500 to-blue-600",
      },
      {
        icon: <Calendar className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Book Appointment",
        description:
          "Select a doctor, suitable date and time, and fill in medical information. Receive instant confirmation via email and SMS.",
        color: "from-green-500 to-green-600",
      },
      {
        icon: <FileText className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Manage Records",
        description:
          "Store and manage medical history, test results and prescriptions all in one secure place.",
        color: "from-purple-500 to-purple-600",
      },
      {
        icon: <Shield className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Track Health",
        description:
          "Monitor health indicators, receive follow-up reminders and updates from your doctor.",
        color: "from-orange-500 to-orange-600",
      },
      {
        icon: <CreditCard className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Easy Payment",
        description:
          "Secure online payment, health insurance integration and detailed electronic invoices.",
        color: "from-pink-500 to-pink-600",
      },
    ],
    features: [
      {
        title: "24/7 Booking",
        description: "Book appointments anytime, no working hour restrictions",
      },
      {
        title: "Smart Reminders",
        description:
          "Receive notifications about appointments, follow-ups and medications",
      },
      {
        title: "Online Results",
        description: "View test results as soon as they are available",
      },
      {
        title: "Chat with Doctors",
        description: "Communicate directly with doctors via messaging",
      },
      {
        title: "Medical History",
        description: "Store complete digital medical records",
      },
      {
        title: "Absolute Security",
        description:
          "Data encrypted and protected according to international standards",
      },
    ],
    tips: [
      "Fill in complete personal information for more accurate diagnosis by doctors",
      "Enable notifications to never miss appointments and test results",
      "Store test result images for easy health tracking",
      "Use chat feature to ask doctors before your visit",
    ],
  },
};

const UserGuide = () => {
  const { t } = useTranslation(trans);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 md:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
            {t.title}
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-center mb-8 md:mb-12">
            {t.stepsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {t.steps.map((step, index) => (
              <div
                key={index}
                className="bg-[var(--card-bg)] rounded-2xl p-6 md:p-8 border border-[var(--border-color)] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${step.color} rounded-xl mb-4 shadow-lg`}
                >
                  <div className="text-white">{step.icon}</div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-center mb-8 md:mb-12">
            {t.featuresTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {t.features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[var(--card-bg)] to-[var(--bg-secondary)] rounded-xl p-5 md:p-6 border border-[var(--border-color)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-primary rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-[var(--text-secondary)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4 md:mb-6">
            {t.tipsTitle}
          </h2>
          <ul className="space-y-3 md:space-y-4">
            {t.tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm md:text-base text-[var(--text-secondary)]"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                  {index + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
