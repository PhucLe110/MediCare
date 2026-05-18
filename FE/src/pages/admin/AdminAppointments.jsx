import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Search, UserRoundCheck, RefreshCw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const trans = {
  vi: {
    loading: 'Đang tải danh sách ca khám...',
    connError: 'Lỗi kết nối đến máy chủ.',
    toastSuccess: 'Cập nhật trạng thái ca khám thành công!',
    toastCancelConfirm: 'Bạn có chắc muốn hủy ca khám này?',
    toastApproveConfirm: 'Bạn có chắc chắn muốn xác nhận đặt lịch ca khám này?',
    toastReschedSuccess: 'Điều phối & Dời ca khám thành công!',
    toastSaveError: 'Không thể lưu kết quả điều phối.',
    toastNoDoctor: 'Vui lòng chọn bác sĩ phụ trách ca khám!',
    toastFetchDoctorError: 'Không thể tải danh sách bác sĩ rảnh.',
    toastUpdateError: 'Không thể cập nhật ca khám.',
    confirmActionTitle: 'Xác Nhận Hành Động',
    btnCancel: 'Hủy bỏ',
    btnConfirm: 'Xác nhận',
    headerTitle: 'Điều phối Ca khám chuyên sâu',
    headerSubtitle: 'Tìm kiếm bác sĩ trống lịch cùng chuyên khoa để phân phối tải hoặc dời giờ khám. Ca khám hoàn thành sẽ do bác sĩ trực tiếp khám bệnh xác nhận.',
    searchPlaceholder: 'Tìm theo tên BN, bác sĩ, mã số vé...',
    filterAllStatus: 'Tất cả trạng thái',
    colTicketDate: 'Mã Vé & Ngày Khám',
    colPatient: 'Bệnh nhân',
    colDoctor: 'Bác sĩ phụ trách',
    colQueue: 'STT',
    colStatus: 'Trạng thái',
    colAction: 'Thao tác',
    btnReschedule: 'Điều phối lịch',
    btnCancelAppt: 'Hủy ca',
    btnConfirmAppt: 'Xác nhận',
    apptClosed: 'Đã đóng ca khám',
    modalTitle: 'Điều Phối Ca Khám Lâm Sàng',
    modalTicketNo: 'Mã vé:',
    modalOrigHeader: 'Thông tin đăng ký ban đầu:',
    modalOrigPatient: 'Bệnh nhân:',
    modalOrigPhone: 'Số điện thoại:',
    modalOrigDoctor: 'Bác sĩ ban đầu:',
    modalOrigDept: 'Khoa & Chuyên khoa:',
    modalStep1: '1. Thiết lập Khung thời gian cần khám',
    modalDateLabel: 'Ngày khám',
    modalTimeLabel: 'Khung giờ',
    modalStep2: '2. Bác sĩ cùng chuyên ngành trống ca',
    modalLoadingWorkload: 'Đang kiểm tra tải lượng công việc...',
    modalNoDoctorsFound: 'Không tìm thấy bác sĩ nào khác cùng chuyên khoa.',
    modalWorkloadFree: 'Trống ca',
    modalWorkloadBusy: 'Bận',
    modalWorkloadFull: 'Đầy tải',
    modalBtnClose: 'Hủy',
    modalBtnSubmit: 'Xác nhận Điều phối & Dời ca',
  },
  en: {
    loading: 'Loading clinical appointment list...',
    connError: 'Server connection error.',
    toastSuccess: 'Appointment status updated successfully!',
    toastCancelConfirm: 'Are you sure you want to cancel this appointment?',
    toastApproveConfirm: 'Are you sure you want to confirm this appointment booking?',
    toastReschedSuccess: 'Clinical coordination & rescheduling completed successfully!',
    toastSaveError: 'Failed to save clinical coordination.',
    toastNoDoctor: 'Please select an attending physician for this session!',
    toastFetchDoctorError: 'Failed to load list of available doctors.',
    toastUpdateError: 'Failed to update appointment session.',
    confirmActionTitle: 'Confirm Action',
    btnCancel: 'Cancel',
    btnConfirm: 'Confirm',
    headerTitle: 'Clinical Session Coordination',
    headerSubtitle: 'Search for available practitioners within the same specialty to balance workload or reschedule appointments. Completed sessions will be validated by the attending doctor.',
    searchPlaceholder: 'Search by patient name, doctor, ticket number...',
    filterAllStatus: 'All Statuses',
    colTicketDate: 'Ticket & Consultation Date',
    colPatient: 'Patient',
    colDoctor: 'Attending Practitioner',
    colQueue: 'Queue No.',
    colStatus: 'Status',
    colAction: 'Actions',
    btnReschedule: 'Reschedule',
    btnCancelAppt: 'Cancel',
    btnConfirmAppt: 'Confirm',
    apptClosed: 'Session Closed',
    modalTitle: 'Clinical Consultation Coordination',
    modalTicketNo: 'Ticket ID:',
    modalOrigHeader: 'Original Scheduling Parameters:',
    modalOrigPatient: 'Patient:',
    modalOrigPhone: 'Phone:',
    modalOrigDoctor: 'Original Physician:',
    modalOrigDept: 'Department & Specialty:',
    modalStep1: '1. Configure Preferred Time Slot',
    modalDateLabel: 'Consultation Date',
    modalTimeLabel: 'Time Frame',
    modalStep2: '2. Specialty Doctors Availability Check',
    modalLoadingWorkload: 'Checking clinician schedules...',
    modalNoDoctorsFound: 'No available practitioners found in this specialty.',
    modalWorkloadFree: 'Available',
    modalWorkloadBusy: 'Busy',
    modalWorkloadFull: 'Fully Loaded',
    modalBtnClose: 'Close',
    modalBtnSubmit: 'Confirm Coordination & Dispatch',
  }
};

