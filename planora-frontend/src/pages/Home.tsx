import React from 'react';
import { useAuth } from '../stores/AuthContext';
import { LogOut, User as UserIcon, Calendar, Sparkles, AlertCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative w-full overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[65%] h-[60%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
            PLANORA
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-center relative z-10">
        
        {/* Success Card */}
        <div className="mb-10 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Chào mừng bạn đến với Planora!
          </h1>
          <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm">
            Tài khoản của bạn đã được xác thực thành công. Bạn đang truy cập vào trang tổng quan của Planora.
          </p>
        </div>

        {/* Profile Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User Profile Card */}
          <div className="md:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-slate-850 border border-slate-750 flex items-center justify-center mb-4 text-violet-400 shadow-inner">
              <UserIcon className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white mb-0.5">
              {user?.fullName}
            </h2>
            <p className="text-xs text-slate-500 font-mono mb-4 break-all">
              {user?.email}
            </p>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Quyền: {user?.role}
            </span>
          </div>

          {/* Quick Stats/Links Card */}
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Trạng thái dự án</span>
              </h3>
              
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Kết nối cơ sở dữ liệu:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Hoạt động
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Trạng thái API Backend:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Đã kết nối (Proxy OK)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Phiên đăng nhập:</span>
                  <span className="font-mono text-xs text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-850">
                    Active (Bearer JWT)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2.5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-800/20 text-xs text-indigo-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
              <span>
                Đây là giao diện đăng nhập ban đầu. Trong các giai đoạn tiếp theo, các tính năng tạo sự kiện, quản lý khách mời, và lập ngân sách sẽ được hiển thị tại đây.
              </span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950/80">
        © 2026 Planora Event Manager. Bảo lưu mọi quyền.
      </footer>
    </div>
  );
};
