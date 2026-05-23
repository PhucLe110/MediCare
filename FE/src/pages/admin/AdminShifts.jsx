import { API_URL, authFetch } from "../../config";
import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { getLocale } from "../../utils/i18nHelpers";

const trans = {
  vi: {
    loading: "Đang tải...",
    toastApproved: "Đã duyệt yêu cầu ca trực!",
    toastRejected: "Đã từ chối yêu cầu.",
    toastError: "Có lỗi xảy ra",
    anonymous: "Ẩn danh",
    pendingBanner: (n) => `Có ${n} yêu cầu ca trực đang chờ duyệt`,
    searchPlaceholder: "Tìm theo tên bác sĩ, khoa...",
    noRequests: "Không có yêu cầu nào.",
    pendingCount: (n) => `${n} chờ duyệt`,
    requestCount: (n) => `${n} yêu cầu`,
    viewSchedule: "Xem lịch",
    addShift: "Thêm ca",
    cancelShift: "Hủy ca",
    statusPending: "Chờ duyệt",
    statusApproved: "Đã duyệt",
    statusRejected: "Đã từ chối",
    approveTitle: "Duyệt",
    rejectTitle: "Từ chối",
    scheduleTitle: (name) => `Lịch trực — BS. ${name}`,
    shiftPattern: "Ca làm việc:",
    fullWeek: "Cả tuần",
    pendingInMonth: (n) => `• ${n} yêu cầu chờ duyệt`,
    legendShift: "Ca trực",
    legendPendingAdd: "Chờ thêm",
    legendPendingCancel: "Chờ hủy",
    waitingAdd: "Chờ thêm",
    waitingCancel: "Chờ hủy",
    waitingPrefix: "Chờ",
    approveBtn: "✓ Duyệt",
    rejectBtn: "✕ Từ chối",
    noShiftDay: "Ngày không có ca trực",
    waitingAddShift: "⏳ Chờ thêm ca:",
    noDaysInMonth: "Không có ngày trực nào trong tháng này.",
    months: [
      "",
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    days: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  },
  en: {
    loading: "Loading...",
    toastApproved: "Shift request approved!",
    toastRejected: "Request rejected.",
    toastError: "Something went wrong",
    anonymous: "Unknown",
    pendingBanner: (n) => `${n} shift request(s) awaiting approval`,
    searchPlaceholder: "Search by doctor name, department...",
    noRequests: "No requests found.",
    pendingCount: (n) => `${n} pending`,
    requestCount: (n) => `${n} request(s)`,
    viewSchedule: "View schedule",
    addShift: "Add shift",
    cancelShift: "Cancel shift",
    statusPending: "Pending",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    approveTitle: "Approve",
    rejectTitle: "Reject",
    scheduleTitle: (name) => `Schedule — Dr. ${name}`,
    shiftPattern: "Shift pattern:",
    fullWeek: "Full week",
    pendingInMonth: (n) => `• ${n} pending in this month`,
    legendShift: "On duty",
    legendPendingAdd: "Pending add",
    legendPendingCancel: "Pending cancel",
    waitingAdd: "pending add",
    waitingCancel: "pending cancel",
    waitingPrefix: "Waiting",
    approveBtn: "✓ Approve",
    rejectBtn: "✕ Reject",
    noShiftDay: "No scheduled shift this day",
    waitingAddShift: "⏳ Pending add:",
    noDaysInMonth: "No shift days in this month.",
    months: [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
};

export default function AdminShifts() {
  const { lang, t } = useTranslation(trans);
  const locale = getLocale(lang);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [previewDoctor, setPreviewDoctor] = useState(null); // { doctorId, doctorName }
  const [previewSchedule, setPreviewSchedule] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMonth, setPreviewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const jsonHeaders = () => ({ "Content-Type": "application/json" });

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Ensure date is in YYYY-MM-DD format before parsing
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const fetchSchedule = async (doctorId) => {
    setPreviewLoading(true);
    try {
      const { year, month } = previewMonth;
      const res = await authFetch(
        `${API_URL}/api/admin/doctors/${doctorId}/schedule?year=${year}&month=${month}`,
      );
      const json = await res.json();
      if (json.success) setPreviewSchedule(json.data);
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
      showToast(t.toastError, "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/admin/shift-requests`);
        const json = await res.json();
        if (json.success) setRequests(json.data);
      } catch (err) {
        console.error("Failed to fetch shift requests:", err);
        showToast(t.toastError, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    if (previewDoctor) fetchSchedule(previewDoctor.doctorId);
  }, [previewMonth, previewDoctor]);

  const openPreview = (doctorId, doctorName) => {
    setPreviewDoctor({ doctorId, doctorName });
    setPreviewSchedule(null);
  };

  const closePreview = () => {
    setPreviewDoctor(null);
    setPreviewSchedule(null);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await authFetch(
        `${API_URL}/api/admin/shift-requests/${id}/status`,
        {
          method: "PUT",
          headers: jsonHeaders(),
          body: JSON.stringify({ status }),
        },
      );
      const json = await res.json();
      if (json.success) {
        showToast(
          status === "approved" ? t.toastApproved : t.toastRejected,
          status === "approved" ? "success" : "error",
        );
        // Refetch requests
        const refetchRequests = async () => {
          try {
            const res = await authFetch(`${API_URL}/api/admin/shift-requests`);
            const json = await res.json();
            if (json.success) setRequests(json.data);
          } catch (err) {
            console.error("Failed to refetch shift requests:", err);
          }
        };
        refetchRequests();
        // Refresh schedule if preview open
        if (previewDoctor) {
          fetchSchedule(previewDoctor.doctorId);
        }
      } else {
        showToast(json.message || t.toastError, "error");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast(t.toastError, "error");
    }
  };

  // Group requests by doctor
  const grouped = requests.reduce((acc, r) => {
    const doctorId = r.doctor?._id;
    if (!doctorId) return acc;
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctorId,
        doctorName: r.doctor?.userId?.fullName || t.anonymous,
        department: r.doctor?.department || "",
        requests: [],
      };
    }
    acc[doctorId].requests.push(r);
    return acc;
  }, {});

  const groupedList = Object.values(grouped).filter(
    (g) =>
      g.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const changeMonth = (delta) => {
    setPreviewMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m > 12) {
        m = 1;
        y++;
      }
      if (m < 1) {
        m = 12;
        y--;
      }
      return { year: y, month: m };
    });
  };

  if (loading)
    return (
      <div className="text-center py-10 font-bold text-[var(--text-secondary)]">
        {t.loading}
      </div>
    );

  return (
    <div className="space-y-4 animate-in fade-in relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-900/30"
              : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-100 border-rose-200 dark:border-rose-900/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle
              className="text-emerald-500 dark:text-emerald-400 shrink-0"
              size={20}
            />
          ) : (
            <XCircle
              className="text-rose-500 dark:text-rose-400 shrink-0"
              size={20}
            />
          )}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl text-yellow-800 dark:text-yellow-100 text-xs md:text-sm font-bold">
          <AlertCircle
            size={16}
            className="text-yellow-500 dark:text-yellow-400 shrink-0"
          />
          {t.pendingBanner(pendingCount)}
        </div>
      )}

      {/* Search */}
      <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm p-3 md:p-4">
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            size={16}
          />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 md:pl-10 pr-3 md:pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Grouped by doctor */}
      {groupedList.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm text-center py-12 md:py-16 text-[var(--text-tertiary)]">
          <AlertCircle size={32} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-xs md:text-sm">{t.noRequests}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedList.map((group) => {
            const pendingInGroup = group.requests.filter(
              (r) => r.status === "pending",
            ).length;
            const isExpanded = expandedDoctor === group.doctorId;
            return (
              <div
                key={group.doctorId}
                className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden"
              >
                {/* Doctor header */}
                <div
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-5 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors gap-3"
                  onClick={() =>
                    setExpandedDoctor(isExpanded ? null : group.doctorId)
                  }
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs md:text-sm shrink-0">
                      {group.doctorName.charAt(
                        group.doctorName.lastIndexOf(" ") + 1,
                      ) || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                        BS. {group.doctorName}
                      </p>
                      <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-medium">
                        {group.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    {pendingInGroup > 0 && (
                      <span className="px-2 md:px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] md:text-xs font-black rounded-full">
                        {t.pendingCount(pendingInGroup)}
                      </span>
                    )}
                    <span className="px-2 md:px-2.5 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] md:text-xs font-bold rounded-full">
                      {t.requestCount(group.requests.length)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(group.doctorId, group.doctorName);
                      }}
                      className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <Eye size={12} />{" "}
                      <span className="hidden md:inline">{t.viewSchedule}</span>
                    </button>
                    {isExpanded ? (
                      <ChevronUp
                        size={16}
                        className="text-[var(--text-tertiary)]"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-[var(--text-tertiary)]"
                      />
                    )}
                  </div>
                </div>

                {/* Requests list */}
                {isExpanded && (
                  <div className="border-t border-[var(--border-color)] divide-y divide-[var(--border-color)]">
                    {group.requests.map((r) => (
                      <div
                        key={r._id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-5 py-3 hover:bg-[var(--bg-tertiary)] transition-colors gap-2 md:gap-4"
                      >
                        <div className="flex items-center gap-2 md:gap-4">
                          <span
                            className={`px-2 md:px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold ${r.type === "add" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"}`}
                          >
                            {r.type === "add" ? t.addShift : t.cancelShift}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] md:text-sm text-[var(--text-secondary)] font-medium">
                            <Calendar
                              size={12}
                              className="text-[var(--text-tertiary)]"
                            />
                            {new Date(r.date).toLocaleDateString(locale, {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </div>
                          <div className="flex flex-wrap gap-1 md:gap-1.5">
                            {(r.times || []).map((t) => (
                              <span
                                key={t}
                                className={`px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-[11px] font-bold border flex items-center gap-0.5 ${r.type === "add" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30"}`}
                              >
                                <Clock size={8} />
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {r.status === "pending" && (
                            <span className="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 md:px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold border border-yellow-100 dark:border-yellow-900/30">
                              {t.statusPending}
                            </span>
                          )}
                          {r.status === "approved" && (
                            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 md:px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                              {t.statusApproved}
                            </span>
                          )}
                          {r.status === "rejected" && (
                            <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 md:px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold border border-rose-100 dark:border-rose-900/30">
                              {t.statusRejected}
                            </span>
                          )}
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(r._id, "approved")}
                                className="p-1 md:p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                title={t.approveTitle}
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => updateStatus(r._id, "rejected")}
                                className="p-1 md:p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                title={t.rejectTitle}
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Preview Modal */}
      {previewDoctor &&
        (() => {
          // Collect pending requests for this doctor in the viewed month
          const { year, month } = previewMonth;
          const monthStr = `${year}-${String(month).padStart(2, "0")}`;
          const pendingReqs = requests.filter(
            (r) =>
              r.doctor?._id === previewDoctor.doctorId &&
              r.status === "pending" &&
              r.date?.startsWith(monthStr),
          );
          // Map pending by date
          const pendingByDate = pendingReqs.reduce((acc, r) => {
            if (!acc[r.date]) acc[r.date] = [];
            acc[r.date].push(r);
            return acc;
          }, {});

          // Dates with pending but not in schedule
          const scheduleDates = new Set(
            (previewSchedule?.schedule || []).map((s) => s.date),
          );
          const pendingOnlyDates = Object.keys(pendingByDate).filter(
            (d) => !scheduleDates.has(d),
          );

          return (
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-3 md:p-4"
              onClick={closePreview}
            >
              <div
                className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl shadow-2xl border border-[var(--border-color)] w-full max-w-2xl max-h-[90vh] md:max-h-[88vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="p-4 md:p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h3 className="text-base md:text-lg font-black text-[var(--text-primary)]">
                      {t.scheduleTitle(previewDoctor.doctorName)}
                    </h3>
                    {previewSchedule && (
                      <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                        {t.shiftPattern}{" "}
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {previewSchedule.doctor?.shiftPattern || t.fullWeek}
                        </span>
                        {pendingReqs.length > 0 && (
                          <span className="ml-2 md:ml-3 text-yellow-600 dark:text-yellow-400 font-bold">
                            {t.pendingInMonth(pendingReqs.length)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={closePreview}
                    className="p-1.5 md:p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Month nav */}
                <div className="flex items-center justify-between px-4 md:px-6 py-2 md:py-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-1.5 md:p-2 hover:bg-[var(--border-color)] rounded-lg transition-colors text-[var(--text-secondary)] font-bold"
                  >
                    ‹
                  </button>
                  <span className="font-black text-xs md:text-sm text-[var(--text-primary)]">
                    {t.months[previewMonth.month]} {previewMonth.year}
                  </span>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-1.5 md:p-2 hover:bg-[var(--border-color)] rounded-lg transition-colors text-[var(--text-secondary)] font-bold"
                  >
                    ›
                  </button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 md:gap-4 px-4 md:px-6 py-2 md:py-2.5 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[10px] md:text-[11px] font-bold flex-wrap">
                  <span className="flex items-center gap-1 md:gap-1.5 text-[var(--text-secondary)]">
                    <span className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-sm bg-[var(--card-bg)] border border-[var(--border-color)] inline-block"></span>
                    {t.legendShift}
                  </span>
                  <span className="flex items-center gap-1 md:gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-900/30 inline-block"></span>
                    {t.legendPendingAdd}
                  </span>
                  <span className="flex items-center gap-1 md:gap-1.5 text-rose-600 dark:text-rose-400">
                    <span className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-sm bg-rose-100 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-900/30 inline-block"></span>
                    {t.legendPendingCancel}
                  </span>
                </div>

                {/* Schedule content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-5">
                  {previewLoading ? (
                    <div className="flex justify-center py-8 md:py-10">
                      <div className="animate-spin h-6 w-6 md:h-8 md:w-8 border-b-2 border-indigo-500 rounded-full" />
                    </div>
                  ) : (
                    <>
                      {previewSchedule?.schedule?.length > 0 ||
                      pendingOnlyDates.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                          {/* Days with approved schedule */}
                          {(previewSchedule?.schedule || []).map((s) => {
                            const dateObj = parseDate(s.date);
                            if (!dateObj) return null;
                            const isToday =
                              new Date().toDateString() ===
                              dateObj.toDateString();
                            const pendingForDay = pendingByDate[s.date] || [];
                            const hasPending = pendingForDay.length > 0;
                            return (
                              <div
                                key={s.date}
                                className={`p-2 md:p-3 border rounded-xl transition-all ${hasPending ? "border-yellow-300 dark:border-yellow-900/30 bg-yellow-50/40 dark:bg-yellow-900/20" : isToday ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-[var(--border-color)] bg-[var(--bg-tertiary)]"}`}
                              >
                                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                                  <span
                                    className={`text-[10px] md:text-xs font-black ${isToday ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-secondary)]"}`}
                                  >
                                    {t.days[s.dayOfWeek]}
                                  </span>
                                  <span
                                    className={`text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-md ${isToday ? "bg-indigo-500 text-white" : "bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-color)]"}`}
                                  >
                                    {dateObj.getDate()}/{dateObj.getMonth() + 1}
                                  </span>
                                </div>
                                {/* Current approved times */}
                                <div className="flex flex-wrap gap-1 mb-1 md:mb-1.5">
                                  {s.times.map((t) => (
                                    <span
                                      key={t}
                                      className="px-1 md:px-1.5 py-0.5 text-[10px] font-bold bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md text-[var(--text-secondary)]"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                                {/* Pending requests for this day */}
                                {pendingForDay.map((pr) => (
                                  <div
                                    key={pr._id}
                                    className={`mt-1 pt-1 md:pt-1.5 border-t ${pr.type === "add" ? "border-emerald-200 dark:border-emerald-900/30" : "border-rose-200 dark:border-rose-900/30"}`}
                                  >
                                    <p
                                      className={`text-[10px] font-black uppercase mb-1 ${pr.type === "add" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                                    >
                                      ⏳ {t.waitingPrefix}{" "}
                                      {pr.type === "add"
                                        ? t.waitingAdd
                                        : t.waitingCancel}
                                      :
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {(pr.times || []).map((t) => (
                                        <span
                                          key={t}
                                          className={`px-1 md:px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${pr.type === "add" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900/30" : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-900/30"}`}
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="flex gap-1 mt-1 md:mt-1.5">
                                      <button
                                        onClick={() =>
                                          updateStatus(pr._id, "approved")
                                        }
                                        className="flex-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-md py-1 transition-colors"
                                      >
                                        {t.approveBtn}
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateStatus(pr._id, "rejected")
                                        }
                                        className="flex-1 text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 rounded-md py-1 transition-colors"
                                      >
                                        {t.rejectBtn}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}

                          {/* Days that only have pending (not yet in schedule) */}
                          {pendingOnlyDates.sort().map((dateStr) => {
                            const dateObj = parseDate(dateStr);
                            if (!dateObj) return null;
                            const dow = dateObj.getDay();
                            const pendingForDay = pendingByDate[dateStr] || [];
                            return (
                              <div
                                key={dateStr}
                                className="p-2 md:p-3 border border-yellow-300 dark:border-yellow-900/30 bg-yellow-50/60 dark:bg-yellow-900/30 rounded-xl"
                              >
                                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                                  <span className="text-[10px] md:text-xs font-black text-yellow-700 dark:text-yellow-400">
                                    {t.days[dow]}
                                  </span>
                                  <span className="text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30">
                                    {dateObj.getDate()}/{dateObj.getMonth() + 1}
                                  </span>
                                </div>
                                <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold mb-1">
                                  {t.noShiftDay}
                                </p>
                                {pendingForDay.map((pr) => (
                                  <div
                                    key={pr._id}
                                    className="mt-1 pt-1 border-t border-emerald-200 dark:border-emerald-900/30"
                                  >
                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                                      {t.waitingAddShift}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mb-1 md:mb-1.5">
                                      {(pr.times || []).map((t) => (
                                        <span
                                          key={t}
                                          className="px-1 md:px-1.5 py-0.5 text-[10px] font-bold rounded-md border bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900/30"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() =>
                                          updateStatus(pr._id, "approved")
                                        }
                                        className="flex-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-md py-1 transition-colors"
                                      >
                                        {t.approveBtn}
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateStatus(pr._id, "rejected")
                                        }
                                        className="flex-1 text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 rounded-md py-1 transition-colors"
                                      >
                                        {t.rejectBtn}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 md:py-12 text-[var(--text-tertiary)]">
                          <Calendar
                            size={32}
                            className="mx-auto mb-3 opacity-20"
                          />
                          <p className="font-medium text-xs md:text-sm">
                            {t.noDaysInMonth}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