export default function AdminAppointments() {
  const { lang, t } = useTranslation(trans);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal States
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [availableData, setAvailableData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ show: false, apptId: null, action: '', message: '' });

  const fetchAppointments = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const res = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setAppointments(json.data);
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
    fetchAppointments();
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

  const handleOpenCoordModal = async (appt) => {
    setSelectedAppt(appt);
    setSelectedDoctorId(appt.doctor?._id || '');
    setNewDate(appt.date);
    setNewTime(appt.time);
    setIsModalOpen(true);
    fetchAvailableDoctors(appt._id, appt.date, appt.time);
  };

  const fetchAvailableDoctors = async (apptId, date, time) => {
    setLoadingModal(true);
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const res = await fetch(`http://localhost:5000/api/admin/appointments/${apptId}/available-doctors?date=${date}&time=${time}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setAvailableData(json.data);
      } else {
        showToast(json.message, 'error');
      }
    } catch (err) {
      showToast(t.toastFetchDoctorError, 'error');
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
      return showToast(t.toastNoDoctor, 'error');
    }

    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const res = await fetch(`http://localhost:5000/api/admin/appointments/${selectedAppt._id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          date: newDate,
          time: newTime
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(t.toastReschedSuccess, 'success');
        setIsModalOpen(false);
        fetchAppointments();
      } else {
        showToast(json.message, 'error');
      }
    } catch (err) {
      showToast(t.toastSaveError, 'error');
    }
  };

  const confirmAction = (id, action, message) => {
    setConfirmDialog({
      show: true,
      apptId: id,
      action,
      message
    });
  };

  const handleExecuteStatusUpdate = async () => {
    const { apptId, action } = confirmDialog;
    setConfirmDialog({ show: false, apptId: null, action: '', message: '' });

    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const res = await fetch(`http://localhost:5000/api/admin/appointments/${apptId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });
      const json = await res.json();
      if (json.success) {
        showToast(t.toastSuccess, 'success');
        fetchAppointments();
      } else {
        showToast(json.message, 'error');
      }
    } catch (err) {
      showToast(t.toastUpdateError, 'error');
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
    if (lang === 'vi') return dept;
    const deptsMap = {
      'Khoa Nội': 'Internal Medicine',
      'Khoa Ngoại': 'Surgery',
      'Khoa Nhi': 'Pediatrics',
      'Khoa Sản': 'Obstetrics & Gynecology',
      'Khoa Da liễu': 'Dermatology',
      'Khoa Tai Mũi Họng': 'ENT',
      'Khoa Mắt': 'Ophthalmology',
      'Khoa Răng Hàm Mặt': 'Odonto-Stomatology',
      'Khoa Tim mạch': 'Cardiology',
      'Khoa Thần kinh': 'Neurology',
      'Khoa Cơ xương khớp': 'Orthopedics & Rheumatology',
      'Khoa Cấp cứu': 'Emergency',
      'Khoa Xét nghiệm': 'Laboratory',
      'Khoa Chẩn đoán hình ảnh': 'Diagnostic Imaging',
      'Ngoại tổng quát': 'General Surgery',
      'Nội tổng quát': 'General Internal Medicine',
    };
    return deptsMap[dept] || dept;
  };

  const getLocalizedStatus = (status) => {
    const statusMap = {
      pending: lang === 'vi' ? 'Chờ xác nhận' : 'Pending',
      confirmed: lang === 'vi' ? 'Đã xác nhận' : 'Confirmed',
      completed: lang === 'vi' ? 'Đã khám' : 'Completed',
      cancelled: lang === 'vi' ? 'Đã hủy' : 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const filteredAppointments = appointments.filter(app => {
    const patientName = app.patient?.fullName?.toLowerCase() || '';
    const doctorName = app.doctor?.userId?.fullName?.toLowerCase() || '';
    const ticketNo = app.ticketNumber?.toLowerCase() || '';
    const matchSearch = patientName.includes(searchTerm.toLowerCase()) || 
                        doctorName.includes(searchTerm.toLowerCase()) ||
                        ticketNo.includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const configs = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${configs[status] || 'bg-slate-100 text-slate-800'}`}>
        {getLocalizedStatus(status).toUpperCase()}
      </span>
    );
  };

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
              <h3 className="font-black text-lg text-slate-800">{t.confirmActionTitle}</h3>
            </div>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog({ show: false, apptId: null, action: '', message: '' })} 
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all"
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

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t.headerTitle}</h2>
          <p className="text-slate-500 font-medium mt-1">{t.headerSubtitle}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none"
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-4 pl-6">{t.colTicketDate}</th>
                <th className="p-4">{t.colPatient}</th>
                <th className="p-4">{t.colDoctor}</th>
                <th className="p-4">{t.colQueue}</th>
                <th className="p-4">{t.colStatus}</th>
                <th className="p-4 text-right pr-6">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map(app => (
                <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex flex-col font-medium">
                      <span className="font-mono font-bold text-slate-800 text-sm">{app.ticketNumber || 'N/A'}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={12}/> {app.date} | <Clock size={12}/> {app.time}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col font-medium">
                      <span className="font-bold text-slate-800 text-sm">{app.patient?.fullName || 'Bệnh nhân ẩn'}</span>
                      <span className="text-xs text-slate-500 font-mono">{app.patient?.patientId || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col font-medium">
                      <span className="font-bold text-slate-800 text-sm">{getDoctorDisplayName(app.doctor?.userId?.fullName)}</span>
                      <span className="text-xs text-indigo-600 font-bold">{getLocalizedDept(app.doctor?.department)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-700 text-xs border border-slate-200">
                      {app.queueNumber || '1'}
                    </span>
                  </td>
                  <td className="p-4">{getStatusBadge(app.status)}</td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    {['pending', 'confirmed'].includes(app.status) && (
                      <>
                        <button 
                          onClick={() => handleOpenCoordModal(app)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                        >
                          {t.btnReschedule}
                        </button>
                        <button 
                          onClick={() => confirmAction(app._id, 'cancelled', t.toastCancelConfirm)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-colors"
                        >
                          {t.btnCancelAppt}
                        </button>
                      </>
                    )}
                    {app.status === 'pending' && (
                      <button 
                        onClick={() => confirmAction(app._id, 'confirmed', t.toastApproveConfirm)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors"
                      >
                        {t.btnConfirmAppt}
                      </button>
                    )}
                    {['completed', 'cancelled'].includes(app.status) && (
                      <span className="text-xs font-bold text-slate-400">{t.apptClosed}</span>
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
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <UserRoundCheck className="text-indigo-600" /> {t.modalTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t.modalTicketNo} {selectedAppt.ticketNumber}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Original Appt Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                <h4 className="font-bold text-slate-700 mb-2">{t.modalOrigHeader}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs font-medium text-slate-600">
                  <p>{t.modalOrigPatient} <span className="font-bold text-slate-800">{selectedAppt.patient?.fullName}</span></p>
                  <p>{t.modalOrigPhone} <span className="font-bold text-slate-800">{selectedAppt.patient?.phone}</span></p>
                  <p>{t.modalOrigDoctor} <span className="font-bold text-slate-800">{getDoctorDisplayName(selectedAppt.doctor?.userId?.fullName)}</span></p>
                  <p>{t.modalOrigDept} <span className="font-bold text-indigo-600">{getLocalizedDept(selectedAppt.doctor?.department)} ({getLocalizedDept(selectedAppt.doctor?.specialty)})</span></p>
                </div>
              </div>

              {/* Step 1: Reschedule Date & Time */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t.modalStep1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.modalDateLabel}</label>
                    <input 
                      type="date" 
                      value={newDate} 
                      onChange={(e) => {
                        setNewDate(e.target.value);
                        handleDateOrTimeChange(e.target.value, newTime);
                      }} 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.modalTimeLabel}</label>
                    <select 
                      value={newTime} 
                      onChange={(e) => {
                        setNewTime(e.target.value);
                        handleDateOrTimeChange(newDate, e.target.value);
                      }}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
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
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t.modalStep2}</h4>
                  {loadingModal && <RefreshCw className="animate-spin text-slate-400" size={16} />}
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                  {loadingModal ? (
                    <div className="text-center py-8 text-xs font-bold text-slate-400">{t.modalLoadingWorkload}</div>
                  ) : availableData?.doctors?.length === 0 ? (
                    <div className="text-center py-8 text-xs font-bold text-slate-400">{t.modalNoDoctorsFound}</div>
                  ) : (
                    availableData?.doctors?.map(doc => {
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
                              ? 'border-indigo-500 bg-indigo-50/30' 
                              : isFull 
                                ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-100/50' 
                                : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                            }`}>
                              BS
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{getDoctorDisplayName(doc.fullName)}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{getLocalizedDept(doc.department)} • {getLocalizedDept(doc.specialty)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isTrongCa ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {t.modalWorkloadFree} ({doc.currentAppointmentsCount}/3)
                              </span>
                            ) : isFull ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {t.modalWorkloadFull} (5/5 ca)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {t.modalWorkloadBusy} ({doc.currentAppointmentsCount}/5)
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

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
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
