import { API_URL, authFetch } from "../../config";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  Search,
  UserRoundCheck,
  RefreshCw,
  X,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import {
  formatDoctorName,
  getLocalizedDept,
  getApptStatusLabel,
} from "../../utils/i18nHelpers";

const trans = {
  vi: {
    loading: "Đang tải danh sách ca khám...",
    connError: "Lỗi kết nối đến máy chủ.",
    toastSuccess: "Cập nhật trạng thái ca khám thành công!",
    toastCancelConfirm: "Bạn có chắc muốn hủy ca khám này?",
    toastApproveConfirm: "Bạn có chắc chắn muốn xác nhận đặt lịch ca khám này?",
    toastReschedSuccess: "Điều phối & Dời ca khám thành công!",
    toastSaveError: "Không thể lưu kết quả điều phối.",
    toastNoDoctor: "Vui lòng chọn bác sĩ phụ trách ca khám!",
    toastFetchDoctorError: "Không thể tải danh sách bác sĩ rảnh.",
    toastUpdateError: "Không thể cập nhật ca khám.",
    confirmActionTitle: "Xác Nhận Hành Động",
    btnCancel: "Hủy bỏ",
    btnConfirm: "Xác nhận",
    headerTitle: "Điều phối Ca khám chuyên sâu",
    headerSubtitle:
      "Tìm kiếm bác sĩ trống lịch cùng chuyên khoa để phân phối tải hoặc dời giờ khám. Ca khám hoàn thành sẽ do bác sĩ trực tiếp khám bệnh xác nhận.",
    searchPlaceholder: "Tìm theo tên BN, bác sĩ, mã số vé...",
    filterAllStatus: "Tất cả trạng thái",
    colTicketDate: "Mã Vé & Ngày Khám",
    colPatient: "Bệnh nhân",
    colDoctor: "Bác sĩ phụ trách",
    colQueue: "STT",
    colStatus: "Trạng thái",
    colAction: "Thao tác",
    btnReschedule: "Điều phối lịch",
    btnCancelAppt: "Hủy ca",
    btnConfirmAppt: "Xác nhận",
    apptClosed: "Đã đóng ca khám",
    modalTitle: "Điều Phối Ca Khám Lâm Sàng",
    modalTicketNo: "Mã vé:",
    modalOrigHeader: "Thông tin đăng ký ban đầu:",
    modalOrigPatient: "Bệnh nhân:",
    modalOrigPhone: "Số điện thoại:",
    modalOrigDoctor: "Bác sĩ ban đầu:",
    modalOrigDept: "Khoa & Chuyên khoa:",
    modalStep1: "1. Thiết lập Khung thời gian cần khám",
    modalDateLabel: "Ngày khám",
    modalTimeLabel: "Khung giờ",
    modalStep2: "2. Bác sĩ cùng chuyên ngành trống ca",
    modalLoadingWorkload: "Đang kiểm tra tải lượng công việc...",
    modalNoDoctorsFound: "Không tìm thấy bác sĩ nào khác cùng chuyên khoa.",
    modalWorkloadFree: "Trống ca",
    modalWorkloadBusy: "Bận",
    modalWorkloadFull: "Đầy tải",
    modalBtnClose: "Hủy",
    modalBtnSubmit: "Xác nhận Điều phối & Dời ca",
  },
  en: {
    loading: "Loading clinical appointment list...",
    connError: "Server connection error.",
    toastSuccess: "Appointment status updated successfully!",
    toastCancelConfirm: "Are you sure you want to cancel this appointment?",
    toastApproveConfirm:
      "Are you sure you want to confirm this appointment booking?",
    toastReschedSuccess:
      "Clinical coordination & rescheduling completed successfully!",
    toastSaveError: "Failed to save clinical coordination.",
    toastNoDoctor: "Please select an attending physician for this session!",
    toastFetchDoctorError: "Failed to load list of available doctors.",
    toastUpdateError: "Failed to update appointment session.",
    confirmActionTitle: "Confirm Action",
    btnCancel: "Cancel",
    btnConfirm: "Confirm",
    headerTitle: "Clinical Session Coordination",
    headerSubtitle:
      "Search for available practitioners within the same specialty to balance workload or reschedule appointments. Completed sessions will be validated by the attending doctor.",
    searchPlaceholder: "Search by patient name, doctor, ticket number...",
    filterAllStatus: "All Statuses",
    colTicketDate: "Ticket & Consultation Date",
    colPatient: "Patient",
    colDoctor: "Attending Practitioner",
    colQueue: "Queue No.",
    colStatus: "Status",
    colAction: "Actions",
    btnReschedule: "Reschedule",
    btnCancelAppt: "Cancel",
    btnConfirmAppt: "Confirm",
    apptClosed: "Session Closed",
    modalTitle: "Clinical Consultation Coordination",
    modalTicketNo: "Ticket ID:",
    modalOrigHeader: "Original Scheduling Parameters:",
    modalOrigPatient: "Patient:",
    modalOrigPhone: "Phone:",
    modalOrigDoctor: "Original Physician:",
    modalOrigDept: "Department & Specialty:",
    modalStep1: "1. Configure Preferred Time Slot",
    modalDateLabel: "Consultation Date",
    modalTimeLabel: "Time Frame",
    modalStep2: "2. Specialty Doctors Availability Check",
    modalLoadingWorkload: "Checking clinician schedules...",
    modalNoDoctorsFound: "No available practitioners found in this specialty.",
    modalWorkloadFree: "Available",
    modalWorkloadBusy: "Busy",
    modalWorkloadFull: "Fully Loaded",
    modalBtnClose: "Close",
    modalBtnSubmit: "Confirm Coordination & Dispatch",
  },
};

