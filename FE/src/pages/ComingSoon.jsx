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
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 text-blue-300 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
        <Construction size={48} />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        {title}
      </h1>
      <p className="text-[var(--text-secondary)] max-w-md">{t.desc}</p>
    </div>
  );
};

export default ComingSoon;
