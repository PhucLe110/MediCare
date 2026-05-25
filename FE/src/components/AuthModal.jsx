import { API_URL } from "../config";
import { saveAuthSession } from "../utils/auth";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, getIdToken } from "firebase/auth";

const trans = {
  vi: {
    loginTitle: "Đăng nhập hệ thống",
    registerTitle: "Tạo tài khoản mới",
    loginSub: "Truy cập hồ sơ y tế của bạn",
    registerSub: "Trải nghiệm dịch vụ y tế thông minh",
    fullName: "Họ và tên",
    fullNamePh: "Nguyễn Văn A",
    phone: "Số điện thoại",
    gender: "Giới tính",
    male: "Nam",
    female: "Nữ",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    remember: "Ghi nhớ",
    forgot: "Quên mật khẩu?",
    loginBtn: "Đăng nhập",
    registerBtn: "Đăng ký tài khoản",
    noAccount: "Chưa có tài khoản?",
    hasAccount: "Đã có tài khoản?",
    registerLink: "Đăng ký ngay",
    loginLink: "Đăng nhập",
    errGeneric: "Đã xảy ra lỗi, vui lòng thử lại sau.",
    errPasswordMatch: "Mật khẩu không khớp",
    forgotTitle: "Quên mật khẩu",
    forgotSub: "Nhập email để nhận mã xác nhận",
    sendCode: "Gửi mã",
    verifyCode: "Xác nhận",
    resetPassword: "Đặt lại mật khẩu",
    codeSent: "Mã đã được gửi đến email của bạn",
    enterCode: "Nhập mã xác nhận",
    newPassword: "Mật khẩu mới",
    backToLogin: "Quay lại đăng nhập",
  },
  en: {
    loginTitle: "Sign in",
    registerTitle: "Create account",
    loginSub: "Access your medical records",
    registerSub: "Experience smart healthcare services",
    fullName: "Full name",
    fullNamePh: "John Doe",
    phone: "Phone number",
    gender: "Gender",
    male: "Male",
    female: "Female",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    remember: "Remember me",
    forgot: "Forgot password?",
    loginBtn: "Sign in",
    registerBtn: "Register",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    registerLink: "Register now",
    loginLink: "Sign in",
    errGeneric: "An error occurred. Please try again.",
    errPasswordMatch: "Passwords do not match",
    forgotTitle: "Forgot password",
    forgotSub: "Enter your email to receive verification code",
    sendCode: "Send code",
    verifyCode: "Verify",
    resetPassword: "Reset password",
    codeSent: "Code has been sent to your email",
    enterCode: "Enter verification code",
    newPassword: "New password",
    backToLogin: "Back to login",
  },
};

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const { t, lang } = useTranslation(trans);
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Nam");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const submitButtonDisabledRef = useRef(false);
  const navigate = useNavigate();
  const initialModeRef = useRef(initialMode);

  useEffect(() => {
    initialModeRef.current = initialMode;
  }, [initialMode]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialModeRef.current);
      setError("");
      setSuccessMessage("");
      setForgotStep(1);
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    submitButtonDisabledRef.current = true;
    setSubmitButtonDisabled(true);

    if (mode === "register" && password !== confirmPassword) {
      setError(t.errPasswordMatch);
      submitButtonDisabledRef.current = false;
      setSubmitButtonDisabled(false);
      return;
    }

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { fullName, email, password, phone, gender, role: "patient" };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        if (mode === "register") {
          setMode("login");
          setPassword("");
          setSuccessMessage(
            lang === "vi"
              ? "Đăng ký thành công! Vui lòng đăng nhập."
              : "Registration successful! Please log in.",
          );
          submitButtonDisabledRef.current = false;
          setSubmitButtonDisabled(false);
        } else {
          saveAuthSession(data.data);
          onClose();
          if (data.data.role === "admin") navigate("/admin");
          else if (data.data.role === "lab_staff")
            navigate("/dashboard/lab-upload");
          else if (data.data.role === "doctor") navigate("/dashboard/doctor");
          else navigate("/dashboard");
        }
      } else {
        setError(data.message);
        submitButtonDisabledRef.current = false;
        setSubmitButtonDisabled(false);
      }
    } catch {
      setError(t.errGeneric);
      submitButtonDisabledRef.current = false;
      setSubmitButtonDisabled(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    submitButtonDisabledRef.current = true;
    setSubmitButtonDisabled(true);

    if (forgotStep === 1) {
      // Send verification code to email
      try {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.success) {
          setForgotStep(2);
          submitButtonDisabledRef.current = false;
          setSubmitButtonDisabled(false);
        } else {
          setError(data.message || t.errGeneric);
          submitButtonDisabledRef.current = false;
          setSubmitButtonDisabled(false);
        }
      } catch {
        setError(t.errGeneric);
        submitButtonDisabledRef.current = false;
        setSubmitButtonDisabled(false);
      }
    } else if (forgotStep === 2) {
      // Verify code
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verificationCode }),
        });
        const data = await res.json();
        if (data.success) {
          setForgotStep(3);
          submitButtonDisabledRef.current = false;
          setSubmitButtonDisabled(false);
        } else {
          setError(data.message || t.errGeneric);
          submitButtonDisabledRef.current = false;
          setSubmitButtonDisabled(false);
        }
      } catch {
        setError(t.errGeneric);
        submitButtonDisabledRef.current = false;
        setSubmitButtonDisabled(false);
      }
    } else if (forgotStep === 3) {
      // Reset password
      if (newPassword !== confirmPassword) {
        setError(t.errPasswordMatch);
        submitButtonDisabledRef.current = false;
        setSubmitButtonDisabled(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verificationCode, newPassword }),
        });
        const data = await res.json();
        if (data.success) {
          setMode("login");
          setForgotStep(1);
          setVerificationCode("");
          setNewPassword("");
          setConfirmPassword("");
          setPassword("");
          submitButtonDisabledRef.current = false;
          setSubmitButtonDisabled(false);
        } else {
          setError(data.message || t.errGeneric);
          submitButtonDisabledRef.current = false;
          setSubmitButtonDisabled(false);
        }
      } catch {
        setError(t.errGeneric);
        submitButtonDisabledRef.current = false;
        setSubmitButtonDisabled(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");

    try {
      // Sign in with Firebase Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await getIdToken(user);

      // Send token to backend
      const res = await fetch(`${API_URL}/api/auth/firebase-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      const data = await res.json();

      if (data.success) {
        saveAuthSession(data.data);
        onClose();
        if (data.data.profileCompleted === false) {
          navigate("/dashboard/records");
        } else if (data.data.role === "admin") {
          navigate("/admin");
        } else if (data.data.role === "lab_staff") {
          navigate("/dashboard/lab-upload");
        } else if (data.data.role === "doctor") {
          navigate("/dashboard/doctor");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || t.errGeneric);
      }
    } catch (err) {
      console.error("Firebase auth error:", err);
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden relative animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-4">
            <img
              src="/LOGO.png"
              alt="MediCare"
              className="h-10 w-auto object-contain mb-3 no-invert"
            />
            <h2 className="text-xl font-black text-[var(--text-primary)]">
              {mode === "forgot"
                ? t.forgotTitle
                : mode === "login"
                  ? t.loginTitle
                  : t.registerTitle}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {mode === "forgot"
                ? t.forgotSub
                : mode === "login"
                  ? t.loginSub
                  : t.registerSub}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-xs mb-3 font-medium text-center border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl text-xs mb-3 font-semibold text-center border border-emerald-100 dark:border-emerald-900/30">
              {successMessage}
            </div>
          )}

          {mode === "forgot" && forgotStep === 2 && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-2.5 rounded-xl text-xs mb-3 font-medium text-center border border-green-100 dark:border-green-900/30">
              {t.codeSent}
            </div>
          )}

          <form
            className="space-y-3"
            onSubmit={mode === "forgot" ? handleForgotPassword : handleSubmit}
          >
            {mode === "forgot" ? (
              <>
                {forgotStep === 1 && (
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}
                {forgotStep === 2 && (
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                      {t.enterCode}
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                )}
                {forgotStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                        {t.newPassword}
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                        {t.confirmPassword}
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {mode === "register" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                        {t.fullName}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                        placeholder={t.fullNamePh}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                        {t.phone}
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                        placeholder="0912345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div
                  className={
                    mode === "register" ? "grid grid-cols-2 gap-3" : ""
                  }
                >
                  <div className={mode === "register" ? "" : "w-full"}>
                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {mode === "register" && (
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                        {t.gender}
                      </label>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-xl cursor-pointer transition-all font-bold text-xs bg-[var(--input-bg)] hover:bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-secondary)] has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 has-[:checked]:text-indigo-600">
                          <input
                            type="radio"
                            name="modalGender"
                            value="Nam"
                            checked={gender === "Nam"}
                            onChange={() => setGender("Nam")}
                            className="hidden"
                          />
                          {t.male}
                        </label>
                        <label className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border rounded-xl cursor-pointer transition-all font-bold text-xs bg-[var(--input-bg)] hover:bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-secondary)] has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 has-[:checked]:text-indigo-600">
                          <input
                            type="radio"
                            name="modalGender"
                            value="Nữ"
                            checked={gender === "Nữ"}
                            onChange={() => setGender("Nữ")}
                            className="hidden"
                          />
                          {t.female}
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={
                    mode === "register" ? "grid grid-cols-2 gap-3" : ""
                  }
                >
                  <div className={mode === "register" ? "" : "w-full"}>
                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                      {t.password}
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {mode === "register" && (
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">
                        {t.confirmPassword}
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-[var(--input-bg)] focus:bg-[var(--bg-primary)] outline-none text-[var(--text-primary)] text-sm"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {mode === "login" && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="rounded text-primary focus:ring-primary border-[var(--border-color)] w-4 h-4"
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium text-[var(--text-secondary)]"
                      >
                        {t.remember}
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError("");
                        setForgotStep(1);
                      }}
                      className="text-sm font-bold text-primary hover:text-primary-dark"
                    >
                      {t.forgot}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submitButtonDisabled || submitButtonDisabledRef.current
                  }
                  className="w-full py-2.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 mt-2 text-sm disabled:opacity-20 disabled:cursor-not-allowed disabled:grayscale disabled:shadow-none disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {mode === "login" ? t.loginBtn : t.registerBtn}
                </button>

                {mode === "login" && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border-color)]"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-[var(--card-bg)] text-[var(--text-secondary)]">
                          hoặc
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={
                        loading ||
                        submitButtonDisabled ||
                        submitButtonDisabledRef.current
                      }
                      className="w-full py-2.5 px-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-md border border-gray-300 flex items-center justify-center gap-3 text-sm disabled:opacity-20 disabled:cursor-not-allowed disabled:grayscale disabled:shadow-none disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {loading ? "Đang xử lý..." : "Đăng nhập với Google"}
                    </button>
                  </>
                )}
              </>
            )}

            {mode === "forgot" && (
              <button
                type="submit"
                disabled={
                  submitButtonDisabled || submitButtonDisabledRef.current
                }
                className="w-full py-2.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 mt-2 text-sm disabled:opacity-20 disabled:cursor-not-allowed disabled:grayscale disabled:shadow-none disabled:bg-gray-300 disabled:text-gray-500"
              >
                {forgotStep === 1
                  ? t.sendCode
                  : forgotStep === 2
                    ? t.verifyCode
                    : t.resetPassword}
              </button>
            )}
          </form>

          {mode === "forgot" ? (
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMessage("");
                  setForgotStep(1);
                  setVerificationCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-sm font-bold text-primary hover:underline"
              >
                {t.backToLogin}
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-center">
              <p className="text-sm text-[var(--text-secondary)] font-medium">
                {mode === "login" ? t.noAccount : t.hasAccount}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  {mode === "login" ? t.registerLink : t.loginLink}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
