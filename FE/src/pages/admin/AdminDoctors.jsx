import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, Stethoscope, X, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const trans = {
  vi: {
    loading: 'Đang tải danh sách bác sĩ...',
    connError: 'Lỗi kết nối đến máy chủ.',
    toastSuccessDelete: 'Xóa bác sĩ thành công!',
    toastSuccessUpdate: 'Cập nhật bác sĩ thành công!',
    toastSuccessAdd: 'Thêm bác sĩ mới thành công!',
    toastErrorDelete: 'Không thể thực hiện xóa.',
    toastErrorSave: 'Đã xảy ra lỗi khi lưu thông tin.',
    confirmTitle: 'Xác Nhận Yêu Cầu',
    confirmMessage: 'Bạn có chắc chắn muốn xóa bác sĩ này khỏi hệ thống? Tài khoản của họ sẽ được chuyển thành vai trò bệnh nhân.',
    btnCancel: 'Hủy bỏ',
    btnConfirmDelete: 'Đồng ý xóa',
    headerTitle: 'Quản lý Bác sĩ & Chuyên khoa',
    headerSubtitle: 'Cập nhật hồ sơ bác sĩ chuyên khoa, mức phí 150k đồng bộ toàn viện và lịch trực khám.',
    btnAddDoctor: 'Thêm Bác sĩ',
    searchPlaceholder: 'Tìm theo tên, khoa, chuyên ngành...',
    colDoctor: 'Bác sĩ',
    colDept: 'Khoa & Chuyên ngành',
    colExp: 'Kinh nghiệm',
    colMonthlyCount: 'Số ca khám tháng này',
    colAction: 'Thao tác',
    yearsExpSuffix: 'năm',
    casesSuffix: 'ca',
    modalEditTitle: 'Chỉnh Sửa Hồ Sơ Bác Sĩ',
    modalAddTitle: 'Thêm Bác Sĩ Mới',
    labelFullName: 'Họ tên bác sĩ',
    labelPhone: 'Số điện thoại',
    labelEmail: 'Email',
    labelPasswordEdit: 'Mật khẩu (Để trống nếu không đổi)',
    labelPasswordAdd: 'Mật khẩu',
    labelDept: 'Khoa trực',
    labelSpecialty: 'Chuyên ngành sâu',
    labelSpecialtyPlaceholder: 'Ví dụ: Rối loạn nhịp tim',
    labelExp: 'Số năm kinh nghiệm',
    labelMonthlyAppts: 'Số ca khám tháng này',
    btnModalSubmitEdit: 'Cập Nhật Thay Đổi',
    btnModalSubmitAdd: 'Thêm Mới Bác Sĩ',
    
    // Departments
    deptCardiology: 'Tim mạch',
    deptNeurology: 'Thần kinh',
    deptPediatrics: 'Nhi khoa',
    deptDermatology: 'Da liễu',
    deptGastroenterology: 'Tiêu hóa',
    deptRespiratory: 'Hô hấp',
    deptGeneralSurgery: 'Ngoại tổng quát',
    deptInternalMedicine: 'Nội tổng quát',
    deptOtorhinolaryngology: 'Tai Mũi Họng',
    deptOphthalmology: 'Mắt',
    deptOdontoStomatology: 'Răng Hàm Mặt',
    deptEmergency: 'Cấp cứu',
    deptLaboratory: 'Xét nghiệm',
    deptImaging: 'Chẩn đoán hình ảnh',
  },
  en: {
    loading: 'Loading practitioner records...',
    connError: 'Server connection error.',
    toastSuccessDelete: 'Practitioner deleted successfully!',
    toastSuccessUpdate: 'Practitioner profile updated successfully!',
    toastSuccessAdd: 'New practitioner added successfully!',
    toastErrorDelete: 'Failed to perform practitioner deletion.',
    toastErrorSave: 'An error occurred while saving information.',
    confirmTitle: 'Confirm Request',
    confirmMessage: 'Are you sure you want to remove this practitioner? Their account credentials will be reverted to patient privileges.',
    btnCancel: 'Cancel',
    btnConfirmDelete: 'Confirm Delete',
    headerTitle: 'Clinicians & Specialties Directory',
    headerSubtitle: 'Manage specialty profiles, global 150k consultation fee sync, and shift schedules.',
    btnAddDoctor: 'Add Physician',
    searchPlaceholder: 'Search by name, department, specialty...',
    colDoctor: 'Practitioner',
    colDept: 'Department & Specialty',
    colExp: 'Experience',
    colMonthlyCount: 'Sessions Count (Month)',
    colAction: 'Actions',
    yearsExpSuffix: 'years',
    casesSuffix: 'cases',
    modalEditTitle: 'Modify Practitioner Profile',
    modalAddTitle: 'Register New Practitioner',
    labelFullName: 'Attending Practitioner Name',
    labelPhone: 'Contact Number',
    labelEmail: 'Email Address',
    labelPasswordEdit: 'Security Password (Leave blank to keep current)',
    labelPasswordAdd: 'Security Password',
    labelDept: 'Assigned Department',
    labelSpecialty: 'Clinical Focus / Specialty Area',
    labelSpecialtyPlaceholder: 'e.g., Arrhythmia & Electrophysiology',
    labelExp: 'Years of Clinical Practice',
    labelMonthlyAppts: 'Consultations Completed (Month)',
    btnModalSubmitEdit: 'Confirm Changes',
    btnModalSubmitAdd: 'Register Practitioner',
    
    // Departments
    deptCardiology: 'Cardiology',
    deptNeurology: 'Neurology',
    deptPediatrics: 'Pediatrics',
    deptDermatology: 'Dermatology',
    deptGastroenterology: 'Gastroenterology',
    deptRespiratory: 'Respiratory Medicine',
    deptGeneralSurgery: 'General Surgery',
    deptInternalMedicine: 'General Internal Medicine',
    deptOtorhinolaryngology: 'ENT',
    deptOphthalmology: 'Ophthalmology',
    deptOdontoStomatology: 'Odonto-Stomatology',
    deptEmergency: 'Emergency',
    deptLaboratory: 'Laboratory',
    deptImaging: 'Diagnostic Imaging',
  }
};

