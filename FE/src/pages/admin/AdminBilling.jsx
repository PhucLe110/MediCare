import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { Download, Search, CheckCircle2, Clock, ShieldAlert, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const trans = {
  vi: {
    loading: 'Đang tải danh sách hóa đơn...',
    connError: 'Lỗi kết nối đến máy chủ.',
    confirmTitle: 'Xác Nhận Thu Phí',
    confirmMessage: 'Bạn có chắc chắn muốn xác nhận ĐÃ THANH TOÁN cho hóa đơn này? Hệ thống sẽ ghi nhận giao dịch thành công.',
    btnCancel: 'Hủy bỏ',
    btnConfirm: 'Xác nhận',
    toastSuccess: 'Xác nhận thanh toán hóa đơn thành công!',
    toastUpdateError: 'Không thể cập nhật hóa đơn.',
    headerTitle: 'Quản lý Viện phí & Hóa đơn',
    headerSubtitle: 'Theo dõi các khoản thu y tế, khám bệnh, đơn thuốc và thanh toán hóa đơn.',
    searchPlaceholder: 'Tìm kiếm bệnh nhân hoặc mã HĐ...',
    filterAll: 'Tất cả hóa đơn',
    filterUnpaid: 'Chờ thanh toán',
    filterPaid: 'Đã thanh toán',
    colBillIdDate: 'Mã HĐ / Ngày tạo',
    colPatient: 'Bệnh nhân',
    colServices: 'Chi tiết các dịch vụ',
    colTotalAmount: 'Tổng tiền',
    colStatus: 'Trạng thái',
    colAction: 'Hành động',
    statusPaid: 'Đã thanh toán',
    statusUnpaid: 'Chờ thanh toán',
    btnConfirmPay: 'Xác nhận thu phí',
    paidTimePrefix: 'Đã thanh toán lúc',
  },
  en: {
    loading: 'Loading billing records...',
    connError: 'Server connection error.',
    confirmTitle: 'Confirm Payment Settle',
    confirmMessage: 'Are you sure you want to verify that this bill has been PAID? The clinical database will record this transaction immediately.',
    btnCancel: 'Cancel',
    btnConfirm: 'Confirm',
    toastSuccess: 'Billing payment settled successfully!',
    toastUpdateError: 'Failed to update billing statement.',
    headerTitle: 'Hospital Fee & Billing Management',
    headerSubtitle: 'Track patient diagnostics fees, consultations charges, prescriptions costs, and manage electronic transactions.',
    searchPlaceholder: 'Search by patient name or bill reference...',
    filterAll: 'All Bills',
    filterUnpaid: 'Awaiting Payment',
    filterPaid: 'Paid',
    colBillIdDate: 'Bill Ref / Generated Date',
    colPatient: 'Patient',
    colServices: 'Itemized Services Summary',
    colTotalAmount: 'Amount Due',
    colStatus: 'Status',
    colAction: 'Action',
    statusPaid: 'Settled',
    statusUnpaid: 'Unpaid',
    btnConfirmPay: 'Settle Payment',
    paidTimePrefix: 'Settled at',
  }
};

export default function AdminBilling() {
  const { lang, t } = useTranslation(trans);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Custom Confirm State
  const [confirmDialog, setConfirmDialog] = useState({ show: false, billId: null, message: '' });

  const fetchBills = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const res = await fetch(`${API_URL}/api/admin/bills`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setBills(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError(t.connError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Lock scrolling on scrollable main container when modal is open
  useEffect(() => {
    const mainContainer = document.querySelector('main');
    if (confirmDialog.show) {
      document.body.style.overflow = 'hidden';
      if (mainContainer) mainContainer.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (mainContainer) mainContainer.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = '';
      if (mainContainer) mainContainer.style.overflow = 'auto';
    };
  }, [confirmDialog.show]);

  const triggerConfirmPay = (billId) => {
    setConfirmDialog({
      show: true,
      billId,
      message: t.confirmMessage
    });
  };

  const handleMarkAsPaid = async () => {
    const billId = confirmDialog.billId;
    setConfirmDialog({ show: false, billId: null, message: '' });

    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const res = await fetch(`${API_URL}/api/bills/${billId}/pay`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        showToast(t.toastSuccess, 'success');
        fetchBills();
      } else {
        showToast(json.message, 'error');
      }
    } catch (err) {
      showToast(t.toastUpdateError, 'error');
    }
  };

  const fmt = (n) => {
    return lang === 'vi'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)
      : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.round((n || 0) / 25000));
  };

  const filteredBills = bills.filter(b => {
    const patientName = b.patient?.fullName?.toLowerCase() || '';
    const billId = b._id?.toLowerCase() || '';
    const matchSearch = patientName.includes(searchTerm.toLowerCase()) || billId.includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="text-center py-10 font-bold text-slate-600">{t.loading}</div>;
  if (error) return <div className="bg-red-50 text-red-500 p-4 rounded-2xl">{error}</div>;

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.show && (
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <ShieldAlert size={28} />
              <h3 className="font-black text-lg text-slate-800">{t.confirmTitle}</h3>
            </div>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog({ show: false, billId: null, message: '' })} 
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all"
              >
                {t.btnCancel}
              </button>
              <button 
                onClick={handleMarkAsPaid}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
              >
                {t.btnConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t.headerTitle}</h2>
          <p className="text-slate-500 font-medium mt-1">{t.headerSubtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none"
            >
              <option value="All">{t.filterAll}</option>
              <option value="unpaid">{t.filterUnpaid}</option>
              <option value="paid">{t.filterPaid}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 pl-6">{t.colBillIdDate}</th>
                <th className="p-4">{t.colPatient}</th>
                <th className="p-4">{t.colServices}</th>
                <th className="p-4">{t.colTotalAmount}</th>
                <th className="p-4">{t.colStatus}</th>
                <th className="p-4 text-right pr-6">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map(b => (
                <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-medium">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-indigo-600 text-sm">{b._id?.slice(-8).toUpperCase()}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{lang === 'vi' ? new Date(b.createdAt).toLocaleDateString('vi-VN') : new Date(b.createdAt).toLocaleDateString('en-US')}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    <div className="flex flex-col">
                      <span>{b.patient?.fullName || 'Bệnh nhân ẩn'}</span>
                      <span className="text-xs text-slate-500 font-mono">{b.patient?.patientId || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {b.items.map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200" title={item.description}>
                          {item.description} ({fmt(item.amount)})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-black text-slate-700">{fmt(b.totalAmount)}</td>
                  <td className="p-4">
                    {b.status === 'paid' ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 size={14}/> {t.statusPaid}</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500"><Clock size={14}/> {t.statusUnpaid}</span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {b.status === 'unpaid' ? (
                      <button 
                        onClick={() => triggerConfirmPay(b._id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors"
                      >
                        {t.btnConfirmPay}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{t.paidTimePrefix} {b.paidAt ? (lang === 'vi' ? new Date(b.paidAt).toLocaleTimeString('vi-VN') : new Date(b.paidAt).toLocaleTimeString('en-US')) : ''}</span>
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
