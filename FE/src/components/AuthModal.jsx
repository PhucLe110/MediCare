import { API_URL } from '../config';
import { saveAuthSession } from '../utils/auth';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import LangThemeControls from './LangThemeControls';

const trans = {
  vi: {
    loginTitle: 'Đăng nhập hệ thống',
    registerTitle: 'Tạo tài khoản mới',
    loginSub: 'Truy cập hồ sơ y tế của bạn',
    registerSub: 'Trải nghiệm dịch vụ y tế thông minh',
    fullName: 'Họ và tên',
    fullNamePh: 'Nguyễn Văn A',
    phone: 'Số điện thoại',
    gender: 'Giới tính',
    male: 'Nam',
    female: 'Nữ',
    email: 'Email',
    password: 'Mật khẩu',
    remember: 'Ghi nhớ',
    forgot: 'Quên mật khẩu?',
    loginBtn: 'Đăng nhập',
    registerBtn: 'Đăng ký tài khoản',
    noAccount: 'Chưa có tài khoản?',
    hasAccount: 'Đã có tài khoản?',
    registerLink: 'Đăng ký ngay',
    loginLink: 'Đăng nhập',
    errGeneric: 'Đã xảy ra lỗi, vui lòng thử lại sau.',
  },
  en: {
    loginTitle: 'Sign in',
    registerTitle: 'Create account',
    loginSub: 'Access your medical records',
    registerSub: 'Experience smart healthcare services',
    fullName: 'Full name',
    fullNamePh: 'John Doe',
    phone: 'Phone number',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    email: 'Email',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    loginBtn: 'Sign in',
    registerBtn: 'Register',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    registerLink: 'Register now',
    loginLink: 'Sign in',
    errGeneric: 'An error occurred. Please try again.',
  },
};

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { lang, t } = useTranslation(trans);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Nam');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { fullName, email, password, phone, gender, role: 'patient' };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        saveAuthSession(data.data);
        onClose();
        if (data.data.role === 'admin') navigate('/admin');
        else if (data.data.role === 'lab_staff') navigate('/dashboard/lab-upload');
        else if (data.data.role === 'doctor') navigate('/dashboard/doctor');
        else navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch {
      setError(t.errGeneric);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <div className="absolute top-4 right-14 z-10">
          <LangThemeControls lang={lang} setLang={(l) => { localStorage.setItem('lang', l); window.dispatchEvent(new Event('language-change')); }} theme={theme} setTheme={setTheme} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <img src="/LOGO.png" alt="MediCare" className="h-12 w-auto object-contain mb-4 no-invert" />
            <h2 className="text-2xl font-black text-gray-900">
              {mode === 'login' ? t.loginTitle : t.registerTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' ? t.loginSub : t.registerSub}
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-medium text-center border border-red-100">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.fullName}</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white outline-none"
                    placeholder={t.fullNamePh}
                    value={fullName} onChange={e => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.phone}</label>
                  <input
                    type="tel" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white outline-none"
                    placeholder="0912345678"
                    value={phone} onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.gender}</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-xl cursor-pointer transition-all font-bold text-sm bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 has-[:checked]:text-indigo-600">
                      <input type="radio" name="modalGender" value="Nam" checked={gender === 'Nam'} onChange={() => setGender('Nam')} className="hidden" />
                      {t.male}
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-xl cursor-pointer transition-all font-bold text-sm bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 has-[:checked]:text-indigo-600">
                      <input type="radio" name="modalGender" value="Nữ" checked={gender === 'Nữ'} onChange={() => setGender('Nữ')} className="hidden" />
                      {t.female}
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.email}</label>
              <input
                type="email" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white outline-none"
                placeholder="email@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.password}</label>
              <input
                type="password" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white outline-none"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded text-primary focus:ring-primary border-gray-300 w-4 h-4" />
                  <label htmlFor="remember" className="text-sm font-medium text-gray-600">{t.remember}</label>
                </div>
                <a href="#" className="text-sm font-bold text-primary hover:text-primary-dark">{t.forgot}</a>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 mt-2"
            >
              {mode === 'login' ? t.loginBtn : t.registerBtn}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 font-medium">
              {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="font-bold text-primary hover:underline"
              >
                {mode === 'login' ? t.registerLink : t.loginLink}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
