import { API_URL, authFetch } from "../config";
import { useState, useEffect, useRef } from "react";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Upload,
  FileText,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Send,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import {
  formatDoctorName,
  formatDate,
  formatDateTime,
} from "../utils/i18nHelpers";

// const API_URL = API_URL;

const jsonHeaders = () => ({ "Content-Type": "application/json" });

const trans = {
  vi: {
    blood: "Xét nghiệm máu",
    urine: "Xét nghiệm nước tiểu",
    xray: "Chụp X-Quang",
    mri: "Chụp MRI",
    ct: "Chụp CT Scan",
    ultrasound: "Siêu âm",
    ecg: "Điện tâm đồ (ECG)",
    other: "Loại khác",

    urgentBadge: "KHẨN CẤP — Ưu tiên xử lý",
    testNameLabel: "Tên xét nghiệm",
    typeLabel: "Loại",
    clinicalNotesLabel: "Ghi chú lâm sàng từ Bác sĩ",
    doctorLabel: "BS.",
    consultationSession: "Ca khám:",
    statusPending: "Chờ xử lý",
    statusInProgress: "Đang tiến hành",
    btnStart: "Bắt đầu XN",
    btnExport: "Xuất kết quả",
    exportPanelTitle: "Xuất kết quả xét nghiệm",
    exportNotesPlaceholder: "Ghi chú kết quả (tùy chọn)...",
    fileUploadGreen: "Chọn file PDF / hình ảnh kết quả",
    btnSendResult: "Gửi kết quả tới bệnh nhân & bác sĩ",
    sendingBtn: "Đang gửi...",

    // Main Dashboard
    dashboardTitle: "Bàn Làm Việc Xét Nghiệm",
    dashboardSubtitle: "Danh sách yêu cầu xét nghiệm từ Bác sĩ chờ xử lý",
    loadError: "Không thể tải danh sách yêu cầu.",
    startSuccess: "Đã bắt đầu tiến hành xét nghiệm!",
    connError: "Lỗi kết nối.",
    unpaidLab: "Chưa thanh toán phí XN",
    unpaidLabHint:
      "Bệnh nhân cần thanh toán phí xét nghiệm trước khi bạn có thể bắt đầu.",
    btnStartDisabled: "Chờ thanh toán XN",

    noRequestsTitle: "Không có yêu cầu nào đang chờ",
    noRequestsDesc: "Tất cả yêu cầu xét nghiệm đã được xử lý xong!",
    requestedTests: "Chỉ định xét nghiệm",
    addFilesHint: "Nhấn để thêm file kết quả (tối đa 5)",
    refreshTitle: "Làm mới danh sách",
    refresh: "Làm mới",
    pendingTab: "Đang xử lý",
    historyTab: "Lịch sử xét nghiệm",
    noHistory: "Chưa có lịch sử",
    noHistorySub: "Các xét nghiệm đã hoàn thành sẽ hiển thị ở đây",
    labDone: "Đã hoàn thành",
    viewResult: "Xem kết quả",
    doctorShort: "Bác sĩ",
  },
  en: {
    blood: "Blood Panel Test",
    urine: "Urinalysis",
    xray: "Radiography (X-Ray)",
    mri: "MRI Scan",
    ct: "CT Scan",
    ultrasound: "Ultrasound Imaging",
    ecg: "Electrocardiogram (ECG)",
    other: "Other Specialty",

    urgentBadge: "CRITICAL — High Priority Dispatch",
    testNameLabel: "Clinical Test Name",
    typeLabel: "Category",
    clinicalNotesLabel: "Practitioner Clinical Notes",
    doctorLabel: "Dr.",
    consultationSession: "Consultation:",
    statusPending: "Pending",
    statusInProgress: "Processing",
    btnStart: "Commence Analysis",
    btnExport: "Generate Report",
    exportPanelTitle: "Compile Laboratory Diagnostics",
    exportNotesPlaceholder: "Clinical interpretation notes (optional)...",
    fileUploadGreen: "Attach PDF Report or Diagnostics Imagery",
    btnSendResult: "Dispatch Results to Patient & Practitioner",
    sendingBtn: "Transmitting...",

    // Main Dashboard
    dashboardTitle: "Clinical Diagnostics Workbench",
    dashboardSubtitle:
      "Pending laboratory examination requests dispatched by physicians",
    loadError: "Unable to fetch pending diagnostics queues.",
    startSuccess: "Diagnostics pipeline successfully commenced!",
    connError: "Connection lost.",
    unpaidLab: "Lab fee unpaid",
    unpaidLabHint:
      "Patient must pay the lab fee before you can start processing.",
    btnStartDisabled: "Awaiting lab payment",

    noRequestsTitle: "Queue Fully Dispatched",
    noRequestsDesc:
      "All diagnostic requests have been processed and dispatched successfully!",
    requestedTests: "Requested Tests",
    addFilesHint: "Click to add files (max 5)",
    refreshTitle: "Refresh list",
    refresh: "Refresh",
    pendingTab: "Pending Requests",
    historyTab: "Lab History",
    noHistory: "No history yet",
    noHistorySub: "Completed lab requests will appear here",
    labDone: "Completed",
    viewResult: "View Result",
    doctorShort: "Dr.",
  },
};

