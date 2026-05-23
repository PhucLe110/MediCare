import { API_URL, authFetch } from "../../config";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Stethoscope,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { formatDoctorName, localizeAdminDept } from "../../utils/i18nHelpers";
import AdminShifts from "./AdminShifts";

const trans = {
  vi: {
    loading: "Đang tải danh sách bác sĩ...",
    connError: "Lỗi kết nối đến máy chủ.",
    toastSuccessDelete: "Xóa bác sĩ thành công!",
    toastSuccessUpdate: "Cập nhật bác sĩ thành công!",
    toastSuccessAdd: "Thêm bác sĩ mới thành công!",
    toastErrorDelete: "Không thể thực hiện xóa.",
    toastErrorSave: "Đã xảy ra lỗi khi lưu thông tin.",
    confirmTitle: "Xác Nhận Yêu Cầu",
    confirmMessage:
      "Bạn có chắc chắn muốn xóa bác sĩ này khỏi hệ thống? Tài khoản của họ sẽ được chuyển thành vai trò bệnh nhân.",
    btnCancel: "Hủy bỏ",
    btnConfirmDelete: "Đồng ý xóa",
    headerTitle: "Quản lý Bác sĩ & Chuyên khoa",
    headerSubtitle:
      "Cập nhật hồ sơ bác sĩ chuyên khoa, mức phí 150k đồng bộ toàn viện và lịch trực khám.",
    btnAddDoctor: "Thêm Bác sĩ",
    searchPlaceholder: "Tìm theo tên, khoa, chuyên ngành...",
    colDoctor: "Bác sĩ",
    colDept: "Khoa & Chuyên ngành",
    colExp: "Kinh nghiệm",
    colMonthlyCount: "Số ca khám tháng này",
    colAction: "Thao tác",
    yearsExpSuffix: "năm",
    casesSuffix: "ca",
    modalEditTitle: "Chỉnh Sửa Hồ Sơ Bác Sĩ",
    modalAddTitle: "Thêm Bác Sĩ Mới",
    labelFullName: "Họ tên bác sĩ",
    labelPhone: "Số điện thoại",
    labelEmail: "Email",
    labelPasswordEdit: "Mật khẩu (Để trống nếu không đổi)",
    labelPasswordAdd: "Mật khẩu",
    labelDept: "Khoa trực",
    labelSpecialty: "Chuyên ngành sâu",
    labelSpecialtyPlaceholder: "Ví dụ: Rối loạn nhịp tim",
    labelExp: "Số năm kinh nghiệm",
    labelMonthlyAppts: "Số ca khám tháng này",
    btnModalSubmitEdit: "Cập Nhật Thay Đổi",
    btnModalSubmitAdd: "Thêm Mới Bác Sĩ",

    // Departments
    deptCardiology: "Tim mạch",
    deptNeurology: "Thần kinh",
    deptPediatrics: "Nhi khoa",
    deptDermatology: "Da liễu",
    deptGastroenterology: "Tiêu hóa",
    deptRespiratory: "Hô hấp",
    deptGeneralSurgery: "Ngoại tổng quát",
    deptInternalMedicine: "Nội tổng quát",
    deptOtorhinolaryngology: "Tai Mũi Họng",
    deptOphthalmology: "Mắt",
    deptOdontoStomatology: "Răng Hàm Mặt",
    deptEmergency: "Cấp cứu",
    deptLaboratory: "Xét nghiệm",
    deptImaging: "Chẩn đoán hình ảnh",
  },
  en: {
    loading: "Loading practitioner records...",
    connError: "Server connection error.",
    toastSuccessDelete: "Practitioner deleted successfully!",
    toastSuccessUpdate: "Practitioner profile updated successfully!",
    toastSuccessAdd: "New practitioner added successfully!",
    toastErrorDelete: "Failed to perform practitioner deletion.",
    toastErrorSave: "An error occurred while saving information.",
    confirmTitle: "Confirm Request",
    confirmMessage:
      "Are you sure you want to remove this practitioner? Their account credentials will be reverted to patient privileges.",
    btnCancel: "Cancel",
    btnConfirmDelete: "Confirm Delete",
    headerTitle: "Clinicians & Specialties Directory",
    headerSubtitle:
      "Manage specialty profiles, global 150k consultation fee sync, and shift schedules.",
    btnAddDoctor: "Add Physician",
    searchPlaceholder: "Search by name, department, specialty...",
    colDoctor: "Practitioner",
    colDept: "Department & Specialty",
    colExp: "Experience",
    colMonthlyCount: "Sessions Count (Month)",
    colAction: "Actions",
    yearsExpSuffix: "years",
    casesSuffix: "cases",
    modalEditTitle: "Modify Practitioner Profile",
    modalAddTitle: "Register New Practitioner",
    labelFullName: "Attending Practitioner Name",
    labelPhone: "Contact Number",
    labelEmail: "Email Address",
    labelPasswordEdit: "Security Password (Leave blank to keep current)",
    labelPasswordAdd: "Security Password",
    labelDept: "Assigned Department",
    labelSpecialty: "Clinical Focus / Specialty Area",
    labelSpecialtyPlaceholder: "e.g., Arrhythmia & Electrophysiology",
    labelExp: "Years of Clinical Practice",
    labelMonthlyAppts: "Consultations Completed (Month)",
    btnModalSubmitEdit: "Confirm Changes",
    btnModalSubmitAdd: "Register Practitioner",

    // Departments
    deptCardiology: "Cardiology",
    deptNeurology: "Neurology",
    deptPediatrics: "Pediatrics",
    deptDermatology: "Dermatology",
    deptGastroenterology: "Gastroenterology",
    deptRespiratory: "Respiratory Medicine",
    deptGeneralSurgery: "General Surgery",
    deptInternalMedicine: "General Internal Medicine",
    deptOtorhinolaryngology: "ENT",
    deptOphthalmology: "Ophthalmology",
    deptOdontoStomatology: "Odonto-Stomatology",
    deptEmergency: "Emergency",
    deptLaboratory: "Laboratory",
    deptImaging: "Diagnostic Imaging",
  },
};

