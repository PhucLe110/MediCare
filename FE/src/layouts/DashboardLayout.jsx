import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarPlus, Bot, FolderHeart, 
  FileText, Pill, CreditCard, Bell, Settings, FlaskConical, LogOut
} from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const u = JSON.parse(userInfo);
      setUser(u);
      // Fetch notification count (unpaid bills + pending appointments)
      const h = { Authorization: `Bearer ${u.token}` };
      Promise.all([
        fetch('http://localhost:5000/api/bills/my', { headers: h }).then(r => r.json()),
        fetch('http://localhost:5000/api/appointments', { headers: h }).then(r => r.json()),
      ]).then(([bd, ad]) => {
        const unpaid = bd.success ? bd.data.filter(b => b.status === 'unpaid').length : 0;
        const pending = ad.success ? ad.data.filter(a => a.status === 'pending').length : 0;
        setNotifCount(unpaid + pending);
      }).catch(() => {});
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const patientMenuItems = [
    { name: 'Tổng quan', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Đặt lịch khám', icon: CalendarPlus, path: '/dashboard/booking' },
    { name: 'AI tư vấn sức khỏe', icon: Bot, path: '/dashboard/ai' },
    { name: 'Hồ sơ sức khỏe', icon: FolderHeart, path: '/dashboard/records' },
    { name: 'Kết quả xét nghiệm', icon: FileText, path: '/dashboard/lab-results' },
    { name: 'Đơn thuốc', icon: Pill, path: '/dashboard/prescriptions' },
    { name: 'Thanh toán', icon: CreditCard, path: '/dashboard/billing' },
    { name: 'Thông báo', icon: Bell, path: '/dashboard/notifications', badge: notifCount },
    { name: 'Cài đặt', icon: Settings, path: '/dashboard/settings' },
  ];

  const labStaffMenuItems = [
    { name: 'Bàn làm việc XN', icon: FlaskConical, path: '/dashboard/lab-upload' },
  ];

  const menuItems = user?.role === 'lab_staff' ? labStaffMenuItems : patientMenuItems;

  if (!user) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col fixed h-full z-20">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center cursor-pointer mb-8">
            <img src="/LOGO.png" alt="MediCare" className="h-12 w-auto object-contain drop-shadow-md" />
          </Link>

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 mb-8 bg-white/10 p-3 rounded-xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm truncate">{user?.fullName}</h3>
              <p className="text-xs text-blue-200 truncate">Mã BN: {user?.patientId}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-1 scrollbar-thin">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || (index === 0 && location.pathname === '/dashboard');
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white text-primary font-bold shadow-sm' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm flex-1">{item.name}</span>
                {item.badge > 0 && (
                  <span className="text-[10px] font-black bg-orange-400 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-blue-100 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Đăng xuất</span>
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