const Toast = ({ toast }) => (
  <div
    className={`fixed top-4 md:top-8 right-4 md:right-8 z-50 transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"}`}
  >
    <div
      className={`bg-[var(--card-bg)] px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-2 md:gap-3 border ${toast.type === "error" ? "border-red-100 dark:border-red-900/30" : "border-green-100 dark:border-green-900/30"}`}
    >
      <div
        className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"}`}
      >
        {toast.type === "error" ? (
          <AlertTriangle size={14} />
        ) : (
          <CheckCircle2 size={14} />
        )}
      </div>
      <p className="text-xs md:text-sm font-bold text-[var(--text-primary)]">
        {toast.message}
      </p>
    </div>
  </div>
);

// Card for a single pending request
const RequestCard = ({ req, onStart, onComplete }) => {
  const { lang, t } = useTranslation(trans);
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const fileRef = useRef();

  const handleStart = async () => {
    setStarting(true);
    await onStart(req._id);
    setStarting(false);
  };

  const handleComplete = async () => {
    if (files.length === 0) return;
    setUploading(true);
    await onComplete(req._id, files, notes);
    setUploading(false);
  };

  const getDoctorDisplayName = (name) => formatDoctorName(lang, name);

  const isUrgent = req.tests?.some((t) => t.urgency === "urgent");
  const labPaid =
    req.paymentStatus === "paid" ||
    (!req.paymentStatus && req.bill?.status === "paid");

  return (
    <div
      className={`bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border shadow-sm transition-all ${isUrgent ? "border-red-200 dark:border-red-900/30 ring-1 ring-red-100 dark:ring-red-900/20" : "border-[var(--border-color)]"}`}
    >
      {isUrgent && (
        <div className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-3 md:px-5 py-1 md:py-1.5 rounded-t-2xl md:rounded-t-3xl flex items-center gap-1 md:gap-2">
          <AlertTriangle size={10} /> {t.urgentBadge}
        </div>
      )}
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
          <div className="flex-1">
            {/* Patient Info */}
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-lg md:rounded-xl flex items-center justify-center font-bold text-sm md:text-lg shrink-0">
                {req.patient?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                  {req.patient?.fullName}
                </h3>
                <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-mono">
                  {req.patient?.patientId} • {req.patient?.phone}
                </p>
              </div>
            </div>

            {/* Test Info */}
            <div className="text-xs md:text-sm mb-3 md:mb-4">
              <p className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 md:mb-2">
                {t.requestedTests} ({req.tests?.length || 0})
              </p>
              <div className="space-y-1.5 md:space-y-2">
                {req.tests?.map((test, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50/50 dark:bg-blue-900/20 p-2 md:p-3 rounded-lg md:rounded-xl border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2"
                  >
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wider mb-0.5 md:mb-1">
                        {t[test.testType] || test.testType}
                      </p>
                      <p className="font-bold text-[var(--text-primary)] text-[10px] md:text-sm">
                        {test.testName}
                      </p>
                    </div>
                    {test.clinicalNotes && (
                      <div className="text-[10px] md:text-xs text-[var(--text-secondary)] italic max-w-xs text-right">
                        "{test.clinicalNotes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor & Time */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs text-[var(--text-tertiary)] font-medium animate-in fade-in duration-300">
              <span className="flex items-center gap-1">
                <User size={10} /> {getDoctorDisplayName(req.doctor?.fullName)}
              </span>
              {req.appointment && (
                <span className="flex items-center gap-1">
                  {t.consultationSession}{" "}
                  {formatDate(lang, req.appointment?.date)}{" "}
                  {req.appointment?.time}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={10} /> {formatDateTime(lang, req.createdAt)}
              </span>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 md:gap-2 shrink-0 w-full md:w-auto">
            <span
              className={`px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-full ${
                req.status === "pending"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              }`}
            >
              {req.status === "pending" ? t.statusPending : t.statusInProgress}
            </span>

            {req.status === "pending" && !labPaid && (
              <div className="text-right max-w-[200px]">
                <span className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 block mb-1 md:mb-2">
                  {t.unpaidLab}
                </span>
                <p className="text-[9px] md:text-[10px] text-orange-600 dark:text-orange-400 leading-snug">
                  {t.unpaidLabHint}
                </p>
              </div>
            )}
            {req.status === "pending" && labPaid && (
              <button
                onClick={handleStart}
                disabled={starting}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1 md:gap-1.5 shadow-md shadow-blue-500/20"
              >
                {starting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <FlaskConical size={12} />
                )}
                {t.btnStart}
              </button>
            )}

            {req.status === "in_progress" && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-teal-600 text-white text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl hover:bg-teal-700 transition-all flex items-center gap-1 md:gap-1.5 shadow-md shadow-teal-500/20"
              >
                <Send size={12} />
                {t.btnExport}
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Upload Result Panel */}
        {expanded && req.status === "in_progress" && (
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[var(--border-color)] space-y-3 md:space-y-4 animate-in slide-in-from-top-2 duration-300">
            <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-xs md:text-sm">
              <Send size={14} className="text-teal-600 dark:text-teal-400" />{" "}
              {t.exportPanelTitle}
            </h4>

            <textarea
              rows="2"
              className="w-full p-2 md:p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 resize-none text-[var(--text-primary)]"
              placeholder={t.exportNotesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {files.length > 0 && (
              <div className="flex flex-col gap-1.5 md:gap-2 mb-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 md:gap-3 bg-[var(--card-bg)] p-2 rounded-lg md:rounded-xl shadow-sm border border-green-100 dark:border-green-900/30"
                  >
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <FileText
                        size={14}
                        className="text-green-600 dark:text-green-400"
                      />
                      <span
                        className="font-bold text-[var(--text-primary)] text-[10px] md:text-xs truncate max-w-[150px] md:max-w-[200px]"
                        title={f.name}
                      >
                        {f.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-[var(--text-tertiary)] hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length < 5 && (
              <div
                className="border-2 border-dashed rounded-lg md:rounded-xl p-3 md:p-5 text-center cursor-pointer transition-all border-[var(--border-color)] hover:border-teal-300 hover:bg-teal-50/30 dark:hover:bg-teal-900/20"
                onClick={() => fileRef.current.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files);
                    setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5)); // max 5 files
                  }}
                />
                <div className="flex items-center justify-center gap-2 text-[var(--text-tertiary)]">
                  <Upload size={16} />
                  <span className="text-xs md:text-sm font-medium">
                    {t.addFilesHint}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleComplete}
              disabled={files.length === 0 || uploading}
              className="w-full py-2 md:py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-lg md:rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-1 md:gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-xs md:text-sm"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> {t.sendingBtn}
                </>
              ) : (
                <>
                  <Send size={14} /> {t.btnSendResult}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main Lab Staff Dashboard
// ============================================================
const LabStaffDashboard = () => {
  const { lang, t } = useTranslation(trans);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'history'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(
      () => setToast({ show: false, type: "success", message: "" }),
      4000,
    );
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_URL}/api/lab-requests`);
        const data = await res.json();
        if (data.success) {
          if (activeTab === "history") {
            setRequests(data.data.filter((r) => r.status === "completed"));
          } else {
            setRequests(data.data.filter((r) => r.status !== "completed"));
          }
        }
      } catch {
        showToast(t.loadError, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [activeTab, t]);

  const handleStart = async (id) => {
    try {
      const res = await authFetch(`${API_URL}/api/lab-requests/${id}/start`, {
        method: "PATCH",
        headers: jsonHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.map((r) => (r._id === id ? data.data : r)));
        showToast(t.startSuccess);
      } else {
        showToast(data.message || t.connError, "error");
      }
    } catch {
      showToast(t.connError, "error");
    }
  };

  const handleComplete = async (id, files, notes) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("notes", notes);

      const res = await authFetch(
        `${API_URL}/api/lab-requests/${id}/complete`,
        {
          method: "POST",
          headers: jsonHeaders(),
          body: formData,
        },
      );
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setRequests((prev) => prev.filter((r) => r._id !== id));
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast(t.connError, "error");
    }
  };

  const pending =
    activeTab === "pending"
      ? requests.filter((r) => r.status === "pending")
      : [];
  const inProgress =
    activeTab === "pending"
      ? requests.filter((r) => r.status === "in_progress")
      : [];
  const completed = activeTab === "history" ? requests : [];

  return (
    <div className="max-w-4xl mx-auto">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-8 bg-[var(--card-bg)] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-[var(--border-color)]">
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-100 dark:from-teal-900/30 to-blue-100 dark:to-blue-900/30 text-teal-600 dark:text-teal-400 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <FlaskConical size={20} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-[var(--text-primary)]">
              {t.dashboardTitle}
            </h1>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-0.5 md:mt-1">
              {t.dashboardSubtitle}
            </p>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 text-center items-center w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              const fetchRequests = async () => {
                setLoading(true);
                try {
                  const res = await authFetch(`${API_URL}/api/lab-requests`);
                  const data = await res.json();
                  if (data.success) {
                    if (activeTab === "history") {
                      setRequests(
                        data.data.filter((r) => r.status === "completed"),
                      );
                    } else {
                      setRequests(
                        data.data.filter((r) => r.status !== "completed"),
                      );
                    }
                  }
                } catch {
                  showToast(t.loadError, "error");
                } finally {
                  setLoading(false);
                }
              };
              fetchRequests();
            }}
            disabled={loading}
            className="p-2 md:p-3 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-900/30 rounded-xl md:rounded-2xl hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:border-teal-200 dark:hover:border-teal-900/40 transition-all flex flex-col items-center justify-center h-full min-h-[56px] md:min-h-[72px] shadow-sm"
            title={t.refreshTitle}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin text-teal-400"
                  : "text-teal-600 dark:text-teal-400"
              }
            />
            <span className="text-[9px] md:text-[10px] font-black text-teal-700 dark:text-teal-400 mt-0.5 md:mt-1 uppercase">
              {t.refresh}
            </span>
          </button>
          <div className="px-3 md:px-5 py-2 md:py-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-900/30 rounded-xl md:rounded-2xl">
            <p className="text-lg md:text-2xl font-black text-yellow-600 dark:text-yellow-400">
              {pending.length}
            </p>
            <p className="text-[10px] md:text-xs text-yellow-500 dark:text-yellow-400 font-bold mt-0.5 md:mt-1">
              {t.statusPending}
            </p>
          </div>
          <div className="px-3 md:px-5 py-2 md:py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/30 rounded-xl md:rounded-2xl">
            <p className="text-lg md:text-2xl font-black text-blue-600 dark:text-blue-400">
              {inProgress.length}
            </p>
            <p className="text-[10px] md:text-xs text-blue-500 dark:text-blue-400 font-bold mt-0.5 md:mt-1">
              {t.statusInProgress}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all ${activeTab === "pending" ? "bg-teal-600 text-white shadow-md shadow-teal-500/20" : "bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]"}`}
        >
          {t.pendingTab}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all ${activeTab === "history" ? "bg-teal-600 text-white shadow-md shadow-teal-500/20" : "bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]"}`}
        >
          {t.historyTab}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 md:space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 md:h-52 bg-[var(--bg-tertiary)] rounded-2xl md:rounded-3xl"
            ></div>
          ))}
        </div>
      ) : activeTab === "pending" ? (
        requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <CheckCircle2
                size={24}
                className="text-green-400 dark:text-green-400"
              />
            </div>
            <h3 className="text-base md:text-xl font-bold text-[var(--text-secondary)] mb-1 md:mb-2">
              {t.noRequestsTitle}
            </h3>
            <p className="text-[var(--text-tertiary)] text-xs md:text-sm">
              {t.noRequestsDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {inProgress.length > 0 && (
              <div>
                <h2 className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-1 md:gap-2">
                  <FlaskConical size={12} /> {t.statusInProgress} (
                  {inProgress.length})
                </h2>
                <div className="space-y-3 md:space-y-4">
                  {inProgress.map((req) => (
                    <RequestCard
                      key={req._id}
                      req={req}
                      onStart={handleStart}
                      onComplete={handleComplete}
                    />
                  ))}
                </div>
              </div>
            )}
            {pending.length > 0 && (
              <div>
                <h2 className="text-xs md:text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-1 md:gap-2">
                  <Clock size={12} /> {t.statusPending} ({pending.length})
                </h2>
                <div className="space-y-3 md:space-y-4">
                  {pending.map((req) => (
                    <RequestCard
                      key={req._id}
                      req={req}
                      onStart={handleStart}
                      onComplete={handleComplete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : completed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm text-center">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-4 md:mb-6">
            <FileText size={24} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-base md:text-xl font-bold text-[var(--text-secondary)] mb-1 md:mb-2">
            {t.noHistory}
          </h3>
          <p className="text-[var(--text-tertiary)] text-xs md:text-sm">
            {t.noHistorySub}
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {completed.map((req) => (
            <div
              key={req._id}
              className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm p-4 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] md:text-[10px] font-bold rounded-full uppercase">
                      {t.labDone}
                    </span>
                    <span className="text-[10px] md:text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1">
                      <Clock size={10} /> {formatDateTime(lang, req.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-lg md:rounded-xl flex items-center justify-center font-bold text-sm md:text-lg shrink-0">
                      {req.patient?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                        {req.patient?.fullName}
                      </h3>
                      <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-mono">
                        {req.patient?.patientId} • {t.doctorShort}:{" "}
                        {req.doctor?.fullName}
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc pl-4 text-xs md:text-sm text-[var(--text-primary)] font-medium space-y-0.5 md:space-y-1 mb-3 md:mb-4">
                    {req.tests?.map((test, i) => (
                      <li key={i}>
                        {test.testName}{" "}
                        <span className="text-[var(--text-tertiary)] text-[10px] md:text-xs">
                          ({test.testType})
                        </span>
                      </li>
                    ))}
                  </ul>
                  {req.result?.files?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {req.result.files.map((f, idx) => (
                        <a
                          key={idx}
                          href={`${API_URL}${f.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 md:px-3 py-1.5 md:py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/40 flex items-center gap-1 md:gap-1.5 transition-colors"
                        >
                          <FileText size={10} />
                          {t.viewResult}{" "}
                          {req.result.files.length > 1 ? idx + 1 : ""}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabStaffDashboard;
