import { useState, useEffect } from "react";
import { API_URL, authFetch } from "../config";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { getLocale } from "../utils/i18nHelpers";

const ALL_TIMES = ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"];

const trans = {
  vi: {
    errSelectDate: "Vui lòng chọn ngày",
    errSelectTime: "Vui lòng chọn ít nhất một khung giờ",
    submitSuccess: (n) => `Đã gửi yêu cầu thành công (${n} khung giờ)!`,
    errGeneric: "Có lỗi xảy ra",
    errRetry: "Có lỗi xảy ra, vui lòng thử lại",
    statusApproved: "Đã duyệt",
    statusRejected: "Từ chối",
    statusPending: "Chờ duyệt",
    title: "Thời gian trực khám",
    subtitle: "Quản lý ca trực và yêu cầu thay đổi lịch trình của bạn",
    newRequest: "Tạo yêu cầu mới",
    requestType: "Loại yêu cầu",
    addShift: "Thêm ca trực",
    cancelShift: "Hủy ca trực",
    dateLabel: "Ngày",
    timeSlots: "Chọn khung giờ",
    multiSelect: "(có thể chọn nhiều)",
    selected: "Đã chọn:",
    sending: "Đang gửi...",
    sendRequest: "Gửi yêu cầu",
    sendN: (n) => `Gửi ${n} yêu cầu`,
    schedule30: "Lịch trực 30 ngày tới",
    basePattern: "Lịch làm việc cơ bản của bạn là:",
    fullWeek: "Cả tuần",
    off: "Nghỉ",
    noShifts30: "Bạn không có ca trực nào trong 30 ngày tới.",
    history: "Lịch sử yêu cầu",
    reqAdd: "Yêu cầu thêm ca",
    reqCancel: "Yêu cầu hủy ca",
    noHistory: "Chưa có yêu cầu nào.",
  },
  en: {
    errSelectDate: "Please select a date",
    errSelectTime: "Please select at least one time slot",
    submitSuccess: (n) => `Request sent successfully (${n} slot(s))!`,
    errGeneric: "Something went wrong",
    errRetry: "An error occurred, please try again",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusPending: "Pending",
    title: "Shift Schedule",
    subtitle: "Manage your shifts and schedule change requests",
    newRequest: "New request",
    requestType: "Request type",
    addShift: "Add shift",
    cancelShift: "Cancel shift",
    dateLabel: "Date",
    timeSlots: "Time slots",
    multiSelect: "(multiple allowed)",
    selected: "Selected:",
    sending: "Sending...",
    sendRequest: "Submit request",
    sendN: (n) => `Submit ${n} request(s)`,
    schedule30: "Next 30 days",
    basePattern: "Your base schedule:",
    fullWeek: "Full week",
    off: "Off",
    noShifts30: "No shifts in the next 30 days.",
    history: "Request history",
    reqAdd: "Add shift request",
    reqCancel: "Cancel shift request",
    noHistory: "No requests yet.",
  },
};