export default function AdminAppointments() {
  const { lang, t } = useTranslation(trans);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal States
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [availableData, setAvailableData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    apptId: null,
    action: "",
    message: "",
  });

  const jsonHeaders = () => ({ "Content-Type": "application/json" });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/admin/appointments`);
        const json = await res.json();
        if (json.success) {
          setAppointments(json.data);
        } else {
          setError(json.message);
        }
      } catch {
        setError(t.connError);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock scrolling on scrollable main container when modals are open
  useEffect(() => {
    const mainContainer = document.querySelector("main");
    const isAnyOpen = isModalOpen || confirmDialog.show;
    if (isAnyOpen) {
      document.body.style.overflow = "hidden";
      if (mainContainer) mainContainer.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (mainContainer) mainContainer.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "";
      if (mainContainer) mainContainer.style.overflow = "auto";
    };
  }, [isModalOpen, confirmDialog.show]);

  const handleOpenCoordModal = async (appt) => {
    setSelectedAppt(appt);
    setSelectedDoctorId(appt.doctor?._id || "");
    setNewDate(appt.date);
    setNewTime(appt.time);
    setIsModalOpen(true);
    fetchAvailableDoctors(appt._id, appt.date, appt.time);
  };

  const fetchAvailableDoctors = async (apptId, date, time) => {
    setLoadingModal(true);
    try {
      const res = await authFetch(
        `${API_URL}/api/admin/appointments/${apptId}/available-doctors?date=${date}&time=${time}`,
      );
      const json = await res.json();
      if (json.success) {
        setAvailableData(json.data);
      } else {
        showToast(json.message, "error");
      }
    } catch {
      showToast(t.toastFetchDoctorError, "error");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleDateOrTimeChange = (date, time) => {
    if (!selectedAppt) return;
    fetchAvailableDoctors(selectedAppt._id, date, time);
  };

  const handleSaveCoordination = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      return showToast(t.toastNoDoctor, "error");
    }

    try {
      const res = await authFetch(
        `${API_URL}/api/admin/appointments/${selectedAppt._id}/reschedule`,
        {
          method: "PUT",
          headers: jsonHeaders(),
          body: JSON.stringify({
            doctorId: selectedDoctorId,
            date: newDate,
            time: newTime,
          }),
        },
      );
      const json = await res.json();
      if (json.success) {
        showToast(t.toastReschedSuccess, "success");
        setIsModalOpen(false);
        // Refetch appointments
        const refetchAppointments = async () => {
          try {
            const res = await authFetch(`${API_URL}/api/admin/appointments`);
            const json = await res.json();
            if (json.success) setAppointments(json.data);
          } catch {
            // Error handling
          }
        };
        refetchAppointments();
      } else {
        showToast(json.message, "error");
      }
    } catch {
      showToast(t.toastSaveError, "error");
    }
  };

  const confirmAction = (id, action, message) => {
    setConfirmDialog({
      show: true,
      apptId: id,
      action,
      message,
    });
  };

  const handleExecuteStatusUpdate = async () => {
    const { apptId, action } = confirmDialog;
    setConfirmDialog({ show: false, apptId: null, action: "", message: "" });

    try {
      const res = await authFetch(
        `${API_URL}/api/admin/appointments/${apptId}/status`,
        {
          method: "PUT",
          headers: jsonHeaders(),
          body: JSON.stringify({ status: action }),
        },
      );
      const json = await res.json();
      if (json.success) {
        showToast(t.toastSuccess, "success");
        // Refetch appointments
        const refetchAppointments = async () => {
          try {
            const res = await authFetch(`${API_URL}/api/admin/appointments`);
            const json = await res.json();
            if (json.success) setAppointments(json.data);
          } catch {
            // Error handling
          }
        };
        refetchAppointments();
      } else {
        showToast(json.message, "error");
      }
    } catch {
      showToast(t.toastUpdateError, "error");
    }
  };

  const getDoctorDisplayName = (name) => formatDoctorName(lang, name);
  const getLocalizedStatus = (status) => getApptStatusLabel(lang, status);

  const filteredAppointments = appointments.filter((app) => {
    const patientName = app.patient?.fullName?.toLowerCase() || "";
    const doctorName = app.doctor?.userId?.fullName?.toLowerCase() || "";
    const ticketNo = app.ticketNumber?.toLowerCase() || "";
    const matchSearch =
      patientName.includes(searchTerm.toLowerCase()) ||
      doctorName.includes(searchTerm.toLowerCase()) ||
      ticketNo.includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "All" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const configs = {
      pending:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
      confirmed:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/30",
      completed:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
      cancelled:
        "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900/30",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border ${configs[status] || "bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-400"}`}
      >
        {getLocalizedStatus(status).toUpperCase()}
      </span>
    );
  };

  if (loading)
    return (
      <div className="text-center py-10 font-bold text-[var(--text-secondary)]">
        {t.loading}
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-4 rounded-2xl">
        {error}
      </div>
    );

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-900/30"
              : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-100 border-rose-200 dark:border-rose-900/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="text-rose-500 dark:text-rose-400" />
          )}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.show && (
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <ShieldAlert size={28} />
              <h3 className="font-black text-lg text-[var(--text-primary)]">
                {t.confirmActionTitle}
              </h3>
            </div>
            <p className="text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() =>
                  setConfirmDialog({
                    show: false,
                    apptId: null,
                    action: "",
                    message: "",
                  })
                }
                className="px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-all"
              >
                {t.btnCancel}
              </button>
              <button
                onClick={handleExecuteStatusUpdate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
              >
                {t.btnConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 bg-[var(--card-bg)] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm animate-in fade-in">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            {t.headerTitle}
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium mt-1">
            {t.headerSubtitle}
          </p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden animate-in fade-in">
        <div className="p-3 md:p-4 border-b border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 bg-[var(--bg-tertiary)]">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              size={18}
            />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-[var(--text-primary)]"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-auto bg-[var(--card-bg)] border border-[var(--border-color)] text-xs md:text-sm font-bold text-[var(--text-primary)] rounded-xl px-3 md:px-4 py-2 outline-none"
            >
              <option value="All">{t.filterAllStatus}</option>
              <option value="confirmed">CONFIRMED</option>
              <option value="pending">PENDING</option>
              <option value="completed">COMPLETED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] md:text-xs uppercase tracking-wider font-bold">
                <th className="p-3 md:p-4 pl-4 md:pl-6">{t.colTicketDate}</th>
                <th className="p-3 md:p-4">{t.colPatient}</th>
                <th className="p-3 md:p-4">{t.colDoctor}</th>
                <th className="p-3 md:p-4">{t.colQueue}</th>
                <th className="p-3 md:p-4">{t.colStatus}</th>
                <th className="p-3 md:p-4 text-right pr-4 md:pr-6">
                  {t.colAction}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredAppointments.map((app) => (
                <tr
                  key={app._id}
                  className="hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <td className="p-3 md:p-4 pl-4 md:pl-6">
                    <div className="flex flex-col font-medium">
                      <span className="font-mono font-bold text-[var(--text-primary)] text-xs md:text-sm">
                        {app.ticketNumber || "N/A"}
                      </span>
                      <span className="text-[10px] md:text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                        <Calendar size={12} /> {app.date} | <Clock size={12} />{" "}
                        {app.time}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex flex-col font-medium">
                      <span className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                        {app.patient?.fullName || "Bệnh nhân ẩn"}
                      </span>
                      <span className="text-[10px] md:text-xs text-[var(--text-secondary)] font-mono">
                        {app.patient?.patientId || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex flex-col font-medium">
                      <span className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                        {getDoctorDisplayName(app.doctor?.userId?.fullName)}
                      </span>
                      <span className="text-[10px] md:text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                        {getLocalizedDept(lang, app.doctor?.department)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center font-black text-[var(--text-primary)] text-[10px] md:text-xs border border-[var(--border-color)]">
                      {app.queueNumber || "1"}
                    </span>
                  </td>
                  <td className="p-3 md:p-4">{getStatusBadge(app.status)}</td>
                  <td className="p-3 md:p-4 pr-4 md:pr-6 text-right space-x-1 md:space-x-2">
                    {["pending", "confirmed"].includes(app.status) && (
                      <>
                        <button
                          onClick={() => handleOpenCoordModal(app)}
                          className="px-2 md:px-3 py-1 md:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] md:text-xs rounded-xl shadow-md transition-colors"
                        >
                          {t.btnReschedule}
                        </button>
                        <button
                          onClick={() =>
                            confirmAction(
                              app._id,
                              "cancelled",
                              t.toastCancelConfirm,
                            )
                          }
                          className="px-2 md:px-2.5 py-1 md:py-1.5 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-bold text-[10px] md:text-xs rounded-lg border border-rose-200 dark:border-rose-900/30 transition-colors"
                        >
                          {t.btnCancelAppt}
                        </button>
                      </>
                    )}
                    {app.status === "pending" && (
                      <button
                        onClick={() =>
                          confirmAction(
                            app._id,
                            "confirmed",
                            t.toastApproveConfirm,
                          )
                        }
                        className="px-2 md:px-2.5 py-1 md:py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] md:text-xs rounded-lg border border-indigo-200 dark:border-indigo-900/30 transition-colors"
                      >
                        {t.btnConfirmAppt}
                      </button>
                    )}
                    {["completed", "cancelled"].includes(app.status) && (
                      <span className="text-[10px] md:text-xs font-bold text-[var(--text-tertiary)]">
                        {t.apptClosed}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Reschedule & Transfer Modal */}
      {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 md:p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-lg md:max-w-xl rounded-2xl md:rounded-3xl shadow-2xl border border-[var(--border-color)] flex flex-col overflow-hidden max-h-[90vh] md:max-h-[85vh]">
            <div className="p-4 md:p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]">
              <div>
                <h3 className="text-base md:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                  <UserRoundCheck
                    className="text-indigo-600 dark:text-indigo-400"
                    size={20}
                  />{" "}
                  {t.modalTitle}
                </h3>
                <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                  {t.modalTicketNo} {selectedAppt.ticketNumber}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 hover:bg-[var(--border-color)] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 md:space-y-6">
              {/* Original Appt Summary */}
              <div className="p-3 md:p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] text-xs md:text-sm">
                <h4 className="font-bold text-[var(--text-primary)] mb-2 text-xs md:text-sm">
                  {t.modalOrigHeader}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-[10px] md:text-xs font-medium text-[var(--text-secondary)]">
                  <p>
                    {t.modalOrigPatient}{" "}
                    <span className="font-bold text-[var(--text-primary)]">
                      {selectedAppt.patient?.fullName}
                    </span>
                  </p>
                  <p>
                    {t.modalOrigPhone}{" "}
                    <span className="font-bold text-[var(--text-primary)]">
                      {selectedAppt.patient?.phone}
                    </span>
                  </p>
                  <p>
                    {t.modalOrigDoctor}{" "}
                    <span className="font-bold text-[var(--text-primary)]">
                      {getDoctorDisplayName(
                        selectedAppt.doctor?.userId?.fullName,
                      )}
                    </span>
                  </p>
                  <p>
                    {t.modalOrigDept}{" "}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {getLocalizedDept(lang, selectedAppt.doctor?.department)}{" "}
                      ({getLocalizedDept(lang, selectedAppt.doctor?.specialty)})
                    </span>
                  </p>
                </div>
              </div>

              {/* Step 1: Reschedule Date & Time */}
              <div className="space-y-2 md:space-y-3">
                <h4 className="text-xs md:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                  {t.modalStep1}
                </h4>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                      {t.modalDateLabel}
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => {
                        setNewDate(e.target.value);
                        handleDateOrTimeChange(e.target.value, newTime);
                      }}
                      className="w-full px-3 md:px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                      {t.modalTimeLabel}
                    </label>
                    <select
                      value={newTime}
                      onChange={(e) => {
                        setNewTime(e.target.value);
                        handleDateOrTimeChange(newDate, e.target.value);
                      }}
                      className="w-full px-3 md:px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none text-[var(--text-primary)]"
                    >
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Available Doctors workload check */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                    {t.modalStep2}
                  </h4>
                  {loadingModal && (
                    <RefreshCw
                      className="animate-spin text-[var(--text-tertiary)]"
                      size={16}
                    />
                  )}
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto border border-[var(--border-color)] rounded-2xl p-2 bg-[var(--bg-tertiary)]">
                  {loadingModal ? (
                    <div className="text-center py-8 text-xs font-bold text-[var(--text-tertiary)]">
                      {t.modalLoadingWorkload}
                    </div>
                  ) : availableData?.doctors?.length === 0 ? (
                    <div className="text-center py-8 text-xs font-bold text-[var(--text-tertiary)]">
                      {t.modalNoDoctorsFound}
                    </div>
                  ) : (
                    availableData?.doctors?.map((doc) => {
                      const isTrongCa = doc.currentAppointmentsCount < 3;
                      const isFull = doc.currentAppointmentsCount >= 5;
                      const isSelected = selectedDoctorId === doc._id;

                      return (
                        <div
                          key={doc._id}
                          onClick={() => {
                            if (!isFull) setSelectedDoctorId(doc._id);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/20"
                              : isFull
                                ? "opacity-50 cursor-not-allowed border-[var(--border-color)] bg-[var(--bg-tertiary)]"
                                : "border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--border-color)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                isSelected
                                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                              }`}
                            >
                              BS
                            </div>
                            <div>
                              <p className="font-bold text-[var(--text-primary)] text-xs">
                                {getDoctorDisplayName(doc.fullName)}
                              </p>
                              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                                {getLocalizedDept(lang, doc.department)} •{" "}
                                {getLocalizedDept(lang, doc.specialty)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isTrongCa ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{" "}
                                {t.modalWorkloadFree} (
                                {doc.currentAppointmentsCount}/3)
                              </span>
                            ) : isFull ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{" "}
                                {t.modalWorkloadFull} (5/5 ca)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>{" "}
                                {t.modalWorkloadBusy} (
                                {doc.currentAppointmentsCount}/5)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--bg-tertiary)]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs font-bold rounded-xl transition-all"
              >
                {t.modalBtnClose}
              </button>
              <button
                type="button"
                onClick={handleSaveCoordination}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                {t.modalBtnSubmit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
