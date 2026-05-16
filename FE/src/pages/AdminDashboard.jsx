import React, { useState, useEffect } from 'react';
import { Users, CreditCard, CalendarDays, UserRoundCog, TrendingUp, Activity, FileStack, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Mock Data for Charts
const revenueData = [
  { name: 'T2', revenue: 12000000, appointments: 45 },
  { name: 'T3', revenue: 15000000, appointments: 52 },
  { name: 'T4', revenue: 11000000, appointments: 38 },
  { name: 'T5', revenue: 18000000, appointments: 65 },
  { name: 'T6', revenue: 22000000, appointments: 78 },
  { name: 'T7', revenue: 25000000, appointments: 90 },
  { name: 'CN', revenue: 28000000, appointments: 105 },
];

const departmentData = [
  { name: 'Tim mạch', count: 120 },
  { name: 'Thần kinh', count: 85 },
  { name: 'Nhi khoa', count: 150 },
  { name: 'Da liễu', count: 95 },
  { name: 'Tiêu hóa', count: 110 },
];

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 1245,
    doctors: 48,
    appointments: 356,
    revenue: 458000000
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Bệnh Nhân" 
          value={stats.patients.toLocaleString()} 
          icon={Users} 
          trend="+12.5%" 
          isPositive={true} 
          color="blue" 
        />
        <StatCard 
          title="Doanh Thu Tuần" 
          value={fmt(stats.revenue)} 
          icon={CreditCard} 
          trend="+8.2%" 
          isPositive={true} 
          color="emerald" 
        />
        <StatCard 
          title="Lịch Khám Tuần" 
          value={stats.appointments} 
          icon={CalendarDays} 
          trend="-2.4%" 
          isPositive={false} 
          color="amber" 
        />
        <StatCard 
          title="Bác Sĩ Trực" 
          value={stats.doctors} 
          icon={UserRoundCog} 
          trend="0%" 
          isPositive={true} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:col-span-2 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">Biểu đồ Doanh Thu & Lịch Khám</h3>
              <p className="text-sm text-slate-500 font-medium">Thống kê theo các ngày trong tuần</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none">
              <option>Tuần này</option>
              <option>Tuần trước</option>
              <option>Tháng này</option>
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
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} tickFormatter={(val) => `${val / 1000000}M`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value, name) => [name === 'revenue' ? fmt(value) : value, name === 'revenue' ? 'Doanh thu' : 'Ca khám']}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800">Tần suất theo Khoa</h3>
            <p className="text-sm text-slate-500 font-medium">Lượt khám y tế tháng này</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 700}} width={80} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-sm font-bold text-slate-600">Lượt khám (Ca)</span>
            </div>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Xem chi tiết</button>
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
              <h3 className="text-xl font-black tracking-tight">Trạng thái AI Chẩn đoán</h3>
            </div>
            <p className="text-indigo-200 font-medium mb-8 max-w-sm">Hệ thống gợi ý chẩn đoán và phân tích dữ liệu lâm sàng đang hoạt động ổn định.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Độ chính xác (Accuracy)</p>
                <p className="text-3xl font-black text-white">96.8%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Ca đã phân tích</p>
                <p className="text-3xl font-black text-white">12,450</p>
              </div>
            </div>
            <button className="mt-6 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 text-sm">
              Cập nhật dữ liệu huấn luyện
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800">Hiệu suất Bác sĩ (Top)</h3>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg">
                    BS
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Bác sĩ Nguyễn Văn {['A', 'B', 'C'][i-1]}</h4>
                    <p className="text-sm text-slate-500 font-medium">Khoa {['Tim mạch', 'Nhi khoa', 'Da liễu'][i-1]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800 text-lg">{150 - i*15} <span className="text-xs text-slate-500 font-bold uppercase">Ca khám</span></p>
                  <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1"><ArrowUpRight size={12}/> Đánh giá 4.9/5</p>
                </div>
              </div>
            ))}
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
