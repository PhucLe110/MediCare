import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical, Clock, CheckCircle2, AlertTriangle, User,
  Upload, FileText, X, Loader2, ChevronDown, ChevronUp, Send
} from 'lucide-react';

const API_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const u = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return { 'Authorization': `Bearer ${u.token}` };
};

const TEST_TYPE_MAP = {
  blood: 'Xét nghiệm máu',
  urine: 'Xét nghiệm nước tiểu',
  xray: 'Chụp X-Quang',
  mri: 'Chụp MRI',
  ct: 'Chụp CT Scan',
  ultrasound: 'Siêu âm',
  ecg: 'Điện tâm đồ (ECG)',
  other: 'Loại khác'
};

const Toast = ({ toast }) => (
  <div className={`fixed top-8 right-8 z-50 transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
    <div className={`bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${toast.type === 'error' ? 'border-red-100' : 'border-green-100'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
        {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
      </div>
      <p className="text-sm font-bold text-gray-800">{toast.message}</p>
    </div>
  </div>
);

// Card for a single pending request
const RequestCard = ({ req, onStart, onComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const fileRef = useRef();

  const handleStart = async () => {
    setStarting(true);
    await onStart(req._id);
    setStarting(false);
  };

  const handleComplete = async () => {
    if (!file) return;
    setUploading(true);
    await onComplete(req._id, file, notes);
    setUploading(false);
  };

  const isUrgent = req.urgency === 'urgent';

  return (
    <div className={`bg-white rounded-3xl border shadow-sm transition-all ${isUrgent ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
      {isUrgent && (
        <div className="bg-red-500 text-white text-xs font-bold px-5 py-1.5 rounded-t-3xl flex items-center gap-2">
          <AlertTriangle size={12} /> KHẨN CẤP — Ưu tiên xử lý
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Patient Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-primary rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                {req.patient?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{req.patient?.fullName}</h3>
                <p className="text-xs text-gray-500 font-mono">
                  {req.patient?.patientId} • {req.patient?.phone}
                </p>
              </div>
            </div>

            {/* Test Info */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Tên xét nghiệm</p>
                <p className="font-bold text-gray-800">{req.testName}</p>
              </div>
              <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">Loại</p>
                <p className="font-bold text-gray-800">{TEST_TYPE_MAP[req.testType] || req.testType}</p>
              </div>
            </div>

            {/* Clinical notes */}
            {req.clinicalNotes && (
              <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100 text-sm mb-4">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Ghi chú lâm sàng từ Bác sĩ</p>
                <p className="text-gray-700 italic">{req.clinicalNotes}</p>
              </div>
            )}

            {/* Doctor & Time */}
            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <User size={12} /> BS. {req.doctor?.fullName}
              </span>
              {req.appointment && (
                <span className="flex items-center gap-1">
                  Ca khám: {new Date(req.appointment?.date).toLocaleDateString('vi-VN')} {req.appointment?.time}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={12} /> {new Date(req.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {req.status === 'pending' ? 'Chờ xử lý' : 'Đang tiến hành'}
            </span>

            {req.status === 'pending' && (
              <button
                onClick={handleStart}
                disabled={starting}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                {starting ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
                Bắt đầu XN
              </button>
            )}

            {req.status === 'in_progress' && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20"
              >
                <Send size={14} />
                Xuất kết quả
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Upload Result Panel */}
        {expanded && req.status === 'in_progress' && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
              <Send size={16} className="text-teal-600" /> Xuất kết quả xét nghiệm
            </h4>

            <textarea
              rows="2"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 resize-none"
              placeholder="Ghi chú kết quả (tùy chọn)..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
              }`}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={20} className="text-green-600" />
                  <span className="font-bold text-gray-700 text-sm">{file.name}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Upload size={20} />
                  <span className="text-sm font-medium">Chọn file PDF / hình ảnh kết quả</span>
                </div>
              )}
            </div>

            <button
              onClick={handleComplete}
              disabled={!file || uploading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {uploading ? <><Loader2 size={18} className="animate-spin" /> Đang gửi...</> : <><Send size={18} /> Gửi kết quả tới bệnh nhân & bác sĩ</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main Lab Staff Dashboard
// ============================================================
const LabStaffDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 4000);
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lab-requests/pending`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (err) {
      showToast('Không thể tải danh sách yêu cầu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleStart = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/lab-requests/${id}/start`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r._id === id ? data.data : r));
        showToast('Đã bắt đầu tiến hành xét nghiệm!');
      }
    } catch { showToast('Lỗi kết nối.', 'error'); }
  };

  const handleComplete = async (id, file, notes) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notes', notes);

      const res = await fetch(`${API_URL}/api/lab-requests/${id}/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        // Remove completed request from list
        setRequests(prev => prev.filter(r => r._id !== id));
      } else {
        showToast(data.message, 'error');
      }
    } catch { showToast('Lỗi kết nối.', 'error'); }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const inProgress = requests.filter(r => r.status === 'in_progress');

  return (
    <div className="max-w-4xl mx-auto">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner">
          <FlaskConical size={32} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Bàn Làm Việc Xét Nghiệm</h1>
          <p className="text-gray-500 mt-1">Danh sách yêu cầu xét nghiệm từ Bác sĩ chờ xử lý</p>
        </div>
        <div className="flex gap-4 text-center">
          <div className="px-5 py-3 bg-yellow-50 border border-yellow-100 rounded-2xl">
            <p className="text-2xl font-black text-yellow-600">{pending.length}</p>
            <p className="text-xs text-yellow-500 font-bold mt-1">Chờ xử lý</p>
          </div>
          <div className="px-5 py-3 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-2xl font-black text-blue-600">{inProgress.length}</p>
            <p className="text-xs text-blue-500 font-bold mt-1">Đang tiến hành</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-52 bg-gray-100 rounded-3xl"></div>)}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">Không có yêu cầu nào đang chờ</h3>
          <p className="text-gray-400 text-sm">Tất cả yêu cầu xét nghiệm đã được xử lý xong!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* In Progress — show first */}
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FlaskConical size={14} /> Đang tiến hành ({inProgress.length})
              </h2>
              <div className="space-y-4">
                {inProgress.map(req => (
                  <RequestCard key={req._id} req={req} onStart={handleStart} onComplete={handleComplete} />
                ))}
              </div>
            </div>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-yellow-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={14} /> Chờ xử lý ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map(req => (
                  <RequestCard key={req._id} req={req} onStart={handleStart} onComplete={handleComplete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabStaffDashboard;
