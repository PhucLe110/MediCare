import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, CalendarDays, UserRoundCog, ArrowUpRight, ArrowDownRight, Bot } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTranslation } from '../hooks/useTranslation';

const trans = {
  vi: {
    loadingStats: 'Đang tải dữ liệu thống kê...',
    connError: 'Lỗi kết nối đến máy chủ.',
    
    // Overview Cards
    totalPatients: 'Tổng Bệnh Nhân',
    revenue: 'Doanh Thu',
    totalConsultations: 'Tổng Ca Khám',
    systemPractitioners: 'Bác Sĩ Hệ Thống',
    stableTrend: 'Ổn định',
    
    // Charts
    chartTitle: 'Biểu đồ Doanh Thu & Lịch Khám',
    chartSub: 'Thống kê theo các ngày trong tuần',
    chartFilterThisWeek: 'Tuần này',
    chartTooltipRevenue: 'Doanh thu',
    chartTooltipAppointments: 'Ca khám',
    
    // Department Frequency
    deptFreqTitle: 'Tần suất theo Khoa',
    deptFreqSub: 'Lượt khám y tế thực tế',
    deptFreqEmpty: 'Chưa có lượt khám nào',
    deptFreqLegend: 'Lượt khám (Ca)',

    // AI Section
    aiStatusTitle: 'Trạng thái AI Chẩn đoán',
    aiStatusSub: 'Hệ thống gợi ý chẩn đoán và phân tích dữ liệu lâm sàng đang hoạt động ổn định.',
    aiAccuracy: 'Độ chính xác (Accuracy)',
    aiAnalyzedCases: 'Ca đã phân tích',
    
    // Doctor Performance
    docPerfTitle: 'Hiệu suất Bác sĩ',
    docPerfViewAll: 'Xem tất cả',
    docPerfEmpty: 'Chưa có bác sĩ nào',
    docPerfConsultationsCount: (c) => `${c} Ca khám`,
    docPerfSpecialtyLabel: 'Chuyên khoa sâu',
    docTitle: 'BS'
  },
  en: {
    loadingStats: 'Fetching analytical dashboards...',
    connError: 'Failed to establish stable server connection.',
    
    // Overview Cards
    totalPatients: 'Active Patient Base',
    revenue: 'Gross Revenue',
    totalConsultations: 'Total Appointments',
    systemPractitioners: 'Practitioners Enrolled',
    stableTrend: 'Stable',

    // Charts
    chartTitle: 'Revenue & Consultations Analytics',
    chartSub: 'Aggregated metrics tracking current weekday activity',
    chartFilterThisWeek: 'Current Week',
    chartTooltipRevenue: 'Revenue Gross',
    chartTooltipAppointments: 'Consultation Count',

    // Department Frequency
    deptFreqTitle: 'Frequency by Specialty',
    deptFreqSub: 'Confirmed clinical visits per department',
    deptFreqEmpty: 'No visitation logs recorded yet',
    deptFreqLegend: 'Visits Count',

    // AI Section
    aiStatusTitle: 'AI Diagnostics Pipeline',
    aiStatusSub: 'Automated differential diagnosis and clinical analysis services running at optimal throughput.',
    aiAccuracy: 'Clinical Accuracy (F1)',
    aiAnalyzedCases: 'Processed Insights',

    // Doctor Performance
    docPerfTitle: 'Practitioner Performance',
    docPerfViewAll: 'Manage Registry',
    docPerfEmpty: 'No practitioners currently assigned',
    docPerfConsultationsCount: (c) => `${c} visit${c > 1 ? 's' : ''}`,
    docPerfSpecialtyLabel: 'Specialist Domain',
    docTitle: 'Dr.'
  }
};

