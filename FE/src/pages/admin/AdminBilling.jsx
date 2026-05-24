import { API_URL, authFetch } from "../../config";
import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { formatMoney, formatDate, getLocale } from "../../utils/i18nHelpers";

const trans = {
  vi: {
    loading: "Đang tải danh sách hóa đơn...",
    connError: "Lỗi kết nối đến máy chủ.",
    confirmTitle: "Xác Nhận Thu Phí",
    confirmMessage:
      "Bạn có chắc chắn muốn xác nhận ĐÃ THANH TOÁN cho hóa đơn này? Hệ thống sẽ ghi nhận giao dịch thành công.",
    btnCancel: "Hủy bỏ",
    btnConfirm: "Xác nhận",
    toastSuccess: "Xác nhận thanh toán hóa đơn thành công!",
    toastUpdateError: "Không thể cập nhật hóa đơn.",
    headerTitle: "Quản lý Viện phí & Hóa đơn",
    headerSubtitle:
      "Theo dõi các khoản thu y tế, khám bệnh, đơn thuốc và thanh toán hóa đơn.",
    searchPlaceholder: "Tìm kiếm bệnh nhân hoặc mã HĐ...",
    filterAll: "Tất cả hóa đơn",
    filterUnpaid: "Chờ thanh toán",
    filterPaid: "Đã thanh toán",
    colBillIdDate: "Mã HĐ / Ngày tạo",
    colPatient: "Bệnh nhân",
    colServices: "Chi tiết các dịch vụ",
    colTotalAmount: "Tổng tiền",
    colStatus: "Trạng thái",
    colAction: "Hành động",
    statusPaid: "Đã thanh toán",
    statusUnpaid: "Chờ thanh toán",
    btnConfirmPay: "Xác nhận thu phí",
    paidTimePrefix: "Đã thanh toán lúc",
  },
  en: {
    loading: "Loading billing records...",
    connError: "Server connection error.",
    confirmTitle: "Confirm Payment Settle",
    confirmMessage:
      "Are you sure you want to verify that this bill has been PAID? The clinical database will record this transaction immediately.",
    btnCancel: "Cancel",
    btnConfirm: "Confirm",
    toastSuccess: "Billing payment settled successfully!",
    toastUpdateError: "Failed to update billing statement.",
    headerTitle: "Hospital Fee & Billing Management",
    headerSubtitle:
      "Track patient diagnostics fees, consultations charges, prescriptions costs, and manage electronic transactions.",
    searchPlaceholder: "Search by patient name or bill reference...",
    filterAll: "All Bills",
    filterUnpaid: "Awaiting Payment",
    filterPaid: "Paid",
    colBillIdDate: "Bill Ref / Generated Date",
    colPatient: "Patient",
    colServices: "Itemized Services Summary",
    colTotalAmount: "Amount Due",
    colStatus: "Status",
    colAction: "Action",
    statusPaid: "Settled",
    statusUnpaid: "Unpaid",
    btnConfirmPay: "Settle Payment",
    paidTimePrefix: "Settled at",
  },
};

