import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Calendar, AlertCircle, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function AdminShifts() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [previewDoctor, setPreviewDoctor] = useState(null); // { doctorId, doctorName }
  const [previewSchedule, setPreviewSchedule] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMonth, setPreviewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return userInfo.token;
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (previewDoctor) fetchSchedule(previewDoctor.doctorId);
  }, [previewMonth, previewDoctor]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/shift-requests`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const json = await res.json();
      if (json.success) setRequests(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async (doctorId) => {
    setPreviewLoading(true);
    try {
      const { year, month } = previewMonth;
      const res = await fetch(
        `${API_URL}/api/admin/doctors/${doctorId}/schedule?year=${year}&month=${month}`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
      );
      const json = await res.json();
      if (json.success) setPreviewSchedule(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const openPreview = (doctorId, doctorName) => {
    setPreviewDoctor({ doctorId, doctorName });
    setPreviewSchedule(null);
  };

  const closePreview = () => {
    setPreviewDoctor(null);
    setPreviewSchedule(null);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/shift-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        showToast(status === 'approved' ? 'Đã duyệt yêu cầu ca trực!' : 'Đã từ chối yêu cầu.', status === 'approved' ? 'success' : 'error');
        fetchRequests();
        // Refresh schedule if preview open
        if (previewDoctor) fetchSchedule(previewDoctor.doctorId);
      } else {
        showToast(json.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (err) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  // Group requests by doctor
  const grouped = requests.reduce((acc, r) => {
    const doctorId = r.doctor?._id;
    if (!doctorId) return acc;
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctorId,
        doctorName: r.doctor?.userId?.fullName || 'Ẩn danh',
        department: r.doctor?.department || '',
        requests: []
      };
    }
    acc[doctorId].requests.push(r);
    return acc;
  }, {});

  const groupedList = Object.values(grouped).filter(g =>
    g.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const MONTH_NAMES = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const changeMonth = (delta) => {
    setPreviewMonth(prev => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      return { year: y, month: m };
    });
  };

  if (loading) return <div className="text-center py-10 font-bold text-slate-600">Đang tải...</div>;

  return (
    <div className="space-y-4 animate-in fade-in relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="text-emerald-500 shrink-0" size={20} /> : <XCircle className="text-rose-500 shrink-0" size={20} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 text-sm font-bold">
          <AlertCircle size={18} className="text-yellow-500 shrink-0" />
          Có <span className="text-yellow-600 mx-1">{pendingCount}</span> yêu cầu ca trực đang chờ duyệt
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên bác sĩ, khoa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full"
          />
        </div>
      </div>

      {/* Grouped by doctor */}
      {groupedList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm text-center py-16 text-slate-400">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-sm">Không có yêu cầu nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedList.map(group => {
            const pendingInGroup = group.requests.filter(r => r.status === 'pending').length;
            const isExpanded = expandedDoctor === group.doctorId;
            return (
              <div key={group.doctorId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Doctor header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  onClick={() => setExpandedDoctor(isExpanded ? null : group.doctorId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">
                      {group.doctorName.charAt(group.doctorName.lastIndexOf(' ') + 1) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">BS. {group.doctorName}</p>
                      <p className="text-xs text-slate-500 font-medium">{group.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pendingInGroup > 0 && (
                      <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-black rounded-full">
                        {pendingInGroup} chờ duyệt
                      </span>
                    )}
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                      {group.requests.length} yêu cầu
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openPreview(group.doctorId, group.doctorName); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Eye size={14} /> Xem lịch
                    </button>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </div>

                {/* Requests list */}
                {isExpanded && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {group.requests.map(r => (
                      <div key={r._id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/40 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${r.type === 'add' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {r.type === 'add' ? 'Thêm ca' : 'Hủy ca'}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(r.times || []).map(t => (
                              <span key={t} className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-0.5 ${r.type === 'add' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                <Clock size={9} />{t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {r.status === 'pending' && <span className="text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-yellow-100">Chờ duyệt</span>}
                          {r.status === 'approved' && <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100">Đã duyệt</span>}
                          {r.status === 'rejected' && <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-100">Đã từ chối</span>}
                          {r.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(r._id, 'approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Duyệt">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => updateStatus(r._id, 'rejected')} className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Từ chối">
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Preview Modal */}
      {previewDoctor && (() => {
        // Collect pending requests for this doctor in the viewed month
        const { year, month } = previewMonth;
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const pendingReqs = requests.filter(r =>
          r.doctor?._id === previewDoctor.doctorId &&
          r.status === 'pending' &&
          r.date?.startsWith(monthStr)
        );
        // Map pending by date
        const pendingByDate = pendingReqs.reduce((acc, r) => {
          if (!acc[r.date]) acc[r.date] = [];
          acc[r.date].push(r);
          return acc;
        }, {});

        // Dates with pending but not in schedule
        const scheduleDates = new Set((previewSchedule?.schedule || []).map(s => s.date));
        const pendingOnlyDates = Object.keys(pendingByDate).filter(d => !scheduleDates.has(d));

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4" onClick={closePreview}>
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Modal header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Lịch trực — BS. {previewDoctor.doctorName}</h3>
                  {previewSchedule && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Ca làm việc: <span className="font-bold text-indigo-600">{previewSchedule.doctor?.shiftPattern || 'Cả tuần'}</span>
                      {pendingReqs.length > 0 && (
                        <span className="ml-3 text-yellow-600 font-bold">• {pendingReqs.length} yêu cầu chờ duyệt</span>
                      )}
                    </p>
                  )}
                </div>
                <button onClick={closePreview} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Month nav */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600 font-bold">‹</button>
                <span className="font-black text-slate-700">{MONTH_NAMES[previewMonth.month]} {previewMonth.year}</span>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600 font-bold">›</button>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-6 py-2.5 bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-3 rounded-sm bg-white border border-slate-200 inline-block"></span>Ca trực</span>
                <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300 inline-block"></span>Chờ thêm</span>
                <span className="flex items-center gap-1.5 text-rose-600"><span className="w-3 h-3 rounded-sm bg-rose-100 border border-rose-300 inline-block"></span>Chờ hủy</span>
              </div>

              {/* Schedule content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {previewLoading ? (
                  <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 rounded-full" /></div>
                ) : (
                  <>
                    {(previewSchedule?.schedule?.length > 0 || pendingOnlyDates.length > 0) ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {/* Days with approved schedule */}
                        {(previewSchedule?.schedule || []).map(s => {
                          const dateObj = new Date(s.date + 'T00:00:00');
                          const isToday = new Date().toDateString() === dateObj.toDateString();
                          const pendingForDay = pendingByDate[s.date] || [];
                          const hasPending = pendingForDay.length > 0;
                          return (
                            <div key={s.date} className={`p-3 border rounded-xl transition-all ${hasPending ? 'border-yellow-300 bg-yellow-50/40' : isToday ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 bg-slate-50/50'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-black ${isToday ? 'text-indigo-600' : 'text-slate-600'}`}>{DAY_NAMES[s.dayOfWeek]}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isToday ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                  {dateObj.getDate()}/{dateObj.getMonth() + 1}
                                </span>
                              </div>
                              {/* Current approved times */}
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {s.times.map(t => (
                                  <span key={t} className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded-md text-slate-600">{t}</span>
                                ))}
                              </div>
                              {/* Pending requests for this day */}
                              {pendingForDay.map(pr => (
                                <div key={pr._id} className={`mt-1 pt-1.5 border-t ${pr.type === 'add' ? 'border-emerald-200' : 'border-rose-200'}`}>
                                  <p className={`text-[9px] font-black uppercase mb-1 ${pr.type === 'add' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    ⏳ Chờ {pr.type === 'add' ? 'thêm' : 'hủy'}:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {(pr.times || []).map(t => (
                                      <span key={t} className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${pr.type === 'add' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-rose-100 text-rose-700 border-rose-300'}`}>{t}</span>
                                    ))}
                                  </div>
                                  <div className="flex gap-1 mt-1.5">
                                    <button onClick={() => updateStatus(pr._id, 'approved')} className="flex-1 text-[9px] font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md py-1 transition-colors">✓ Duyệt</button>
                                    <button onClick={() => updateStatus(pr._id, 'rejected')} className="flex-1 text-[9px] font-black text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md py-1 transition-colors">✕ Từ chối</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}

                        {/* Days that only have pending (not yet in schedule) */}
                        {pendingOnlyDates.sort().map(dateStr => {
                          const dateObj = new Date(dateStr + 'T00:00:00');
                          const dow = dateObj.getDay();
                          const pendingForDay = pendingByDate[dateStr] || [];
                          return (
                            <div key={dateStr} className="p-3 border border-yellow-300 bg-yellow-50/60 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-yellow-700">{DAY_NAMES[dow]}</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200">
                                  {dateObj.getDate()}/{dateObj.getMonth() + 1}
                                </span>
                              </div>
                              <p className="text-[9px] text-yellow-600 font-bold mb-1">Ngày không có ca trực</p>
                              {pendingForDay.map(pr => (
                                <div key={pr._id} className="mt-1 pt-1 border-t border-emerald-200">
                                  <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">⏳ Chờ thêm ca:</p>
                                  <div className="flex flex-wrap gap-1 mb-1.5">
                                    {(pr.times || []).map(t => (
                                      <span key={t} className="px-1.5 py-0.5 text-[10px] font-bold rounded-md border bg-emerald-100 text-emerald-700 border-emerald-300">{t}</span>
                                    ))}
                                  </div>
                                  <div className="flex gap-1">
                                    <button onClick={() => updateStatus(pr._id, 'approved')} className="flex-1 text-[9px] font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md py-1 transition-colors">✓ Duyệt</button>
                                    <button onClick={() => updateStatus(pr._id, 'rejected')} className="flex-1 text-[9px] font-black text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md py-1 transition-colors">✕ Từ chối</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium text-sm">Không có ngày trực nào trong tháng này.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