export default function AdminDoctors() {
  const { lang, t } = useTranslation(trans);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Tim mạch');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ show: false, doctorId: null, message: '' });

  const fetchDoctors = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const res = await fetch('http://localhost:5000/api/admin/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setDoctors(json.data);
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
    fetchDoctors();
  }, []);

  // Lock scrolling on scrollable main container when modals are open
  useEffect(() => {
    const mainContainer = document.querySelector('main');
    const isAnyOpen = isModalOpen || confirmDialog.show;
    if (isAnyOpen) {
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
  }, [isModalOpen, confirmDialog.show]);

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setDepartment('Tim mạch');
    setSpecialty('');
    setExperience('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc) => {
    setEditingDoctor(doc);
    setFullName(doc.userId?.fullName || '');
    setEmail(doc.userId?.email || '');
    setPassword('');
    setPhone(doc.userId?.phone || '');
    setDepartment(doc.department);
    setSpecialty(doc.specialty);
    setExperience(doc.experience);
    setIsModalOpen(true);
  };

  const confirmDeleteDoctor = (id) => {
    setConfirmDialog({
      show: true,
      doctorId: id,
      message: t.confirmMessage
    });
  };

  const handleDeleteDoctor = async () => {
    const id = confirmDialog.doctorId;
    setConfirmDialog({ show: false, doctorId: null, message: '' });

    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const res = await fetch(`http://localhost:5000/api/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setDoctors(doctors.filter(d => d._id !== id));
        showToast(t.toastSuccessDelete, 'success');
      } else {
        showToast(json.message, 'error');
      }
    } catch (err) {
      showToast(t.toastErrorDelete, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const body = {
        fullName,
        email,
        phone,
        department,
        specialty,
        experience: Number(experience),
        consultationFee: 150000 // Tất cả phí khám đều là 150k
      };

      if (!editingDoctor) {
        body.password = password || '123456';
      }

      const url = editingDoctor 
        ? `http://localhost:5000/api/admin/doctors/${editingDoctor._id}`
        : 'http://localhost:5000/api/admin/doctors';

      const method = editingDoctor ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingDoctor ? t.toastSuccessUpdate : t.toastSuccessAdd, 'success');
        setIsModalOpen(false);
        fetchDoctors();
      } else {
        showToast(json.message, 'error');
      }
    } catch (err) {
      showToast(t.toastErrorSave, 'error');
    }
  };

  const getDoctorDisplayName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    const bareName = trimmed.replace(/^(bs\.|bs\s|bác sĩ\s)/i, '').trim();
    return lang === 'vi' ? `BS. ${bareName}` : `Dr. ${bareName}`;
  };

  const getLocalizedDept = (dept) => {
    if (!dept) return '';
    if (lang === 'vi') {
      const deptsMap = {
        'Cardiology': 'Tim mạch',
        'Neurology': 'Thần kinh',
        'Pediatrics': 'Nhi khoa',
        'Dermatology': 'Da liễu',
        'Gastroenterology': 'Tiêu hóa',
        'Respiratory Medicine': 'Hô hấp',
        'General Surgery': 'Ngoại tổng quát',
        'General Internal Medicine': 'Nội tổng quát',
        'ENT': 'Tai Mũi Họng',
        'Ophthalmology': 'Mắt',
        'Odonto-Stomatology': 'Răng Hàm Mặt',
        'Emergency': 'Cấp cứu',
        'Laboratory': 'Xét nghiệm',
        'Diagnostic Imaging': 'Chẩn đoán hình ảnh',
      };
      return deptsMap[dept] || dept;
    } else {
      const deptsMap = {
        'Tim mạch': 'Cardiology',
        'Thần kinh': 'Neurology',
        'Nhi khoa': 'Pediatrics',
        'Da liễu': 'Dermatology',
        'Tiêu hóa': 'Gastroenterology',
        'Hô hấp': 'Respiratory Medicine',
        'Ngoại tổng quát': 'General Surgery',
        'Nội tổng quát': 'General Internal Medicine',
        'Tai Mũi Họng': 'ENT',
        'Mắt': 'Ophthalmology',
        'Răng Hàm Mặt': 'Odonto-Stomatology',
        'Cấp cứu': 'Emergency',
        'Xét nghiệm': 'Laboratory',
        'Chẩn đoán hình ảnh': 'Diagnostic Imaging',
      };
      return deptsMap[dept] || dept;
    }
  };

  const filteredDoctors = doctors.filter(d => {
    const nameMatch = d.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = d.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const specMatch = d.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || deptMatch || specMatch;
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
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert size={28} />
              <h3 className="font-black text-lg text-slate-800">{t.confirmTitle}</h3>
            </div>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog({ show: false, doctorId: null, message: '' })} 
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all"
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

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t.headerTitle}</h2>
          <p className="text-slate-500 font-medium mt-1">{t.headerSubtitle}</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus size={18} /> {t.btnAddDoctor}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-80" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 pl-6">{t.colDoctor}</th>
                <th className="p-4">{t.colDept}</th>
                <th className="p-4">{t.colExp}</th>
                <th className="p-4">{t.colMonthlyCount}</th>
                <th className="p-4 text-right pr-6">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map(d => (
                <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{getDoctorDisplayName(d.userId?.fullName)}</p>
                        <p className="text-xs text-slate-500 font-mono">{d.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col font-medium">
                      <span className="font-bold text-slate-800 text-sm">{getLocalizedDept(d.department)}</span>
                      <span className="text-xs text-slate-500 font-medium">{getLocalizedDept(d.specialty)}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-600">{d.experience} {t.yearsExpSuffix}</td>
                  <td className="p-4 font-black text-indigo-600">{d.monthlyAppointmentsCount || 0} {t.casesSuffix}</td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenEditModal(d)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => confirmDeleteDoctor(d._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">
                {editingDoctor ? t.modalEditTitle : t.modalAddTitle}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t.labelFullName}</label>
                  <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t.labelPhone}</label>
                  <input required type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t.labelEmail}</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{editingDoctor ? t.labelPasswordEdit : t.labelPasswordAdd}</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t.labelDept}</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                    <option value="Tim mạch">{t.deptCardiology}</option>
                    <option value="Thần kinh">{t.deptNeurology}</option>
                    <option value="Nhi khoa">{t.deptPediatrics}</option>
                    <option value="Da liễu">{t.deptDermatology}</option>
                    <option value="Tiêu hóa">{t.deptGastroenterology}</option>
                    <option value="Hô hấp">{t.deptRespiratory}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t.labelSpecialty}</label>
                  <input required type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder={t.labelSpecialtyPlaceholder} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t.labelExp}</label>
                  <input required type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{t.labelMonthlyAppts}</label>
                  <div className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-xl text-sm leading-relaxed">
                    {editingDoctor ? (editingDoctor.monthlyAppointmentsCount || 0) + ' ' + t.casesSuffix : '0 ' + t.casesSuffix}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all mt-6 text-sm">
                {editingDoctor ? t.btnModalSubmitEdit : t.btnModalSubmitAdd}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
