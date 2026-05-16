import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, ChevronRight, CheckCircle2, ChevronDown, User, Printer, X, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';
const authH = () => ({ Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}` });

const STATUS = {
  pending:   { label: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  confirmed: { label: 'Đã xác nhận',  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  completed: { label: 'Đã khám',      color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  cancelled: { label: 'Đã hủy',       color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export default function AppointmentsHistory() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/appointments`, { headers: authH() });
        const data = await res.json();
        if (data.success) {
          setAppts(data.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppts();
  }, []);

  const handleAction = (a) => {
    if (a.status === 'completed') {
      // Navigate to Records with state to open Medical tab
      navigate('/dashboard/records', { state: { activeTab: 'medical', highlightApptId: a._id } });
    } else {
      setTicketModal(a);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-primary" size={32} />
            Thông tin lịch khám
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-2">Toàn bộ lịch sử đặt lịch và phiếu khám bệnh của bạn</p>
        </div>
        <button onClick={() => navigate('/dashboard/booking')}
          className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">
          + Đặt lịch mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        </div>
      ) : appts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <Calendar size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Chưa có lịch khám nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appts.map(a => {
            const st = STATUS[a.status] || STATUS.pending;
            const isCompleted = a.status === 'completed';
            return (
              <div key={a._id} className="bg-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0"
                    style={{ background: st.bg, borderColor: st.border, color: st.color }}>
                    <span className="text-xs font-black uppercase">Th{new Date(a.date).getMonth() + 1}</span>
                    <span className="text-2xl font-black leading-none mt-0.5">{new Date(a.date).getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-1">
                      {a.doctor?.department || 'Khám tổng quát'}
                      <span className="ml-3 px-3 py-1 rounded-full text-xs font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </h3>
                    <p className="text-sm font-medium text-gray-600 mb-2">BS. {a.doctor?.userId?.fullName || 'Phụ trách'}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {a.time}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {new Date(a.date).toLocaleDateString('vi-VN')}</span>
                      {a.ticketNumber && <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-gray-400"/> Phiếu: {a.ticketNumber}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 shrink-0">
                  <button onClick={() => handleAction(a)}
                    className="px-5 py-2 rounded-xl font-bold text-sm transition-all border"
                    style={{
                      background: isCompleted ? '#f8fafc' : '#eff6ff',
                      color: isCompleted ? '#0f172a' : '#2563eb',
                      borderColor: isCompleted ? '#cbd5e1' : '#bfdbfe'
                    }}
                  >
                    {isCompleted ? 'Xem Bệnh án điện tử →' : 'Xem Phiếu khám'}
                  </button>
                  {a.paymentStatus === 'paid' ? (
                    <p className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Đã thanh toán</p>
                  ) : (
                    <p className="text-xs font-bold text-orange-500 flex items-center gap-1"><Clock size={14}/> Chưa thanh toán</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {ticketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <button onClick={() => setTicketModal(null)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
              <X size={18} />
            </button>
            <div className="p-8 print:p-0">
              <div className="text-center mb-6">
                <img src="/LOGO.png" alt="MediCare" className="h-8 mx-auto mb-4 grayscale opacity-80" />
                <h3 className="text-xl font-black uppercase tracking-widest text-gray-800">Phiếu Khám Bệnh</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">Số: {ticketModal.ticketNumber || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Số thứ tự của bạn</p>
                  <p className="text-5xl font-black text-primary">{ticketModal.queueNumber || '00'}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm font-bold text-gray-500">Bệnh nhân</span>
                    <span className="text-sm font-black text-gray-900">{JSON.parse(localStorage.getItem('userInfo'))?.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm font-bold text-gray-500">Bác sĩ</span>
                    <span className="text-sm font-black text-gray-900">BS. {ticketModal.doctor?.userId?.fullName || 'Phụ trách'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm font-bold text-gray-500">Phòng khám</span>
                    <span className="text-sm font-black text-gray-900">{ticketModal.doctor?.department || 'Tổng quát'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-sm font-bold text-gray-500">Thời gian</span>
                    <span className="text-sm font-black text-primary">{ticketModal.time} - {new Date(ticketModal.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <button onClick={handlePrint} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 print:hidden">
                <Printer size={18} /> In Phiếu Khám
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
