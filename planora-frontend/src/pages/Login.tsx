import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { login as loginService } from '../services/auth';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import loginBanner from '../assets/login_banner.png';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
      
      // Delay navigation slightly to let the success animation show
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans text-slate-100 overflow-hidden relative w-full">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />

      {/* Main card container */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/50 m-4 relative z-10 min-h-[600px]">
        
        {/* Left column: Visual branding - hidden on mobile, beautiful on desktop */}
        <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-8 overflow-hidden border-r border-slate-800 bg-slate-950/40">
          {/* Overlay Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
          
          {/* Branding Top */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              PLANORA
            </span>
          </div>

          {/* Banner Graphic Center */}
          <div className="relative z-10 my-auto py-6 flex flex-col items-center">
            <div className="relative group max-w-[280px]">
              {/* Outer soft glow border */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
              <img 
                src={loginBanner} 
                alt="Planora Visual" 
                className="relative rounded-2xl border border-slate-700/50 object-cover shadow-xl transition-all duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Kiến Tạo Khoảnh Khắc</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                Nền tảng quản lý tiệc cưới và tổ chức sự kiện chuyên nghiệp hàng đầu.
              </p>
            </div>
          </div>

          {/* Footer List Bottom */}
          <div className="relative z-10 flex flex-col gap-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Quản lý kế hoạch thông minh</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>Tối ưu hóa ngân sách chặt chẽ</span>
            </div>
          </div>
        </div>

        {/* Right column: Login Form */}
        <div className="md:col-span-7 flex flex-col justify-center p-8 sm:p-12 relative bg-slate-900/40">
          
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                Chào mừng trở lại!
              </h2>
              <p className="text-slate-400 text-sm">
                Đăng nhập vào tài khoản của bạn để tiếp tục quản lý sự kiện.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm flex items-start gap-3 animate-shake">
                <span className="text-rose-400 text-lg select-none">⚠️</span>
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2 relative">
                <label 
                  htmlFor="email" 
                  className="text-xs font-semibold uppercase tracking-wider text-slate-400 block"
                >
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    disabled={isSubmitting}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all disabled:opacity-50 text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label 
                    htmlFor="password" 
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Mật khẩu
                  </label>
                  <a 
                    href="#forgot" 
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                    onClick={(e) => e.preventDefault()}
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="block w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all disabled:opacity-50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:pointer-events-none text-sm group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Mock Register section */}
            <div className="mt-8 text-center border-t border-slate-800/80 pt-6 text-sm text-slate-400">
              Chưa có tài khoản?{' '}
              <a 
                href="#register" 
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                onClick={(e) => e.preventDefault()}
              >
                Đăng ký ngay
              </a>
            </div>

            {/* Quick Login Assist (for development reference) */}
            <div className="mt-8 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/60 text-[11px] text-slate-500 flex flex-col gap-1">
              <span className="font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Tài khoản demo:</span>
              <div className="flex justify-between">
                <span>Email: <code className="text-indigo-300 font-mono">user@planora.com</code></span>
                <span>Mật khẩu: <code className="text-indigo-300 font-mono">123456</code></span>
              </div>
              <div className="flex justify-between">
                <span>Email: <code className="text-indigo-300 font-mono">vendor@planora.com</code></span>
                <span>Email: <code className="text-indigo-300 font-mono">admin@planora.com</code></span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
