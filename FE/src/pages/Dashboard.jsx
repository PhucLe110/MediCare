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
    if (!u) return navigate("/login");
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
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 4px" }}>
      {/* ── HERO GREETING ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1a56db 100%)",
          borderRadius: 28,
          padding: "36px 40px",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 16px 48px rgba(26,86,219,0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            background: "rgba(255,255,255,0.04)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: 100,
            width: 160,
            height: 160,
            background: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
          }}
        />
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              marginBottom: 8,
            }}
          >
            {formattedDate}
          </p>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            {t.welcome}, {user?.fullName?.split(" ").slice(-1)[0]} 👋
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              fontWeight: 500,
            }}
          >
            {upcoming.length > 0
              ? t.upcomingCount(upcoming.length)
              : t.healthyWish}
          </p>
        </div>
        {soonAppts.length > 0 && (
          <div
            onClick={() => navigate("/dashboard/booking")}
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              borderRadius: 20,
              padding: "18px 24px",
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#f87171",
                  animation: "pulse 1s infinite",
                }}
              />
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#fca5a5",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.apptSoon}
              </p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
              {soonAppts[0].time}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
              }}
            >
              {getDoctorDisplayName(soonAppts[0].doctor?.userId?.fullName)}
            </p>
          </div>
        )}
        {unpaidBills.length > 0 && soonAppts.length === 0 && (
          <div
            onClick={() => navigate("/dashboard/billing")}
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              borderRadius: 20,
              padding: "18px 24px",
              cursor: "pointer",
              border: "1px solid rgba(255,165,0,0.4)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <AlertCircle size={14} color="#fbbf24" />
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#fbbf24",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.unpaidAlert(unpaidBills.length)}
              </p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
              {fmt(unpaidBills.reduce((s, b) => s + b.totalAmount, 0))}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                marginTop: 2,
              }}
            >
              {t.payNow}
            </p>
          </div>
        )}
      </div>

      {/* ── STAT CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            onClick={() => navigate(s.link)}
            style={{
              background: "var(--card-bg)",
              borderRadius: 20,
              padding: "20px 22px",
              border: "1px solid var(--border-color)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--text-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${s.color}30`,
                }}
              >
                <s.icon size={22} style={{ color: s.color }} />
              </div>
              <ArrowUpRight
                size={16}
                style={{ color: "var(--text-tertiary)", marginTop: 4 }}
              />
            </div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontSize: s.money ? 16 : 28,
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-tertiary)",
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}
      >
        {/* Appointments */}
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: 24,
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 11,
                  background: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #bfdbfe",
                }}
              >
                <Calendar size={18} color="#2563eb" />
              </div>
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: "var(--text-primary)",
                }}
              >
                {t.myAppts}
              </h3>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => navigate("/dashboard/history")}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--border-color)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--bg-tertiary)")
                }
              >
                {t.viewAll}
              </button>
              <button
                onClick={() => navigate("/dashboard/booking")}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  background: "#2563eb",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 14px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#2563eb")
                }
              >
                {t.newAppt}
              </button>
            </div>
          </div>
          <div
            style={{
              maxHeight: 420,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--border-color) transparent",
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: 40,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    border: "3px solid var(--bg-tertiary)",
                    borderTopColor: "#2563eb",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              </div>
            ) : appts.length === 0 ? (
              <div
                style={{
                  padding: "60px 24px",
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                <Calendar
                  size={48}
                  strokeWidth={1}
                  style={{ margin: "0 auto 12px" }}
                />
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 24px",
                      borderBottom: "1px solid var(--border-color)",
                      background: isSoon ? "#fff7f7" : "transparent",
                      transition: "all 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-secondary)";
                      e.currentTarget.style.transform = "translateX(6px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSoon
                        ? "#fff7f7"
                        : "transparent";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 15,
                        background: st.bg,
                        border: `1px solid ${st.color}40`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: st.color,
                          lineHeight: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {formattedApptMonth}
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: st.color,
                          lineHeight: 1,
                        }}
                      >
                        {apptDate.getDate()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: "var(--text-primary)",
                          lineHeight: 1.3,
                        }}
                      >
                        {getDoctorDisplayName(a.doctor?.userId?.fullName)}
                        {isSoon && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 10,
                              background: "#fee2e2",
                              color: "#dc2626",
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontWeight: 800,
                            }}
                          >
                            {t.soon}
                          </span>
                        )}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          marginTop: 3,
                          fontWeight: 600,
                        }}
                      >
                        {getLocalizedDept(a.doctor?.department) || t.genDept} •{" "}
                        {a.time}
                      </p>
                    </div>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      {a.status !== "completed" && a.status !== "cancelled" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicketAppt(a);
                          }}
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            color: "#ea580c",
                            background: "#ffedd5",
                            border: "1px solid #fed7aa",
                            padding: "5px 12px",
                            borderRadius: 999,
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f97316";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#ffedd5";
                            e.currentTarget.style.color = "#ea580c";
                          }}
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
                            style={{ flexShrink: 0 }}
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="m9 15 2 2 4-4" />
                          </svg>
                          {t.viewTicket}
                        </button>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: st.color,
                          background: st.bg,
                          padding: "5px 12px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                        }}
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
        <div
          style={{
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            maxHeight: 480,
          }}
        >
          <img
            src="https://i.pinimg.com/736x/2c/8a/90/2c8a9004feae986bbc7282ba4aa8cda2.jpg"
            alt="Promo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginTop: 20,
        }}
      >
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
            style={{
              background: "var(--card-bg)",
              borderRadius: 18,
              padding: "18px 20px",
              border: "1px solid var(--border-color)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.borderColor = "var(--text-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                background: q.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: `1px solid ${q.color}30`,
              }}
            >
              <q.icon size={20} style={{ color: q.color }} />
            </div>
            <p
              style={{
                fontWeight: 800,
                fontSize: 13,
                color: "var(--text-primary)",
              }}
            >
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
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: 32,
              width: "100%",
              maxWidth: 400,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              border: "1px solid var(--border-color)",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {/* Ticket Header with Colorful Project Logo */}
            <div
              style={{
                padding: "24px 24px 16px",
                borderBottom: "1px dashed var(--border-color)",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <img
                  src="/LOGO.png"
                  alt="MediCare"
                  style={{ height: 36, width: "auto", objectFit: "contain" }}
                />
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  margin: "8px 0 0",
                  color: "var(--text-primary)",
                }}
              >
                {t.ticketTitle}
              </h3>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                  fontWeight: 600,
                  margin: "4px 0 0",
                }}
              >
                {t.ticketSubtitle}
              </p>

              {/* Left/Right ticket notches */}
              <div
                style={{
                  position: "absolute",
                  left: -8,
                  bottom: -8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)",
                  zIndex: 10,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: -8,
                  bottom: -8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)",
                  zIndex: 10,
                }}
              />
            </div>

            {/* Ticket Body */}
            <div style={{ padding: 24 }}>
              {/* Big Queue Number */}
              <div
                style={{
                  background: "#f0f7ff",
                  border: "1px solid #e0f2fe",
                  borderRadius: 16,
                  padding: "16px 0",
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#3b82f6",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 6px",
                  }}
                >
                  {t.yourQueue}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #102a63 0%, #2563eb 100%)",
                    color: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 32,
                    boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                    margin: "8px 0",
                  }}
                >
                  #{selectedTicketAppt.queueNumber || "01"}
                </div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    margin: "6px 0 0",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t.watchMonitor}
                </p>
              </div>

              {/* Ticket Details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  fontSize: 13,
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: 8,
                  }}
                >
                  <span
                    style={{ color: "var(--text-tertiary)", fontWeight: 700 }}
                  >
                    {t.ticketId}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  >
                    {selectedTicketAppt.ticketNumber}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: 8,
                  }}
                >
                  <span
                    style={{ color: "var(--text-tertiary)", fontWeight: 700 }}
                  >
                    {t.patient}
                  </span>
                  <span
                    style={{ fontWeight: 800, color: "var(--text-primary)" }}
                  >
                    {user?.fullName}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: 8,
                  }}
                >
                  <span
                    style={{ color: "var(--text-tertiary)", fontWeight: 700 }}
                  >
                    {t.physician}
                  </span>
                  <span style={{ fontWeight: 800, color: "#102a63" }}>
                    {getDoctorDisplayName(
                      selectedTicketAppt.doctor?.userId?.fullName,
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: 8,
                  }}
                >
                  <span
                    style={{ color: "var(--text-tertiary)", fontWeight: 700 }}
                  >
                    {t.department}
                  </span>
                  <span
                    style={{ fontWeight: 800, color: "var(--text-primary)" }}
                  >
                    {getLocalizedDept(selectedTicketAppt.doctor?.department)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: 8,
                  }}
                >
                  <span
                    style={{ color: "var(--text-tertiary)", fontWeight: 700 }}
                  >
                    {t.schedule}
                  </span>
                  <span
                    style={{ fontWeight: 800, color: "var(--text-primary)" }}
                  >
                    {selectedTicketAppt.time} •{" "}
                    {formatDate(lang, selectedTicketAppt.date)}
                  </span>
                </div>
              </div>

              {/* Dummy Barcode using high-tech SVGs */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 20,
                }}
              >
                <svg style={{ width: 256, height: 48 }} overflow="visible">
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
                <p
                  style={{
                    fontSize: 9,
                    color: "var(--text-tertiary)",
                    fontFamily: "monospace",
                    margin: "8px 0 0",
                    letterSpacing: "0.15em",
                  }}
                >
                  {selectedTicketAppt._id}
                </p>
              </div>
            </div>

            {/* Ticket Footer Buttons */}
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: "16px 24px",
                display: "flex",
                gap: 12,
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#102a63",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 4px 6px -1px rgba(16, 42, 99, 0.2)",
                }}
              >
                <Printer size={14} />
                {t.printTicket}
              </button>
              <button
                onClick={() => setSelectedTicketAppt(null)}
                style={{
                  padding: "10px 16px",
                  background: "#e2e8f0",
                  color: "#475569",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
