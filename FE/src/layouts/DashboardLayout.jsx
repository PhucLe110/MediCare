import { API_URL } from '../config';
import { authFetch, ensureValidSession, logoutAuth } from '../utils/auth';
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarPlus, Bot, FolderHeart, 
  FileText, Pill, CreditCard, Bell, FlaskConical, LogOut,
  Sun, Moon, Globe
} from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    (async () => {
      try {
        const u = await ensureValidSession();
        if (!u) {
          navigate('/');
          return;
        }
        if (u.role === 'admin') {
          navigate('/admin');
          return;
        }
        setUser(u);
        const [br, ar] = await Promise.all([
          authFetch(`${API_URL}/api/bills/my`).then((r) => r.json()),
          authFetch(`${API_URL}/api/appointments`).then((r) => r.json()),
        ]);
        const unpaid = br.success ? br.data.filter((b) => b.status === 'unpaid').length : 0;
        const pending = ar.success ? ar.data.filter((a) => a.status === 'pending').length : 0;
        setNotifCount(unpaid + pending);
      } catch {
        navigate('/');
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    window.dispatchEvent(new Event('language-change'));
  }, [lang]);

  useEffect(() => {
    const handleLangChange = () => {
      const currentLang = localStorage.getItem('lang') || 'vi';
      if (currentLang !== lang) {
        setLang(currentLang);
      }
    };
    window.addEventListener('language-change', handleLangChange);
    return () => window.removeEventListener('language-change', handleLangChange);
  }, [lang]);

  const handleLogout = async () => {
    await logoutAuth();
    navigate('/');
  };

  const trans = {
    vi: {
      dashboard: 'Tổng quan',
      booking: 'Đặt lịch khám',
      ai: 'AI tư vấn sức khỏe',
      records: 'Hồ sơ sức khỏe',
      results: 'Kết quả xét nghiệm',
      prescriptions: 'Đơn thuốc',
      billing: 'Thanh toán',
      notifications: 'Thông báo',
      logout: 'Đăng xuất',
      patientId: 'Mã BN',
      theme: 'Giao diện',
      language: 'Ngôn ngữ',
      light: 'Sáng',
      dark: 'Tối',
      loading: 'Đang tải...',
      roleUser: 'Bệnh nhân',
      roleLabStaff: 'Nhân viên Xét nghiệm',
      roleAdmin: 'Admin',
      labDesk: 'Bàn làm việc XN',
      shiftDesk: 'Lịch trực khám',
      doctorDesk: 'Bàn khám bác sĩ',
      roleDoctor: 'Bác sĩ chuyên khoa',
    },
    en: {
      dashboard: 'Overview',
      booking: 'Book Appointment',
      ai: 'AI Health Triage',
      records: 'Health Records',
      results: 'Lab Results',
      prescriptions: 'Prescriptions',
      billing: 'Billing & Fees',
      notifications: 'Notifications',
      logout: 'Sign Out',
      patientId: 'BN Code',
      theme: 'Appearance',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      loading: 'Loading...',
      roleUser: 'Patient',
      roleLabStaff: 'Lab Technician',
      roleAdmin: 'System Admin',
      labDesk: 'Lab Workspace',
      shiftDesk: 'Shift Management',
      doctorDesk: 'Doctor Workspace',
      roleDoctor: 'Specialist Doctor',
    }
  };

  const t = trans[lang];

  const patientMenuItems = [
    { name: t.dashboard, icon: LayoutDashboard, path: '/dashboard' },
    { name: t.booking, icon: CalendarPlus, path: '/dashboard/booking' },
    { name: t.ai, icon: Bot, path: '/dashboard/ai' },
    { name: t.records, icon: FolderHeart, path: '/dashboard/records' },
    { name: t.results, icon: FileText, path: '/dashboard/lab-results' },
    { name: t.prescriptions, icon: Pill, path: '/dashboard/prescriptions' },
    { name: t.billing, icon: CreditCard, path: '/dashboard/billing' },
    { name: t.notifications, icon: Bell, path: '/dashboard/notifications', badge: notifCount },
  ];

  const labStaffMenuItems = [
    { name: t.labDesk, icon: FlaskConical, path: '/dashboard/lab-upload' },
  ];

  const doctorMenuItems = [
    { name: t.doctorDesk, icon: LayoutDashboard, path: '/dashboard/doctor' },
    { name: t.shiftDesk, icon: CalendarPlus, path: '/dashboard/doctor-shifts' },
  ];

  const menuItems = user?.role === 'lab_staff' 
    ? labStaffMenuItems 
    : (user?.role === 'doctor' ? doctorMenuItems : patientMenuItems);

  if (!user) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">{t.loading}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col fixed h-full z-20 shadow-xl shadow-blue-900/10">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center cursor-pointer mb-8">
            <img src="/LOGO.png" alt="MediCare" className="h-12 w-auto object-contain drop-shadow-md no-invert" />
          </Link>

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 mb-6 bg-white/10 p-4 rounded-2xl border border-white/10 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-500/25 shrink-0 animate-pulse-slow">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-sm text-white truncate leading-tight">{user?.fullName}</h3>
              <p className="text-[11px] text-blue-200 font-bold mt-1 truncate leading-none">
                {user?.role === 'patient' 
                  ? `${t.patientId}: ${user?.patientId}` 
                  : (user?.role === 'lab_staff' 
                      ? t.roleLabStaff 
                      : (user?.role === 'doctor' 
                          ? t.roleDoctor
                          : t.roleAdmin))
                }
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto space-y-1 scrollbar-thin">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || (index === 0 && location.pathname === '/dashboard');
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white text-primary font-bold shadow-md shadow-blue-950/10 scale-[1.02]' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm flex-1">{item.name}</span>
                {item.badge > 0 && (
                  <span className="text-[10px] font-black bg-orange-400 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme & Language Controls Panel */}
        <div className="px-6 py-5 border-t border-white/10 space-y-4 bg-gradient-to-b from-blue-950/20 to-blue-950/40">
          {/* Theme Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100 flex items-center gap-2">
              <Sun size={14} className="text-blue-300 animate-pulse" />
              {t.theme}
            </span>
            <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 shadow-inner">
              <button 
                onClick={() => setTheme('light')}
                className={`w-8 h-8 rounded-md transition-all flex items-center justify-center ${theme === 'light' ? 'bg-white text-primary shadow-md scale-105' : 'text-blue-200 hover:text-white'}`}
                title={t.light}
              >
                <Sun size={16} />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`w-8 h-8 rounded-md transition-all flex items-center justify-center ${theme === 'dark' ? 'bg-white text-primary shadow-md scale-105' : 'text-blue-200 hover:text-white'}`}
                title={t.dark}
              >
                <Moon size={16} />
              </button>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100 flex items-center gap-2">
              <Globe size={14} className="text-blue-300" />
              {t.language}
            </span>
            <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 shadow-inner">
              <button 
                onClick={() => setLang('vi')}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-[11px] font-black tracking-wider transition-all ${lang === 'vi' ? 'bg-white text-primary shadow-md scale-105' : 'text-blue-200 hover:text-white'}`}
              >
                VI
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-[11px] font-black tracking-wider transition-all ${lang === 'en' ? 'bg-white text-primary shadow-md scale-105' : 'text-blue-200 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
