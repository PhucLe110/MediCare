import React, { useState, useEffect } from 'react';
import { Bell, Calendar, FlaskConical, Pill, CreditCard, CheckCircle2, Clock, ChevronRight, AlertCircle, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';
const authH = () => ({ Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}` });
const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const timeAgo = (t) => {
  const s = (Date.now() - new Date(t)) / 1000;
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} ngày trước`;
  return new Date(t).toLocaleDateString('vi-VN');
};

const timeUntil = (date, time) => {
  const apptTime = new Date(`${date}T${time}`);
  const mins = Math.round((apptTime - Date.now()) / 60000);
  if (mins <= 0) return 'Đã đến giờ';
  if (mins < 60) return `còn ${mins} phút`;
  return `còn ${Math.round(mins/60)} giờ`;
};

export default function Notifications() {
  const [appts, setAppts]   = useState([]);
  const [bills, setBills]   = useState([]);
  const [labs, setLabs]     = useState([]);
  const [rxs, setRxs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
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

  // Build all notifications
  const all = [];

  // 1. 1-hour appointment reminders
  appts.filter(a => a.status === 'confirmed' || a.status === 'pending').forEach(a => {
    const apptTime = new Date(`${a.date}T${a.time}`);
    const diff = (apptTime - Date.now()) / 60000;
    if (diff >= 0 && diff <= 60) {
      all.push({
        id: `remind-${a._id}`, type: 'reminder', urgent: true,
        icon: Clock, color: '#dc2626', bg: '#fef2f2',
        title: '⏰ Nhắc lịch khám — Sắp đến giờ!',
        desc: `BS. ${a.doctor?.userId?.fullName || 'Phụ trách'} • ${a.doctor?.department || 'Khoa tổng quát'} • ${a.time} — ${timeUntil(a.date, a.time)}`,
        time: new Date(),
        link: '/dashboard/history',
      });
    }
  });

  // 2. Unpaid bills (Hóa đơn mới cập nhật)
  bills.filter(b => b.status === 'unpaid').forEach(b => {
    all.push({
      id: `bill-unpaid-${b._id}`, type: 'bill', urgent: true,
      icon: CreditCard, color: '#d97706', bg: '#fef3c7',
      title: 'Hóa đơn mới cập nhật',
      desc: `${fmt(b.totalAmount)} — Vui lòng hoàn tất để nhận kết quả khám`,
      time: b.createdAt, link: '/dashboard/billing',
    });
  });

  // 3. Completed appointments (Cập nhật chẩn bệnh)
  appts.filter(a => a.status === 'completed').slice(0, 5).forEach(a => {
    all.push({
      id: `done-${a._id}`, type: 'update',
      icon: Stethoscope, color: '#059669', bg: '#d1fae5',
      title: 'Cập nhật chẩn bệnh của Bác sĩ',
      desc: `BS. ${a.doctor?.userId?.fullName || 'Phụ trách'} đã cập nhật thông tin chẩn đoán và đơn thuốc cho ca khám ngày ${new Date(a.date).toLocaleDateString('vi-VN')}`,
      time: a.updatedAt || a.createdAt, link: `/dashboard/appointment/${a._id}`,
    });
  });

  all.sort((a, b) => {
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    return new Date(b.time) - new Date(a.time);
  });

  const FILTERS = [
    { key: 'all',      label: 'Tất cả' },
    { key: 'reminder', label: '⏰ Nhắc hẹn' },
    { key: 'bill',     label: 'Hóa đơn' },
    { key: 'update',   label: 'Chẩn đoán' },
  ];

  const displayed = filter === 'all' ? all : all.filter(n => n.type === filter);
  const urgentCount = all.filter(n => n.urgent).length;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '8px 0 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(245,158,11,0.3)' }}>
            <Bell size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>Thông báo</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>
              {urgentCount > 0 ? `${urgentCount} thông báo cần chú ý` : 'Cập nhật từ hệ thống MediCare'}
            </p>
          </div>
          {urgentCount > 0 && (
            <div style={{ marginLeft: 'auto', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite', display: 'block' }} />
              <p style={{ fontSize: 12, fontWeight: 800, color: '#dc2626' }}>{urgentCount} khẩn</p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {FILTERS.map(f => {
          const cnt = f.key === 'all' ? all.length : all.filter(n=>n.type===f.key).length;
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
                borderRadius: 99, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
                cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                background: active ? '#0f172a' : '#f1f5f9',
                color: active ? '#fff' : '#64748b',
                boxShadow: active ? '0 4px 14px rgba(15,23,42,0.2)' : 'none',
              }}
            >
              {f.label}
              <span style={{
                fontSize: 11, fontWeight: 800, minWidth: 20, height: 20, borderRadius: 99,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                background: active ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                color: active ? '#fff' : '#94a3b8',
              }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ padding: '80px 24px', textAlign: 'center', color: '#cbd5e1' }}>
          <Bell size={64} strokeWidth={1} style={{ margin: '0 auto 16px' }} />
          <p style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Không có thông báo</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map((n, i) => {
            const Icon = n.icon;
            const isReminder = n.type === 'reminder';
            return (
              <div key={n.id} onClick={() => n.link && navigate(n.link)}
                style={{
                  background: '#fff', borderRadius: 20, cursor: n.link ? 'pointer' : 'default',
                  border: `1px solid ${isReminder ? '#fecaca' : n.urgent ? '#fed7aa' : '#f1f5f9'}`,
                  boxShadow: isReminder ? '0 4px 20px rgba(220,38,38,0.1)' : n.urgent ? '0 4px 16px rgba(217,119,6,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.18s',
                  ...(isReminder ? { background: 'linear-gradient(135deg,#fff5f5,#fff)' } : {}),
                }}
                onMouseEnter={e => n.link && (e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)')}
                onMouseLeave={e => e.currentTarget.style.boxShadow = isReminder ? '0 4px 20px rgba(220,38,38,0.1)' : n.urgent ? '0 4px 16px rgba(217,119,6,0.08)' : '0 1px 4px rgba(0,0,0,0.04)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 15, background: n.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: n.urgent ? `0 4px 16px ${n.color}25` : 'none',
                  }}>
                    <Icon size={22} style={{ color: n.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', lineHeight: 1.3 }}>{n.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {n.urgent && <span style={{ width: 8, height: 8, borderRadius: '50%', background: isReminder ? '#ef4444' : '#f59e0b', animation: 'pulse 1.5s infinite', display: 'block' }} />}
                        {n.link && <ChevronRight size={14} style={{ color: '#cbd5e1' }} />}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>{n.desc}</p>
                    <p style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600, marginTop: 6 }}>{timeAgo(n.time)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
