'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/AuthContext';
import { login as loginService } from '@/services/auth';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // Redirection check (PublicRoute behavior)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu!');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await loginService({ email, password });
      login(response.accessToken);
      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');

      setTimeout(() => {
        router.replace('/');
      }, 1200);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      // Gọi API lên Backend Spring Boot để xác thực
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        throw new Error('Đăng nhập Google thất bại tại Backend!');
      }
      const data = await response.json();

      const jwtToken = data.accessToken || data.token;
      if (!jwtToken) {
        throw new Error('Không nhận được token xác thực từ máy chủ!');
      }

      login(jwtToken);
      setSuccessMessage('Đăng nhập bằng Google thành công! Đang chuyển hướng...');

      setTimeout(() => {
        router.replace('/');
      }, 1200);
    } catch (error) {
      console.error('Lỗi khi đăng nhập Google:', error);
      const errorMsg = error instanceof Error ? error.message : 'Đăng nhập bằng Google thất bại. Vui lòng thử lại!';
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setErrorMessage('Đăng nhập bằng Google thất bại. Vui lòng thử lại!');
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm text-slate-400">Đang kiểm tra bảo mật...</span>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen flex items-center justify-center bg-canvas font-sans text-body-text relative w-full overflow-hidden select-none">

        {/* Container holding the split design */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 bg-canvas border border-hairline rounded-lg overflow-hidden shadow-sm m-4 min-h-[640px]">

          {/* Left Column: Full-Bleed Signature Forest card */}
          <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-10 bg-sig-forest text-sig-cream overflow-hidden">

            {/* Header */}
            <div className="relative z-10 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-sig-cream flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-sig-forest" />
              </div>
              <span className="text-md font-medium tracking-widest text-sig-cream font-display">
                PLANORA
              </span>
            </div>

            {/* Visual Showcase - Print Magazine Layout Style */}
            <div className="relative z-10 my-auto space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-medium tracking-tight text-white leading-snug font-display">
                  Kiến tạo mọi trải nghiệm hoàn hảo
                </h2>
                <p className="text-xs text-sig-cream/80 leading-relaxed font-sans max-w-[280px]">
                  Nền tảng quản lý sự kiện và lập kế hoạch tiệc cưới tinh giản, chuẩn mực dành cho đơn vị chuyên nghiệp.
                </p>
              </div>

              {/* Editorial color-block cards mimicking product UI fragments */}
              <div className="space-y-3 pt-4">

                {/* Cream Callout Card */}
                <div className="bg-sig-cream text-ink p-4 rounded-md shadow-sm border border-sig-cream/20">
                  <span className="text-xs font-semibold uppercase tracking-wider block text-sig-coral mb-1">
                    Quản lý ngân sách
                  </span>
                  <p className="text-xs text-body-text leading-normal">
                    Kiểm soát chi phí theo thời gian thực trực quan, minh bạch.
                  </p>
                </div>

                {/* Peach Callout Card */}
                <div className="bg-sig-peach text-ink p-4 rounded-md shadow-sm border border-sig-peach/20">
                  <span className="text-xs font-semibold uppercase tracking-wider block text-sig-forest mb-1">
                    Lịch trình chi tiết
                  </span>
                  <p className="text-xs text-body-text leading-normal">
                    Phân chia đầu việc thông minh cho từng mốc thời gian.
                  </p>
                </div>

              </div>
            </div>

            {/* Footer list */}
            <div className="relative z-10 text-[10px] text-sig-cream/60 flex justify-between border-t border-white/10 pt-4">
              <span>Phiên bản 1.0.0</span>
              <span>© Planora Inc.</span>
            </div>
          </div>

          {/* Right Column: Clean White Canvas Form */}
          <div className="md:col-span-7 flex flex-col justify-center p-8 sm:p-16 bg-canvas">

            <div className="max-w-md w-full mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-medium text-ink tracking-tight mb-2 font-display">
                  Chào mừng trở lại
                </h1>
                <p className="text-muted-text text-sm">
                  Đăng nhập vào tài khoản của bạn để tiếp tục làm việc.
                </p>
              </div>

              {/* Error Message: Full-Bleed Signature Coral card with cream text */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-sig-coral text-sig-cream rounded-lg text-xs font-sans flex items-start gap-3 shadow-sm">
                  <span className="text-sig-cream text-sm shrink-0">⚠️</span>
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Success Message: Full-Bleed Signature Mint card with forest text */}
              {successMessage && (
                <div className="mb-6 p-4 bg-sig-mint text-sig-forest rounded-lg text-xs font-sans flex items-start gap-3 shadow-sm border border-sig-mint/20">
                  <CheckCircle2 className="w-4 h-4 text-sig-forest shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{successMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium uppercase tracking-wider text-ink block"
                  >
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-text" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      disabled={isSubmitting}
                      className="block w-full h-[44px] pl-10 pr-4 bg-canvas border border-hairline rounded-sm text-ink placeholder-slate-400 focus:outline-none focus:border-ink transition-editorial disabled:opacity-50 text-sm"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="text-xs font-medium uppercase tracking-wider text-ink block"
                    >
                      Mật khẩu
                    </label>
                    <a
                      href="#forgot"
                      className="text-xs text-link hover:text-link-active font-medium"
                      onClick={(e) => e.preventDefault()}
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-text" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      className="block w-full h-[44px] pl-10 pr-10 bg-canvas border border-hairline rounded-sm text-ink placeholder-slate-400 focus:outline-none focus:border-ink transition-editorial disabled:opacity-50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-text hover:text-ink transition-colors focus:outline-none cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button: Near-black Ink Primary CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[48px] flex items-center justify-center gap-2 rounded-lg font-medium text-white bg-primary hover:bg-primary-active active:scale-[0.99] transition-editorial cursor-pointer shadow-sm disabled:opacity-50 disabled:pointer-events-none text-sm group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

              </form>

              {/* Google Login Divider */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-hairline"></div>
                <span className="flex-shrink mx-4 text-muted-text text-[11px] uppercase tracking-wider font-semibold">Hoặc đăng nhập bằng</span>
                <div className="flex-grow border-t border-hairline"></div>
              </div>

              {/* Google Login Button */}
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  shape="pill"
                />
              </div>

              {/* Register link */}
              <div className="mt-8 text-center border-t border-hairline pt-6 text-sm text-muted-text">
                Chưa có tài khoản?{' '}
                <a
                  href="#register"
                  className="text-link hover:text-link-active font-medium"
                  onClick={(e) => e.preventDefault()}
                >
                  Đăng ký thành viên
                </a>
              </div>

              {/* Quick Login Assist (cleaner card structure) */}
              <div className="mt-8 p-4 bg-surface-soft rounded-md border border-hairline text-[11px] text-body-text flex flex-col gap-1.5">
                <span className="font-semibold text-ink uppercase tracking-wider block mb-0.5">
                  Tài khoản thử nghiệm (Demo)
                </span>
                <div className="grid grid-cols-2 gap-2 text-muted-text font-mono border-t border-hairline/60 pt-2">
                  <div>
                    <span className="block text-[9px] font-sans uppercase font-medium text-ink">Vai trò Khách</span>
                    <span>user@planora.com</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-sans uppercase font-medium text-ink font-semibold">Mật khẩu chung</span>
                    <span className="text-sig-coral">123456</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] font-sans uppercase font-medium text-ink">Vai trò Khác</span>
                    <div className="flex gap-2">
                      <span>vendor@planora.com</span>
                      <span>•</span>
                      <span>admin@planora.com</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
