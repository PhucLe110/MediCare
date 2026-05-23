import { API_URL, authFetch } from "../config";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CreditCard,
  CalendarDays,
  UserRoundCog,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useTranslation } from "../hooks/useTranslation";
import {
  formatMoney,
  formatDoctorName,
  getLocalizedDept,
  formatChartTick,
} from "../utils/i18nHelpers";

const trans = {
  vi: {
    loadingStats: "Đang tải dữ liệu thống kê...",
    connError: "Lỗi kết nối đến máy chủ.",

    // Overview Cards
    totalPatients: "Tổng Bệnh Nhân",
    revenue: "Doanh Thu",
    totalConsultations: "Tổng Ca Khám",
    systemPractitioners: "Bác Sĩ Hệ Thống",
    stableTrend: "Ổn định",

    // Charts
    chartTitle: "Biểu đồ Doanh Thu & Lịch Khám",
    chartSub: "Thống kê theo các ngày trong tuần",
    chartFilterThisWeek: "Tuần này",
    chartTooltipRevenue: "Doanh thu",
    chartTooltipAppointments: "Ca khám",

    // Department Frequency
    deptFreqTitle: "Tần suất theo Khoa",
    deptFreqSub: "Lượt khám y tế thực tế",
    deptFreqEmpty: "Chưa có lượt khám nào",
    deptFreqLegend: "Lượt khám (Ca)",

    // AI Section
    aiStatusTitle: "Trạng thái AI Chẩn đoán",
    aiStatusSub:
      "Hệ thống gợi ý chẩn đoán và phân tích dữ liệu lâm sàng đang hoạt động ổn định.",
    aiAccuracy: "Độ chính xác (Accuracy)",
    aiAnalyzedCases: "Ca đã phân tích",

    // Doctor Performance
    docPerfTitle: "Hiệu suất Bác sĩ",
    docPerfViewAll: "Xem tất cả",
    docPerfEmpty: "Chưa có bác sĩ nào",
    docPerfConsultationsCount: (c) => `${c} Ca khám`,
    docPerfSpecialtyLabel: "Chuyên khoa sâu",
    docTitle: "BS",
    deptLabel: "Khoa",
  },
  en: {
    loadingStats: "Fetching analytical dashboards...",
    connError: "Failed to establish stable server connection.",

    // Overview Cards
    totalPatients: "Active Patient Base",
    revenue: "Gross Revenue",
    totalConsultations: "Total Appointments",
    systemPractitioners: "Practitioners Enrolled",
    stableTrend: "Stable",

    // Charts
    chartTitle: "Revenue & Consultations Analytics",
    chartSub: "Aggregated metrics tracking current weekday activity",
    chartFilterThisWeek: "Current Week",
    chartTooltipRevenue: "Revenue Gross",
    chartTooltipAppointments: "Consultation Count",

    // Department Frequency
    deptFreqTitle: "Frequency by Specialty",
    deptFreqSub: "Confirmed clinical visits per department",
    deptFreqEmpty: "No visitation logs recorded yet",
    deptFreqLegend: "Visits Count",

    // AI Section
    aiStatusTitle: "AI Diagnostics Pipeline",
    aiStatusSub:
      "Automated differential diagnosis and clinical analysis services running at optimal throughput.",
    aiAccuracy: "Clinical Accuracy (F1)",
    aiAnalyzedCases: "Processed Insights",

    // Doctor Performance
    docPerfTitle: "Practitioner Performance",
    docPerfViewAll: "Manage Registry",
    docPerfEmpty: "No practitioners currently assigned",
    docPerfConsultationsCount: (c) => `${c} visit${c > 1 ? "s" : ""}`,
    docPerfSpecialtyLabel: "Specialist Domain",
    docTitle: "Dr.",
    deptLabel: "Dept",
  },
};

