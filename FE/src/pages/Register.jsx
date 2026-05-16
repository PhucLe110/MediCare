import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp!');
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('userInfo', JSON.stringify(data.data));
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi, vui lòng thử lại sau.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center cursor-pointer mb-6">
            <img src="/LOGO.png" alt="MediCare Logo" className="h-20 w-auto object-contain drop-shadow-md" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Đăng ký tài khoản</h2>
          <p className="text-sm text-gray-500 mt-2">Khởi tạo hồ sơ bệnh án điện tử của bạn</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input 
              type="text" name="fullName" required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="Nguyễn Văn A"
              value={formData.fullName} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" name="email" required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="email@example.com"
              value={formData.email} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input 
              type="text" name="phone" required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="0912345678"
              value={formData.phone} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
              type="password" name="password" required minLength="6"
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="••••••••"
              value={formData.password} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input 
              type="password" name="confirmPassword" required minLength="6"
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="••••••••"
              value={formData.confirmPassword} onChange={handleChange}
            />
          </div>

          <button 
            type="submit"
            className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            Đăng ký
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-light">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
