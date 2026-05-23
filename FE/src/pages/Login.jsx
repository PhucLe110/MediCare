import { API_URL } from "../config";
import { saveAuthSession } from "../utils/auth";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

const trans = {
  vi: {
    toastError: "Đã xảy ra lỗi, vui lòng thử lại sau.",
    loginTitle: "Đăng nhập",
    loginSubtitle: "Truy cập hệ thống quản lý bệnh viện thông minh",
    emailLabel: "Email",
    emailPlaceholder: "nhapemail@example.com",
    passwordLabel: "Mật khẩu",
    rememberMe: "Ghi nhớ đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    btnSubmit: "Đăng nhập",
    noAccount: "Chưa có tài khoản?",
    registerNow: "Đăng ký ngay",
  },
  en: {
    toastError: "An unexpected error occurred. Please try again later.",
    loginTitle: "Sign In",
    loginSubtitle: "Access to MediCare Intelligent Clinical Network",
    emailLabel: "Email Address",
    emailPlaceholder: "enteremail@example.com",
    passwordLabel: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot Password?",
    btnSubmit: "Sign In",
    noAccount: "Do not have an account?",
    registerNow: "Register Now",
  },
};

const Login = () => {
  const { lang, t } = useTranslation(trans);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        saveAuthSession(data.data);
        if (data.data.role === "admin") {
          navigate("/admin");
        } else if (data.data.role === "lab_staff") {
          navigate("/dashboard/lab-upload");
        } else if (data.data.role === "doctor") {
          navigate("/dashboard/doctor");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(t.toastError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[var(--card-bg)] p-8 rounded-2xl shadow-xl border border-[var(--border-color)]">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center cursor-pointer mb-6">
            <img
              src="/LOGO.png"
              alt="MediCare Logo"
              className="h-20 w-auto object-contain drop-shadow-md"
            />
          </Link>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-2">
            {t.loginTitle}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">
            {t.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {t.emailLabel}
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 border border-[var(--border-color)] rounded-xl focus:ring-primary focus:border-primary transition-colors bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)]"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 border border-[var(--border-color)] rounded-xl focus:ring-primary focus:border-primary transition-colors bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-[var(--border-color)] rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-[var(--text-secondary)]"
              >
                {t.rememberMe}
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary hover:text-primary-light"
              >
                {t.forgotPassword}
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all font-bold"
          >
            {t.btnSubmit}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-[var(--text-secondary)] font-medium">
            {t.noAccount}{" "}
            <Link
              to="/register"
              className="font-bold text-primary hover:text-primary-light"
            >
              {t.registerNow}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
