import { API_URL, authFetch } from '../../config';
import React, { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const trans = {
  vi: {
    loading: 'Đang tải danh sách người dùng...',
    connError: 'Lỗi kết nối đến máy chủ.',
    toastSuccessStatus: 'Cập nhật trạng thái thành công!',
    toastSuccessRole: 'Cập nhật vai trò thành công!',
    toastErrorStatus: 'Không thể cập nhật trạng thái người dùng.',
    toastErrorRole: 'Không thể cập nhật vai trò.',
    confirmTitle: 'Xác Nhận Yêu Cầu',
    confirmMsgBlock: 'Bạn có chắc chắn muốn KHÓA tài khoản này? Người dùng sẽ không thể đăng nhập vào hệ thống.',
    confirmMsgUnblock: 'Bạn có chắc chắn muốn KÍCH HOẠT lại tài khoản này? Người dùng có thể đăng nhập bình thường.',
    btnCancel: 'Hủy bỏ',
    btnConfirm: 'Đồng ý',
    headerTitle: 'Quản lý Tài khoản',
    headerSubtitle: 'Phân quyền vai trò và khóa/mở khóa tài khoản người dùng hệ thống.',
    searchPlaceholder: 'Tìm kiếm theo tên, email...',
    filterAll: 'Tất cả vai trò',
    colUser: 'Người dùng',
    colRole: 'Vai trò',
    colUpdateRole: 'Cập nhật vai trò',
    colStatus: 'Trạng thái',
    colAction: 'Thao tác',
    statusActive: 'Hoạt động',
    statusBlocked: 'Đã khóa',
    btnBlock: 'Khóa TK',
    btnUnblock: 'Mở TK',
    
    // Role display names
    roleAdmin: 'Admin', // Request 8: Với role Admin thì hiện Admin chứ đừng hiện Quản trị viên
    roleDoctor: 'Bác sĩ',
    roleLabStaff: 'Xét nghiệm',
    rolePatient: 'Bệnh nhân',
  },
  en: {
    loading: 'Loading accounts directory...',
    connError: 'Server connection error.',
    toastSuccessStatus: 'Account status updated successfully!',
    toastSuccessRole: 'Account privileges updated successfully!',
    toastErrorStatus: 'Failed to update account status.',
    toastErrorRole: 'Failed to modify account privileges.',
    confirmTitle: 'Confirm Account Action',
    confirmMsgBlock: 'Are you sure you want to SUSPEND this user account? The user will be immediately blocked from accessing their clinical dashboard.',
    confirmMsgUnblock: 'Are you sure you want to RESTORE this user account? Their authentication privileges will be reactivated immediately.',
    btnCancel: 'Cancel',
    btnConfirm: 'Proceed',
    headerTitle: 'Identity & Access Management',
    headerSubtitle: 'Delegate system roles, assign clinical privileges, and suspend/restore user accounts.',
    searchPlaceholder: 'Search by full name or email address...',
    filterAll: 'All Privileges',
    colUser: 'Identity',
    colRole: 'System Role',
    colUpdateRole: 'Delegate Privilege',
    colStatus: 'Status',
    colAction: 'Actions',
    statusActive: 'Active',
    statusBlocked: 'Suspended',
    btnBlock: 'Block',
    btnUnblock: 'Activate',
    
    // Role display names
    roleAdmin: 'Admin',
    roleDoctor: 'Physician',
    roleLabStaff: 'Lab Technician',
    rolePatient: 'Patient',
  }
};

export default function AdminUsers() {
  const { lang, t } = useTranslation(trans);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ show: false, userId: null, currentStatus: '', message: '' });

  const jsonHeaders = () => ({ 'Content-Type': 'application/json' });

  const fetchUsers = async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/users`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
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
    fetchUsers();
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

  const triggerStatusConfirm = (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const msg = nextStatus === 'blocked' ? t.confirmMsgBlock : t.confirmMsgUnblock;
      
    setConfirmDialog({
      show: true,
      userId: id,
      currentStatus: currentStatus,
      message: msg
    });
  };

  const handleUpdateStatus = async () => {
    const { userId: id, currentStatus } = confirmDialog;
    setConfirmDialog({ show: false, userId: null, currentStatus: '', message: '' });
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';

    try {
      const res = await authFetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await res.json();
      if (json.success) {
        setUsers(users.map(u => u._id === id ? { ...u, status: nextStatus } : u));
        showToast(t.toastSuccessStatus, 'success');
      } else {
        showToast(json.message, 'error');
      }
    } catch (err) {
      showToast(t.toastErrorStatus, 'error');
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      const json = await res.json();
      if (json.success) {
        setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
        showToast(t.toastSuccessRole, 'success');
      } else {
        showToast(json.message, 'error');
      }
    } catch (err) {
      showToast(t.toastErrorRole, 'error');
    }
  };

  const RoleBadge = ({ role }) => {
    const colors = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      doctor: 'bg-blue-100 text-blue-700 border-blue-200',
      lab_staff: 'bg-purple-100 text-purple-700 border-purple-200',
      patient: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    const labels = {
      admin: t.roleAdmin,
      doctor: t.roleDoctor,
      lab_staff: t.roleLabStaff,
      patient: t.rolePatient
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[role] || 'bg-gray-100 text-gray-700'}`}>{labels[role] || role}</span>;
  };

  const filteredUsers = users.filter(u => {
    const nameMatch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = filterRole === 'All' || u.role === filterRole;
    return (nameMatch || emailMatch) && roleMatch;
  });

  if (loading) return <div className="text-center py-10 font-bold text-slate-600">{t.loading}</div>;
  if (error) return <div className="bg-red-50 text-red-500 p-4 rounded-2xl">{error}</div>;

  return (
    <div className="space-y-6 relative animate-in fade-in">
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
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert size={28} />
              <h3 className="font-black text-lg text-slate-800">{t.confirmTitle}</h3>
            </div>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog({ show: false, userId: null, currentStatus: '', message: '' })} 
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all"
              >
                {t.btnCancel}
              </button>
              <button 
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 transition-all"
              >
                {t.btnConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t.headerTitle}</h2>
          <p className="text-slate-500 font-medium mt-1">{t.headerSubtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64" 
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none"
            >
              <option value="All">{t.filterAll}</option>
              <option value="patient">{t.rolePatient}</option>
              <option value="doctor">{t.roleDoctor}</option>
              <option value="lab_staff">{t.roleLabStaff}</option>
              <option value="admin">{t.roleAdmin}</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 pl-6">{t.colUser}</th>
                <th className="p-4">{t.colRole}</th>
                <th className="p-4">{t.colUpdateRole}</th>
                <th className="p-4">{t.colStatus}</th>
                <th className="p-4 text-right pr-6">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                        {u.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{u.fullName}</p>
                        <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><RoleBadge role={u.role} /></td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="patient">{t.rolePatient}</option>
                      <option value="doctor">{t.roleDoctor}</option>
                      <option value="lab_staff">{t.roleLabStaff}</option>
                      <option value="admin">{t.roleAdmin}</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {u.status !== 'blocked' ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> {t.statusActive}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                        <Ban size={12}/> {t.statusBlocked}
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => triggerStatusConfirm(u._id, u.status || 'active')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        u.status !== 'blocked'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status !== 'blocked' ? t.btnBlock : t.btnUnblock}
                    </button>
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