export default function AdminBilling() {
  const { lang, t } = useTranslation(trans);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

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

  // Custom Confirm State
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    billId: null,
    message: "",
  });

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/admin/bills`);
        const json = await res.json();
        if (json.success) {
          setBills(json.data);
        } else {
          setError(json.message);
        }
      } catch {
        setError(t.connError);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock scrolling on scrollable main container when modal is open
  useEffect(() => {
    const mainContainer = document.querySelector("main");
    if (confirmDialog.show) {
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
  }, [confirmDialog.show]);

  const triggerConfirmPay = (billId) => {
    setConfirmDialog({
      show: true,
      billId,
      message: t.confirmMessage,
    });
  };

  const handleMarkAsPaid = async () => {
    const billId = confirmDialog.billId;
    setConfirmDialog({ show: false, billId: null, message: "" });

    try {
      const res = await authFetch(`${API_URL}/api/bills/${billId}/pay`, {
        method: "PATCH",
      });
      const json = await res.json();
      if (json.success) {
        showToast(t.toastSuccess, "success");
        // Refetch bills
        const refetchBills = async () => {
          try {
            const res = await authFetch(`${API_URL}/api/admin/bills`);
            const json = await res.json();
            if (json.success) setBills(json.data);
          } catch {
            // Error handling
          }
        };
        refetchBills();
      } else {
        showToast(json.message, "error");
      }
    } catch {
      showToast(t.toastUpdateError, "error");
    }
  };

  const fmt = (n) => formatMoney(lang, n);
  const locale = getLocale(lang);

  const filteredBills = bills.filter((b) => {
    const patientName = b.patient?.fullName?.toLowerCase() || "";
    const billId = b._id?.toLowerCase() || "";
    const matchSearch =
      patientName.includes(searchTerm.toLowerCase()) ||
      billId.includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    return matchSearch && matchStatus;
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
            <div className="flex items-center gap-2 md:gap-3 text-indigo-600 dark:text-indigo-400">
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
                  setConfirmDialog({ show: false, billId: null, message: "" })
                }
                className="px-3 md:px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] rounded-xl text-[10px] md:text-xs font-bold text-[var(--text-primary)] transition-all"
              >
                {t.btnCancel}
              </button>
              <button
                onClick={handleMarkAsPaid}
                className="px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] md:text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
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
              className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-xs md:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-[var(--text-primary)]"
            />
          </div>
          <div className="w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-auto bg-[var(--card-bg)] border border-[var(--border-color)] text-xs md:text-sm font-bold text-[var(--text-primary)] rounded-xl px-3 md:px-4 py-2 outline-none"
            >
              <option value="All">{t.filterAll}</option>
              <option value="unpaid">{t.filterUnpaid}</option>
              <option value="paid">{t.filterPaid}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] md:text-xs uppercase tracking-wider font-bold">
                <th className="p-3 md:p-4 pl-4 md:pl-6">{t.colBillIdDate}</th>
                <th className="p-3 md:p-4">{t.colPatient}</th>
                <th className="p-3 md:p-4">{t.colServices}</th>
                <th className="p-3 md:p-4">{t.colTotalAmount}</th>
                <th className="p-3 md:p-4">{t.colStatus}</th>
                <th className="p-3 md:p-4 text-right pr-4 md:pr-6">
                  {t.colAction}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredBills.map((b) => (
                <tr
                  key={b._id}
                  className="hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <td className="p-3 md:p-4 pl-4 md:pl-6 font-medium">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs md:text-sm">
                        {b._id?.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[10px] md:text-xs text-[var(--text-secondary)] mt-0.5">
                        {formatDate(lang, b.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4 font-bold text-[var(--text-primary)] text-xs md:text-sm">
                    <div className="flex flex-col">
                      <span>{b.patient?.fullName || "Bệnh nhân ẩn"}</span>
                      <span className="text-[10px] md:text-xs text-[var(--text-secondary)] font-mono">
                        {b.patient?.patientId || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {b.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] md:text-xs font-bold rounded-lg border border-[var(--border-color)]"
                          title={item.description}
                        >
                          {item.description} ({fmt(item.amount)})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 md:p-4 font-black text-[var(--text-primary)] text-xs md:text-sm">
                    {fmt(b.totalAmount)}
                  </td>
                  <td className="p-3 md:p-4">
                    {b.status === "paid" ? (
                      <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> {t.statusPaid}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-orange-500 dark:text-orange-400">
                        <Clock size={14} /> {t.statusUnpaid}
                      </span>
                    )}
                  </td>
                  <td className="p-3 md:p-4 pr-4 md:pr-6 text-right">
                    {b.status === "unpaid" ? (
                      <button
                        onClick={() => triggerConfirmPay(b._id)}
                        className="px-2 md:px-3 py-1 md:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] md:text-xs rounded-lg shadow-md transition-colors"
                      >
                        {t.btnConfirmPay}
                      </button>
                    ) : (
                      <span className="text-[10px] md:text-xs font-bold text-[var(--text-tertiary)]">
                        {t.paidTimePrefix}{" "}
                        {b.paidAt
                          ? new Date(b.paidAt).toLocaleTimeString(locale)
                          : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
