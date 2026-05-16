import React, { useState, useRef } from 'react';
import { Upload, FlaskConical, User, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const TEST_TYPES = [
  { value: 'blood', label: 'Xét nghiệm máu' },
  { value: 'urine', label: 'Xét nghiệm nước tiểu' },
  { value: 'xray', label: 'Chụp X-Quang' },
  { value: 'mri', label: 'Chụp MRI' },
  { value: 'ct', label: 'Chụp CT Scan' },
  { value: 'ultrasound', label: 'Siêu âm' },
  { value: 'ecg', label: 'Điện tâm đồ (ECG)' },
  { value: 'other', label: 'Loại khác' },
];

const LabUpload = () => {
  const [form, setForm] = useState({
    patientId: '',
    testName: '',
    testType: 'blood',
    notes: '',
  });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const fileRef = useRef();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 4000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return showToast('Vui lòng đính kèm file kết quả.', 'error');
    if (!form.patientId.trim()) return showToast('Vui lòng nhập mã bệnh nhân.', 'error');
    if (!form.testName.trim()) return showToast('Vui lòng nhập tên xét nghiệm.', 'error');

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', form.patientId.trim());
      formData.append('testName', form.testName);
      formData.append('testType', form.testType);
      formData.append('notes', form.notes);

      const res = await fetch(`${API_URL}/api/lab-results`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userInfo.token}` },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message, 'success');
        setForm({ patientId: '', testName: '', testType: 'blood', notes: '' });
        setFile(null);
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối, vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toast */}
      <div className={`fixed top-8 right-8 z-50 transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${toast.type === 'error' ? 'border-red-100' : 'border-green-100'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <p className="text-sm font-bold text-gray-800">{toast.message}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner">
          <FlaskConical size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gửi Kết Quả Xét Nghiệm</h1>
          <p className="text-gray-500 mt-1">Nhân viên xét nghiệm - Tải lên và gửi kết quả đến bệnh nhân</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full blur-3xl opacity-50 -z-0 pointer-events-none"></div>

        {/* Patient ID */}
        <div className="relative z-10">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} className="text-primary" /> Mã Bệnh nhân (BN-XXXXXX)
          </label>
          <input
            type="text"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
            placeholder="VD: BN000001"
            value={form.patientId}
            onChange={e => setForm({...form, patientId: e.target.value})}
          />
        </div>

        {/* Test Name & Type */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tên xét nghiệm</label>
            <input
              type="text"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="VD: Công thức máu toàn bộ"
              value={form.testName}
              onChange={e => setForm({...form, testName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Loại xét nghiệm</label>
            <select
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={form.testType}
              onChange={e => setForm({...form, testType: e.target.value})}
            >
              {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="relative z-10">
          <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú kết quả (Tùy chọn)</label>
          <textarea
            rows="3"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
            placeholder="Ví dụ: Bạch cầu hơi cao, cần theo dõi thêm..."
            value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
          ></textarea>
        </div>

        {/* File Upload Zone */}
        <div
          className={`relative z-10 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging ? 'border-teal-400 bg-teal-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
          }`}
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="ml-auto p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all">
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-gray-400" />
              </div>
              <p className="font-bold text-gray-700 mb-1">Kéo thả file vào đây hoặc click để chọn</p>
              <p className="text-sm text-gray-400">Hỗ trợ PDF, JPG, PNG — Tối đa 10MB</p>
            </>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-2xl hover:from-teal-700 hover:to-blue-700 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait relative z-10"
        >
          {loading ? <><Loader2 size={20} className="animate-spin" /> Đang gửi...</> : <><FlaskConical size={20} /> Gửi kết quả tới bệnh nhân</>}
        </button>
      </form>
    </div>
  );
};

export default LabUpload;
