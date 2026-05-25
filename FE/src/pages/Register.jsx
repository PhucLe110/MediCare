import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import LangThemeControls from '../components/LangThemeControls';

const trans = {
  vi: {
    mismatchError: 'Mật khẩu xác nhận không khớp!',
    toastError: 'Đã xảy ra lỗi, vui lòng thử lại sau.',
    title: 'Đăng ký tài khoản',
    subtitle: 'Khởi tạo hồ sơ bệnh án điện tử của bạn',
    fullNameLabel: 'Họ và tên',
    fullNamePlaceholder: 'Nguyễn Văn A',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    phoneLabel: 'Số điện thoại',
    phonePlaceholder: '0912345678',
    genderLabel: 'Giới tính',
    genderMale: 'Nam',
    genderFemale: 'Nữ',
    passwordLabel: 'Mật khẩu',
    confirmPasswordLabel: 'Xác nhận mật khẩu',
    btnSubmit: 'Đăng ký',
    hasAccount: 'Đã có tài khoản?',
    loginNow: 'Đăng nhập',
  },
  en: {
    mismatchError: 'Confirm password does not match!',
    toastError: 'An unexpected error occurred. Please try again later.',
    title: 'Create Account',
    subtitle: 'Establish your electronic personal clinical profile',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    emailLabel: 'Email Address',
    emailPlaceholder: 'email@example.com',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '0912345678',
    genderLabel: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    btnSubmit: 'Create Account',
    hasAccount: 'Already have an account?',
    loginNow: 'Sign In',
  }
};

const Register = () => {
  const { lang, t } = useTranslation(trans);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError(t.mismatchError);
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          password: formData.password
        })
      });

      const data = await res.json();

      if (data.success) {
        navigate('/login', { 
          state: { 
            message: lang === 'vi' 
              ? 'Đăng ký thành công! Vui lòng đăng nhập.' 
              : 'Registration successful! Please log in.' 
          } 
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(t.toastError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <LangThemeControls lang={lang} setLang={() => {}} theme={theme} setTheme={setTheme} />
      </div>
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center cursor-pointer mb-6">
            <img src="/LOGO.png" alt="MediCare Logo" className="h-20 w-auto object-contain drop-shadow-md" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">{t.title}</h2>
          <p className="text-sm text-gray-500 mt-2 text-center">{t.subtitle}</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.fullNameLabel}</label>
            <input 
              type="text" name="fullName" required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder={t.fullNamePlaceholder}
              value={formData.fullName} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.emailLabel}</label>
            <input 
              type="email" name="email" required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder={t.emailPlaceholder}
              value={formData.email} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.phoneLabel}</label>
            <input 
              type="text" name="phone" required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder={t.phonePlaceholder}
              value={formData.phone} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.genderLabel}</label>
            <div className="mt-1.5 flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer transition-all font-bold text-sm bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 has-[:checked]:text-indigo-600">
                <input 
                  type="radio" name="gender" value="Nam" 
                  checked={formData.gender === 'Nam'} 
                  onChange={handleChange}
                  className="hidden" 
                />
                {t.genderMale}
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer transition-all font-bold text-sm bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 has-[:checked]:text-indigo-600">
                <input 
                  type="radio" name="gender" value="Nữ" 
                  checked={formData.gender === 'Nữ'} 
                  onChange={handleChange}
                  className="hidden" 
                />
                {t.genderFemale}
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.passwordLabel}</label>
            <input 
              type="password" name="password" required minLength="6"
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="••••••••"
              value={formData.password} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.confirmPasswordLabel}</label>
            <input 
              type="password" name="confirmPassword" required minLength="6"
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="••••••••"
              value={formData.confirmPassword} onChange={handleChange}
            />
          </div>

          <button 
            type="submit"
            className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all font-bold"
          >
            {t.btnSubmit}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 font-medium">
            {t.hasAccount}{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary-light">{t.loginNow}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
