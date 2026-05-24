import { API_URL as API, authFetch, getStoredUser } from "../config";
import { useState, useEffect } from "react";
import {
  Calendar,
  FlaskConical,
  Pill,
  CreditCard,
  AlertCircle,
  ArrowUpRight,
  Printer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { ticketTrans, mergeTrans } from "../i18n/ticketI18n";
import {
  formatMoney,
  formatDoctorName,
  getLocalizedDept,
  formatApptMonth,
  formatDate,
  getLocale,
} from "../utils/i18nHelpers";

const trans = mergeTrans(
  {
    vi: {
      welcome: "Xin chào",
      upcomingCount: (c) => `Bạn có ${c} lịch hẹn sắp tới`,
      healthyWish: "Chúc bạn một ngày sức khỏe tốt lành",
      apptSoon: "Sắp đến giờ khám!",
      unpaidAlert: (c) => `${c} hóa đơn chưa trả`,
      payNow: "Bấm để thanh toán →",

      statAppts: "Lịch hẹn",
      statApptsSub: (c) => `${c} đã khám`,
      statLabs: "Xét nghiệm",
      statLabsSub: "kết quả",
      statRxs: "Đơn thuốc",
      statRxsSub: "đơn thuốc",
      statPaid: "Đã thanh toán",
      statPaidSub: (c) => `${c} hóa đơn`,

      myAppts: "Lịch hẹn của bạn",
      viewAll: "Xem tất cả",
      newAppt: "+ Đặt lịch mới",
      noAppt: "Chưa có lịch hẹn",
      soon: "Sắp đến!",
      genDept: "Khoa tổng quát",
      doctorTitle: "Bác sĩ phụ trách",

      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      completed: "Đã khám",
      cancelled: "Đã hủy",

      justNow: "Vừa xong",
      minsAgo: (m) => `${m} phút trước`,
      hoursAgo: (h) => `${h} giờ trước`,
      daysAgo: (d) => `${d} ngày trước`,

      booking: "Đặt lịch khám",
      results: "Kết quả XN",
      prescriptions: "Đơn thuốc",
      billing: "Thanh toán",
      pending_payment: "Chờ thanh toán",
    },
    en: {
      welcome: "Welcome",
      upcomingCount: (c) =>
        `You have ${c} upcoming appointment${c > 1 ? "s" : ""}`,
      healthyWish: "Wishing you a healthy and productive day",
      apptSoon: "Consultation starting soon!",
      unpaidAlert: (c) => `${c} unpaid bill${c > 1 ? "s" : ""}`,
      payNow: "Pay now →",

      statAppts: "Appointments",
      statApptsSub: (c) => `${c} completed`,
      statLabs: "Lab Results",
      statLabsSub: "results available",
      statRxs: "Prescriptions",
      statRxsSub: "prescriptions",
      statPaid: "Total Paid",
      statPaidSub: (c) => `${c} invoice${c > 1 ? "s" : ""}`,

      myAppts: "Your Appointments",
      viewAll: "View All",
      newAppt: "+ New Appointment",
      noAppt: "No appointments scheduled",
      soon: "Soon!",
      genDept: "General Dept",
      doctorTitle: "Attending Physician",

      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",

      justNow: "Just now",
      minsAgo: (m) => `${m} mins ago`,
      hoursAgo: (h) => `${h} hours ago`,
      daysAgo: (d) => `${d} days ago`,

      booking: "Book Appointment",
      results: "Lab Results",
      prescriptions: "Prescriptions",
      billing: "Billing & Fees",
      pending_payment: "Pending payment",
    },
  },
  ticketTrans,
);

export default function Dashboard() {
  const { lang, t } = useTranslation(trans);
  const [user, setUser] = useState(null);
  const [appts, setAppts] = useState([]);
  const [bills, setBills] = useState([]);
  const [labs, setLabs] = useState([]);
  const [rxs, setRxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketAppt, setSelectedTicketAppt] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const navigate = useNavigate();

  const fmt = (n) => formatMoney(lang, n);
  const locale = getLocale(lang);

  const STATUS = {
    pending: { label: t.pending, color: "#d97706", bg: "#fef3c7" },
    pending_payment: {
      label: t.pending_payment,
      color: "#d97706",
      bg: "#fef3c7",
    },
    confirmed: { label: t.confirmed, color: "#2563eb", bg: "#dbeafe" },
    completed: { label: t.completed, color: "#059669", bg: "#d1fae5" },
    cancelled: { label: t.cancelled, color: "#dc2626", bg: "#fee2e2" },
  };

  const getDoctorDisplayName = (name) =>
    formatDoctorName(lang, name) || t.doctorTitle;

  useEffect(() => {
    const u = getStoredUser();
    if (!u) return navigate("/");

    // Check if user needs to complete profile (first-time Google users)
    if (u.profileCompleted === false) {
      return navigate("/dashboard/records");
    }

    (async () => {
      try {
        const [ar, br, lr, rxr] = await Promise.all([
          authFetch(`${API}/api/appointments`),
          authFetch(`${API}/api/bills/my`),
          authFetch(`${API}/api/lab-results/my`),
          authFetch(`${API}/api/prescriptions/my`),
        ]);
        const [ad, bd, ld, rxd] = await Promise.all([
          ar.json(),
          br.json(),
          lr.json(),
          rxr.json(),
        ]);
        if (ad.success) setAppts(ad.data);
        if (bd.success) setBills(bd.data);
        if (ld.success) setLabs(ld.data);
        if (rxd.success) setRxs(rxd.data);
        setUser(u);
      } catch {
        // Error handling
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upcoming = appts.filter(
    (a) =>
      a.status === "confirmed" ||
      a.status === "pending" ||
      a.status === "pending_payment",
  );
  const completed = appts.filter((a) => a.status === "completed");
  const paidTotal = bills
    .filter((b) => b.status === "paid")
    .reduce((s, b) => s + b.totalAmount, 0);
  const unpaidBills = bills.filter((b) => b.status === "unpaid");

  // Check 1-hour reminder
  const soonAppts = appts
    .filter((a) => a.status === "confirmed" || a.status === "pending")
    .filter((a) => {
      const apptTime = new Date(`${a.date}T${a.time}`);
      const diff = (apptTime - Date.now()) / 60000; // eslint-disable-line react-hooks/purity
      return diff >= 0 && diff <= 60;
    });

  const formattedDate = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const STATS = [
    {
      label: t.statAppts,
      value: upcoming.length,
      sub: t.statApptsSub(completed.length),
      icon: Calendar,
      color: "#2563eb",
      bg: "#dbeafe",
      link: "/dashboard/booking",
    },
    {
      label: t.statLabs,
      value: labs.length,
      sub: `${labs.length} ${t.statLabsSub}`,
      icon: FlaskConical,
      color: "#7c3aed",
      bg: "#ede9fe",
      link: "/dashboard/lab-results",
    },
    {
      label: t.statRxs,
      value: rxs.length,
      sub: `${rxs.length} ${t.statRxsSub}`,
      icon: Pill,
      color: "#059669",
      bg: "#d1fae5",
      link: "/dashboard/prescriptions",
    },
    {
      label: t.statPaid,
      value: fmt(paidTotal),
      sub: t.statPaidSub(bills.filter((b) => b.status === "paid").length),
      icon: CreditCard,
      color: "#d97706",
      bg: "#fef3c7",
      link: "/dashboard/billing",
      money: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-6">
      {/* ── HERO GREETING ── */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a56db] rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-10 mb-4 md:mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 md:w-56 md:h-56 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 right-24 w-24 h-24 md:w-40 md:h-40 bg-white/5 rounded-full" />
        <div>
          <p className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5 md:mb-2">
            {formattedDate}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight mb-2 md:mb-2.5 leading-tight">
            {t.welcome}, {user?.fullName?.split(" ").slice(-1)[0]} 👋
          </h1>
          <p className="text-xs md:text-sm text-white/65 font-medium">
            {upcoming.length > 0
              ? t.upcomingCount(upcoming.length)
              : t.healthyWish}
          </p>
        </div>
        {soonAppts.length > 0 && (
          <div
            onClick={() => navigate("/dashboard/booking")}
            className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3.5 md:p-4 lg:p-6 cursor-pointer border border-white/20 flex-shrink-0 w-full md:w-auto hover:bg-white/15 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              <p className="text-[10px] md:text-xs font-black text-red-300 uppercase tracking-wider">
                {t.apptSoon}
              </p>
            </div>
            <p className="text-lg md:text-xl font-black text-white">
              {soonAppts[0].time}
            </p>
            <p className="text-[10px] md:text-xs text-white/70 mt-0.5">
              {getDoctorDisplayName(soonAppts[0].doctor?.userId?.fullName)}
            </p>
          </div>
        )}
        {unpaidBills.length > 0 && soonAppts.length === 0 && (
          <div
            onClick={() => navigate("/dashboard/billing")}
            className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3.5 md:p-4 lg:p-6 cursor-pointer border border-orange-400/40 flex-shrink-0 w-full md:w-auto hover:bg-white/15 transition-all"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle size={12} className="text-amber-400" />
              <p className="text-[10px] md:text-xs font-black text-amber-400 uppercase tracking-wider">
                {t.unpaidAlert(unpaidBills.length)}
              </p>
            </div>
            <p className="text-lg md:text-xl font-black text-white">
              {fmt(unpaidBills.reduce((s, b) => s + b.totalAmount, 0))}
            </p>
            <p className="text-[10px] md:text-xs text-white/60 mt-0.5">
              {t.payNow}
            </p>
          </div>
        )}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 lg:mb-8">
        {STATS.map((s) => (
          <div
            key={s.label}
            onClick={() => navigate(s.link)}
            className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 border border-[var(--border-color)] shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--text-tertiary)] transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <div
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center"
                style={{ background: s.bg, border: `1px solid ${s.color}30` }}
              >
                <s.icon
                  size={20}
                  className="md:size-22"
                  style={{ color: s.color }}
                />
              </div>
              <ArrowUpRight
                size={14}
                className="text-[var(--text-tertiary)] mt-1"
              />
            </div>
            <p className="text-[10px] md:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <p
              className={`font-black text-[var(--text-primary)] tracking-tight leading-none ${s.money ? "text-base md:text-lg" : "text-2xl md:text-3xl"}`}
            >
              {s.value}
            </p>
            <p className="text-[10px] md:text-xs text-[var(--text-tertiary)] mt-1 font-semibold">
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 md:gap-5 lg:gap-6">
        {/* Appointments */}
        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 md:p-5 lg:p-6 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Calendar
                  size={16}
                  className="md:size-[18px] text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="font-extrabold text-sm md:text-base text-[var(--text-primary)]">
                {t.myAppts}
              </h3>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate("/dashboard/history")}
                className="flex-1 sm:flex-none text-[11px] md:text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 md:px-4 py-1.5 md:py-2 cursor-pointer hover:bg-[var(--border-color)] transition-all"
              >
                {t.viewAll}
              </button>
              <button
                onClick={() => navigate("/dashboard/booking")}
                className="flex-1 sm:flex-none text-[11px] md:text-xs font-bold text-white bg-blue-600 border-none rounded-lg px-3 md:px-4 py-1.5 md:py-2 cursor-pointer shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-all"
              >
                {t.newAppt}
              </button>
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-[var(--border-color)]">
            {loading ? (
              <div className="p-10 flex justify-center">
                <div className="w-8 h-8 border-3 border-[var(--bg-tertiary)] border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : appts.length === 0 ? (
              <div className="p-12 md:p-16 text-center text-[var(--text-tertiary)]">
                <Calendar size={40} strokeWidth={1} className="mx-auto mb-3" />
                <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest">
                  {t.noAppt}
                </p>
              </div>
            ) : (
              appts.slice(0, 5).map((a) => {
                const st = STATUS[a.status] || STATUS.pending;
                const isSoon = soonAppts.some((s) => s._id === a._id);
                const apptDate = new Date(a.date);
                const formattedApptMonth = formatApptMonth(lang, apptDate);
                return (
                  <div
                    key={a._id}
                    onClick={() => navigate(`/dashboard/appointment/${a._id}`)}
                    className={`flex items-center gap-3 md:gap-4 p-4 md:p-6 border-b border-[var(--border-color)] ${isSoon ? "bg-red-50/50 dark:bg-red-900/10" : ""} hover:bg-[var(--bg-secondary)] hover:translate-x-1 transition-all cursor-pointer`}
                  >
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{
                        background: st.bg,
                        border: `1px solid ${st.color}40`,
                      }}
                    >
                      <span
                        className="text-[10px] font-black leading-none uppercase"
                        style={{ color: st.color }}
                      >
                        {formattedApptMonth}
                      </span>
                      <span
                        className="text-lg md:text-xl font-black leading-none"
                        style={{ color: st.color }}
                      >
                        {apptDate.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm md:text-base text-[var(--text-primary)] leading-tight truncate">
                        {getDoctorDisplayName(a.doctor?.userId?.fullName)}
                        {isSoon && (
                          <span className="ml-2 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-black">
                            {t.soon}
                          </span>
                        )}
                      </p>
                      <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 font-semibold truncate">
                        {getLocalizedDept(a.doctor?.department) || t.genDept} •{" "}
                        {a.time}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {a.status !== "completed" && a.status !== "cancelled" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (a.paymentStatus === "paid") {
                              setSelectedTicketAppt(a);
                            } else {
                              setPaymentModal(a);
                            }
                          }}
                          className="text-[11px] font-black text-orange-600 bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer hover:bg-orange-500 hover:text-white transition-all"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="flex-shrink-0"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="m9 15 2 2 4-4" />
                          </svg>
                          {t.viewTicket}
                        </button>
                      )}
                      <span
                        className="text-[11px] font-black px-3 py-1.5 rounded-full whitespace-nowrap"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Banner Image */}
        <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-sm max-h-[480px] hidden lg:block">
          <img
            src="https://i.pinimg.com/736x/2c/8a/90/2c8a9004feae986bbc7282ba4aa8cda2.jpg"
            alt="Promo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mt-4 md:mt-5 lg:mt-6">
        {[
          {
            label: t.booking,
            icon: Calendar,
            color: "#2563eb",
            bg: "#dbeafe",
            link: "/dashboard/booking",
          },
          {
            label: t.results,
            icon: FlaskConical,
            color: "#7c3aed",
            bg: "#ede9fe",
            link: "/dashboard/lab-results",
          },
          {
            label: t.prescriptions,
            icon: Pill,
            color: "#059669",
            bg: "#d1fae5",
            link: "/dashboard/prescriptions",
          },
          {
            label: t.billing,
            icon: CreditCard,
            color: "#d97706",
            bg: "#fef3c7",
            link: "/dashboard/billing",
          },
        ].map((q) => (
          <div
            key={q.label}
            onClick={() => navigate(q.link)}
            className="bg-[var(--card-bg)] rounded-xl md:rounded-2xl p-4 md:p-5 border border-[var(--border-color)] cursor-pointer flex items-center gap-3 md:gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--text-tertiary)]"
          >
            <div
              className="w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: q.bg, border: `1px solid ${q.color}30` }}
            >
              <q.icon
                size={18}
                className="md:size-20"
                style={{ color: q.color }}
              />
            </div>
            <p className="font-extrabold text-xs md:text-sm text-[var(--text-primary)]">
              {q.label}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>
      {/* Premium Queue Ticket Check-in Modal */}
      {selectedTicketAppt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div className="bg-[var(--card-bg)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[var(--border-color)]">
            {/* Ticket Header with Colorful Project Logo */}
            <div className="p-6 md:p-8 border-b border-dashed border-[var(--border-color)] text-center relative">
              <div className="flex justify-center mb-3">
                <img
                  src="/LOGO.png"
                  alt="MediCare"
                  className="h-8 md:h-9 w-auto object-contain"
                />
              </div>
              <h3 className="text-lg md:text-xl font-black tracking-tight text-[var(--text-primary)] mt-2">
                {t.ticketTitle}
              </h3>
              <p className="text-[11px] md:text-xs text-[var(--text-secondary)] mt-1 font-semibold">
                {t.ticketSubtitle}
              </p>

              {/* Left/Right ticket notches */}
              <div className="absolute -left-2 -bottom-2 w-4 h-4 rounded-full bg-black/60 z-10" />
              <div className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-black/60 z-10" />
            </div>

            {/* Ticket Body */}
            <div className="p-6 md:p-8">
              {/* Big Queue Number */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 text-center mb-6">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                  {t.yourQueue}
                </p>
                <div className="inline-flex w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#102a63] to-blue-600 text-white items-center justify-center font-black text-3xl md:text-4xl shadow-lg shadow-blue-500/30 my-2">
                  #{selectedTicketAppt.queueNumber || "01"}
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1.5">
                  {t.watchMonitor}
                </p>
              </div>

              {/* Ticket Details */}
              <div className="flex flex-col gap-3 text-xs md:text-sm font-semibold text-[var(--text-primary)]">
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.ticketId}
                  </span>
                  <span className="font-mono font-black text-[var(--text-primary)] text-sm">
                    {selectedTicketAppt.ticketNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.patient}
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {user?.fullName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.physician}
                  </span>
                  <span className="font-extrabold text-[#102a63]">
                    {getDoctorDisplayName(
                      selectedTicketAppt.doctor?.userId?.fullName,
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.department}
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {getLocalizedDept(selectedTicketAppt.doctor?.department)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.schedule}
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {selectedTicketAppt.time} •{" "}
                    {formatDate(lang, selectedTicketAppt.date)}
                  </span>
                </div>
              </div>

              {/* Dummy Barcode using high-tech SVGs */}
              <div className="flex flex-col items-center justify-center pt-5">
                <svg className="w-64 h-12" overflow="visible">
                  {[...Array(32)].map((_, i) => (
                    <rect
                      key={i}
                      x={i * 8}
                      y={0}
                      width={i % 3 === 0 ? 4 : i % 5 === 0 ? 1 : 2}
                      height={48}
                      fill="var(--text-primary)"
                    />
                  ))}
                </svg>
                <p className="text-[9px] text-[var(--text-tertiary)] font-mono tracking-widest mt-2">
                  {selectedTicketAppt._id}
                </p>
              </div>
            </div>

            {/* Ticket Footer Buttons */}
            <div className="bg-[var(--bg-secondary)] p-4 md:p-6 flex gap-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 md:py-3 bg-[#102a63] text-white text-xs md:text-sm font-bold rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 md:gap-2 shadow-md shadow-[#102a63]/20"
              >
                <Printer size={14} />
                {t.printTicket}
              </button>
              <button
                onClick={() => setSelectedTicketAppt(null)}
                className="px-4 md:px-5 py-2.5 md:py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-bold rounded-xl border-none cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Required Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <CreditCard
                size={32}
                className="text-amber-600 dark:text-amber-400"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black text-[var(--text-primary)] mb-2 text-center">
              Cần thanh toán phí khám
            </h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)] mb-5 text-center leading-relaxed">
              Vui lòng thanh toán phí khám trước khi xem phiếu STT.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPaymentModal(null)}
                className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm font-bold rounded-xl border border-[var(--border-color)] cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setPaymentModal(null);
                  navigate("/dashboard/billing");
                }}
                className="flex-1 px-4 py-3 bg-orange-600 text-white text-sm font-bold rounded-xl border-none cursor-pointer hover:bg-orange-700 transition-colors"
              >
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
