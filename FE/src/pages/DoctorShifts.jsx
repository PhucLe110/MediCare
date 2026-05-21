import React, { useState, useEffect } from 'react';
import { API_URL, authFetch } from '../config';
import { Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { getLocale } from '../utils/i18nHelpers';

const ALL_TIMES = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];

const trans = {
  vi: {
    errSelectDate: 'Vui lòng chọn ngày',
    errSelectTime: 'Vui lòng chọn ít nhất một khung giờ',
    submitSuccess: (n) => `Đã gửi yêu cầu thành công (${n} khung giờ)!`,
    errGeneric: 'Có lỗi xảy ra',
    errRetry: 'Có lỗi xảy ra, vui lòng thử lại',
    statusApproved: 'Đã duyệt',
    statusRejected: 'Từ chối',
    statusPending: 'Chờ duyệt',
    title: 'Thời gian trực khám',
    subtitle: 'Quản lý ca trực và yêu cầu thay đổi lịch trình của bạn',
    newRequest: 'Tạo yêu cầu mới',
    requestType: 'Loại yêu cầu',
    addShift: 'Thêm ca trực',
    cancelShift: 'Hủy ca trực',
    dateLabel: 'Ngày',
    timeSlots: 'Chọn khung giờ',
    multiSelect: '(có thể chọn nhiều)',
    selected: 'Đã chọn:',
    sending: 'Đang gửi...',
    sendRequest: 'Gửi yêu cầu',
    sendN: (n) => `Gửi ${n} yêu cầu`,
    schedule30: 'Lịch trực 30 ngày tới',
    basePattern: 'Lịch làm việc cơ bản của bạn là:',
    fullWeek: 'Cả tuần',
    off: 'Nghỉ',
    noShifts30: 'Bạn không có ca trực nào trong 30 ngày tới.',
    history: 'Lịch sử yêu cầu',
    reqAdd: 'Yêu cầu thêm ca',
    reqCancel: 'Yêu cầu hủy ca',
    noHistory: 'Chưa có yêu cầu nào.',
  },
  en: {
    errSelectDate: 'Please select a date',
    errSelectTime: 'Please select at least one time slot',
    submitSuccess: (n) => `Request sent successfully (${n} slot(s))!`,
    errGeneric: 'Something went wrong',
    errRetry: 'An error occurred, please try again',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusPending: 'Pending',
    title: 'Shift Schedule',
    subtitle: 'Manage your shifts and schedule change requests',
    newRequest: 'New request',
    requestType: 'Request type',
    addShift: 'Add shift',
    cancelShift: 'Cancel shift',
    dateLabel: 'Date',
    timeSlots: 'Time slots',
    multiSelect: '(multiple allowed)',
    selected: 'Selected:',
    sending: 'Sending...',
    sendRequest: 'Submit request',
    sendN: (n) => `Submit ${n} request(s)`,
    schedule30: 'Next 30 days',
    basePattern: 'Your base schedule:',
    fullWeek: 'Full week',
    off: 'Off',
    noShifts30: 'No shifts in the next 30 days.',
    history: 'Request history',
    reqAdd: 'Add shift request',
    reqCancel: 'Cancel shift request',
    noHistory: 'No requests yet.',
  },
};

const DoctorShifts = () => {
  const { lang, t } = useTranslation(trans);
  const locale = getLocale(lang);
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

  const jsonHeaders = () => ({ 'Content-Type': 'application/json' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resReq, resProf] = await Promise.all([
        authFetch(`${API_URL}/api/doctors/shift-requests`),
        authFetch(`${API_URL}/api/doctors/profile`),
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
    if (!date) return showToast(t.errSelectDate, 'error');
    if (selectedTimes.length === 0) return showToast(t.errSelectTime, 'error');

    setSubmitting(true);
    try {
      // Send ONE request with all selected times
      const res = await authFetch(`${API_URL}/api/doctors/shift-requests`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ type, date, times: selectedTimes.sort() })
      });
      const data = await res.json();

      if (data.success) {
        showToast(t.submitSuccess(selectedTimes.length), 'success');
        fetchData();
        setDate('');
        setSelectedTimes([]);
      } else {
        showToast(data.message || t.errGeneric, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t.errRetry, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1 w-max"><CheckCircle size={14} /> {t.statusApproved}</span>;
      case 'rejected': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1 w-max"><XCircle size={14} /> {t.statusRejected}</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1 w-max"><Clock size={14} /> {t.statusPending}</span>;
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
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h1>
          <p className="text-gray-500 mt-2">{t.subtitle}</p>
        </div>
      </div>

      {/* Create Request Form */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">{t.newRequest}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.requestType}</label>
              <select
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                value={type}
                onChange={(e) => { setType(e.target.value); setSelectedTimes([]); }}
              >
                <option value="add">{t.addShift}</option>
                <option value="cancel">{t.cancelShift}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.dateLabel}</label>
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
              {t.timeSlots} <span className="text-primary normal-case">{t.multiSelect}</span>
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
                {t.selected} <span className="font-bold text-primary">{selectedTimes.sort().join(', ')}</span>
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
              <><div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" /> {t.sending}</>
            ) : (
              <><Send size={18} /> {selectedTimes.length > 0 ? t.sendN(selectedTimes.length) : t.sendRequest}</>
            )}
          </button>
        </form>
      </div>

      {/* 30-day Schedule */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-2 text-gray-800">{t.schedule30}</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          {t.basePattern}{' '}
          <span className="font-bold text-primary">{profile?.shiftPattern || t.fullWeek}</span>
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
                      {s.date.toLocaleDateString(locale, { weekday: 'short' })}
                    </p>
                    <p className={`text-xs font-bold ${isToday ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'} px-2 py-1 rounded-md`}>
                      {s.date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.times.length > 0 ? s.times.map(t => (
                      <span key={t} className="px-2 py-1 text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                        {t}
                      </span>
                    )) : (
                      <span className="text-xs font-medium text-gray-400 italic">{t.off}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm font-medium">{t.noShifts30}</div>
        )}
      </div>

      {/* Request History */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">{t.history}</h2>
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
                    <h3 className="font-bold text-gray-800 text-sm">{req.type === 'add' ? t.reqAdd : t.reqCancel}</h3>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-0.5">
                      <Calendar size={12} /> {new Date(req.date).toLocaleDateString(locale)}
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
            <p className="font-medium text-sm">{t.noHistory}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorShifts;
