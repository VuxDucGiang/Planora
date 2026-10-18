'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Activity, 
  ArrowLeft,
  ShieldAlert,
  LogOut,
  Sparkles,
  UserX,
  Menu,
  X
} from 'lucide-react';
import { parseToken } from '@/services/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isMobileAdminOpen, setIsMobileAdminOpen] = useState(false);

  // Auto close mobile drawer on route change
  useEffect(() => {
    setIsMobileAdminOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('planora_token');
    const userStr = localStorage.getItem('planora_user');

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      let role = '';
      let email = '';

      // Kiểm tra qua parseToken từ JWT
      const parsed = parseToken(token);
      if (parsed) {
        email = parsed.email;
        role = parsed.role || '';
      }

      // Kiểm tra thêm qua localStorage nếu có lưu object user
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.role) role = typeof userObj.role === 'string' ? userObj.role : userObj.role.roleName || '';
          if (userObj.email) email = userObj.email;
        } catch {
          // ignore
        }
      }

      setAdminEmail(email || 'Admin');

      // Cho phép nếu có role ADMIN hoặc email là admin mặc định
      if (role === 'ADMIN' || email === 'admin@planora.com') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('planora_token');
    localStorage.removeItem('planora_user');
    router.push('/login');
  };

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFBF5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5D0F12] border-t-transparent shadow-sm"></div>
          <p className="text-xs font-medium text-stone-500">Đang xác thực quyền Quản trị viên...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FFFBF5] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5D0F12]/10 text-[#5D0F12] mb-4 shadow-sm border border-[#5D0F12]/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Quyền truy cập bị từ chối</h1>
        <p className="mt-2 text-sm text-stone-600 max-w-md">
          Bạn cần đăng nhập bằng tài khoản có vai trò <strong className="text-[#5D0F12]">Quản trị viên (ADMIN)</strong> (ví dụ: <code className="bg-[#FAF8F5] border border-[#EADCC9] px-1.5 py-0.5 rounded text-xs font-mono text-[#5D0F12]">admin@planora.com</code>) để truy cập hệ thống Tracking Dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-[#5D0F12] px-5 py-2.5 text-sm font-semibold text-[#FFFBF5] shadow-md shadow-[#5D0F12]/20 hover:bg-[#4A0C0E] transition"
          >
            Đăng nhập tài khoản Admin
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[#EADCC9] bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-[#FAF8F5] transition"
          >
            Quay lại Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Tổng quan (KPI & Funnel)', href: '/admin', icon: LayoutDashboard },
    { name: 'Insight Thị Trường & AI', href: '/admin/ai-insights', icon: Sparkles },
    { name: 'Tài khoản Ngủ đông', href: '/admin/dormant', icon: UserX },
    { name: 'Nhật ký Tracking (Logs)', href: '/admin/activities', icon: Activity },
  ];

  const renderNavContent = () => (
    <>
      <div>
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#EADCC9]/60">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5D0F12] text-[#FFFBF5] font-bold shadow-md shadow-[#5D0F12]/20 text-lg shrink-0">
            🕊️
          </span>
          <div className="overflow-hidden">
            <h2 className="font-bold text-[#1A1A1A] tracking-tight text-base">Planora Admin</h2>
            <span className="text-[11px] font-semibold text-[#5D0F12] bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Tracking Tool
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive 
                    ? 'bg-[#5D0F12] text-[#FFFBF5] shadow-md shadow-[#5D0F12]/25 font-semibold' 
                    : 'text-stone-700 hover:bg-[#F5EFE6] hover:text-[#5D0F12]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Footer */}
      <div className="pt-4 border-t border-[#EADCC9]/60 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-[#1A1A1A] truncate">{adminEmail}</p>
            <p className="text-[10px] text-[#5D0F12] font-semibold uppercase tracking-wider">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="text-stone-400 hover:text-[#5D0F12] transition p-1.5 rounded-lg hover:bg-[#5D0F12]/10"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-[#5D0F12] transition px-1 py-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Về Trang chủ Planora
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#FFFBF5] font-sans text-stone-800 flex-col lg:flex-row">
      {/* ─── MOBILE TOP BAR (lg:hidden) ─── */}
      <header className="lg:hidden h-14 bg-[#FAF8F5] border-b border-[#EADCC9] px-4 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileAdminOpen(!isMobileAdminOpen)}
            className="w-9 h-9 rounded-lg bg-white border border-[#EADCC9] flex items-center justify-center text-stone-700 hover:text-[#5D0F12]"
            aria-label="Mở menu quản trị"
          >
            {isMobileAdminOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base">🕊️</span>
            <span className="font-bold text-sm text-[#1A1A1A]">Admin Portal</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="text-stone-500 hover:text-[#5D0F12] p-2 rounded-lg bg-white border border-[#EADCC9]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* ─── DESKTOP SIDEBAR (hidden lg:flex) ─── */}
      <aside className="hidden lg:flex w-64 border-r border-[#EADCC9] bg-[#FAF8F5] p-5 flex-col justify-between shrink-0 shadow-sm sticky top-0 h-screen overflow-y-auto">
        {renderNavContent()}
      </aside>

      {/* ─── MOBILE ADMIN DRAWER (when isMobileAdminOpen is true) ─── */}
      {isMobileAdminOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsMobileAdminOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#FAF8F5] p-5 z-50 flex flex-col justify-between shadow-2xl animate-slide-right overflow-y-auto">
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