export default function AdminDashboard() {
  const { lang, t } = useTranslation(trans);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fmt = (n) => {
    const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
    const currency = lang === 'vi' ? 'VND' : 'USD';
    const finalVal = lang === 'vi' ? n : Math.round(n / 25000);
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(finalVal || 0);
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
    const fetchDashboardStats = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return;
        const { token } = JSON.parse(userInfo);

        const res = await fetch(`${API_URL}/api/admin/dashboard-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message);
        }
      } catch (err) {
        setError(t.connError);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [t.connError]);

  if (loading) return <div className="text-center py-10 font-bold text-slate-600">{t.loadingStats}</div>;
  if (error) return <div className="bg-red-50 text-red-500 p-4 rounded-2xl">{error}</div>;

  const { stats, revenueData, departmentData, doctorPerformances } = data || {
    stats: { patients: 0, doctors: 0, appointments: 0, revenue: 0 },
    revenueData: [],
    departmentData: [],
    doctorPerformances: []
  };

  const localizedDeptData = departmentData.map(d => ({
    ...d,
    name: getLocalizedDept(d.name)
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title={t.totalPatients} 
          value={stats.patients.toLocaleString()} 
          icon={Users} 
          trend="+12.5%" 
          isPositive={true} 
          color="blue" 
        />
        <StatCard 
          title={t.revenue} 
          value={fmt(stats.revenue)} 
          icon={CreditCard} 
          trend="+8.2%" 
          isPositive={true} 
          color="emerald" 
        />
        <StatCard 
          title={t.totalConsultations} 
          value={stats.appointments} 
          icon={CalendarDays} 
          trend="+4.1%" 
          isPositive={true} 
          color="amber" 
        />
        <StatCard 
          title={t.systemPractitioners} 
          value={stats.doctors} 
          icon={UserRoundCog} 
          trend={t.stableTrend} 
          isPositive={true} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:col-span-2 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">{t.chartTitle}</h3>
              <p className="text-sm text-slate-500 font-medium">{t.chartSub}</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none">
              <option>{t.chartFilterThisWeek}</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} tickFormatter={(val) => lang === 'vi' ? `${val / 1000}k` : `$${Math.round(val / 25000)}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value, name) => [name === 'revenue' ? fmt(value) : value, name === 'revenue' ? t.chartTooltipRevenue : t.chartTooltipAppointments]}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800">{t.deptFreqTitle}</h3>
            <p className="text-sm text-slate-500 font-medium">{t.deptFreqSub}</p>
          </div>
          <div className="h-64">
            {localizedDeptData.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium">{t.deptFreqEmpty}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={localizedDeptData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 700}} width={80} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-sm font-bold text-slate-600">{t.deptFreqLegend}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Bot size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center backdrop-blur-md">
                <Bot size={20} className="text-indigo-200" />
              </div>
              <h3 className="text-xl font-black tracking-tight">{t.aiStatusTitle}</h3>
            </div>
            <p className="text-indigo-200 font-medium mb-8 max-w-sm">{t.aiStatusSub}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">{t.aiAccuracy}</p>
                <p className="text-3xl font-black text-white">96.8%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">{t.aiAnalyzedCases}</p>
                <p className="text-3xl font-black text-white">12,450</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800">{t.docPerfTitle}</h3>
            <button 
              onClick={() => navigate('/admin/doctors')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
            >
              {t.docPerfViewAll}
            </button>
          </div>
          <div className="space-y-4">
            {doctorPerformances.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium">{t.docPerfEmpty}</div>
            ) : (
              doctorPerformances.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">
                      {t.docTitle}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{getDoctorDisplayName(doc.fullName)}</h4>
                      <p className="text-sm text-slate-500 font-medium">{lang === 'vi' ? 'Khoa' : 'Dept'} {getLocalizedDept(doc.department)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-lg">{t.docPerfConsultationsCount(doc.count)}</p>
                    <p className="text-xs font-bold text-indigo-500 flex items-center justify-end gap-1"><ArrowUpRight size={12}/> {t.docPerfSpecialtyLabel}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, isPositive, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon size={26} />
      </div>
      <div>
        <h3 className="text-slate-500 font-bold text-sm mb-1">{title}</h3>
        <div className="flex items-end gap-3">
          <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
          <span className={`flex items-center gap-1 text-sm font-bold pb-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
