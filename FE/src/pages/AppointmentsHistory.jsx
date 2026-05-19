import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, CheckCircle2, X, CreditCard, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

// const API_URL = API_URL;
const authH = () => ({ Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}` });

const trans = {
  vi: {
    title: 'Thông tin lịch khám',
    sub: 'Toàn bộ lịch sử đặt lịch và phiếu khám bệnh của bạn',
    newBooking: '+ Đặt lịch mới',
    loading: 'Đang tải lịch khám...',
    noAppts: 'Chưa có lịch khám nào',
    viewRecords: 'Xem Bệnh án →',
    viewTicket: 'Xem Phiếu khám',
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    ticketTitle: 'Phiếu Khám Bệnh',
    ticketNo: 'Số:',
    queueNoLabel: 'Số thứ tự của bạn',
    patient: 'Bệnh nhân',
    doctor: 'Bác sĩ',
    clinicRoom: 'Phòng khám',
    time: 'Thời gian',
    printTicket: 'In Phiếu Khám',
    generalDept: 'Khám tổng quát',
    doctorTitle: 'Bác sĩ phụ trách',

    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Đã khám',
    cancelled: 'Đã hủy',
  },
  en: {
    title: 'Appointments History',
    sub: 'Comprehensive logs of your scheduled bookings and clinical cards',
    newBooking: '+ New Appointment',
    loading: 'Loading clinical records...',
    noAppts: 'No clinical appointments scheduled yet',
    viewRecords: 'Clinical Record →',
    viewTicket: 'View Ticket',
    paid: 'Paid',
    unpaid: 'Unpaid',
    ticketTitle: 'Clinical Ticket',
    ticketNo: 'No:',
    queueNoLabel: 'Your Queue Number',
    patient: 'Patient',
    doctor: 'Physician',
    clinicRoom: 'Clinic Room',
    time: 'Schedule',
    printTicket: 'Print Ticket',
    generalDept: 'General Consultation',
    doctorTitle: 'Attending Physician',

    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
};

export default function AppointmentsHistory() {
  const { lang, t } = useTranslation(trans);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState(null);
  const navigate = useNavigate();

  const STATUS = {
    pending:   { label: t.pending, color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
    confirmed: { label: t.confirmed,  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    completed: { label: t.completed,      color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
    cancelled: { label: t.cancelled,       color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  };

  const getDoctorDisplayName = (name) => {
    if (!name) return t.doctorTitle;
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
      'Khoa Tai Mũi Họng': 'Otorhinolaryngology (ENT)',
      'Khoa Mắt': 'Ophthalmology',
      'Khoa Răng Hàm Mặt': 'Odonto-Stomatology',
      'Khoa Tim mạch': 'Cardiology',
      'Khoa Thần kinh': 'Neurology',
      'Khoa Cơ xương khớp': 'Orthopedics & Rheumatology',
      'Khoa Cấp cứu': 'Emergency Department',
      'Khoa Xét nghiệm': 'Laboratory Medicine',
      'Khoa Chẩn đoán hình ảnh': 'Diagnostic Imaging',
      'Ngoại tổng quát': 'General Surgery',
      'Nội tổng quát': 'General Internal Medicine',
    };
    return deptsMap[dept] || dept;
  };

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
    navigate(`/dashboard/appointment/${a._id}`);
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-primary animate-pulse-slow" size={32} />
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-2">{t.sub}</p>
        </div>
        <button onClick={() => navigate('/dashboard/booking')}
          className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">
          {t.newBooking}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        </div>
      ) : appts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <Calendar size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t.noAppts}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appts.map(a => {
            const st = STATUS[a.status] || STATUS.pending;
            const isCompleted = a.status === 'completed';
            const apptDateObj = new Date(a.date);
            const apptMonth = lang === 'vi' ? `Th${apptDateObj.getMonth() + 1}` : apptDateObj.toLocaleDateString('en-US', { month: 'short' });
            return (
              <div key={a._id} className="bg-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0"
                    style={{ background: st.bg, borderColor: st.border, color: st.color }}>
                    <span className="text-xs font-black uppercase">{apptMonth}</span>
                    <span className="text-2xl font-black leading-none mt-0.5">{apptDateObj.getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center flex-wrap gap-2">
                      {a.doctor?.department || t.generalDept}
                      {a.status !== 'completed' && a.status !== 'cancelled' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setTicketModal(a);
                          }}
                          className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 duration-150"
                          style={{ cursor: 'pointer' }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <path d="m9 15 2 2 4-4"/>
                          </svg>
                          {lang === 'vi' ? 'Xem phiếu STT' : 'View Ticket'}
                        </button>
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </h3>
                    <p className="text-sm font-medium text-gray-600 mb-2">{getDoctorDisplayName(a.doctor?.userId?.fullName)}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {a.time}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {lang === 'vi' ? apptDateObj.toLocaleDateString('vi-VN') : apptDateObj.toLocaleDateString('en-US')}</span>
                      {a.ticketNumber && <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-gray-400"/> {t.viewTicket}: {a.ticketNumber}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 shrink-0">
                  <button onClick={() => handleAction(a)}
                    className="px-5 py-2 rounded-xl font-bold text-sm transition-all border bg-blue-50 text-primary border-blue-100 hover:bg-primary hover:text-white shadow-sm shrink-0"
                  >
                    {isCompleted ? t.viewRecords : t.viewTicket}
                  </button>
                  {a.paymentStatus === 'paid' ? (
                    <p className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> {t.paid}</p>
                  ) : (
                    <p className="text-xs font-bold text-orange-500 flex items-center gap-1"><Clock size={14}/> {t.unpaid}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {ticketModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#fff', borderRadius: 32, width: '100%', maxWidth: 400,
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #f1f5f9',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            {/* Ticket Header with Colorful Project Logo */}
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px dashed #cbd5e1', textAlign: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <img src="/LOGO.png" alt="MediCare" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', margin: '8px 0 0', color: '#1e293b' }}>
                {lang === 'vi' ? 'PHIẾU HẸN & SỐ THỨ TỰ' : 'QUEUE TICKET'}
              </h3>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: 600, margin: '4px 0 0' }}>
                {lang === 'vi' ? 'Hệ thống Y tế thông minh MediCare' : 'MediCare Smart Hospital System'}
              </p>
              
              {/* Left/Right ticket notches */}
              <div style={{ position: 'absolute', left: -8, bottom: -8, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', zIndex: 10 }} />
              <div style={{ position: 'absolute', right: -8, bottom: -8, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', zIndex: 10 }} />
            </div>

            {/* Ticket Body */}
            <div style={{ padding: 24 }}>
              {/* Big Queue Number */}
              <div style={{ background: '#f0f7ff', border: '1px solid #e0f2fe', borderRadius: 16, padding: '16px 0', textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{lang === 'vi' ? 'Số Thứ Tự Của Bạn' : 'Your Queue Number'}</p>
                <div style={{
                  display: 'inline-flex', width: 88, height: 88, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #102a63 0%, #2563eb 100%)', color: '#fff',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 32,
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)', margin: '8px 0'
                }}>
                  #{ticketModal.queueNumber || '01'}
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, margin: '6px 0 0', color: '#64748b' }}>{lang === 'vi' ? 'Vui lòng theo dõi bảng điện tử tại sảnh chờ' : 'Please watch the monitor in the waiting hall'}</p>
              </div>

              {/* Ticket Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>{lang === 'vi' ? 'Mã ca khám:' : 'Ticket ID:'}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#1e293b', fontSize: 14 }}>{ticketModal.ticketNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>{lang === 'vi' ? 'Bệnh nhân:' : 'Patient:'}</span>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>{JSON.parse(localStorage.getItem('userInfo') || '{}')?.fullName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>{lang === 'vi' ? 'Bác sĩ khám:' : 'Physician:'}</span>
                  <span style={{ fontWeight: 800, color: '#102a63' }}>{getDoctorDisplayName(ticketModal.doctor?.userId?.fullName)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>{lang === 'vi' ? 'Chuyên khoa:' : 'Department:'}</span>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>{getLocalizedDept(ticketModal.doctor?.department)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>{lang === 'vi' ? 'Thời gian:' : 'Schedule:'}</span>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>{ticketModal.time} • {new Date(ticketModal.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
                </div>
              </div>

              {/* Dummy Barcode using high-tech SVGs */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
                <svg style={{ width: 256, height: 48 }} overflow="visible">
                  {[...Array(32)].map((_, i) => (
                    <rect 
                      key={i} 
                      x={i * 8} 
                      y={0} 
                      width={i % 3 === 0 ? 4 : i % 5 === 0 ? 1 : 2} 
                      height={48} 
                      fill="#1e293b" 
                    />
                  ))}
                </svg>
                <p style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'monospace', margin: '8px 0 0', letterSpacing: '0.15em' }}>{ticketModal._id}</p>
              </div>
            </div>

            {/* Ticket Footer Buttons */}
            <div style={{ background: '#f8fafc', padding: '16px 24px', display: 'flex', gap: 12, borderTop: '1px solid #f1f5f9' }}>
              <button 
                onClick={() => window.print()}
                style={{
                  flex: 1, padding: '10px 0', background: '#102a63', color: '#fff',
                  fontSize: 12, fontWeight: 700, borderRadius: 12, border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 4px 6px -1px rgba(16, 42, 99, 0.2)'
                }}
              >
                <Printer size={14} />
                {lang === 'vi' ? 'In phiếu' : 'Print Ticket'}
              </button>
              <button 
                onClick={() => setTicketModal(null)}
                style={{
                  padding: '10px 16px', background: '#e2e8f0', color: '#475569',
                  fontSize: 12, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer'
                }}
              >
                {lang === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
