import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';

const ALL_TIMES = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];

const DoctorShifts = () => {
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [type, setType] = useState('add');
  const [date, setDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getAuthHeaders = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resReq, resProf] = await Promise.all([
        fetch(`${API_URL}/api/doctors/shift-requests`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/doctors/profile`, { headers: getAuthHeaders() })
      ]);
      const dataReq = await resReq.json();
      const dataProf = await resProf.json();

      let reqs = [];
      if (dataReq.success) {
        reqs = dataReq.data;
        setRequests(reqs);
      }
      if (dataProf.success) {
        setProfile(dataProf.data.profile);
        generateSchedule(dataProf.data.profile, reqs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = (doctor, reqs) => {
    const pattern = doctor.shiftPattern || 'Cả tuần';
    const baseTimes = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];
    const days = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayOfWeek = d.getDay();

      if (dayOfWeek === 0) continue; // Skip Sunday

      let isWorkingDay = false;
      if (pattern === 'Cả tuần') isWorkingDay = true;
      else if (pattern === 'T2-T3-T4' && [1, 2, 3].includes(dayOfWeek)) isWorkingDay = true;
      else if (pattern === 'T5-T6-T7' && [4, 5, 6].includes(dayOfWeek)) isWorkingDay = true;
      else if (pattern === 'T2-T4-T6' && [1, 3, 5].includes(dayOfWeek)) isWorkingDay = true;
      else if (pattern === 'T3-T5-T7' && [2, 4, 6].includes(dayOfWeek)) isWorkingDay = true;

      let times = isWorkingDay ? [...baseTimes] : [];

      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // Direct string comparison — avoids timezone issues
      const approvedReqs = reqs.filter(r =>
        r.status === 'approved' && String(r.date).slice(0, 10) === dateString
      );

      for (const r of approvedReqs) {
        for (const t of (r.times || [])) {
          if (r.type === 'add' && !times.includes(t)) {
            times.push(t);
          } else if (r.type === 'cancel') {
            times = times.filter(x => x !== t);
          }
        }
      }

      times.sort();
      // Only show days that actually have shifts
      if (times.length > 0) {
        days.push({ date: d, times });
      }
    }
    setSchedule(days);
  };

  const toggleTime = (t) => {
    setSelectedTimes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return showToast('Vui lòng chọn ngày', 'error');
    if (selectedTimes.length === 0) return showToast('Vui lòng chọn ít nhất một khung giờ', 'error');

    setSubmitting(true);
    try {
      // Send ONE request with all selected times
      const res = await fetch(`${API_URL}/api/doctors/shift-requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, date, times: selectedTimes.sort() })
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Đã gửi yêu cầu thành công (${selectedTimes.length} khung giờ)!`, 'success');
        fetchData();
        setDate('');
        setSelectedTimes([]);
      } else {
        showToast(data.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1 w-max"><CheckCircle size={14} /> Đã duyệt</span>;
      case 'rejected': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1 w-max"><XCircle size={14} /> Từ chối</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1 w-max"><Clock size={14} /> Chờ duyệt</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          toast.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
          'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="text-emerald-500 shrink-0" size={20} /> :
           toast.type === 'warning' ? <AlertCircle className="text-yellow-500 shrink-0" size={20} /> :
           <XCircle className="text-rose-500 shrink-0" size={20} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Thời gian trực khám</h1>
          <p className="text-gray-500 mt-2">Quản lý ca trực và yêu cầu thay đổi lịch trình của bạn</p>
        </div>
      </div>

      {/* Create Request Form */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Tạo yêu cầu mới</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Loại yêu cầu</label>
              <select
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                value={type}
                onChange={(e) => { setType(e.target.value); setSelectedTimes([]); }}
              >
                <option value="add">Thêm ca trực</option>
                <option value="cancel">Hủy ca trực</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ngày</label>
              <input
                type="date"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                value={date}
                onChange={(e) => { setDate(e.target.value); setSelectedTimes([]); }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">
              Chọn khung giờ <span className="text-primary normal-case">(có thể chọn nhiều)</span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {ALL_TIMES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTime(t)}
                  className={`py-3 rounded-xl text-sm font-black border-2 transition-all ${
                    selectedTimes.includes(t)
                      ? type === 'add'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-200'
                        : 'border-red-400 bg-red-50 text-red-700 shadow-sm shadow-red-200'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-primary/30 hover:text-gray-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {selectedTimes.length > 0 && (
              <p className="mt-3 text-xs text-gray-500 font-medium">
                Đã chọn: <span className="font-bold text-primary">{selectedTimes.sort().join(', ')}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || selectedTimes.length === 0 || !date}
            className={`w-full py-4 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 shadow-lg ${
              submitting || selectedTimes.length === 0 || !date
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : type === 'add'
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-red-200'
            }`}
          >
            {submitting ? (
              <><div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" /> Đang gửi...</>
            ) : (
              <><Send size={18} /> Gửi {selectedTimes.length > 0 ? `${selectedTimes.length} yêu cầu` : 'yêu cầu'}</>
            )}
          </button>
        </form>
      </div>

      {/* 30-day Schedule */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Lịch trực 30 ngày tới</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Lịch làm việc cơ bản của bạn là:{' '}
          <span className="font-bold text-primary">{profile?.shiftPattern || 'Cả tuần'}</span>
        </p>

        {loading ? (
          <div className="text-center py-6"><div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mx-auto" /></div>
        ) : schedule.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {schedule.map((s, idx) => {
              const isToday = new Date().toDateString() === s.date.toDateString();
              return (
                <div key={idx} className={`p-4 border rounded-2xl transition-all shadow-sm ${isToday ? 'border-primary bg-primary/5 shadow-primary/10' : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-md'}`}>
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                    <p className={`text-sm font-black ${isToday ? 'text-primary' : 'text-gray-800'}`}>
                      {s.date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </p>
                    <p className={`text-xs font-bold ${isToday ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'} px-2 py-1 rounded-md`}>
                      {s.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.times.length > 0 ? s.times.map(t => (
                      <span key={t} className="px-2 py-1 text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                        {t}
                      </span>
                    )) : (
                      <span className="text-xs font-medium text-gray-400 italic">Nghỉ</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm font-medium">Bạn không có ca trực nào trong 30 ngày tới.</div>
        )}
      </div>

      {/* Request History */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Lịch sử yêu cầu</h2>
        {loading ? (
          <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto" /></div>
        ) : requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.type === 'add' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {req.type === 'add' ? <Plus size={20} /> : <Trash2 size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{req.type === 'add' ? 'Yêu cầu thêm ca' : 'Yêu cầu hủy ca'}</h3>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-0.5">
                      <Calendar size={12} /> {new Date(req.date).toLocaleDateString('vi-VN')}
                      <Clock size={12} className="ml-1" /> {req.time}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium text-sm">Chưa có yêu cầu nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorShifts;
