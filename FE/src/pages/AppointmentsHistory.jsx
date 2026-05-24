import { API_URL, authFetch, getStoredUser } from "../config";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  CreditCard,
  Printer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { ticketTrans, mergeTrans } from "../i18n/ticketI18n";
import {
  formatDoctorName,
  getLocalizedDept,
  formatApptMonth,
  formatDate,
} from "../utils/i18nHelpers";

// const API_URL = API_URL;

const trans = mergeTrans(
  {
    vi: {
      title: "Thông tin lịch khám",
      sub: "Toàn bộ lịch sử đặt lịch và phiếu khám bệnh của bạn",
      newBooking: "+ Đặt lịch mới",
      loading: "Đang tải lịch khám...",
      noAppts: "Chưa có lịch khám nào",
      viewRecords: "Xem Bệnh án →",
      viewTicket: "Xem Phiếu khám",
      paid: "Đã thanh toán",
      unpaid: "Chưa thanh toán",
      ticketTitle: "Phiếu Khám Bệnh",
      ticketNo: "Số:",
      queueNoLabel: "Số thứ tự của bạn",
      patient: "Bệnh nhân",
      doctor: "Bác sĩ",
      clinicRoom: "Phòng khám",
      time: "Thời gian",
      printTicket: "In Phiếu Khám",
      generalDept: "Khám tổng quát",
      doctorTitle: "Bác sĩ phụ trách",

      pending: "Chờ xác nhận",
      pending_payment: "Chờ thanh toán phí khám",
      payNow: "Thanh toán phí khám",
      confirmed: "Đã xác nhận",
      completed: "Đã khám",
      cancelled: "Đã hủy",
      viewTicketStt: "Xem phiếu STT",
    },
    en: {
      title: "Appointments History",
      sub: "Comprehensive logs of your scheduled bookings and clinical cards",
      newBooking: "+ New Appointment",
      loading: "Loading clinical records...",
      noAppts: "No clinical appointments scheduled yet",
      viewRecords: "Clinical Record →",
      viewTicket: "View Ticket",
      paid: "Paid",
      unpaid: "Unpaid",
      ticketTitle: "Clinical Ticket",
      ticketNo: "No:",
      queueNoLabel: "Your Queue Number",
      patient: "Patient",
      doctor: "Physician",
      clinicRoom: "Clinic Room",
      time: "Schedule",
      printTicket: "Print Ticket",
      generalDept: "General Consultation",
      doctorTitle: "Attending Physician",

      pending: "Pending",
      pending_payment: "Awaiting consultation payment",
      payNow: "Pay consultation fee",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      viewTicketStt: "View Ticket",
    },
  },
  ticketTrans,
);

