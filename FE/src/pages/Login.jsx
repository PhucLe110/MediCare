import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Đăng nhập</h2>
          <p className="text-sm text-gray-500 mt-2">Truy cập hệ thống quản lý bệnh viện thông minh</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="nhapemail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
              type="password" 
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary transition-colors bg-gray-50 focus:bg-white outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Ghi nhớ đăng nhập</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary-light">Quên mật khẩu?</a>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-light">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
