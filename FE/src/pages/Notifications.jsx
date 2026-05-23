import { API_URL as API, authFetch } from "../config";
import { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  CreditCard,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import {
  formatMoney,
  formatDoctorName,
  formatDate,
} from "../utils/i18nHelpers";

// const API = API;

const trans = {
  vi: {
    title: "Thông báo",
    all: "Tất cả",
    filterReminder: "⏰ Nhắc hẹn",
    filterBill: "Hóa đơn",
    filterUpdate: "Chẩn đoán",
    loading: "Đang tải thông báo...",
    noNotifications: "Không có thông báo",
    urgentText: "khẩn",
    urgentCountText: "thông báo cần chú ý",
    defaultCountText: "Cập nhật từ hệ thống MediCare",
    timeJustNow: "Vừa xong",
    timeMinutesAgo: "phút trước",
    timeHoursAgo: "giờ trước",
    timeDaysAgo: "ngày trước",
    timeUntilReady: "Đã đến giờ",
    generalDept: "Khoa tổng quát",
    doctorTitle: "Phụ trách",
    apptReminderTitle: "⏰ Nhắc lịch khám — Sắp đến giờ!",
    billTitle: "Hóa đơn mới cập nhật",
    billDescSuffix: "— Vui lòng thanh toán",
    billConsultation: "Phí khám bệnh",
    billLab: "Phí xét nghiệm",
    billMedicine: "Phí thuốc",
    completedApptTitle: "Cập nhật chẩn bệnh của Bác sĩ",
    completedApptDesc:
      "BS. {doctor} đã cập nhật thông tin chẩn đoán và đơn thuốc cho ca khám ngày {date}",
    payLabHint: " — Thanh toán để được xét nghiệm",
    payMedicineHint: " — Thanh toán để nhận thuốc",
    payConsultHint: " — Thanh toán để xác nhận lịch khám",
    minsRemaining: (m) => `còn ${m} phút`,
    hoursRemaining: (h) => `còn ${h} giờ`,
    minsAgo: (m) => `${m} phút trước`,
    hoursAgo: (h) => `${h} giờ trước`,
    daysAgo: (d) => `${d} ngày trước`,
  },
  en: {
    title: "Notifications",
    all: "All",
    filterReminder: "⏰ Reminders",
    filterBill: "Billing",
    filterUpdate: "Diagnosis",
    loading: "Loading notification stream...",
    noNotifications: "No notifications",
    urgentText: "urgent",
    urgentCountText: "notifications require attention",
    defaultCountText: "MediCare system updates",
    timeJustNow: "Just now",
    timeMinutesAgo: "minutes ago",
    timeHoursAgo: "hours ago",
    timeDaysAgo: "days ago",
    timeUntilReady: "Scheduled time has arrived",
    generalDept: "General Consultation",
    doctorTitle: "Attending Doctor",
    apptReminderTitle: "⏰ Appointment Reminder — Upcoming!",
    billTitle: "New Billing Statement Published",
    billDescSuffix: "— Please complete payment",
    billConsultation: "Consultation fee",
    billLab: "Lab test fee",
    billMedicine: "Medicine fee",
    completedApptTitle: "Clinical Record Updated",
    completedApptDesc:
      "Dr. {doctor} has successfully updated the medical diagnosis and prescription card for your visit on {date}",
    payLabHint: " — Pay to proceed with lab tests",
    payMedicineHint: " — Pay to receive medicine",
    payConsultHint: " — Pay to confirm appointment",
    minsRemaining: (m) => `${m} mins remaining`,
    hoursRemaining: (h) => `${h} hours remaining`,
    minsAgo: (m) => `${m} mins ago`,
    hoursAgo: (h) => `${h} hours ago`,
    daysAgo: (d) => `${d} days ago`,
  },
};

export default function Notifications() {
  const { t } = useTranslation(trans);
  const [appts, setAppts] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const fmt = (n) => formatMoney("vi", n);
  const getDoctorDisplayName = (name) =>
    formatDoctorName("vi", name) || t.doctorTitle;

  const timeAgo = (dateVal) => {
    const s = (Date.now() - new Date(dateVal)) / 1000; // eslint-disable-line react-hooks/purity
    if (s < 60) return t.timeJustNow;
    if (s < 3600) return t.minsAgo(Math.floor(s / 60));
    if (s < 86400) return t.hoursAgo(Math.floor(s / 3600));
    if (s < 86400 * 7) return t.daysAgo(Math.floor(s / 86400));
    return formatDate("vi", dateVal);
  };

  const timeUntil = (date, timeStr) => {
    const apptTime = new Date(`${date}T${timeStr}`);
    const mins = Math.round((apptTime - Date.now()) / 60000); // eslint-disable-line react-hooks/purity
    if (mins <= 0) return t.timeUntilReady;
    if (mins < 60) return t.minsRemaining(mins);
    return t.hoursRemaining(Math.round(mins / 60));
  };

  useEffect(() => {
    (async () => {
      try {
        const [ar, br] = await Promise.all([
          authFetch(`${API}/api/appointments`),
          authFetch(`${API}/api/bills/my`),
        ]);
        const [ad, bd] = await Promise.all([ar.json(), br.json()]);
        if (ad.success) setAppts(ad.data);
        if (bd.success) setBills(bd.data);
      } catch {
        // Error handling
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const all = [];

  // 1. 1-hour appointment reminders
  appts
    .filter((a) => a.status === "confirmed" || a.status === "pending")
    .forEach((a) => {
      const apptTime = new Date(`${a.date}T${a.time}`);
      const diff = (apptTime - Date.now()) / 60000; // eslint-disable-line react-hooks/purity
      if (diff >= 0 && diff <= 60) {
        all.push({
          id: `remind-${a._id}`,
          type: "reminder",
          urgent: true,
          icon: Clock,
          color: "#dc2626",
          bg: "#fef2f2",
          title: t.apptReminderTitle,
          desc: `${getDoctorDisplayName(a.doctor?.userId?.fullName)} • ${a.doctor?.department || t.generalDept} • ${a.time} — ${timeUntil(a.date, a.time)}`,
          time: new Date(),
          link: "/dashboard/history",
        });
      }
    });

  const billTypeLabel = (type) => {
    if (type === "consultation") return t.billConsultation;
    if (type === "lab") return t.billLab;
    if (type === "medicine") return t.billMedicine;
    return t.billTitle;
  };

  // 2. Unpaid bills — từng loại hóa đơn riêng
  bills
    .filter((b) => b.status === "unpaid")
    .forEach((b) => {
      const label = billTypeLabel(b.billType);
      const hint =
        b.billType === "lab"
          ? t.payLabHint
          : b.billType === "medicine"
            ? t.payMedicineHint
            : t.payConsultHint;
      all.push({
        id: `bill-unpaid-${b._id}`,
        type: "bill",
        urgent: true,
        icon: CreditCard,
        color: "#d97706",
        bg: "#fef3c7",
        title: label,
        desc: `${fmt(b.totalAmount)}${hint}`,
        time: b.createdAt,
        link: "/dashboard/billing",
      });
    });

  // 3. Completed appointments (Cập nhật chẩn bệnh)
  appts
    .filter((a) => a.status === "completed")
    .slice(0, 5)
    .forEach((a) => {
      const dateFormatted = formatDate("vi", a.date);
      all.push({
        id: `done-${a._id}`,
        type: "update",
        icon: Stethoscope,
        color: "#059669",
        bg: "#d1fae5",
        title: t.completedApptTitle,
        desc: t.completedApptDesc
          .replace("{doctor}", getDoctorDisplayName(a.doctor?.userId?.fullName))
          .replace("{date}", dateFormatted),
        time: a.updatedAt || a.createdAt,
        link: `/dashboard/appointment/${a._id}`,
      });
    });

  all.sort((a, b) => {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return new Date(b.time) - new Date(a.time);
  });

  const FILTERS = [
    { key: "all", label: t.all },
    { key: "reminder", label: t.filterReminder },
    { key: "bill", label: t.filterBill },
    { key: "update", label: t.filterUpdate },
  ];

  const displayed =
    filter === "all" ? all : all.filter((n) => n.type === filter);
  const urgentCount = all.filter((n) => n.urgent).length;

  return (
    <div className="max-w-lg md:max-w-2xl mx-auto px-2 py-4 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Bell size={18} md={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-[28px] font-black text-[var(--text-primary)] tracking-tight leading-none">
              {t.title}
            </h1>
            <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-semibold mt-1 md:mt-1">
              {urgentCount > 0
                ? `${urgentCount} ${t.urgentCountText}`
                : t.defaultCountText}
            </p>
          </div>
          {urgentCount > 0 && (
            <div className="ml-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-[10px] md:text-xs font-extrabold text-red-600 dark:text-red-400">
                {urgentCount} {t.urgentText}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map((f) => {
          const cnt =
            f.key === "all"
              ? all.length
              : all.filter((n) => n.type === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition-all border-none ${
                active
                  ? "bg-[var(--text-primary)] text-white shadow-md"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              }`}
            >
              {f.label}
              <span
                className={`text-[10px] md:text-[11px] font-extrabold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[var(--border-color)] text-[var(--text-tertiary)]"
                }`}
              >
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 md:py-20 flex justify-center">
          <div className="w-8 h-8 md:w-9 md:h-9 border-3 border-[var(--border-color)] border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-16 md:py-20 text-center text-[var(--text-tertiary)]">
          <Bell
            size={40}
            md={64}
            strokeWidth={1}
            className="mx-auto mb-4 md:mb-4"
          />
          <p className="font-bold text-xs md:text-sm uppercase tracking-widest">
            {t.noNotifications}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 md:gap-2.5">
          {displayed.map((n) => {
            const Icon = n.icon;
            const isReminder = n.type === "reminder";
            return (
              <div
                key={n.id}
                onClick={() => n.link && navigate(n.link)}
                className={`bg-[var(--card-bg)] rounded-xl md:rounded-2xl cursor-pointer border transition-all ${
                  isReminder
                    ? "border-red-200 dark:border-red-900/30 shadow-md shadow-red-500/10 bg-gradient-to-br from-red-50/50 dark:from-red-900/10 dark:to-transparent"
                    : n.urgent
                      ? "border-orange-200 dark:border-orange-900/30 shadow-sm shadow-orange-500/8"
                      : "border-[var(--border-color)] shadow-sm"
                } hover:shadow-lg`}
              >
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-5">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex-shrink-0 flex items-center justify-center ${
                      isReminder
                        ? "bg-red-50 dark:bg-red-900/30 shadow-md shadow-red-500/20"
                        : n.urgent
                          ? "bg-amber-50 dark:bg-amber-900/30 shadow-md shadow-amber-500/20"
                          : "bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    <Icon
                      size={18}
                      md={22}
                      className={
                        isReminder
                          ? "text-red-600 dark:text-red-400"
                          : n.urgent
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-[var(--text-secondary)]"
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-extrabold text-xs md:text-sm text-[var(--text-primary)] leading-tight">
                        {n.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {n.urgent && (
                          <span
                            className={`w-2 h-2 rounded-full animate-pulse ${isReminder ? "bg-red-500" : "bg-amber-500"}`}
                          />
                        )}
                        {n.link && (
                          <ChevronRight
                            size={12}
                            md={14}
                            className="text-[var(--text-tertiary)]"
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] md:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                      {n.desc}
                    </p>
                    <p className="text-[10px] md:text-xs text-[var(--text-tertiary)] font-semibold mt-1 md:mt-1.5">
                      {timeAgo(n.time)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
