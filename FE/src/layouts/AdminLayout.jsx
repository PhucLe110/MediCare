import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserRoundCog, CalendarDays, 
  FileStack, Pill, CreditCard, Bot, Settings, LogOut, ChevronLeft,
  Sun, Moon, Globe
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const u = JSON.parse(userInfo);
      if (u.role !== 'admin') {
        navigate('/dashboard'); // Kick out non-admins
      } else {
        setUser(u);
      }
    } else {
      navigate('/');
    }
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

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const trans = {
    vi: {
      dashboard: 'Tổng quan',
      users: 'Tài khoản',
      doctors: 'Bác sĩ',
      appointments: 'Điều phối ca khám',
      records: 'Hồ sơ y tế',
      inventory: 'Kho thuốc',
      billing: 'Viện phí',
      ai: 'Hệ thống AI',
      logout: 'Đăng xuất',
      client: 'Về Client',
      theme: 'Giao diện',
      language: 'Ngôn ngữ',
      light: 'Sáng',
      dark: 'Tối',
      serverStatus: 'Trạng thái Server',
      roleAdmin: 'Admin',
    },
    en: {
      dashboard: 'Overview',
      users: 'Accounts',
      doctors: 'Doctors',
      appointments: 'Consultation Dispatch',
      records: 'Medical Records',
      inventory: 'Pharmacy Stock',
      billing: 'Billing & Fees',
      ai: 'AI Services',
      logout: 'Sign Out',
      client: 'To Client',
      theme: 'Theme',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      serverStatus: 'Server Status',
      roleAdmin: 'Admin',
    }
  };

  const t = trans[lang];

  const adminMenu = [
    { name: t.dashboard, icon: LayoutDashboard, path: '/admin' },
    { name: t.users, icon: Users, path: '/admin/users' },
    { name: t.doctors, icon: UserRoundCog, path: '/admin/doctors' },
    { name: t.appointments, icon: CalendarDays, path: '/admin/appointments' },
    { name: t.records, icon: FileStack, path: '/admin/records' },
    { name: t.inventory, icon: Pill, path: '/admin/inventory' },
    { name: t.billing, icon: CreditCard, path: '/admin/billing' },
    { name: t.ai, icon: Bot, path: '/admin/ai' },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar - Dark Premium Theme */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl relative z-20">
        <div className="p-6 pb-2 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/LOGO.png" alt="MediCare" className="h-12 w-auto object-contain drop-shadow-md no-invert" />
            <span className="font-black text-white tracking-widest uppercase text-xl">Admin</span>
          </Link>
          <div className="mt-6 mb-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30 shrink-0">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white leading-tight truncate">{user?.fullName}</p>
              <p className="text-xs text-indigo-300 font-medium truncate">{t.roleAdmin}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20' 
                    : 'hover:bg-slate-800 hover:text-white font-medium text-slate-400'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Theme & Language Controls Panel */}
        <div className="px-6 py-5 border-t border-slate-800 space-y-4 bg-slate-950/40">
          {/* Theme Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sun size={14} className="text-indigo-400 animate-pulse" />
              {t.theme}
            </span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 shadow-inner">
              <button 
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${theme === 'light' ? 'bg-indigo-500 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
                title={t.light}
              >
                <Sun size={15} />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
                title={t.dark}
              >
                <Moon size={15} />
              </button>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Globe size={14} className="text-indigo-400" />
              {t.language}
            </span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 shadow-inner">
              <button 
                onClick={() => setLang('vi')}
                className={`px-3.5 py-1 rounded-md text-[10px] font-black tracking-wider transition-all ${lang === 'vi' ? 'bg-indigo-500 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
              >
                VI
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-3.5 py-1 rounded-md text-[10px] font-black tracking-wider transition-all ${lang === 'en' ? 'bg-indigo-500 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl transition-all text-sm font-bold border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} /> {t.logout}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {adminMenu.find(m => m.path === location.pathname)?.name || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-sm text-slate-500 font-medium">
              {t.serverStatus}: <span className="text-emerald-500 font-bold ml-1 flex items-center inline-flex gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <Link to="/dashboard" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
              <ChevronLeft size={16} /> {t.client}
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </div>
  );
};

export default AdminLayout;

