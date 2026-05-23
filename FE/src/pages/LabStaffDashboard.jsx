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
    className={`fixed top-8 right-8 z-50 transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"}`}
  >
    <div
      className={`bg-[var(--card-bg)] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${toast.type === "error" ? "border-red-100 dark:border-red-900/30" : "border-green-100 dark:border-green-900/30"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"}`}
      >
        {toast.type === "error" ? (
          <AlertTriangle size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}
      </div>
      <p className="text-sm font-bold text-[var(--text-primary)]">
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
      className={`bg-[var(--card-bg)] rounded-3xl border shadow-sm transition-all ${isUrgent ? "border-red-200 dark:border-red-900/30 ring-1 ring-red-100 dark:ring-red-900/20" : "border-[var(--border-color)]"}`}
    >
      {isUrgent && (
        <div className="bg-red-500 text-white text-xs font-bold px-5 py-1.5 rounded-t-3xl flex items-center gap-2">
          <AlertTriangle size={12} /> {t.urgentBadge}
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Patient Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                {req.patient?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">
                  {req.patient?.fullName}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-mono">
                  {req.patient?.patientId} • {req.patient?.phone}
                </p>
              </div>
            </div>

            {/* Test Info */}
            <div className="text-sm mb-4">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                {t.requestedTests} ({req.tests?.length || 0})
              </p>
              <div className="space-y-2">
                {req.tests?.map((test, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wider mb-1">
                        {t[test.testType] || test.testType}
                      </p>
                      <p className="font-bold text-[var(--text-primary)]">
                        {test.testName}
                      </p>
                    </div>
                    {test.clinicalNotes && (
                      <div className="text-xs text-[var(--text-secondary)] italic max-w-xs text-right">
                        "{test.clinicalNotes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor & Time */}
            <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)] font-medium animate-in fade-in duration-300">
              <span className="flex items-center gap-1">
                <User size={12} /> {getDoctorDisplayName(req.doctor?.fullName)}
              </span>
              {req.appointment && (
                <span className="flex items-center gap-1">
                  {t.consultationSession}{" "}
                  {formatDate(lang, req.appointment?.date)}{" "}
                  {req.appointment?.time}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={12} /> {formatDateTime(lang, req.createdAt)}
              </span>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                req.status === "pending"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              }`}
            >
              {req.status === "pending" ? t.statusPending : t.statusInProgress}
            </span>

            {req.status === "pending" && !labPaid && (
              <div className="text-right max-w-[200px]">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 block mb-2">
                  {t.unpaidLab}
                </span>
                <p className="text-[10px] text-orange-600 dark:text-orange-400 leading-snug">
                  {t.unpaidLabHint}
                </p>
              </div>
            )}
            {req.status === "pending" && labPaid && (
              <button
                onClick={handleStart}
                disabled={starting}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                {starting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FlaskConical size={14} />
                )}
                {t.btnStart}
              </button>
            )}

            {req.status === "in_progress" && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20"
              >
                <Send size={14} />
                {t.btnExport}
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Upload Result Panel */}
        {expanded && req.status === "in_progress" && (
          <div className="mt-6 pt-6 border-t border-[var(--border-color)] space-y-4 animate-in slide-in-from-top-2 duration-300">
            <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-sm">
              <Send size={16} className="text-teal-600 dark:text-teal-400" />{" "}
              {t.exportPanelTitle}
            </h4>

            <textarea
              rows="2"
              className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 resize-none text-[var(--text-primary)]"
              placeholder={t.exportNotesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {files.length > 0 && (
              <div className="flex flex-col gap-2 mb-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 bg-[var(--card-bg)] p-2 rounded-lg shadow-sm border border-green-100 dark:border-green-900/30"
                  >
                    <div className="flex items-center gap-2">
                      <FileText
                        size={20}
                        className="text-green-600 dark:text-green-400"
                      />
                      <span
                        className="font-bold text-[var(--text-primary)] text-xs truncate max-w-[200px]"
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
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length < 5 && (
              <div
                className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all border-[var(--border-color)] hover:border-teal-300 hover:bg-teal-50/30 dark:hover:bg-teal-900/20"
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
                  <Upload size={20} />
                  <span className="text-sm font-medium">{t.addFilesHint}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleComplete}
              disabled={files.length === 0 || uploading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> {t.sendingBtn}
                </>
              ) : (
                <>
                  <Send size={18} /> {t.btnSendResult}
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
        const endpoint =
          activeTab === "history"
            ? "/api/lab-requests/history"
            : "/api/lab-requests";
        const res = await authFetch(`${API_URL}${endpoint}`);
        const data = await res.json();
        if (data.success) {
          if (activeTab === "history") {
            setRequests(data.data.filter((r) => r.status === "completed"));
          } else {
            setRequests(data.data);
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
      <div className="flex items-center gap-4 mb-8 bg-[var(--card-bg)] p-6 rounded-3xl shadow-sm border border-[var(--border-color)]">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 dark:from-teal-900/30 to-blue-100 dark:to-blue-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center shadow-inner">
          <FlaskConical size={32} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t.dashboardTitle}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {t.dashboardSubtitle}
          </p>
        </div>
        <div className="flex gap-4 text-center items-center">
          <button
            onClick={() => {
              const fetchRequests = async () => {
                setLoading(true);
                try {
                  const endpoint =
                    activeTab === "history"
                      ? "/api/lab-requests/history"
                      : "/api/lab-requests";
                  const res = await authFetch(`${API_URL}${endpoint}`);
                  const data = await res.json();
                  if (data.success) {
                    if (activeTab === "history") {
                      setRequests(
                        data.data.filter((r) => r.status === "completed"),
                      );
                    } else {
                      setRequests(data.data);
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
            className="p-3 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-900/30 rounded-2xl hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:border-teal-200 dark:hover:border-teal-900/40 transition-all flex flex-col items-center justify-center h-full min-h-[72px] shadow-sm"
            title={t.refreshTitle}
          >
            <RefreshCw
              size={20}
              className={
                loading
                  ? "animate-spin text-teal-400"
                  : "text-teal-600 dark:text-teal-400"
              }
            />
            <span className="text-[10px] font-black text-teal-700 dark:text-teal-400 mt-1 uppercase">
              {t.refresh}
            </span>
          </button>
          <div className="px-5 py-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl">
            <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
              {pending.length}
            </p>
            <p className="text-xs text-yellow-500 dark:text-yellow-400 font-bold mt-1">
              {t.statusPending}
            </p>
          </div>
          <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {inProgress.length}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 font-bold mt-1">
              {t.statusInProgress}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === "pending" ? "bg-teal-600 text-white shadow-md shadow-teal-500/20" : "bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]"}`}
        >
          {t.pendingTab}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === "history" ? "bg-teal-600 text-white shadow-md shadow-teal-500/20" : "bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]"}`}
        >
          {t.historyTab}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 bg-[var(--bg-tertiary)] rounded-3xl"
            ></div>
          ))}
        </div>
      ) : activeTab === "pending" ? (
        requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm text-center">
            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2
                size={40}
                className="text-green-400 dark:text-green-400"
              />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-secondary)] mb-2">
              {t.noRequestsTitle}
            </h3>
            <p className="text-[var(--text-tertiary)] text-sm">
              {t.noRequestsDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {inProgress.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FlaskConical size={14} /> {t.statusInProgress} (
                  {inProgress.length})
                </h2>
                <div className="space-y-4">
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
                <h2 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={14} /> {t.statusPending} ({pending.length})
                </h2>
                <div className="space-y-4">
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
        <div className="flex flex-col items-center justify-center py-24 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm text-center">
          <div className="w-24 h-24 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6">
            <FileText size={40} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-secondary)] mb-2">
            {t.noHistory}
          </h3>
          <p className="text-[var(--text-tertiary)] text-sm">
            {t.noHistorySub}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completed.map((req) => (
            <div
              key={req._id}
              className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full uppercase">
                      {t.labDone}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-1">
                      <Clock size={12} /> {formatDateTime(lang, req.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                      {req.patient?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">
                        {req.patient?.fullName}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-mono">
                        {req.patient?.patientId} • {t.doctorShort}:{" "}
                        {req.doctor?.fullName}
                      </p>
                    </div>
                  </div>
                  <ul className="list-disc pl-4 text-sm text-[var(--text-primary)] font-medium space-y-1 mb-4">
                    {req.tests?.map((test, i) => (
                      <li key={i}>
                        {test.testName}{" "}
                        <span className="text-[var(--text-tertiary)] text-xs">
                          ({test.testType})
                        </span>
                      </li>
                    ))}
                  </ul>
                  {req.result?.files?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {req.result.files.map((f, idx) => (
                        <a
                          key={idx}
                          href={`${API_URL}${f.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-xl text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/40 flex items-center gap-1.5 transition-colors"
                        >
                          <FileText size={14} />
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
