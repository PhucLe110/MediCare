import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Bell, Bot, ChevronRight } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const MainLayout = () => {
  const location = useLocation();
  const [authModal, setAuthModal] = React.useState({ isOpen: false, mode: 'login' });
  const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Giới thiệu', path: '/about' },
    { name: 'Dịch vụ', path: '/services' },
    { name: 'Bác sĩ', path: '/doctors' }
  ];

  React.useEffect(() => {
    const handleOpenAuth = (e) => {
      setAuthModal({ isOpen: true, mode: e.detail || 'login' });
    };
    document.addEventListener('open-auth', handleOpenAuth);
    return () => document.removeEventListener('open-auth', handleOpenAuth);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center cursor-pointer">
              <img src="/LOGO.png" alt="MediCare Logo" className="h-16 w-auto object-contain drop-shadow-md" />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.path}
                  className={`text-sm font-bold transition-colors hover:text-primary ${
                    location.pathname === item.path
                    ? 'text-primary border-b-2 border-primary py-1' 
                    : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="px-5 py-2.5 bg-white text-primary border border-primary text-sm font-bold rounded-full hover:bg-blue-50 transition-all"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={authModal.isOpen} 
        mode={authModal.mode}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })} 
      />

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#102A63] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-6">
              <img src="/LOGO.png" alt="MediCare" className="h-16 w-auto drop-shadow-md" />
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              MediCare – Hệ thống quản lý bệnh viện thông minh, đồng hành cùng sức khỏe của bạn và gia đình.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33 2.78 2.78 0 001.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.33z"></path><path fill="none" stroke="currentColor" strokeWidth="2" d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z"></path></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-white">Liên kết nhanh</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li><Link to="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dịch vụ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bác sĩ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tin tức</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-white">Hỗ trợ</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-white">Thông tin liên hệ</h4>
            <ul className="space-y-4 text-sm text-blue-200">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-blue-400">📍</span>
                <span className="leading-relaxed">123 Đường Lê Lợi, Quận 1,<br/>TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400">📞</span>
                <span>(028) 1234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400">✉️</span>
                <span>support@medicare.vn</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6 text-white">Tải ứng dụng</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 border border-white/5">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
                <div className="text-left">
                  <p className="text-[10px] text-blue-200 uppercase font-medium">Download on the</p>
                  <p className="text-sm font-bold text-white leading-none mt-0.5">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 border border-white/5">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.5.4-.6.8-.2l16 8c.4.2.4.6 0 .8l-16 8c-.4.4-.8.3-.8-.2z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-blue-200 uppercase font-medium">GET IT ON</p>
                  <p className="text-sm font-bold text-white leading-none mt-0.5">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-8 border-t border-blue-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-blue-300">
              © 2024 MediCare. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6 text-sm text-blue-300">
              <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-white transition-colors">Bảo mật</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
