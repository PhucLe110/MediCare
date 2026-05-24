import { API_URL, authFetch, getStoredUser } from "../config";
import { useState, useEffect } from "react";
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  QrCode,
  FileText,
  X,
  User,
  Stethoscope,
  FlaskConical,
  Pill,
  Calendar,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import {
  formatMoney,
  formatDoctorName,
  formatDate,
  formatDateTime,
  formatApptMonth,
} from "../utils/i18nHelpers";

// const API_URL = API_URL;

const trans = {
  vi: {
    title: "Thanh toán & Viện phí",
    loading: "Đang tải thông tin thanh toán...",
    paid: "Đã trả",
    unpaid: "Chờ trả",
    recentVisits: "Ca khám gần đây",
    generalDept: "Khám tổng quát",
    selectVisit: "Chọn một ca khám",
    noAppointments: "Chưa có ca khám đã đặt",
    doctorTitle: "Bác sĩ phụ trách",
    needPay: "Cần thanh toán",
    paySub: "Hoàn tất để nhận kết quả khám",
    waitingBank: "Đang chờ giao dịch ngân hàng...",
    scanQr: "Quét VietQR để thanh toán",
    paidInvoices: "Hóa đơn đã quyết toán",
    noInvoices: "Chưa có hóa đơn nào",
    successPaid: "Quyết toán thành công",
    receipt: "Biên lai",
    eReceipt: "Biên lai điện tử",
    patient: "Bệnh nhân",
    department: "Khoa",
    doctorLabel: "Bác sĩ",
    time: "Thời gian",
    total: "Tổng cộng",
    paidSuccessMsg: "Đã quyết toán thành công",
    typeConsultation: "Phí khám bệnh",
    typeLab: "Xét nghiệm / Siêu âm",
    typeMedication: "Đơn thuốc",
    typeOther: "Phí dịch vụ khác",
    billConsultation: "Hóa đơn phí khám",
    billLab: "Hóa đơn xét nghiệm",
    billMedicine: "Hóa đơn thuốc",
    payLabHint: "Thanh toán để được tiến hành xét nghiệm",
    payMedicineHint: "Thanh toán để nhận thuốc theo đơn",
  },
  en: {
    title: "Billing & Invoices",
    loading: "Loading billing information...",
    paid: "Paid Total",
    unpaid: "Unpaid Fees",
    recentVisits: "Recent Visits",
    generalDept: "General Consultation",
    selectVisit: "Select a clinical visit",
    noAppointments: "No appointments booked yet",
    doctorTitle: "Attending Physician",
    needPay: "Requires Payment",
    paySub: "Complete payment to release clinical results",
    waitingBank: "Awaiting banking confirmation...",
    scanQr: "Scan VietQR code to settle",
    paidInvoices: "Settled Invoices",
    noInvoices: "No invoices settled yet",
    successPaid: "Settlement Succeeded",
    receipt: "Receipt",
    eReceipt: "Electronic Receipt",
    patient: "Patient",
    department: "Department",
    doctorLabel: "Physician",
    time: "Timestamp",
    total: "Total Amount",
    paidSuccessMsg: "Settlement Succeeded",
    typeConsultation: "Consultation Fee",
    typeLab: "Laboratory & Diagnostic Fee",
    typeMedication: "Prescription & Medicine Fee",
    typeOther: "Other Services Fee",
    billConsultation: "Consultation invoice",
    billLab: "Lab test invoice",
    billMedicine: "Medicine invoice",
    payLabHint: "Pay to proceed with laboratory tests",
    payMedicineHint: "Pay to receive prescribed medicine",
  },
};

const BILL_TYPE_META = {
  consultation: { labelKey: "billConsultation", color: "#3b82f6" },
  lab: { labelKey: "billLab", color: "#8b5cf6" },
  medicine: { labelKey: "billMedicine", color: "#10b981" },
};

