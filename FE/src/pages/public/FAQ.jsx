import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const trans = {
  vi: {
    backHome: "Về trang chủ",
    title: "Câu hỏi thường gặp",
    description:
      "Tìm câu trả lời cho các thắc mắc phổ biến về dịch vụ MediCare",
    contactSupport: "Liên hệ hỗ trợ",
    noAnswer: "Không tìm thấy câu trả lời?",
    contactDesc: "Liên hệ với chúng tôi để được hỗ trợ trực tiếp",
    faqs: [
      {
        question: "Làm thế nào để đăng ký tài khoản MediCare?",
        answer:
          "Bạn có thể đăng ký tài khoản bằng cách nhấp vào nút 'Đăng ký' ở góc trên bên phải của trang web. Điền thông tin cá nhân của bạn, bao gồm tên, email, số điện thoại và mật khẩu. Sau đó xác nhận email của bạn để kích hoạt tài khoản.",
      },
      {
        question: "Làm thế nào để đặt lịch khám bệnh?",
        answer:
          "Sau khi đăng nhập, bạn có thể đặt lịch khám bằng cách vào trang Đặt lịch, chọn bác sĩ, ngày giờ phù hợp và điền thông tin bệnh lý cơ bản. Bạn sẽ nhận được xác nhận qua email và SMS.",
      },
      {
        question: "Tôi có thể hủy lịch khám đã đặt không?",
        answer:
          "Có, bạn có thể hủy lịch khám ít nhất 24 giờ trước giờ hẹn thông qua trang Lịch sử khám trong tài khoản của mình. Lịch hẹn bị hủy muộn hơn 24 giờ có thể bị tính phí.",
      },
      {
        question: "Làm thế nào để xem kết quả xét nghiệm?",
        answer:
          "Kết quả xét nghiệm sẽ được cập nhật trong trang Kết quả xét nghiệm của bạn khi bác sĩ đã duyệt. Bạn sẽ nhận được thông báo khi kết quả có sẵn.",
      },
      {
        question: "MediCare có bảo hiểm y tế không?",
        answer:
          "Hiện tại MediCare chấp nhận thanh toán qua bảo hiểm y tế của các đối tác liên kết. Vui lòng kiểm tra danh sách các công ty bảo hiểm chúng tôi chấp nhận trong phần Thanh toán.",
      },
      {
        question: "Làm thế nào để liên hệ với hỗ trợ khách hàng?",
        answer:
          "Bạn có thể liên hệ với chúng tôi qua số điện thoại (028) 1234 5678, email support@medicare.vn, hoặc sử dụng tính năng chat trực tuyến trên trang web. Đội ngũ hỗ trợ hoạt động 24/7.",
      },
      {
        question: "Thông tin cá nhân của tôi có được bảo mật không?",
        answer:
          "Tuyệt đối! MediCare tuân thủ nghiêm ngặt các quy định về bảo mật dữ liệu y tế. Tất cả thông tin của bạn đều được mã hóa và bảo vệ theo tiêu chuẩn quốc tế.",
      },
      {
        question: "Tôi có thể đổi bác sĩ đã chọn không?",
        answer:
          "Có, bạn có thể yêu cầu đổi bác sĩ trước ngày khám ít nhất 48 giờ. Vui lòng liên hệ với bộ phận hỗ trợ để xử lý yêu cầu này.",
      },
    ],
  },
  en: {
    backHome: "Back to Home",
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about MediCare services",
    contactSupport: "Contact Support",
    noAnswer: "Can't find an answer?",
    contactDesc: "Contact us for direct support",
    faqs: [
      {
        question: "How do I register a MediCare account?",
        answer:
          "You can register by clicking the 'Register' button in the top right corner of the website. Fill in your personal information including name, email, phone number and password. Then confirm your email to activate your account.",
      },
      {
        question: "How do I book an appointment?",
        answer:
          "After logging in, you can book an appointment by going to the Booking page, selecting a doctor, suitable date and time, and filling in basic medical information. You will receive confirmation via email and SMS.",
      },
      {
        question: "Can I cancel a booked appointment?",
        answer:
          "Yes, you can cancel an appointment at least 24 hours before the scheduled time through the Appointment History in your account. Appointments canceled less than 24 hours in advance may incur a fee.",
      },
      {
        question: "How do I view test results?",
        answer:
          "Test results will be updated in your Test Results page when approved by the doctor. You will receive a notification when results are available.",
      },
      {
        question: "Does MediCare accept health insurance?",
        answer:
          "Currently MediCare accepts payments through health insurance from partner companies. Please check the list of insurance companies we accept in the Payment section.",
      },
      {
        question: "How do I contact customer support?",
        answer:
          "You can contact us via phone at (028) 1234 5678, email at support@medicare.vn, or use the live chat feature on the website. Our support team operates 24/7.",
      },
      {
        question: "Is my personal information secure?",
        answer:
          "Absolutely! MediCare strictly complies with medical data privacy regulations. All your information is encrypted and protected according to international standards.",
      },
      {
        question: "Can I change my selected doctor?",
        answer:
          "Yes, you can request to change your doctor at least 48 hours before the appointment date. Please contact our support department to process this request.",
      },
    ],
  },
};

const FAQ = () => {
  const { t } = useTranslation(trans);
  const [openIndex, setOpenIndex] = useState(null);

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
            <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
            {t.title}
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {t.faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 md:px-8 md:py-6 flex items-center justify-between text-left"
              >
                <span className="text-base md:text-lg font-semibold text-[var(--text-primary)] pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)]">
                  {openIndex === index ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-secondary)]" />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 md:px-8 md:pb-6">
                  <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20">
            <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-3">
              {t.noAnswer}
            </h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)] mb-4">
              {t.contactDesc}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
            >
              <span>{t.contactSupport}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
