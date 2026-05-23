import { Construction } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

const trans = {
  vi: {
    desc: "Tính năng này đang trong quá trình phát triển và sẽ sớm được ra mắt trong bản cập nhật tiếp theo. Cảm ơn bạn đã kiên nhẫn!",
    settingsTitle: "Cài đặt hệ thống",
  },
  en: {
    desc: "This feature is currently under active development and will be rolled out in an upcoming release. Thank you for your patience!",
    settingsTitle: "System Settings",
  },
};

const ComingSoon = ({ titleKey = "settingsTitle" }) => {
  const { t } = useTranslation(trans);
  const title = t[titleKey] || titleKey;
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] md:h-[70vh] text-center px-4">
      <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-50 dark:bg-blue-900/30 text-blue-300 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 md:mb-6">
        <Construction size={32} md={48} />
      </div>
      <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-1.5 md:mb-2">
        {title}
      </h1>
      <p className="text-xs md:text-sm text-[var(--text-secondary)] max-w-md">
        {t.desc}
      </p>
    </div>
  );
};

export default ComingSoon;
