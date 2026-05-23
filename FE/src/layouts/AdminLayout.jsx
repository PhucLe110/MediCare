import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRoundCog,
  CalendarDays,
  FileStack,
  Pill,
  CreditCard,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  Sun,
  Moon,
  Globe,
  CalendarClock,
} from "lucide-react";
import { ensureValidSession, logoutAuth } from "../utils/auth";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "vi");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    (async () => {
      try {
        const u = await ensureValidSession();
        if (!u) {
          navigate("/");
          return;
        }
        if (u.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setUser(u);
      } catch {
        navigate("/");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    window.dispatchEvent(new Event("language-change"));
  }, [lang]);

  useEffect(() => {
    const handleLangChange = () => {
      const currentLang = localStorage.getItem("lang") || "vi";
      if (currentLang !== lang) {
        setLang(currentLang);
      }
    };
    window.addEventListener("language-change", handleLangChange);
    return () =>
      window.removeEventListener("language-change", handleLangChange);
  }, [lang]);

  const handleLogout = async () => {
    await logoutAuth();
    navigate("/");
  };

  const trans = {
    vi: {
      dashboard: "Tổng quan",
      users: "Tài khoản",
      doctors: "Bác sĩ",
      appointments: "Điều phối ca khám",
      records: "Hồ sơ y tế",
      inventory: "Kho thuốc",
      billing: "Viện phí",
      ai: "Hệ thống AI",
      logout: "Đăng xuất",
      client: "Về Client",
      theme: "Giao diện",
      language: "Ngôn ngữ",
      light: "Sáng",
      dark: "Tối",
      serverStatus: "Trạng thái Server",
      roleAdmin: "Admin",
    },
    en: {
      dashboard: "Overview",
      users: "Accounts",
      doctors: "Doctors",
      appointments: "Consultation Dispatch",
      records: "Medical Records",
      inventory: "Pharmacy Stock",
      billing: "Billing & Fees",
      ai: "AI Services",
      logout: "Sign Out",
      client: "To Client",
      theme: "Theme",
      language: "Language",
      light: "Light",
      dark: "Dark",
      serverStatus: "Server Status",
      roleAdmin: "Admin",
    },
  };

  const t = trans[lang];

  const adminMenu = [
    { name: t.dashboard, icon: LayoutDashboard, path: "/admin" },
    { name: t.users, icon: Users, path: "/admin/users" },
    { name: t.doctors, icon: UserRoundCog, path: "/admin/doctors" },
    { name: t.appointments, icon: CalendarDays, path: "/admin/appointments" },
    { name: t.records, icon: FileStack, path: "/admin/records" },
    { name: t.inventory, icon: Pill, path: "/admin/inventory" },
    { name: t.billing, icon: CreditCard, path: "/admin/billing" },
    { name: t.ai, icon: Bot, path: "/admin/ai" },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[var(--bg-secondary)] font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar - Dark Premium Theme */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl relative z-20">
        <div className="p-6 pb-2 border-b border-slate-800">
          <Link to="/admin" className="flex items-center justify-center gap-3">
            <img
              src="/LOGO.png"
              alt="MediCare"
              className="h-12 w-auto object-contain drop-shadow-md no-invert"
            />
            <span className="font-black text-white tracking-widest uppercase text-xl">
              Admin
            </span>
          </Link>
          <div className="mt-6 mb-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            {/* Language & Theme Switchers - Separated at two ends */}
            <div className="flex justify-around mb-3">
              {/* Language Switcher - Left */}
              <div className="flex bg-slate-700/50 p-1 rounded-lg border border-slate-600/50 shadow-inner gap-0.5">
                <button
                  onClick={() => setLang("vi")}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-[10px] font-black tracking-wider transition-all ${lang === "vi" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                >
                  VI
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-[10px] font-black tracking-wider transition-all ${lang === "en" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                >
                  EN
                </button>
              </div>
              {/* Theme Switcher - Right */}
              <div className="flex bg-slate-700/50 p-1 rounded-lg border border-slate-600/50 shadow-inner gap-0.5">
                <button
                  onClick={() => setTheme("light")}
                  className={`w-7 h-7 rounded-md transition-all flex items-center justify-center ${theme === "light" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                  title={t.light}
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`w-7 h-7 rounded-md transition-all flex items-center justify-center ${theme === "dark" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                  title={t.dark}
                >
                  <Moon size={14} />
                </button>
              </div>
            </div>

            {/* Avatar and Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30 shrink-0">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1">
                <h3 className="font-extrabold text-sm text-white truncate leading-tight">
                  {user?.fullName}
                </h3>
                <p className="text-[11px] text-indigo-300 font-bold mt-1 truncate leading-none">
                  {t.roleAdmin}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? "bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20"
                    : "hover:bg-slate-800 hover:text-white font-medium text-slate-400"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
                )}
                <Icon
                  size={20}
                  className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
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
        <header className="h-16 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
              {adminMenu.find((m) => m.path === location.pathname)?.name ||
                "Admin Panel"}
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-sm text-[var(--text-secondary)] font-medium">
              {t.serverStatus}:{" "}
              <span className="text-emerald-500 dark:text-emerald-400 font-bold ml-1 flex items-center inline-flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                Online
              </span>
            </div>
            <div className="h-6 w-px bg-[var(--border-color)]"></div>
            <Link
              to="/dashboard"
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30 transition-colors"
            >
              <ChevronLeft size={16} /> {t.client}
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-secondary)] p-8">
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
