import { API_URL, authFetch, getStoredUser } from "../config";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Stethoscope,
  TestTube2,
  Pill,
  FileCheck2,
  Calendar,
  Clock,
  CreditCard,
  Activity,
  Printer,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { ticketTrans, mergeTrans } from "../i18n/ticketI18n";
import {
  formatDoctorName,
  getLocalizedDept,
  formatDate,
} from "../utils/i18nHelpers";

// const API_URL = API_URL;

const trans = mergeTrans(
  {
    vi: {
      backBtn: "Quay lại Hồ sơ",
      backSimple: "Quay lại",
      loading: "Đang tải chi tiết...",
      notFound: "Không tìm thấy ca khám",
      title: "Thông tin ca khám",
      subtitle: "Chi tiết chẩn đoán và điều trị của bác sĩ",
      attendingDoctor: "Bác sĩ phụ trách",
      notOccurred: "Ca khám chưa diễn ra!",
      notOccurredSub:
        "Lịch khám của bạn được lên lịch vào lúc {time} ngày {date}. Số thứ tự xếp hàng của bạn là #{queue}. Vui lòng đến đúng giờ để bác sĩ tiến hành thăm khám.",
      dateLabel: "Ngày khám",
      timeLabel: "Giờ khám",
      ticketLabel: "Mã phiếu",
      symptomsLabel: "Triệu chứng",
      noSymptoms: "Không có",
      clinicalDiag: "Chẩn đoán lâm sàng",
      defaultDiag: "Sức khỏe bình thường, không phát hiện vấn đề nghiêm trọng.",
      diagPlaceholder:
        "Chẩn đoán lâm sàng chưa được cập nhật. Kết quả chẩn đoán và đơn thuốc sẽ hiển thị tại đây sau khi bác sĩ hoàn tất ca khám.",
      labDiag: "Kết quả xét nghiệm cận lâm sàng",
      labNormal: "Kết quả bình thường",
      labAbnormal: "Chỉ số bất thường",
      labUpdated: "Cập nhật:",
      prescribedMedicines: "Đơn thuốc được kê",
      dosageLabel: "Liều:",
      usageLabel: "Cách dùng:",
      qtyLabel: "Số lượng",
      deptLabel: "Khoa:",
      labResultsAvailable: "Đã có kết quả xét nghiệm cận lâm sàng",
      viewDetailedResults: "Xem kết quả chi tiết",
    },
    en: {
      backBtn: "Back to Profile",
      backSimple: "Back",
      loading: "Loading details...",
      notFound: "Consultation session not found",
      title: "Consultation Overview",
      subtitle: "Clinical details and physician diagnostics",
      attendingDoctor: "Attending Physician",
      notOccurred: "Consultation Pending!",
      notOccurredSub:
        "Your consultation session is scheduled at {time} on {date}. Your queue placement is #{queue}. Please arrive on schedule.",
      dateLabel: "Schedule Date",
      timeLabel: "Session Time",
      ticketLabel: "Ticket ID",
      symptomsLabel: "Symptoms",
      noSymptoms: "None reported",
      clinicalDiag: "Clinical Diagnostics",
      defaultDiag:
        "Vitals stable, no significant pathological changes identified.",
      diagPlaceholder:
        "Diagnostics and prescriptions will be updated here once the physician completes the consultation.",
      labDiag: "Laboratory & Diagnostic Reports",
      labNormal: "Normal Range",
      labAbnormal: "Abnormal Range",
      labUpdated: "Updated:",
      prescribedMedicines: "Prescribed Medicines",
      dosageLabel: "Dosage:",
      usageLabel: "Directions:",
      qtyLabel: "Qty",
      deptLabel: "Dept:",
      labResultsAvailable: "Laboratory results are available",
      viewDetailedResults: "View Detailed Results",
    },
  },
  ticketTrans,
);