export default function AdminDashboard() {
  const { lang, t } = useTranslation(trans);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fmt = (n) => formatMoney(lang, n);
  const getDoctorDisplayName = (name) => formatDoctorName(lang, name);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/admin/dashboard-stats`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message);
        }
      } catch {
        setError(t.connError);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [t.connError]);

  if (loading)
    return (
      <div className="text-center py-10 font-bold text-[var(--text-secondary)]">
        {t.loadingStats}
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-2xl">
        {error}
      </div>
    );

  const { stats, revenueData, departmentData, doctorPerformances } = data || {
    stats: { patients: 0, doctors: 0, appointments: 0, revenue: 0 },
    revenueData: [],
    departmentData: [],
    doctorPerformances: [],
  };

  const localizedDeptData = departmentData.map((d) => ({
    ...d,
    name: getLocalizedDept(lang, d.name),
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Chart */}
        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-[var(--border-color)] lg:col-span-2 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 md:mb-6">
            <div>
              <h3 className="text-base md:text-lg font-black text-[var(--text-primary)]">
                {t.chartTitle}
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium">
                {t.chartSub}
              </p>
            </div>
            <select className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs md:text-sm font-bold text-[var(--text-primary)] rounded-xl px-3 md:px-4 py-2 outline-none">
              <option>{t.chartFilterThisWeek}</option>
            </select>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-color)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                  tickFormatter={(val) => formatChartTick(lang, val)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text-primary)",
                  }}
                  formatter={(value, name) => [
                    name === "revenue" ? fmt(value) : value,
                    name === "revenue"
                      ? t.chartTooltipRevenue
                      : t.chartTooltipAppointments,
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Chart */}
        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-[var(--border-color)]">
          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black text-[var(--text-primary)]">
              {t.deptFreqTitle}
            </h3>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium">
              {t.deptFreqSub}
            </p>
          </div>
          <div className="h-56 md:h-64">
            {localizedDeptData.length === 0 ? (
              <div className="text-center py-16 md:py-20 text-[var(--text-tertiary)] font-medium text-xs md:text-sm">
                {t.deptFreqEmpty}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={localizedDeptData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="var(--border-color)"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--text-primary)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                    width={60}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[0, 8, 8, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[var(--border-color)] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-xs md:text-sm font-bold text-[var(--text-secondary)]">
                {t.deptFreqLegend}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Bot size={150} md={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center backdrop-blur-md">
                <Bot size={16} md={20} className="text-indigo-200" />
              </div>
              <h3 className="text-base md:text-xl font-black tracking-tight">
                {t.aiStatusTitle}
              </h3>
            </div>
            <p className="text-indigo-200 font-medium mb-4 md:mb-8 max-w-sm text-xs md:text-sm">
              {t.aiStatusSub}
            </p>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10">
                <p className="text-indigo-200 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                  {t.aiAccuracy}
                </p>
                <p className="text-2xl md:text-3xl font-black text-white">
                  96.8%
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10">
                <p className="text-indigo-200 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                  {t.aiAnalyzedCases}
                </p>
                <p className="text-2xl md:text-3xl font-black text-white">
                  12,450
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-[var(--border-color)]">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black text-[var(--text-primary)]">
              {t.docPerfTitle}
            </h3>
            <button
              onClick={() => navigate("/admin/doctors")}
              className="text-[10px] md:text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all"
            >
              {t.docPerfViewAll}
            </button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {doctorPerformances.length === 0 ? (
              <div className="text-center py-8 md:py-10 text-[var(--text-tertiary)] font-medium text-xs md:text-sm">
                {t.docPerfEmpty}
              </div>
            ) : (
              doctorPerformances.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 rounded-2xl border border-[var(--border-color)] hover:border-[var(--border-color)] transition-colors bg-[var(--bg-tertiary)] gap-2 md:gap-4"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs md:text-sm shrink-0">
                      {t.docTitle}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                        {getDoctorDisplayName(doc.fullName)}
                      </h4>
                      <p className="text-[10px] md:text-sm text-[var(--text-secondary)] font-medium">
                        {t.deptLabel} {getLocalizedDept(lang, doc.department)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[var(--text-primary)] text-base md:text-lg">
                      {t.docPerfConsultationsCount(doc.count)}
                    </p>
                    <p className="text-[10px] md:text-xs font-bold text-indigo-500 dark:text-indigo-400 flex items-center justify-end gap-1">
                      <ArrowUpRight size={10} md={12} />{" "}
                      <span className="hidden md:inline">
                        {t.docPerfSpecialtyLabel}
                      </span>
                    </p>
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
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    amber:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    purple:
      "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-[var(--border-color)] relative overflow-hidden group hover:shadow-md transition-shadow">
      <div
        className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3 md:mb-4 ${colorMap[color]}`}
      >
        <Icon size={20} md={26} />
      </div>
      <div>
        <h3 className="text-[var(--text-secondary)] font-bold text-xs md:text-sm mb-1">
          {title}
        </h3>
        <div className="flex items-end gap-2 md:gap-3">
          <p className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {value}
          </p>
          <span
            className={`flex items-center gap-1 text-[10px] md:text-sm font-bold pb-1 ${isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} md={16} />
            ) : (
              <ArrowDownRight size={12} md={16} />
            )}
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
