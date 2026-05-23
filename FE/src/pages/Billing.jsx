import { API_URL, authFetch, getStoredUser } from "../config";
import { useState, useEffect } from "react";
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
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
    <div className="flex" style={{ height: "calc(100vh - 64px)" }}>
      {/* ══ SIDEBAR — soft white ══ */}
      <aside
        style={{
          width: 320,
          minWidth: 280,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo + title */}
        <div
          style={{
            padding: "24px 20px 16px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <img src="/LOGO.png" alt="Logo" style={{ height: 30 }} />
          </div>
          {/* Stats */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
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
                style={{
                  background: s.bg,
                  borderRadius: 12,
                  padding: "10px 12px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#94a3b8",
                    marginBottom: 3,
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: s.color,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ padding: "14px 16px 8px", flexShrink: 0 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--text-tertiary)",
            }}
          >
            {t.recentVisits}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4px 10px 16px",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--border-color) transparent",
          }}
        >
          {appList.map((app) => {
            const active = selId === app.id;
            const d = new Date(app.date);
            const hasUnpaid = app.unpaid.length > 0;
            const appMonth = formatApptMonth(lang, d);
            return (
              <button
                key={app.id}
                onClick={() => setSelId(app.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 16,
                  marginBottom: 4,
                  background: active ? "var(--card-bg)" : "transparent",
                  border: active
                    ? "1px solid var(--border-color)"
                    : "1px solid transparent",
                  boxShadow: active ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "var(--bg-tertiary)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Date box */}
                <div
                  style={{
                    width: 48,
                    height: 52,
                    borderRadius: 12,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: active
                      ? "var(--color-primary, #3b82f6)"
                      : "var(--bg-tertiary)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: active
                        ? "rgba(255,255,255,0.8)"
                        : "var(--text-tertiary)",
                      lineHeight: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {appMonth}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: active ? "#fff" : "var(--text-primary)",
                      lineHeight: 1,
                      marginTop: 2,
                    }}
                  >
                    {d.getDate()}
                  </span>
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: active
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {app.department}
                    </p>
                    {hasUnpaid && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#f59e0b",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#3b82f6",
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 1,
                    }}
                  >
                    {getDoctorDisplayName(app.doctor)}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--text-tertiary)",
                      fontWeight: 600,
                    }}
                  >
                    {formatDate(lang, d)}
                  </p>
                </div>
                {active && (
                  <ChevronRight
                    size={14}
                    style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ══ MAIN — white ══ */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          background: "var(--bg-primary)",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border-color) transparent",
        }}
      >
        {!sel ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-tertiary)",
            }}
          >
            <Receipt
              size={56}
              strokeWidth={1}
              style={{ marginBottom: 12, opacity: 0.3 }}
            />
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              {t.selectVisit}
            </p>
          </div>
        ) : (
          <div
            style={{ maxWidth: 720, margin: "0 auto", padding: "40px 32px" }}
          >
            {/* Header — gradient card */}
            <div
              style={{
                marginBottom: 32,
                background:
                  "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
                borderRadius: 24,
                padding: "28px 32px",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}
                >
                  {sel.department}
                </h1>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      fontWeight: 700,
                      background: "var(--card-bg)",
                      padding: "5px 12px",
                      borderRadius: 999,
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <Calendar size={13} color="var(--text-tertiary)" />
                    {formatDate(lang, sel.date)}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "#0369a1",
                      fontWeight: 700,
                      background: "var(--bg-tertiary)",
                      padding: "5px 12px",
                      borderRadius: 999,
                    }}
                  >
                    <User size={13} />
                    {getDoctorDisplayName(sel.doctor)}
                  </span>
                </div>
              </div>
              <img
                src="/LOGO.png"
                alt="Logo"
                style={{ height: 36, opacity: 0.15, flexShrink: 0 }}
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
                  style={{
                    marginBottom: 20,
                    background: "var(--card-bg)",
                    borderRadius: 28,
                    overflow: "hidden",
                    border: "2px solid #fed7aa",
                    boxShadow: "0 8px 40px rgba(251,146,60,0.12)",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg,#fff7ed,#ffedd5)",
                      padding: "18px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderBottom: "1px solid #fed7aa",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: meta.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AlertCircle size={18} color="#fff" />
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 900,
                          fontSize: 14,
                          color: "#c2410c",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {billTitle}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#ea580c",
                          fontWeight: 600,
                        }}
                      >
                        {hint}
                      </p>
                    </div>
                    <p
                      style={{
                        marginLeft: "auto",
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#c2410c",
                      }}
                    >
                      {fmt(amountDue(bill))}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
                    <div
                      style={{
                        flex: 1,
                        minWidth: 280,
                        padding: "20px 24px",
                        borderRight: "1px dashed #fed7aa",
                      }}
                    >
                      {(bill.items || []).map((item, i) => {
                        const m = getMeta(item.type);
                        const Icon = m.icon;
                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              padding: "12px 16px",
                              background: "var(--bg-tertiary)",
                              borderRadius: 16,
                              marginBottom: 10,
                              border: "1px solid var(--border-color)",
                            }}
                          >
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: `${m.color}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icon size={18} color={m.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "var(--text-primary)",
                                }}
                              >
                                {item.description}
                              </p>
                              <p
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: "var(--text-tertiary)",
                                  textTransform: "uppercase",
                                }}
                              >
                                {m.label}
                              </p>
                            </div>
                            <p
                              style={{
                                fontWeight: 900,
                                fontSize: 15,
                                color: "var(--text-primary)",
                              }}
                            >
                              {fmt(item.amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 180,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: 20,
                        background: "var(--bg-tertiary)",
                      }}
                    >
                      <div
                        style={{
                          background: "var(--card-bg)",
                          borderRadius: 20,
                          padding: 14,
                          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                          border: "1px solid var(--border-color)",
                          marginBottom: 10,
                        }}
                      >
                        <img
                          src={qrUrl(amountDue(bill), [bill._id])}
                          alt="QR"
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: "var(--text-tertiary)",
                          textTransform: "uppercase",
                          textAlign: "center",
                        }}
                      >
                        {t.scanQr}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* PAID HISTORY */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    background: "#d1fae5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={16} color="#10b981" />
                </div>
                <h3
                  style={{
                    fontWeight: 900,
                    fontSize: 13,
                    color: "var(--text-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {t.paidInvoices}
                </h3>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--border-color)",
                    marginLeft: 6,
                  }}
                ></div>
              </div>

              {sel.paid.length === 0 ? (
                <div
                  style={{
                    background: "var(--card-bg)",
                    borderRadius: 24,
                    border: "2px dashed var(--border-color)",
                    padding: "60px 24px",
                    textAlign: "center",
                  }}
                >
                  <Receipt
                    size={40}
                    strokeWidth={1}
                    style={{
                      margin: "0 auto 12px",
                      color: "var(--border-color)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t.noInvoices}
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {sel.paid.map((bill) => (
                    <div
                      key={bill._id}
                      style={{
                        background: "var(--card-bg)",
                        borderRadius: 20,
                        border: "1px solid var(--border-color)",
                        overflow: "hidden",
                        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                        transition: "box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 4px 20px rgba(0,0,0,0.09)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 1px 8px rgba(0,0,0,0.05)")
                      }
                    >
                      {/* Bill header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 20px",
                          background:
                            "linear-gradient(90deg, var(--bg-secondary), var(--card-bg))",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            background: "#10b981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 3px 10px rgba(16,185,129,0.25)",
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircle2 size={20} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: "#6ee7b7",
                              textTransform: "uppercase",
                              letterSpacing: "0.12em",
                              lineHeight: 1,
                            }}
                          >
                            {t.successPaid}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                              marginTop: 2,
                            }}
                          >
                            {formatDateTime(
                              lang,
                              bill.paidAt || bill.updatedAt,
                            )}
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {fmt(bill.totalAmount)}
                        </p>
                      </div>

                      {/* Items */}
                      <div style={{ padding: "10px 14px 12px" }}>
                        {(bill.items || []).map((item, ii) => {
                          const m = getMeta(item.type);
                          const Icon = m.icon;
                          return (
                            <div
                              key={ii}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "9px 10px",
                                borderRadius: 12,
                                transition: "background 0.15s",
                                cursor: "default",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--bg-tertiary)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 10,
                                  background: `${m.color}12`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Icon size={16} color={m.color} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: "var(--text-primary)",
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {item.description}
                                </p>
                                <p
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "var(--text-tertiary)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    marginTop: 2,
                                  }}
                                >
                                  {m.label}
                                </p>
                              </div>
                              <p
                                style={{
                                  fontWeight: 800,
                                  fontSize: 13,
                                  color: "var(--text-secondary)",
                                  marginRight: 10,
                                }}
                              >
                                {fmt(item.amount)}
                              </p>
                              <button
                                onClick={() => setModal(bill)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  background: "var(--bg-tertiary)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border-color)",
                                  cursor: "pointer",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "var(--text-primary)";
                                  e.currentTarget.style.color = "#fff";
                                  e.currentTarget.style.borderColor =
                                    "var(--text-primary)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "var(--bg-tertiary)";
                                  e.currentTarget.style.color =
                                    "var(--text-secondary)";
                                  e.currentTarget.style.borderColor =
                                    "var(--border-color)";
                                }}
                              >
                                <FileText size={12} /> {t.receipt}
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15,23,42,0.7)",
              backdropFilter: "blur(12px)",
            }}
            onClick={() => setModal(null)}
          />
          <div
            style={{
              position: "relative",
              background: "var(--card-bg)",
              width: "100%",
              maxWidth: 400,
              borderRadius: 40,
              overflow: "hidden",
              boxShadow: "0 50px 100px rgba(0,0,0,0.4)",
            }}
          >
            <button
              onClick={() => setModal(null)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--bg-tertiary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <X size={18} color="var(--text-secondary)" />
            </button>
            <div style={{ padding: "48px 40px 36px" }}>
              {/* Header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 28,
                  paddingBottom: 24,
                  borderBottom: "2px dashed var(--border-color)",
                }}
              >
                <img
                  src="/LOGO.png"
                  alt="Logo"
                  style={{ height: 32, margin: "0 auto 12px" }}
                />
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    marginBottom: 4,
                    color: "var(--text-primary)",
                  }}
                >
                  {t.eReceipt}
                </h3>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-tertiary)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  MediCare Hospital
                </p>
              </div>
              {/* Info rows */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 24,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {[
                  [t.patient, user?.fullName],
                  [t.department, sel?.department],
                  [t.doctorLabel, getDoctorDisplayName(sel?.doctor)],
                  [
                    t.time,
                    formatDateTime(lang, modal.paidAt || modal.updatedAt),
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontSize: 10,
                      }}
                    >
                      {k}
                    </span>
                    <span
                      style={{
                        color: "var(--text-primary)",
                        textAlign: "right",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              {/* Items */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {modal.items?.map((item, i) => {
                  const m = getMeta(item.type);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          {item.description}
                        </p>
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-tertiary)",
                            fontWeight: 800,
                            textTransform: "uppercase",
                          }}
                        >
                          {m.label}
                        </p>
                      </div>
                      <p
                        style={{
                          fontWeight: 900,
                          color: "var(--text-primary)",
                        }}
                      >
                        {fmt(item.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* Total */}
              <div
                style={{
                  paddingTop: 20,
                  borderTop: "2px dashed var(--border-color)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.total}
                  </p>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {fmt(modal.totalAmount)}
                  </p>
                </div>
                <div
                  style={{
                    background: "#10b981",
                    borderRadius: 16,
                    padding: "12px 20px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {t.paidSuccessMsg}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 24, opacity: 0.1 }}>
                <QrCode size={48} style={{ margin: "0 auto 6px" }} />
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                  }}
                >
                  MediCare Authentic Receipt
                </p>
              </div>
            </div>
            {/* Tear edge */}
            <div
              style={{
                display: "flex",
                height: 18,
                overflow: "hidden",
                background: "var(--bg-secondary)",
              }}
            >
              {Array.from({ length: 22 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    background: "var(--card-bg)",
                    transform: "rotate(45deg)",
                    flexShrink: 0,
                    marginTop: -14,
                    marginRight: 2,
                  }}
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
