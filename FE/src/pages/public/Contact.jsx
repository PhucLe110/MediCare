import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const trans = {
  vi: {
    backHome: "Về trang chủ",
    title: "Liên hệ hỗ trợ",
    description:
      "Gửi thắc mắc của bạn và chúng tôi sẽ phản hồi trong thời gian sớm nhất",
    contactInfo: "Thông tin liên hệ",
    phone: "Điện thoại",
    email: "Email",
    address: "Địa chỉ",
    supportTime: "Thời gian hỗ trợ",
    supportTimeDesc:
      "Đội ngũ hỗ trợ của chúng tôi hoạt động 24/7 để giải đáp mọi thắc mắc của bạn.",
    sendForm: "Gửi thắc mắc",
    name: "Họ tên",
    namePlaceholder: "Nhập họ tên của bạn",
    emailLabel: "Email",
    emailPlaceholder: "email@example.com",
    phoneLabel: "Số điện thoại",
    phonePlaceholder: "0901234567",
    subject: "Chủ đề",
    selectSubject: "Chọn chủ đề",
    subjectOptions: [
      "Hỗ trợ đặt lịch",
      "Vấn đề tài khoản",
      "Thanh toán",
      "Kết quả xét nghiệm",
      "Khác",
    ],
    message: "Nội dung thắc mắc",
    messagePlaceholder: "Mô tả chi tiết thắc mắc của bạn...",
    sending: "Đang gửi...",
    send: "Gửi thắc mắc",
    success: "Thắc mắc của bạn đã được gửi thành công!",
    error: "Có lỗi xảy ra. Vui lòng thử lại.",
  },
  en: {
    backHome: "Back to Home",
    title: "Contact Support",
    description: "Send your inquiry and we will respond as soon as possible",
    contactInfo: "Contact Information",
    phone: "Phone",
    email: "Email",
    address: "Address",
    supportTime: "Support Hours",
    supportTimeDesc:
      "Our support team operates 24/7 to answer all your inquiries.",
    sendForm: "Send Inquiry",
    name: "Full Name",
    namePlaceholder: "Enter your full name",
    emailLabel: "Email",
    emailPlaceholder: "email@example.com",
    phoneLabel: "Phone Number",
    phonePlaceholder: "0901234567",
    subject: "Subject",
    selectSubject: "Select a subject",
    subjectOptions: [
      "Booking Support",
      "Account Issues",
      "Payment",
      "Test Results",
      "Other",
    ],
    message: "Message",
    messagePlaceholder: "Describe your inquiry in detail...",
    sending: "Sending...",
    send: "Send Inquiry",
    success: "Your inquiry has been sent successfully!",
    error: "An error occurred. Please try again.",
  },
};

const Contact = () => {
  const { t } = useTranslation(trans);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send data to backend
      const response = await fetch("http://localhost:5001/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert(t.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Mail className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
            {t.title}
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Info */}
          <div className="space-y-6 md:space-y-8">
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 md:p-8 border border-[var(--border-color)]">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-6">
                {t.contactInfo}
              </h2>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Phone className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {t.phone}
                    </h3>
                    <p className="text-sm md:text-base text-[var(--text-secondary)]">
                      (028) 1234 5678
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Mail className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {t.email}
                    </h3>
                    <p className="text-sm md:text-base text-[var(--text-secondary)]">
                      support@medicare.vn
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {t.address}
                    </h3>
                    <p className="text-sm md:text-base text-[var(--text-secondary)]">
                      123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20">
              <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-3">
                {t.supportTime}
              </h3>
              <p className="text-sm md:text-base text-[var(--text-secondary)]">
                {t.supportTimeDesc}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 md:p-8 border border-[var(--border-color)]">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-6">
              {t.sendForm}
            </h2>

            {submitSuccess && (
              <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm md:text-base text-green-600 dark:text-green-400">
                  {t.success}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {t.name} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder={t.namePlaceholder}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {t.emailLabel} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={t.phonePlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {t.subject} *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">{t.selectSubject}</option>
                  {t.subjectOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {t.message} *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder={t.messagePlaceholder}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t.sending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{t.send}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