export default function AppointmentsHistory() {
  const { lang, t } = useTranslation(trans);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const navigate = useNavigate();

  const STATUS = {
    pending: {
      label: t.pending,
      color: "#d97706",
      bg: "#fef3c7",
      border: "#fde68a",
    },
    pending_payment: {
      label: t.pending_payment,
      color: "#ea580c",
      bg: "#ffedd5",
      border: "#fed7aa",
    },
    confirmed: {
      label: t.confirmed,
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    completed: {
      label: t.completed,
      color: "#059669",
      bg: "#d1fae5",
      border: "#a7f3d0",
    },
    cancelled: {
      label: t.cancelled,
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca",
    },
  };

  const getDoctorDisplayName = (name) =>
    formatDoctorName(lang, name) || t.doctorTitle;

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/appointments`);
        const data = await res.json();
        if (data.success) {
          setAppts(
            data.data.sort((a, b) => new Date(b.date) - new Date(a.date)),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppts();
  }, []);

  const handleAction = (a) => {
    navigate(`/dashboard/appointment/${a._id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8 px-3 md:px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2 md:gap-3">
            <Calendar className="text-primary animate-pulse-slow" size={24} />
            {t.title}
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium mt-2">
            {t.sub}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/booking")}
          className="px-4 md:px-5 py-2 md:py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all text-xs md:text-sm"
        >
          {t.newBooking}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 md:py-20">
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-[var(--border-color)] border-t-primary rounded-full animate-spin" />
        </div>
      ) : appts.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl p-8 md:p-16 text-center border border-[var(--border-color)] shadow-sm">
          <Calendar
            size={48}
            className="mx-auto text-[var(--text-tertiary)] mb-4"
          />
          <p className="text-[var(--text-tertiary)] font-bold uppercase tracking-widest text-xs md:text-sm">
            {t.noAppts}
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {appts.map((a) => {
            const st = STATUS[a.status] || STATUS.pending;
            const isCompleted = a.status === "completed";
            const apptDateObj = new Date(a.date);
            const apptMonth = formatApptMonth(lang, apptDateObj);
            return (
              <div
                key={a._id}
                className="bg-[var(--card-bg)] rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 md:gap-5">
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0"
                    style={{
                      background: st.bg,
                      borderColor: st.border,
                      color: st.color,
                    }}
                  >
                    <span className="text-[10px] md:text-xs font-black uppercase">
                      {apptMonth}
                    </span>
                    <span className="text-xl md:text-2xl font-black leading-none mt-0.5">
                      {apptDateObj.getDate()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm md:text-lg font-black text-[var(--text-primary)] mb-1 flex items-center flex-wrap gap-2">
                      {a.doctor?.department || t.generalDept}
                      {a.status !== "completed" &&
                        a.status !== "cancelled" &&
                        a.status !== "pending_payment" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (a.paymentStatus === "paid") {
                                setTicketModal(a);
                              } else {
                                setPaymentModal(a);
                              }
                            }}
                            className="px-2 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-black bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30 hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1 md:gap-1.5 active:scale-95 duration-150"
                            style={{ cursor: "pointer" }}
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="shrink-0"
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                              <path d="m9 15 2 2 4-4" />
                            </svg>
                            <span className="hidden md:inline">
                              {t.viewTicketStt}
                            </span>
                          </button>
                        )}
                      <span
                        className="px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)] mb-2">
                      {getDoctorDisplayName(a.doctor?.userId?.fullName)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1 md:gap-1.5">
                        <Clock
                          size={12}
                          className="text-[var(--text-tertiary)]"
                        />{" "}
                        {a.time}
                      </span>
                      <span className="flex items-center gap-1 md:gap-1.5">
                        <Calendar
                          size={12}
                          className="text-[var(--text-tertiary)]"
                        />{" "}
                        {formatDate(lang, apptDateObj)}
                      </span>
                      {a.ticketNumber && (
                        <span className="flex items-center gap-1 md:gap-1.5">
                          <CreditCard
                            size={12}
                            className="text-[var(--text-tertiary)]"
                          />{" "}
                          <span className="hidden md:inline">
                            {t.viewTicket}:
                          </span>{" "}
                          {a.ticketNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 md:gap-3 shrink-0">
                  {a.status === "pending_payment" ? (
                    <button
                      onClick={() => navigate("/dashboard/billing")}
                      className="px-4 md:px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all border bg-orange-500 text-white border-orange-600 hover:bg-orange-600 shadow-sm shrink-0"
                    >
                      {t.payNow}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (a.paymentStatus === "paid") {
                          handleAction(a);
                        } else {
                          setPaymentModal(a);
                        }
                      }}
                      className="px-4 md:px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all border bg-blue-50 dark:bg-blue-900/30 text-primary border-blue-100 dark:border-blue-900/30 hover:bg-primary hover:text-white shadow-sm shrink-0"
                    >
                      {isCompleted ? t.viewRecords : t.viewTicket}
                    </button>
                  )}
                  {a.paymentStatus === "paid" ? (
                    <p className="text-[10px] md:text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {t.paid}
                    </p>
                  ) : (
                    <p className="text-[10px] md:text-xs font-bold text-orange-500 flex items-center gap-1">
                      <Clock size={12} /> {t.unpaid}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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
              Vui lòng thanh toán phí khám trước khi xem phiếu STT hoặc phiếu
              khám.
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

      {/* Ticket Modal */}
      {ticketModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[var(--card-bg)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[var(--border-color)]">
            {/* Ticket Header with Colorful Project Logo */}
            <div className="p-4 md:p-6 border-b border-dashed border-[var(--border-color)] text-center relative">
              <div className="flex justify-center mb-2">
                <img
                  src="/LOGO.png"
                  alt="MediCare"
                  className="h-7 md:h-8 w-auto object-contain"
                />
              </div>
              <h3 className="text-base md:text-lg font-black tracking-tight text-[var(--text-primary)] mt-1.5">
                {t.ticketTitle}
              </h3>
              <p className="text-[10px] md:text-xs text-[var(--text-secondary)] mt-1 font-semibold">
                {t.ticketSubtitle}
              </p>

              {/* Left/Right ticket notches */}
              <div className="absolute -left-2 -bottom-2 w-4 h-4 rounded-full bg-black/60 z-10" />
              <div className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-black/60 z-10" />
            </div>

            {/* Ticket Body */}
            <div className="p-4 md:p-6">
              {/* Big Queue Number */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-3 md:p-4 text-center mb-4">
                <p className="text-[9px] md:text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                  {t.yourQueue}
                </p>
                <div className="inline-flex w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#102a63] to-blue-600 text-white items-center justify-center font-black text-2xl md:text-3xl shadow-lg shadow-blue-500/30 my-1.5">
                  #{ticketModal.queueNumber || "01"}
                </div>
                <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] mt-1">
                  {t.watchMonitor}
                </p>
              </div>

              {/* Ticket Details */}
              <div className="flex flex-col gap-2 text-xs md:text-sm font-semibold text-[var(--text-primary)]">
                <div className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.ticketId}
                  </span>
                  <span className="font-mono font-black text-[var(--text-primary)]">
                    {ticketModal.ticketNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.patient}
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {getStoredUser()?.fullName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.physician}
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {getDoctorDisplayName(ticketModal.doctor?.userId?.fullName)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.department}
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {getLocalizedDept(ticketModal.doctor?.department)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
                  <span className="font-bold text-[var(--text-tertiary)]">
                    {t.schedule}
                  </span>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {ticketModal.time} • {formatDate(lang, ticketModal.date)}
                  </span>
                </div>
              </div>

              {/* Dummy Barcode using high-tech SVGs */}
              <div className="flex flex-col items-center justify-center pt-4">
                <svg className="w-48 md:w-56 h-10 md:h-12" overflow="visible">
                  {[...Array(32)].map((_, i) => (
                    <rect
                      key={i}
                      x={i * 8}
                      y={0}
                      width={i % 3 === 0 ? 4 : i % 5 === 0 ? 1 : 2}
                      height={40}
                      fill="var(--text-primary)"
                    />
                  ))}
                </svg>
                <p className="text-[8px] md:text-[10px] text-[var(--text-tertiary)] font-mono tracking-widest mt-1.5">
                  {ticketModal._id}
                </p>
              </div>
            </div>

            {/* Ticket Footer Buttons */}
            <div className="bg-[var(--bg-tertiary)] p-3 md:p-4 flex gap-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 md:py-2.5 bg-[#102a63] text-white text-[11px] md:text-xs font-bold rounded-xl border-none cursor-pointer flex items-center justify-center gap-1 md:gap-1.5 shadow-md shadow-[#102a63]/20"
              >
                <Printer size={12} />
                {t.printTicket}
              </button>
              <button
                onClick={() => setTicketModal(null)}
                className="px-3 py-2 md:py-2.5 bg-[var(--border-color)] text-[var(--text-secondary)] text-[11px] md:text-xs font-bold rounded-xl border-none cursor-pointer"
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