export default function Billing() {
  const { lang, t } = useTranslation(trans);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useState(null);
  const [payInfo, setPayInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null);

  const amountDue = (bill) => {
    const total = bill?.totalAmount || 0;
    const paid = bill?.paidAmount || 0;
    return Math.max(0, total - paid);
  };

  const fmt = (n) => formatMoney(lang, n);

  const TYPE_META = {
    consultation: {
      label: t.typeConsultation,
      icon: Stethoscope,
      color: "#3b82f6",
    },
    lab: { label: t.typeLab, icon: FlaskConical, color: "#8b5cf6" },
    lab_test: { label: t.typeLab, icon: FlaskConical, color: "#8b5cf6" },
    medicine: { label: t.typeMedication, icon: Pill, color: "#10b981" },
    medication: { label: t.typeMedication, icon: Pill, color: "#10b981" },
  };
  const getMeta = (typeKey) =>
    TYPE_META[typeKey] || {
      label: t.typeOther,
      icon: Receipt,
      color: "#6b7280",
    };

  const getDoctorDisplayName = (name) =>
    formatDoctorName(lang, name) || t.doctorTitle;

  useEffect(() => {
    (async () => {
      try {
        const [br, pr] = await Promise.all([
          authFetch(`${API_URL}/api/bills/my`),
          fetch(`${API_URL}/api/payment-info`),
        ]);
        const [bd, pd] = await Promise.all([br.json(), pr.json()]);
        if (bd.success) {
          setBills(bd.data);
          if (bd.data[0]) setSelId(bd.data[0].appointment?._id || "other");
        }
        if (pd.success) setPayInfo(pd.data);
        setUser(getStoredUser() || {});
      } catch {
        // Error handling
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const hasUnpaid = bills.some(
      (b) => (b.appointment?._id || "other") === selId && b.status === "unpaid",
    );
    if (!hasUnpaid) return;
    const iv = setInterval(async () => {
      const r = await authFetch(`${API_URL}/api/bills/my`);
      const d = await r.json();
      if (d.success) {
        setBills(d.data);
        if (
          !d.data.some(
            (b) =>
              (b.appointment?._id || "other") === selId &&
              b.status === "unpaid",
          )
        )
          clearInterval(iv);
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [selId, bills]);

  const appsMap = bills.reduce((acc, b) => {
    const id = b.appointment?._id || "other";
    if (!acc[id])
      acc[id] = {
        id,
        department:
          b.appointment?.doctor?.department ||
          b.appointment?.department ||
          t.generalDept,
        specialty: b.appointment?.doctor?.specialty || "",
        date: b.appointment?.date || b.createdAt,
        doctor: b.appointment?.doctor?.userId?.fullName || null,
        paid: [],
        unpaid: [],
      };
    b.status === "paid" ? acc[id].paid.push(b) : acc[id].unpaid.push(b);
    return acc;
  }, {});

  const appList = Object.values(appsMap).sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  const sel = appsMap[selId];

  const qrUrl = (amount, ids) => {
    if (!payInfo || !ids?.length) return "";
    const desc = `MediCare HD ${ids[0].slice(-6).toUpperCase()}`;
    return `https://img.vietqr.io/image/${payInfo.bankId}-${payInfo.accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(payInfo.accountName)}`;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* ══ SIDEBAR — soft white ══ */}
      <aside className="w-full md:w-80 md:min-w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col md:block hidden">
        {/* Logo + title */}
        <div className="p-4 md:p-6 md:px-5 md:pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <img src="/LOGO.png" alt="Logo" className="h-6 md:h-8" />
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: t.paid,
                value: fmt(
                  bills
                    .filter((b) => b.status === "paid")
                    .reduce((s, b) => s + b.totalAmount, 0),
                ),
                color: "#059669",
                bg: "#ecfdf5",
              },
              {
                label: t.unpaid,
                value: fmt(
                  bills
                    .filter((b) => b.status === "unpaid")
                    .reduce((s, b) => s + amountDue(b), 0),
                ),
                color: "#d97706",
                bg: "#fffbeb",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl md:rounded-2xl p-2 md:p-3 border border-[var(--border-color)]"
                style={{ background: s.bg }}
              >
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {s.label}
                </p>
                <p
                  className="text-xs md:text-sm font-black"
                  style={{ color: s.color }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="px-3 md:px-4 py-2 md:py-3 md:pb-2 flex-shrink-0">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
            {t.recentVisits}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 md:px-3 py-1 md:py-0 md:pb-4 scrollbar-thin">
          {appList.map((app) => {
            const active = selId === app.id;
            const d = new Date(app.date);
            const hasUnpaid = app.unpaid.length > 0;
            const appMonth = formatApptMonth(lang, d);
            return (
              <button
                key={app.id}
                onClick={() => setSelId(app.id)}
                className={`w-full text-left p-2 md:p-3 rounded-xl md:rounded-2xl mb-1 md:mb-1 border transition-all duration-180 flex items-center gap-2 md:gap-3 ${
                  active
                    ? "bg-[var(--card-bg)] border-[var(--border-color)] shadow-sm"
                    : "bg-transparent border-transparent hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                {/* Date box */}
                <div
                  className={`w-10 h-11 md:w-12 md:h-13 rounded-lg md:rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                    active
                      ? "bg-[var(--color-primary,#3b82f6)]"
                      : "bg-[var(--bg-tertiary)]"
                  }`}
                >
                  <span
                    className={`text-[8px] md:text-[9px] font-black leading-none uppercase ${
                      active ? "text-white/80" : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {appMonth}
                  </span>
                  <span
                    className={`text-lg md:text-xl font-black leading-none mt-0.5 ${
                      active ? "text-white" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                    <p
                      className={`font-black text-xs md:text-sm truncate ${
                        active
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {app.department}
                    </p>
                    {hasUnpaid && (
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] md:text-xs text-blue-600 font-bold truncate mb-0.5">
                    {getDoctorDisplayName(app.doctor)}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-[var(--text-tertiary)] font-semibold">
                    {formatDate(lang, d)}
                  </p>
                </div>
                {active && (
                  <ChevronRight
                    size={12}
                    className="text-[var(--text-tertiary)] flex-shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile selector */}
      <div className="md:hidden p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        {appList.length === 0 ? (
          <div className="w-full p-3 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-xl text-center">
            <p className="text-sm font-bold text-[var(--text-tertiary)]">
              {t.noAppointments}
            </p>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selId}
              onChange={(e) => setSelId(e.target.value)}
              className="w-full p-3 pr-10 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-primary)] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              {appList.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.department} - {formatDate(lang, new Date(app.date))}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* ══ MAIN — white ══ */}
      <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)] scrollbar-thin">
        {/* Mobile stats - visible only on mobile */}
        <div className="md:hidden p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: t.paid,
                value: fmt(
                  bills
                    .filter((b) => b.status === "paid")
                    .reduce((s, b) => s + b.totalAmount, 0),
                ),
                color: "#059669",
                bg: "#ecfdf5",
              },
              {
                label: t.unpaid,
                value: fmt(
                  bills
                    .filter((b) => b.status === "unpaid")
                    .reduce((s, b) => s + amountDue(b), 0),
                ),
                color: "#d97706",
                bg: "#fffbeb",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-2 border border-[var(--border-color)]"
                style={{ background: s.bg }}
              >
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {s.label}
                </p>
                <p className="text-xs font-black" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {!sel ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] p-8">
            <Receipt
              size={40}
              strokeWidth={1}
              className="mb-3 md:mb-4 opacity-30"
            />
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
              {t.selectVisit}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl md:max-w-3xl mx-auto p-4 md:p-8 md:px-8 md:py-10">
            {/* Header — gradient card */}
            <div className="mb-6 md:mb-8 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] rounded-2xl md:rounded-3xl p-4 md:p-6 md:px-8 border border-[var(--border-color)] flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight mb-2 md:mb-3 leading-tight md:leading-tight">
                  {sel.department}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs text-[var(--text-secondary)] font-bold bg-[var(--card-bg)] px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-[var(--border-color)]">
                    <Calendar size={10} color="var(--text-tertiary)" />
                    {formatDate(lang, sel.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs text-sky-700 font-bold bg-[var(--bg-tertiary)] px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                    <User size={10} />
                    {getDoctorDisplayName(sel.doctor)}
                  </span>
                </div>
              </div>
              <img
                src="/LOGO.png"
                alt="Logo"
                className="h-7 md:h-9 opacity-15 flex-shrink-0"
              />
            </div>

            {/* UNPAID — mỗi hóa đơn thanh toán riêng */}
            {sel.unpaid.map((bill) => {
              const meta = BILL_TYPE_META[bill.billType] || {
                labelKey: "needPay",
                color: "#fb923c",
              };
              const billTitle = t[meta.labelKey] || t.needPay;
              const hint =
                bill.billType === "lab"
                  ? t.payLabHint
                  : bill.billType === "medicine"
                    ? t.payMedicineHint
                    : t.paySub;
              return (
                <div
                  key={bill._id}
                  className="mb-4 md:mb-5 bg-[var(--card-bg)] rounded-2xl md:rounded-3xl overflow-hidden border-2 border-orange-200 shadow-lg shadow-orange-200/30"
                >
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 md:p-4 md:px-6 flex items-center gap-2 md:gap-3 border-b border-orange-200">
                    <div
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center"
                      style={{ background: meta.color }}
                    >
                      <AlertCircle size={14} color="#fff" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-xs md:text-sm text-orange-700 uppercase tracking-wider">
                        {billTitle}
                      </p>
                      <p className="text-[10px] md:text-xs text-orange-600 font-semibold">
                        {hint}
                      </p>
                    </div>
                    <p className="text-lg md:text-2xl font-black text-orange-700">
                      {fmt(amountDue(bill))}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-0">
                    <div className="flex-1 min-w-0 p-3 md:p-4 md:px-6 border-b md:border-b-0 md:border-r border-dashed border-orange-200">
                      {(bill.items || []).map((item, i) => {
                        const m = getMeta(item.type);
                        const Icon = m.icon;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 md:gap-4 p-2 md:p-3 md:px-4 bg-[var(--bg-tertiary)] rounded-xl md:rounded-2xl mb-2 md:mb-3 border border-[var(--border-color)]"
                          >
                            <div
                              className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${m.color}15` }}
                            >
                              <Icon size={14} color={m.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs md:text-sm text-[var(--text-primary)] truncate">
                                {item.description}
                              </p>
                              <p className="text-[9px] md:text-[10px] font-black text-[var(--text-tertiary)] uppercase">
                                {m.label}
                              </p>
                            </div>
                            <p className="font-black text-xs md:text-sm text-[var(--text-primary)]">
                              {fmt(item.amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="w-full md:w-auto md:max-w-44 flex flex-col items-center p-3 md:p-5 bg-[var(--bg-tertiary)]">
                      <div className="bg-[var(--card-bg)] rounded-xl md:rounded-2xl p-2 md:p-3 shadow-lg border border-[var(--border-color)] mb-2 md:mb-3">
                        <img
                          src={qrUrl(amountDue(bill), [bill._id])}
                          alt="QR"
                          className="w-24 h-24 md:w-32 md:h-32 object-contain"
                        />
                      </div>
                      <p className="text-[8px] md:text-[9px] font-black text-[var(--text-tertiary)] uppercase text-center">
                        {t.scanQr}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* PAID HISTORY */}
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={12} color="#10b981" />
                </div>
                <h3 className="font-black text-xs md:text-sm text-[var(--text-primary)] uppercase tracking-wider">
                  {t.paidInvoices}
                </h3>
                <div className="flex-1 h-px bg-[var(--border-color)] ml-2" />
              </div>

              {sel.paid.length === 0 ? (
                <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border-2 border-dashed border-[var(--border-color)] p-8 md:p-16 text-center">
                  <Receipt
                    size={28}
                    strokeWidth={1}
                    className="mx-auto mb-2 md:mb-3 text-[var(--border-color)]"
                  />
                  <p className="text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                    {t.noInvoices}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 md:gap-4">
                  {sel.paid.map((bill) => (
                    <div
                      key={bill._id}
                      className="bg-[var(--card-bg)] rounded-xl md:rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Bill header */}
                      <div className="flex items-center gap-2 md:gap-4 p-3 md:p-4 md:px-5 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--card-bg)]">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/25 flex-shrink-0">
                          <CheckCircle2 size={14} color="#fff" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-wider leading-none">
                            {t.successPaid}
                          </p>
                          <p className="text-[10px] md:text-xs font-semibold text-[var(--text-secondary)] mt-0.5 md:mt-1">
                            {formatDateTime(
                              lang,
                              bill.paidAt || bill.updatedAt,
                            )}
                          </p>
                        </div>
                        <p className="text-base md:text-xl font-black text-[var(--text-primary)] tracking-tight">
                          {fmt(bill.totalAmount)}
                        </p>
                      </div>

                      {/* Items */}
                      <div className="p-2 md:p-3 md:px-4">
                        {(bill.items || []).map((item, ii) => {
                          const m = getMeta(item.type);
                          const Icon = m.icon;
                          return (
                            <div
                              key={ii}
                              className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl transition-colors cursor-default hover:bg-[var(--bg-tertiary)]"
                            >
                              <div
                                className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${m.color}12` }}
                              >
                                <Icon size={12} color={m.color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs md:text-sm text-[var(--text-primary)] leading-tight">
                                  {item.description}
                                </p>
                                <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">
                                  {m.label}
                                </p>
                              </div>
                              <p className="font-black text-xs md:text-sm text-[var(--text-secondary)] mr-2">
                                {fmt(item.amount)}
                              </p>
                              <button
                                onClick={() => setModal(bill)}
                                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] cursor-pointer text-[10px] md:text-xs font-bold whitespace-nowrap transition-all hover:bg-[var(--text-primary)] hover:text-white hover:border-[var(--text-primary)]"
                              >
                                <FileText size={10} />{" "}
                                <span className="hidden md:inline">
                                  {t.receipt}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ══ RECEIPT MODAL ══ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={() => setModal(null)}
          />
          <div className="relative bg-[var(--card-bg)] w-full max-w-sm md:max-w-md rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl">
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 md:top-5 right-4 md:right-5 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--bg-tertiary)] border-none cursor-pointer flex items-center justify-center z-10"
            >
              <X size={14} color="var(--text-secondary)" />
            </button>
            <div className="p-6 md:p-10 md:pb-8">
              {/* Header */}
              <div className="text-center mb-6 md:mb-7 pb-5 md:pb-6 border-b-2 border-dashed border-[var(--border-color)]">
                <img
                  src="/LOGO.png"
                  alt="Logo"
                  className="h-7 md:h-8 mx-auto mb-2 md:mb-3"
                />
                <h3 className="text-base md:text-lg font-black uppercase tracking-tight mb-1 text-[var(--text-primary)]">
                  {t.eReceipt}
                </h3>
                <p className="text-[10px] md:text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
                  MediCare Hospital
                </p>
              </div>
              {/* Info rows */}
              <div className="flex flex-col gap-2 md:gap-3 mb-5 md:mb-6 text-xs md:text-sm font-bold">
                {[
                  [t.patient, user?.fullName],
                  [t.department, sel?.department],
                  [t.doctorLabel, getDoctorDisplayName(sel?.doctor)],
                  [
                    t.time,
                    formatDateTime(lang, modal.paidAt || modal.updatedAt),
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] md:text-xs">
                      {k}
                    </span>
                    <span className="text-[var(--text-primary)] text-right truncate">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              {/* Items */}
              <div className="flex flex-col gap-2 md:gap-3 mb-5 md:mb-6">
                {modal.items?.map((item, i) => {
                  const m = getMeta(item.type);
                  return (
                    <div
                      key={i}
                      className="flex justify-between text-xs md:text-sm"
                    >
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase">
                          {m.label}
                        </p>
                      </div>
                      <p className="font-black text-[var(--text-primary)]">
                        {fmt(item.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* Total */}
              <div className="pt-4 md:pt-5 border-t-2 border-dashed border-[var(--border-color)]">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
                    {t.total}
                  </p>
                  <p className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    {fmt(modal.totalAmount)}
                  </p>
                </div>
                <div className="bg-emerald-500 rounded-xl md:rounded-2xl py-2 md:py-3 px-4 md:px-5 text-center">
                  <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-wider">
                    {t.paidSuccessMsg}
                  </p>
                </div>
              </div>
              <div className="text-center mt-5 md:mt-6 opacity-10">
                <QrCode size={32} className="mx-auto mb-1 md:mb-2" />
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">
                  MediCare Authentic Receipt
                </p>
              </div>
            </div>
            {/* Tear edge */}
            <div className="flex h-4 md:h-5 overflow-hidden bg-[var(--bg-secondary)]">
              {Array.from({ length: 22 }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 md:w-7 h-5 md:h-7 bg-[var(--card-bg)] rotate-45 flex-shrink-0 -mt-2 md:-mt-3 mr-0.5"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