export default function AppointmentDetail() {
  const { lang, t } = useTranslation(trans);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appt, setAppt] = useState(null);
  const [rx, setRx] = useState(null);
  const [labs, setLabs] = useState([]);
  const [showTicket, setShowTicket] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [apptRes, rxRes, labRes] = await Promise.all([
          authFetch(`${API_URL}/api/appointments`),
          authFetch(`${API_URL}/api/prescriptions/my`),
          authFetch(`${API_URL}/api/lab-results/my`),
        ]);

        const apptData = await apptRes.json();
        const rxData = await rxRes.json();
        const labData = await labRes.json();

        if (apptData.success) {
          const currentAppt = apptData.data.find((a) => a._id === id);
          setAppt(currentAppt);
          if (currentAppt) {
            if (rxData.success) {
              setRx(
                rxData.data.find(
                  (p) => p.appointment === id || p.appointment?._id === id,
                ),
              );
            }
            if (labData.success) {
              setLabs(
                labData.data.filter(
                  (l) => l.appointment === id || l.appointment?._id === id,
                ),
              );
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getDoctorDisplayName = (name) => formatDoctorName(lang, name);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {t.notFound}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-primary hover:underline font-bold"
        >
          {t.backSimple}
        </button>
      </div>
    );
  }

  const getNotOccurredSub = () => {
    return t.notOccurredSub
      .replace("{time}", appt.time)
      .replace("{date}", formatDate(lang, appt.date))
      .replace("{queue}", appt.queueNumber || "--");
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-primary transition-colors mb-6 font-bold text-sm"
      >
        <ArrowLeft size={16} /> {t.backBtn}
      </button>

      <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--border-color)] shadow-xl shadow-gray-200/20 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[var(--border-color)] pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">
              {t.title}
            </h1>
            <p className="text-[var(--text-secondary)] font-medium">
              {t.subtitle}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 px-5 py-3 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
            <div className="text-blue-900 dark:text-blue-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-1">
                {t.attendingDoctor}
              </p>
              <p className="font-bold">
                {getDoctorDisplayName(appt.doctor?.userId?.fullName)}
              </p>
              <p className="text-sm font-medium">
                {getLocalizedDept(appt.doctor?.department)}
              </p>
            </div>
          </div>
        </div>

        {appt.status !== "completed" && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-900/30 p-6 rounded-3xl mb-8 flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center shrink-0 shadow-inner">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-orange-950 dark:text-orange-400 font-black text-lg mb-1">
                {t.notOccurred}
              </h3>
              <p
                className="text-orange-900 dark:text-orange-300 text-sm leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: getNotOccurredSub() }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-color)]">
            <Calendar size={20} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
              {t.dateLabel}
            </p>
            <p className="font-black text-[var(--text-primary)]">
              {formatDate(lang, appt.date)}
            </p>
          </div>
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-color)]">
            <Clock size={20} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
              {t.timeLabel}
            </p>
            <p className="font-black text-[var(--text-primary)]">{appt.time}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-color)]">
            <CreditCard
              size={20}
              className="text-[var(--text-tertiary)] mb-2"
            />
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
              {t.ticketLabel}
            </p>
            <p className="font-black text-primary">{appt.ticketNumber}</p>
          </div>
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-2xl border border-[var(--border-color)]">
            <Activity size={20} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">
              {t.symptomsLabel}
            </p>
            <p
              className="font-bold text-[var(--text-primary)] truncate"
              title={appt.symptoms}
            >
              {appt.symptoms || t.noSymptoms}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Diagnosis */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Stethoscope size={16} />
              </div>
              {t.clinicalDiag}
            </h2>
            <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-6 rounded-2xl">
              <p
                className={`font-medium leading-relaxed ${appt.status === "completed" ? "text-blue-900 dark:text-blue-100" : "text-[var(--text-secondary)] italic"}`}
              >
                {appt.status === "completed"
                  ? rx?.diagnosis || t.defaultDiag
                  : t.diagPlaceholder}
              </p>
            </div>
          </div>

          {/* Lab Results */}
          {labs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <TestTube2 size={16} />
                </div>
                {t.labDiag}
              </h2>
              <div className="bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 p-6 rounded-2xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                  <FileCheck2 size={24} />
                </div>
                <p className="font-bold text-[var(--text-primary)] mb-1">
                  {t.labResultsAvailable}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {labs.map((l) => l.testName).join(", ")}
                </p>
                <button
                  onClick={() => navigate("/dashboard/lab-results")}
                  className="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
                >
                  {t.viewDetailedResults}
                </button>
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {rx?.medicines && rx.medicines.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Pill size={16} />
                </div>
                {t.prescribedMedicines}
              </h2>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-2xl">
                <ul className="space-y-2">
                  {rx.medicines.map((m, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center py-2 border-b border-emerald-100/50 dark:border-emerald-900/30 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">
                          {m.name}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                          {t.dosageLabel} {m.dosage} • {t.usageLabel}{" "}
                          {m.frequency}
                        </p>
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-lg text-sm">
                        x{m.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Queue Ticket Check-in Modal */}
      {showTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-250">
          <div className="bg-[var(--card-bg)] rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-[var(--border-color)] transform scale-100 transition-all duration-300 animate-in zoom-in-95">
            {/* Ticket Header */}
            <div className="bg-primary text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="flex justify-between items-center mb-4">
                <img
                  src="/LOGO.png"
                  alt="MediCare"
                  className="h-8 w-auto object-contain no-invert"
                />
                <span className="text-[10px] font-black tracking-widest bg-white/20 px-2.5 py-1 rounded-full uppercase">
                  {t.medicalTicket}
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight">
                {t.ticketTitle}
              </h3>
              <p className="text-xs text-blue-200 mt-1 font-medium">
                {t.ticketSubtitle}
              </p>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-6 relative">
              {/* Big Queue Number */}
              <div className="text-center py-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 relative">
                <p className="text-[10px] font-bold text-blue-400 dark:text-blue-300 uppercase tracking-widest mb-1">
                  {t.yourQueue}
                </p>
                <div className="inline-flex w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white items-center justify-center font-black text-4xl shadow-lg shadow-blue-500/20 my-2">
                  #{appt.queueNumber || "01"}
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold px-4">
                  {t.watchMonitor}
                </p>
              </div>

              {/* Ticket Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="text-[var(--text-tertiary)] font-bold">
                    {t.ticketId}
                  </span>
                  <span className="font-mono font-black text-[var(--text-primary)]">
                    {appt.ticketNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="text-[var(--text-tertiary)] font-bold">
                    {t.patient}
                  </span>
                  <span className="font-black text-[var(--text-primary)]">
                    {getStoredUser()?.fullName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="text-[var(--text-tertiary)] font-bold">
                    {t.physician}
                  </span>
                  <span className="font-bold text-primary">
                    {getDoctorDisplayName(appt.doctor?.userId?.fullName)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="text-[var(--text-tertiary)] font-bold">
                    {t.department}
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {getLocalizedDept(appt.doctor?.department)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="text-[var(--text-tertiary)] font-bold">
                    {t.schedule}
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {appt.time} • {formatDate(lang, appt.date)}
                  </span>
                </div>
              </div>

              {/* Dummy Barcode using high-tech SVGs */}
              <div className="flex flex-col items-center justify-center pt-2">
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
                <p className="text-[10px] text-[var(--text-tertiary)] font-mono tracking-widest mt-2">
                  {appt._id}
                </p>
              </div>
            </div>

            {/* Ticket Footer Buttons */}
            <div className="bg-[var(--bg-tertiary)] px-6 py-4 flex gap-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
              >
                <Printer size={14} />
                {t.printTicket}
              </button>
              <button
                onClick={() => setShowTicket(false)}
                className="px-4 py-2.5 bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold rounded-xl hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-all font-bold"
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
