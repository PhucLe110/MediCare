import React, { useState, useEffect } from 'react';
import {
  Calendar, FlaskConical, Pill, CreditCard, ChevronRight,
  Stethoscope, TrendingUp, Clock, CheckCircle2, AlertCircle,
  Bell, Sparkles, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';
const authH = () => ({ Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}` });
const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const STATUS = {
  pending:   { label: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7' },
  confirmed: { label: 'Đã xác nhận',  color: '#2563eb', bg: '#dbeafe' },
  completed: { label: 'Đã khám',      color: '#059669', bg: '#d1fae5' },
  cancelled: { label: 'Đã hủy',       color: '#dc2626', bg: '#fee2e2' },
};

const timeAgo = (t) => {
  const s = (Date.now() - new Date(t)) / 1000;
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
};

export default function Dashboard() {
  const [user, setUser]         = useState(null);
  const [appts, setAppts]       = useState([]);
  const [bills, setBills]       = useState([]);
  const [labs, setLabs]         = useState([]);
  const [rxs, setRxs]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!u) return navigate('/login');
    setUser(u);
    (async () => {
      try {
        const [ar, br, lr, rxr] = await Promise.all([
          fetch(`${API}/api/appointments`, { headers: authH() }),
          fetch(`${API}/api/bills/my`, { headers: authH() }),
          fetch(`${API}/api/lab-results/my`, { headers: authH() }),
          fetch(`${API}/api/prescriptions/my`, { headers: authH() }),
        ]);
        const [ad, bd, ld, rxd] = await Promise.all([ar.json(), br.json(), lr.json(), rxr.json()]);
        if (ad.success) setAppts(ad.data);
        if (bd.success) setBills(bd.data);
        if (ld.success) setLabs(ld.data);
        if (rxd.success) setRxs(rxd.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const upcoming    = appts.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const completed   = appts.filter(a => a.status === 'completed');
  const paidTotal   = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.totalAmount, 0);
  const unpaidBills = bills.filter(b => b.status === 'unpaid');

  // Check 1-hour reminder
  const soonAppts = upcoming.filter(a => {
    const apptTime = new Date(`${a.date}T${a.time}`);
    const diff = (apptTime - Date.now()) / 60000;
    return diff >= 0 && diff <= 60;
  });

  // Build notifications for panel
  const notifs = [];
  soonAppts.forEach(a => notifs.push({
    id: `soon-${a._id}`, urgent: true, icon: Clock, color: '#dc2626', bg: '#fef2f2',
    title: 'Sắp đến giờ khám!',
    desc: `BS. ${a.doctor?.userId?.fullName || 'Phụ trách'} lúc ${a.time} hôm nay`,
    time: new Date(),
  }));
  unpaidBills.forEach(b => notifs.push({
    id: `bill-${b._id}`, urgent: true, icon: CreditCard, color: '#d97706', bg: '#fef3c7',
    title: 'Hóa đơn chờ thanh toán',
    desc: fmt(b.totalAmount),
    time: b.createdAt,
    link: '/dashboard/billing',
  }));
  upcoming.filter(a => !soonAppts.includes(a)).slice(0, 2).forEach(a => notifs.push({
    id: `appt-${a._id}`, icon: Calendar, color: '#2563eb', bg: '#dbeafe',
    title: `Lịch khám: ${a.doctor?.department || 'Tổng quát'}`,
    desc: `${a.time} — ${new Date(a.date).toLocaleDateString('vi-VN')}`,
    time: a.createdAt,
    link: '/dashboard/booking',
  }));
  labs.slice(0, 1).forEach(l => notifs.push({
    id: `lab-${l._id}`, icon: FlaskConical, color: '#7c3aed', bg: '#ede9fe',
    title: 'Kết quả xét nghiệm mới',
    desc: l.testName || 'Xem chi tiết',
    time: l.createdAt,
    link: '/dashboard/lab-results',
  }));

  const STATS = [
    { label: 'Lịch hẹn', value: upcoming.length, sub: `${completed.length} đã khám`, icon: Calendar, color: '#2563eb', bg: '#dbeafe', link: '/dashboard/booking' },
    { label: 'Xét nghiệm', value: labs.length, sub: 'kết quả', icon: FlaskConical, color: '#7c3aed', bg: '#ede9fe', link: '/dashboard/lab-results' },
    { label: 'Đơn thuốc', value: rxs.length, sub: 'đơn thuốc', icon: Pill, color: '#059669', bg: '#d1fae5', link: '/dashboard/prescriptions' },
    { label: 'Đã thanh toán', value: fmt(paidTotal), sub: `${bills.filter(b=>b.status==='paid').length} hóa đơn`, icon: CreditCard, color: '#d97706', bg: '#fef3c7', link: '/dashboard/billing', money: true },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 4px' }}>

      {/* ── HERO GREETING ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1a56db 100%)',
        borderRadius: 28, padding: '36px 40px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 16px 48px rgba(26,86,219,0.2)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 100, width: 160, height: 160, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 8 }}>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.2 }}>
            Xin chào, {user?.fullName?.split(' ').slice(-1)[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            {upcoming.length > 0
              ? `Bạn có ${upcoming.length} lịch hẹn sắp tới`
              : 'Chúc bạn một ngày sức khỏe tốt lành'}
          </p>
        </div>
        {soonAppts.length > 0 && (
          <div onClick={() => navigate('/dashboard/booking')} style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
            borderRadius: 20, padding: '18px 24px', cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', animation: 'pulse 1s infinite' }} />
              <p style={{ fontSize: 11, fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sắp đến giờ khám!</p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{soonAppts[0].time}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>BS. {soonAppts[0].doctor?.userId?.fullName || 'Phụ trách'}</p>
          </div>
        )}
        {unpaidBills.length > 0 && soonAppts.length === 0 && (
          <div onClick={() => navigate('/dashboard/billing')} style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
            borderRadius: 20, padding: '18px 24px', cursor: 'pointer',
            border: '1px solid rgba(255,165,0,0.4)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <AlertCircle size={14} color="#fbbf24" />
              <p style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{unpaidBills.length} hóa đơn chưa trả</p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{fmt(unpaidBills.reduce((s,b)=>s+b.totalAmount,0))}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Bấm để thanh toán →</p>
          </div>
        )}
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} onClick={() => navigate(s.link)}
            style={{ background: '#fff', borderRadius: 20, padding: '20px 22px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${s.color}30` }}>
                <s.icon size={22} style={{ color: s.color }} />
              </div>
              <ArrowUpRight size={16} style={{ color: '#cbd5e1', marginTop: 4 }} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: s.money ? 16 : 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* Appointments */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                <Calendar size={18} color="#2563eb" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Lịch hẹn của bạn</h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/dashboard/history')}
                style={{ fontSize: 12, fontWeight: 700, color: '#475569', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#cbd5e1'}
                onMouseLeave={e => e.currentTarget.style.background = '#e2e8f0'}
              >
                Xem tất cả
              </button>
              <button onClick={() => navigate('/dashboard/booking')}
                style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
              >
                + Đặt lịch mới
              </button>
            </div>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
            {loading ? (
              <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            ) : appts.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#94a3b8' }}>
                <Calendar size={48} strokeWidth={1} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Chưa có lịch hẹn</p>
              </div>
            ) : appts.slice(0, 5).map(a => {
              const st = STATUS[a.status] || STATUS.pending;
              const isSoon = soonAppts.some(s => s._id === a._id);
              return (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: isSoon ? '#fff7f7' : 'transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => !isSoon && (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => !isSoon && (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: st.bg, border: `1px solid ${st.color}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: st.color, lineHeight: 1, textTransform: 'uppercase' }}>Th{new Date(a.date).getMonth()+1}</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: st.color, lineHeight: 1 }}>{new Date(a.date).getDate()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', lineHeight: 1.3 }}>
                      BS. {a.doctor?.userId?.fullName || 'Phụ trách'}
                      {isSoon && <span style={{ marginLeft: 8, fontSize: 10, background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 999, fontWeight: 800 }}>Sắp đến!</span>}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 600 }}>
                      {a.doctor?.department || 'Khoa tổng quát'} • {a.time}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: st.color, background: st.bg, padding: '5px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Banner Image */}
        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', maxHeight: 480 }}>
          <img src="https://i.pinimg.com/736x/2c/8a/90/2c8a9004feae986bbc7282ba4aa8cda2.jpg" alt="Promo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 20 }}>
        {[
          { label: 'Đặt lịch khám', icon: Calendar, color: '#2563eb', bg: '#dbeafe', link: '/dashboard/booking' },
          { label: 'Kết quả XN', icon: FlaskConical, color: '#7c3aed', bg: '#ede9fe', link: '/dashboard/lab-results' },
          { label: 'Đơn thuốc', icon: Pill, color: '#059669', bg: '#d1fae5', link: '/dashboard/prescriptions' },
          { label: 'Thanh toán', icon: CreditCard, color: '#d97706', bg: '#fef3c7', link: '/dashboard/billing' },
        ].map(q => (
          <div key={q.label} onClick={() => navigate(q.link)}
            style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 13, background: q.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${q.color}30` }}>
              <q.icon size={20} style={{ color: q.color }} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>{q.label}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
