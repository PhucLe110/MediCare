import { API_URL, authFetch } from "../../config";
import { useState, useEffect } from "react";
import {
  Pill,
  AlertCircle,
  Plus,
  Search,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import {
  formatMoney,
  localizeMedicineUnit,
  formatDate,
  pickLang,
} from "../../utils/i18nHelpers";

const trans = {
  vi: {
    loading: "Đang tải danh mục kho thuốc...",
    connError: "Lỗi kết nối đến máy chủ.",
    toastSuccessDelete: "Xóa thuốc khỏi danh mục thành công!",
    toastSuccessUpdate: "Cập nhật thông tin thuốc thành công!",
    toastSuccessAdd: "Thêm thuốc mới vào kho thành công!",
    toastErrorDelete: "Không thể thực hiện xóa.",
    toastErrorSave: "Đã xảy ra lỗi khi lưu thông tin.",
    confirmTitle: "Xác Nhận Hành Động",
    confirmMessage:
      "Bạn có chắc chắn muốn xóa loại thuốc này khỏi danh mục kho y tế?",
    btnCancel: "Hủy bỏ",
    btnConfirmDelete: "Đồng ý xóa",
    headerTitle: "Quản lý Thuốc & Kho Y tế",
    headerSubtitle:
      "Kiểm soát danh mục thuốc, cảnh báo hết hạn và theo dõi tồn kho thực tế.",
    btnImport: "Nhập kho thuốc",
    searchPlaceholder: "Tìm kiếm thuốc...",
    statsShowing: "Hiển thị",
    statsOf: "loại thuốc",
    colName: "Tên thuốc & Hàm lượng",
    colStock: "Tồn kho",
    colPrice: "Đơn giá",
    colExpiry: "Hạn sử dụng",
    colStatus: "Trạng thái",
    colAction: "Thao tác",
    statusNormal: "Bình thường",
    statusLow: "Sắp hết thuốc",
    modalEditTitle: "Chỉnh Sửa Thông Tin Thuốc",
    modalAddTitle: "Nhập Kho Thuốc Mới",
    labelName: "Tên biệt dược / Tên thuốc",
    labelDosage: "Hàm lượng",
    labelUnit: "Đơn vị đóng gói",
    labelStock: "Số lượng nhập",
    labelPrice: "Đơn giá (VND)",
    labelPriceEn: "Đơn giá (USD)",
    labelExpiry: "Hạn sử dụng",
    btnModalSubmitEdit: "Lưu Thay Đổi",
    btnModalSubmitAdd: "Nhập Kho Thuốc",
    unitTablet: "Viên",
    unitBottle: "Lọ",
    unitSachet: "Gói",
    unitTube: "Tuýp",
    unitAmpoule: "Ống",
    unitFlacon: "Chai",
  },
  en: {
    loading: "Loading pharmaceuticals directory...",
    connError: "Server connection error.",
    toastSuccessDelete: "Medicine deleted successfully from inventory!",
    toastSuccessUpdate: "Medicine profile updated successfully!",
    toastSuccessAdd: "New medicine stocked into inventory successfully!",
    toastErrorDelete: "Failed to delete medicine item.",
    toastErrorSave: "An error occurred while saving information.",
    confirmTitle: "Confirm Action",
    confirmMessage:
      "Are you sure you want to completely remove this pharmaceutical item from active medical inventory?",
    btnCancel: "Cancel",
    btnConfirmDelete: "Confirm Delete",
    headerTitle: "Pharmacy & Medical Inventory",
    headerSubtitle:
      "Control hospital medicines, track expiration alerts, and manage physical storage levels.",
    btnImport: "Stock Medicine",
    searchPlaceholder: "Search pharmaceuticals directory...",
    statsShowing: "Showing",
    statsOf: "medical items",
    colName: "Product Name & Dosage",
    colStock: "Stock Level",
    colPrice: "Unit Cost",
    colExpiry: "Expiration Date",
    colStatus: "Status",
    colAction: "Actions",
    statusNormal: "In Stock",
    statusLow: "Low Stock Alert",
    modalEditTitle: "Modify Pharmaceutical Information",
    modalAddTitle: "Stock New Pharmaceutical Batch",
    labelName: "Brand Name / Active Compound",
    labelDosage: "Strength / Dosage",
    labelUnit: "Packaging Unit",
    labelStock: "Inbound Batch Quantity",
    labelPrice: "Unit Price (VND)",
    labelPriceEn: "Unit Price (USD)",
    labelExpiry: "Expiry Date",
    btnModalSubmitEdit: "Save Modifications",
    btnModalSubmitAdd: "Stock Inbound Batch",
    unitTablet: "Tablet",
    unitBottle: "Bottle",
    unitSachet: "Sachet",
    unitTube: "Tube",
    unitAmpoule: "Ampoule",
    unitFlacon: "Flacon",
  },
};

export default function AdminInventory() {
  const { lang, t } = useTranslation(trans);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [unit, setUnit] = useState("Viên");
  const [stock, setStock] = useState(100);
  const [expiry, setExpiry] = useState("");
  const [unitPrice, setUnitPrice] = useState(1000);

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
    medId: null,
    message: "",
  });

  const jsonHeaders = () => ({ "Content-Type": "application/json" });

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/admin/medicines`);
        const json = await res.json();
        if (json.success) {
          setMedicines(json.data);
        } else {
          setError(json.message);
        }
      } catch {
        setError(t.connError);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
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
    setEditingMed(null);
    setName("");
    setDosage("");
    setUnit("Viên");
    setStock(100);
    setExpiry("");
    setUnitPrice(1000);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setUnit(med.unit);
    setStock(med.stock);
    setExpiry(med.expiry);
    setUnitPrice(med.unitPrice);
    setIsModalOpen(true);
  };

  const confirmDeleteMed = (id) => {
    setConfirmDialog({
      show: true,
      medId: id,
      message: t.confirmMessage,
    });
  };

  const handleDeleteMed = async () => {
    const id = confirmDialog.medId;
    setConfirmDialog({ show: false, medId: null, message: "" });

    try {
      const res = await authFetch(`${API_URL}/api/admin/medicines/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setMedicines(medicines.filter((m) => m._id !== id));
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
        name,
        dosage,
        unit,
        stock: Number(stock),
        expiry,
        unitPrice: Number(unitPrice),
        status: Number(stock) < 150 ? "low" : "normal",
      };

      const url = editingMed
        ? `${API_URL}/api/admin/medicines/${editingMed._id}`
        : `${API_URL}/api/admin/medicines`;

      const method = editingMed ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          editingMed ? t.toastSuccessUpdate : t.toastSuccessAdd,
          "success",
        );
        setIsModalOpen(false);
        // Refetch medicines
        const refetchMedicines = async () => {
          try {
            const res = await authFetch(`${API_URL}/api/admin/medicines`);
            const json = await res.json();
            if (json.success) setMedicines(json.data);
          } catch {
            // Error handling
          }
        };
        refetchMedicines();
      } else {
        showToast(json.message, "error");
      }
    } catch {
      showToast(t.toastErrorSave, "error");
    }
  };

  const getLocalizedUnit = (unitVal) => localizeMedicineUnit(lang, unitVal);
  const fmt = (n) => formatMoney(lang, n);

  const filteredMedicines = medicines.filter((m) => {
    return (
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dosage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 md:p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-sm rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-[var(--border-color)] space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 md:gap-3 text-rose-600 dark:text-rose-400">
              <ShieldAlert size={28} />
              <h3 className="font-black text-base md:text-lg text-[var(--text-primary)]">
                {t.confirmTitle}
              </h3>
            </div>
            <p className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-2 md:gap-3 pt-2">
              <button
                onClick={() =>
                  setConfirmDialog({ show: false, medId: null, message: "" })
                }
                className="px-3 md:px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] rounded-xl text-[10px] md:text-xs font-bold text-[var(--text-primary)] transition-all"
              >
                {t.btnCancel}
              </button>
              <button
                onClick={handleDeleteMed}
                className="px-3 md:px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] md:text-xs font-bold shadow-lg shadow-rose-600/20 transition-all"
              >
                {t.btnConfirmDelete}
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
        <button
          onClick={handleOpenAddModal}
          className="px-4 md:px-5 py-2 md:py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all text-xs md:text-sm"
        >
          <Plus size={18} /> {t.btnImport}
        </button>
      </div>

      <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden animate-in fade-in">
        <div className="p-3 md:p-4 border-b border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 bg-[var(--bg-tertiary)]">
          <div className="relative w-full md:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              size={18}
            />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-9 md:pl-10 pr-3 md:pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium outline-none focus:border-indigo-500 text-[var(--text-primary)]"
            />
          </div>
          <div className="text-[10px] md:text-xs text-[var(--text-secondary)] font-bold">
            {t.statsShowing}{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {filteredMedicines.length}
            </span>{" "}
            / {medicines.length} {t.statsOf}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] md:text-xs uppercase tracking-wider font-bold">
                <th className="p-3 md:p-4 pl-4 md:pl-6">{t.colName}</th>
                <th className="p-3 md:p-4">{t.colStock}</th>
                <th className="p-3 md:p-4">{t.colPrice}</th>
                <th className="p-3 md:p-4">{t.colExpiry}</th>
                <th className="p-3 md:p-4">{t.colStatus}</th>
                <th className="p-3 md:p-4 text-right pr-4 md:pr-6">
                  {t.colAction}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredMedicines.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <td className="p-3 md:p-4 pl-4 md:pl-6 font-medium">
                    <div className="flex items-center gap-2">
                      <Pill
                        size={16}
                        className="text-indigo-500 dark:text-indigo-400 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] font-mono font-bold uppercase">
                          {item.dosage}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 md:p-4 font-bold text-[var(--text-secondary)] text-xs md:text-sm">
                    {item.stock} {getLocalizedUnit(item.unit)}
                  </td>
                  <td className="p-3 md:p-4 font-black text-indigo-600 dark:text-indigo-400 text-xs md:text-sm">
                    {fmt(item.unitPrice)}
                  </td>
                  <td className="p-3 md:p-4 font-semibold text-[var(--text-secondary)] text-[10px] md:text-xs">
                    {formatDate(lang, item.expiry)}
                  </td>
                  <td className="p-3 md:p-4">
                    {item.stock >= 150 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        {t.statusNormal}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center w-max gap-1">
                        <AlertCircle size={10} /> {t.statusLow} ({item.stock})
                      </span>
                    )}
                  </td>
                  <td className="p-3 md:p-4 pr-4 md:pr-6 text-right space-x-1 md:space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1 md:p-1.5 text-[var(--text-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => confirmDeleteMed(item._id)}
                      className="p-1 md:p-1.5 text-[var(--text-tertiary)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 md:p-4">
          <div className="bg-[var(--card-bg)] w-full max-w-md rounded-2xl md:rounded-3xl shadow-2xl border border-[var(--border-color)] flex flex-col overflow-hidden max-h-[90vh] md:max-h-[85vh]">
            <div className="p-4 md:p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]">
              <h3 className="text-base md:text-xl font-black text-[var(--text-primary)]">
                {editingMed ? t.modalEditTitle : t.modalAddTitle}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 hover:bg-[var(--border-color)] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-6 space-y-3 md:space-y-4 overflow-y-auto flex-1"
            >
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                  {t.labelName}
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  placeholder="Ví dụ: Paracetamol"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelDosage}
                  </label>
                  <input
                    required
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                    placeholder="Ví dụ: 500mg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelUnit}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-bold text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 outline-none bg-[var(--card-bg)]"
                  >
                    <option value="Viên">{t.unitTablet}</option>
                    <option value="Lọ">{t.unitBottle}</option>
                    <option value="Gói">{t.unitSachet}</option>
                    <option value="Tuýp">{t.unitTube}</option>
                    <option value="Ống">{t.unitAmpoule}</option>
                    <option value="Chai">{t.unitFlacon}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {t.labelStock}
                  </label>
                  <input
                    required
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                    {pickLang(lang, t.labelPrice, t.labelPriceEn)}
                  </label>
                  <input
                    required
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">
                  {t.labelExpiry}
                </label>
                <input
                  required
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none text-[var(--text-primary)] bg-[var(--card-bg)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all mt-4 md:mt-6 text-xs md:text-sm"
              >
                {editingMed ? t.btnModalSubmitEdit : t.btnModalSubmitAdd}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