export default function AdminDoctors() {
  const { lang, t } = useTranslation(trans);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("doctors"); // 'doctors' or 'shifts'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Tim mạch");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");

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
    doctorId: null,
    message: "",
  });

  const jsonHeaders = () => ({ "Content-Type": "application/json" });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/admin/doctors`);
        const json = await res.json();
        if (json.success) {
          setDoctors(json.data);
        } else {
          setError(json.message);
        }
      } catch {
        setError(t.connError);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
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

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setDepartment("Tim mạch");
    setSpecialty("");
    setExperience("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc) => {
    setEditingDoctor(doc);
    setFullName(doc.userId?.fullName || "");
    setEmail(doc.userId?.email || "");
    setPassword("");
    setPhone(doc.userId?.phone || "");
    setDepartment(doc.department);
    setSpecialty(doc.specialty);
    setExperience(doc.experience);
    setIsModalOpen(true);
  };

  const confirmDeleteDoctor = (id) => {
    setConfirmDialog({
      show: true,
      doctorId: id,
      message: t.confirmMessage,
    });
  };

  const handleDeleteDoctor = async () => {
    const id = confirmDialog.doctorId;
    setConfirmDialog({ show: false, doctorId: null, message: "" });

    try {
      const res = await authFetch(`${API_URL}/api/admin/doctors/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setDoctors(doctors.filter((d) => d._id !== id));
        showToast(t.toastSuccessDelete, "success");
      } else {
        showToast(json.message, "error");
      }
    } catch {
      showToast(t.toastErrorDelete, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const body = {
        fullName,
        email,
        phone,
        department,
        specialty,
        experience: Number(experience),
        consultationFee: 150000, // Tất cả phí khám đều là 150k
      };

      if (!editingDoctor) {
        body.password = password || "123456";
      }

      const url = editingDoctor
        ? `${API_URL}/api/admin/doctors/${editingDoctor._id}`
        : `${API_URL}/api/admin/doctors`;

      const method = editingDoctor ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          editingDoctor ? t.toastSuccessUpdate : t.toastSuccessAdd,
          "success",
        );
        setIsModalOpen(false);
        // Refetch doctors
        const refetchDoctors = async () => {
          try {
            const res = await authFetch(`${API_URL}/api/admin/doctors`);
            const json = await res.json();
            if (json.success) setDoctors(json.data);
          } catch {
            // Error handling
          }
        };
        refetchDoctors();
      } else {
        showToast(json.message, "error");
      }
    } catch {
      showToast(t.toastErrorSave, "error");
    }
  };

  const getDoctorDisplayName = (name) => formatDoctorName(lang, name);
  const getLocalizedDept = (dept) => localizeAdminDept(lang, dept);

  const filteredDoctors = doctors.filter((d) => {
    const nameMatch = d.userId?.fullName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const deptMatch = d.department
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const specMatch = d.specialty
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatch || deptMatch || specMatch;
  });

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
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <ShieldAlert size={28} />
              <h3 className="font-black text-lg text-[var(--text-primary)]">
                {t.confirmTitle}
              </h3>
            </div>
            <p className="text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() =>
                  setConfirmDialog({ show: false, doctorId: null, message: "" })
                }
                className="px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-all"
              >
                {t.btnCancel}
              </button>
              <button
                onClick={handleDeleteDoctor}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 transition-all"
              >
                {t.btnConfirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 bg-[var(--card-bg)] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm animate-in fade-in">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
            {activeTab === "doctors"
              ? t.headerTitle
              : "Quản lý Yêu cầu Ca trực"}
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium mt-1">
            {activeTab === "doctors"
              ? t.headerSubtitle
              : "Duyệt yêu cầu thêm/hủy ca trực của bác sĩ"}
          </p>
        </div>

        <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-xl mx-0 md:mx-4">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${activeTab === "doctors" ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
          >
            Danh sách Bác sĩ
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${activeTab === "shifts" ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
          >
            Yêu cầu ca trực
          </button>
        </div>

        {activeTab === "doctors" && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 md:px-5 py-2 md:py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all text-xs md:text-sm"
          >
            <Plus size={16} md={18} /> {t.btnAddDoctor}
          </button>
        )}
      </div>

      {activeTab === "shifts" ? (
        <AdminShifts />
      ) : (
        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden animate-in fade-in">
          <div className="p-3 md:p-4 border-b border-[var(--border-color)] flex items-center bg-[var(--bg-tertiary)]">
            <div className="relative w-full md:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                size={16}
                md={18}
              />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 md:pl-10 pr-3 md:pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full md:w-80 text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] md:text-xs uppercase tracking-wider font-bold">
                  <th className="p-3 md:p-4 pl-4 md:pl-6">{t.colDoctor}</th>
                  <th className="p-3 md:p-4">{t.colDept}</th>
                  <th className="p-3 md:p-4">{t.colExp}</th>
                  <th className="p-3 md:p-4">{t.colMonthlyCount}</th>
                  <th className="p-3 md:p-4 text-right pr-4 md:pr-6">
                    {t.colAction}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredDoctors.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <td className="p-3 md:p-4 pl-4 md:pl-6 font-medium">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                          <Stethoscope size={14} md={18} />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                            {getDoctorDisplayName(d.userId?.fullName)}
                          </p>
                          <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-mono">
                            {d.userId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex flex-col font-medium">
                        <span className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                          {getLocalizedDept(d.department)}
                        </span>
                        <span className="text-[10px] md:text-xs text-[var(--text-secondary)] font-medium">
                          {getLocalizedDept(d.specialty)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 font-bold text-[var(--text-secondary)] text-xs md:text-sm">
                      {d.experience} {t.yearsExpSuffix}
                    </td>
                    <td className="p-3 md:p-4 font-black text-indigo-600 dark:text-indigo-400 text-xs md:text-sm">
                      {d.monthlyAppointmentsCount || 0} {t.casesSuffix}
                    </td>
                    <td className="p-3 md:p-4 pr-4 md:pr-6 text-right space-x-1 md:space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(d)}
                        className="p-1.5 md:p-2 text-[var(--text-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} md={18} />
                      </button>
                      <button
                        onClick={() => confirmDeleteDoctor(d._id)}
                        className="p-1.5 md:p-2 text-[var(--text-tertiary)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} md={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 md:p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-lg rounded-2xl md:rounded-3xl shadow-2xl border border-[var(--border-color)] flex flex-col overflow-hidden max-h-[90vh] md:max-h-[85vh]">
            <div className="p-4 md:p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]">
              <h3 className="text-base md:text-xl font-black text-[var(--text-primary)]">
                {editingDoctor ? t.modalEditTitle : t.modalAddTitle}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 hover:bg-[var(--border-color)] rounded-full transition-colors"
              >
                <X size={18} md={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-6 space-y-3 md:space-y-4 overflow-y-auto flex-1 scrollbar-thin"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelFullName}
                  </label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelPhone}
                  </label>
                  <input
                    required
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelEmail}
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {editingDoctor ? t.labelPasswordEdit : t.labelPasswordAdd}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelDept}
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-[var(--card-bg)]"
                  >
                    <option value="Tim mạch">{t.deptCardiology}</option>
                    <option value="Thần kinh">{t.deptNeurology}</option>
                    <option value="Nhi khoa">{t.deptPediatrics}</option>
                    <option value="Da liễu">{t.deptDermatology}</option>
                    <option value="Tiêu hóa">{t.deptGastroenterology}</option>
                    <option value="Hô hấp">{t.deptRespiratory}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelSpecialty}
                  </label>
                  <input
                    required
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                    placeholder={t.labelSpecialtyPlaceholder}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelExp}
                  </label>
                  <input
                    required
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelMonthlyAppts}
                  </label>
                  <div className="w-full px-3 md:px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold rounded-xl text-xs md:text-sm leading-relaxed">
                    {editingDoctor
                      ? (editingDoctor.monthlyAppointmentsCount || 0) +
                        " " +
                        t.casesSuffix
                      : "0 " + t.casesSuffix}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all mt-4 md:mt-6 text-xs md:text-sm"
              >
                {editingDoctor ? t.btnModalSubmitEdit : t.btnModalSubmitAdd}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
