import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

const trans = {
  vi: {
    title: "Tài khoản đã bị khóa",
    message:
      "Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ Admin để biết thêm thông tin.",
    redirecting: "Đang chuyển về trang đăng nhập trong",
    seconds: "giây",
    close: "Đóng ngay",
  },
  en: {
    title: "Account Blocked",
    message:
      "Your account has been blocked by the administrator. Please contact Admin for more information.",
    redirecting: "Redirecting to login page in",
    seconds: "seconds",
    close: "Close Now",
  },
};

const AccountBlockedModal = ({ isOpen, lang = "vi" }) => {
  const [countdown, setCountdown] = useState(15);
  const t = trans[lang] || trans.vi;

  const handleClose = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">
            {t.title}
          </h2>

          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {t.message}
          </p>

          <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 w-full">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-2">
              {t.redirecting}
            </p>
            <div className="text-4xl font-black text-primary">
              {countdown}
              <span className="text-lg font-medium text-[var(--text-secondary)] ml-1">
                {t.seconds}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="mt-4 w-full py-2.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 text-sm"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountBlockedModal;