const DoctorShifts = () => {
  const { lang, t } = useTranslation(trans);
  const locale = getLocale(lang);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [type, setType] = useState("add");
  const [date, setDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const jsonHeaders = () => ({ "Content-Type": "application/json" });

  const generateSchedule = (doctor, reqs) => {
    const pattern = doctor.shiftPattern || "Cả tuần";
    const baseTimes = ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"];
    const days = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayName = d.toLocaleDateString("vi-VN", { weekday: "long" });
      const dateStr = d.toISOString().split("T")[0];

      if (pattern === "Cả tuần" || pattern === dayName) {
        baseTimes.forEach((time) => {
          const isRequested = reqs.some(
            (r) =>
              r.date === dateStr && r.time === time && r.status === "approved",
          );
          const isCancelled = reqs.some(
            (r) =>
              r.date === dateStr &&
              r.time === time &&
              r.status === "approved" &&
              r.type === "cancel",
          );
          if (!isCancelled) {
            days.push({ date: dateStr, time, isRequested });
          }
        });
      }
    }

    setSchedule(days);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resReq, resProf] = await Promise.all([
          authFetch(`${API_URL}/api/doctors/shift-requests`),
          authFetch(`${API_URL}/api/doctors/profile`),
        ]);
        const dataReq = await resReq.json();
        const dataProf = await resProf.json();

        let reqs = [];
        if (dataReq.success) {
          reqs = dataReq.data;
          setRequests(reqs);
        }
        if (dataProf.success) {
          setProfile(dataProf.data.profile);
          generateSchedule(dataProf.data.profile, reqs);
        }
      } catch {
        // Error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleTime = (t) => {
    setSelectedTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return showToast(t.errSelectDate, "error");
    if (selectedTimes.length === 0) return showToast(t.errSelectTime, "error");

    setSubmitting(true);
    try {
      // Send ONE request with all selected times
      const res = await authFetch(`${API_URL}/api/doctors/shift-requests`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ type, date, times: selectedTimes.sort() }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(t.submitSuccess(selectedTimes.length), "success");
        // Refetch data
        const fetchData = async () => {
          setLoading(true);
          try {
            const [resReq, resProf] = await Promise.all([
              authFetch(`${API_URL}/api/doctors/shift-requests`),
              authFetch(`${API_URL}/api/doctors/profile`),
            ]);
            const dataReq = await resReq.json();
            const dataProf = await resProf.json();

            let reqs = [];
            if (dataReq.success) {
              reqs = dataReq.data;
              setRequests(reqs);
            }
            if (dataProf.success) {
              setProfile(dataProf.data.profile);
              generateSchedule(dataProf.data.profile, reqs);
            }
          } catch {
            // Error handling
          } finally {
            setLoading(false);
          }
        };
        fetchData();
        setDate("");
        setSelectedTimes([]);
      } else {
        showToast(data.message || t.errGeneric, "error");
      }
    } catch (err) {
      console.error(err);
      showToast(t.errRetry, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1 w-max">
            <CheckCircle size={14} /> {t.statusApproved}
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center gap-1 w-max">
            <XCircle size={14} /> {t.statusRejected}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center gap-1 w-max">
            <Clock size={14} /> {t.statusPending}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 md:top-6 right-4 md:right-6 z-50 flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-900/30"
              : toast.type === "warning"
                ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-100 border-yellow-200 dark:border-yellow-900/30"
                : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-100 border-rose-200 dark:border-rose-900/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle
              className="text-emerald-500 dark:text-emerald-400 shrink-0"
              size={16}
              md={20}
            />
          ) : toast.type === "warning" ? (
            <AlertCircle
              className="text-yellow-500 dark:text-yellow-400 shrink-0"
              size={16}
              md={20}
            />
          ) : (
            <XCircle
              className="text-rose-500 dark:text-rose-400 shrink-0"
              size={16}
              md={20}
            />
          )}
          <span className="font-bold text-xs md:text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {t.title}
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 md:mt-2">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Create Request Form */}
      <div className="bg-[var(--card-bg)] p-4 md:p-8 rounded-2xl md:rounded-[32px] shadow-sm border border-[var(--border-color)]">
        <h2 className="text-base md:text-xl font-bold mb-4 md:mb-6 text-[var(--text-primary)]">
          {t.newRequest}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1 md:mb-2">
                {t.requestType}
              </label>
              <select
                className="w-full p-2 md:p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-xs md:text-sm text-[var(--text-primary)]"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setSelectedTimes([]);
                }}
              >
                <option value="add">{t.addShift}</option>
                <option value="cancel">{t.cancelShift}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1 md:mb-2">
                {t.dateLabel}
              </label>
              <input
                type="date"
                className="w-full p-2 md:p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-xs md:text-sm text-[var(--text-primary)]"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedTimes([]);
                }}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-2 md:mb-3">
              {t.timeSlots}{" "}
              <span className="text-primary normal-case text-[10px] md:text-xs">
                {t.multiSelect}
              </span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
              {ALL_TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTime(t)}
                  className={`py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black border-2 transition-all ${
                    selectedTimes.includes(t)
                      ? type === "add"
                        ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/20"
                        : "border-red-400 dark:border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm shadow-red-200 dark:shadow-red-900/20"
                      : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-primary/30 hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {selectedTimes.length > 0 && (
              <p className="mt-2 md:mt-3 text-[10px] md:text-xs text-[var(--text-secondary)] font-medium">
                {t.selected}{" "}
                <span className="font-bold text-primary text-[10px] md:text-xs">
                  {selectedTimes.sort().join(", ")}
                </span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || selectedTimes.length === 0 || !date}
            className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all flex justify-center items-center gap-1 md:gap-2 shadow-lg ${
              submitting || selectedTimes.length === 0 || !date
                ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed shadow-none"
                : type === "add"
                  ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                  : "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-b-2 border-white rounded-full" />{" "}
                {t.sending}
              </>
            ) : (
              <>
                <Send size={14} md={18} />{" "}
                {selectedTimes.length > 0
                  ? t.sendN(selectedTimes.length)
                  : t.sendRequest}
              </>
            )}
          </button>
        </form>
      </div>

      {/* 30-day Schedule */}
      <div className="bg-[var(--card-bg)] p-4 md:p-8 rounded-2xl md:rounded-[32px] shadow-sm border border-[var(--border-color)]">
        <h2 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-[var(--text-primary)]">
          {t.schedule30}
        </h2>
        <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-4 md:mb-6 font-medium">
          {t.basePattern}{" "}
          <span className="font-bold text-primary text-xs md:text-sm">
            {profile?.shiftPattern || t.fullWeek}
          </span>
        </p>

        {loading ? (
          <div className="text-center py-4 md:py-6">
            <div className="animate-spin h-5 w-5 md:h-6 md:w-6 border-b-2 border-primary rounded-full mx-auto" />
          </div>
        ) : schedule.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
            {schedule.map((s, idx) => {
              const isToday =
                new Date().toDateString() === s.date.toDateString();
              return (
                <div
                  key={idx}
                  className={`p-2 md:p-4 border rounded-xl md:rounded-2xl transition-all shadow-sm ${isToday ? "border-primary bg-primary/5 shadow-primary/10" : "border-[var(--border-color)] bg-[var(--card-bg)] hover:border-primary/30 hover:shadow-md"}`}
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3 border-b border-[var(--border-color)] pb-1 md:pb-2">
                    <p
                      className={`text-xs md:text-sm font-black ${isToday ? "text-primary" : "text-[var(--text-primary)]"}`}
                    >
                      {s.date.toLocaleDateString(locale, { weekday: "short" })}
                    </p>
                    <p
                      className={`text-[10px] md:text-xs font-bold ${isToday ? "bg-primary text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)"} px-1.5 md:px-2 py-0.5 md:py-1 rounded-md`}
                    >
                      {s.date.toLocaleDateString(locale, {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 md:gap-1.5">
                    {s.times.length > 0 ? (
                      s.times.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[11px] font-bold bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] md:text-xs font-medium text-[var(--text-tertiary)] italic">
                        {t.off}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 md:py-6 text-[var(--text-tertiary)] text-xs md:text-sm font-medium">
            {t.noShifts30}
          </div>
        )}
      </div>

      {/* Request History */}
      <div className="bg-[var(--card-bg)] p-4 md:p-8 rounded-2xl md:rounded-[32px] shadow-sm border border-[var(--border-color)]">
        <h2 className="text-base md:text-xl font-bold mb-4 md:mb-6 text-[var(--text-primary)]">
          {t.history}
        </h2>
        {loading ? (
          <div className="text-center py-6 md:py-10">
            <div className="animate-spin h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary rounded-full mx-auto" />
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border border-[var(--border-color)] rounded-xl md:rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all gap-3"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${req.type === "add" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}
                  >
                    {req.type === "add" ? (
                      <Plus size={14} md={20} />
                    ) : (
                      <Trash2 size={14} md={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                      {req.type === "add" ? t.reqAdd : t.reqCancel}
                    </h3>
                    <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1 md:gap-2 mt-0.5">
                      <Calendar size={10} md={12} />{" "}
                      {new Date(req.date).toLocaleDateString(locale)}
                      <Clock
                        size={10}
                        md={12}
                        className="ml-0.5 md:ml-1"
                      />{" "}
                      {req.time}
                    </p>
                  </div>
                </div>
                <div className="flex md:block justify-end">
                  {getStatusBadge(req.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 text-[var(--text-tertiary)]">
            <AlertCircle
              size={32}
              md={48}
              className="mx-auto mb-2 md:mb-4 opacity-20"
            />
            <p className="font-medium text-xs md:text-sm">{t.noHistory}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorShifts;
