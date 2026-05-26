import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
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
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 md:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-6 shadow-lg shadow-primary/30">
            <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Câu hỏi thường gặp
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Tìm câu trả lời cho các thắc mắc phổ biến về dịch vụ MediCare
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
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
              Không tìm thấy câu trả lời?
            </h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)] mb-4">
              Liên hệ với chúng tôi để được hỗ trợ trực tiếp
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
            >
              <span>Liên hệ hỗ trợ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
