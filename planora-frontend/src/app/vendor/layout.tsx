'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Store,
  Camera,
  Briefcase,
  MessageSquare,
  Star,
  BarChart3,
  ExternalLink,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { parseToken } from '@/services/auth';
import { getVendorProfile } from '@/services/vendorProfile';
import type { VendorProfileResponse } from '@/types/vendor';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [vendorData, setVendorData] = useState<VendorProfileResponse | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('planora_token');
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const parsed = parseToken(token);
      const role = parsed?.role || '';
      const email = parsed?.email || '';

      // Cho phép nếu có role VENDOR hoặc ADMIN hoặc email là vendor mẫu
      const hasVendorAccess =
        role === 'VENDOR' ||
        role === 'ADMIN' ||
        email.includes('vendor') ||
        email.includes('admin');

      if (!hasVendorAccess) {
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);

      // Load vendor info for sidebar
      getVendorProfile()
        .then((profile) => setVendorData(profile))
        .catch(() => {
          // Fallback if not completed yet
        });
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
          <p className="text-xs font-medium text-stone-500 font-serif italic">
            Đang xác thực thông tin Nhà cung cấp Planora...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FFFBF5] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5D0F12]/10 text-[#5D0F12] mb-4 shadow-sm border border-[#5D0F12]/20">
          <Building2 className="h-8 w-8" />
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight uppercase"
          style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
        >
          Kênh Dành Riêng Cho Nhà Cung Cấp
        </h1>
        <p className="mt-3 text-sm text-stone-600 max-w-md">
          Bạn cần đăng nhập bằng tài khoản có vai trò{' '}
          <strong className="text-[#5D0F12]">Nhà cung cấp (VENDOR)</strong> để quản lý trang cá nhân, dịch vụ và bộ sưu tập ảnh cưới.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-[#5D0F12] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FFFBF5] shadow-md shadow-[#5D0F12]/20 hover:bg-[#4A0C0E] transition"
          >
            Đăng nhập tài khoản Vendor
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-[#D4B896] bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-[#FAF8F5] transition"
          >
            Đăng ký mở Gian hàng mới
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Hồ sơ thương hiệu',
      href: '/vendor/profile',
      icon: Store,
      badge: 'Giai đoạn 1',
    },
    {
      name: 'Bộ sưu tập ảnh (Portfolio)',
      href: '/vendor/profile#portfolios',
      icon: Camera,
      badge: 'Cloudinary',
    },
    {
      name: 'Dịch vụ & Gói giá',
      href: '/vendor/services',
      icon: Briefcase,
      badge: 'Giai đoạn 2',
      disabled: false,
    },
    {
      name: 'Tin nhắn tư vấn (Chat)',
      href: '/vendor/chat',
      icon: MessageSquare,
      badge: 'Giai đoạn 3',
      disabled: false,
    },
    {
      name: 'Đánh giá của dâu rể',
      href: '/vendor/reviews',
      icon: Star,
      badge: 'Giai đoạn 4',
      disabled: false,
    },
    {
      name: 'Thống kê hiệu quả',
      href: '/vendor/analytics',
      icon: BarChart3,
      badge: 'Giai đoạn 4',
      disabled: false,
    },
  ];

  const renderNavContent = () => (
    <>
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#EADCC9]/60">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5D0F12] text-[#FFFBF5] font-bold shadow-md shadow-[#5D0F12]/20 text-xl shrink-0">
            🕊️
          </span>
          <div className="overflow-hidden">
            <h2
              className="font-bold text-[#1A1A1A] tracking-wide text-lg uppercase"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              Planora Vendor
            </h2>
            <span className="text-[10px] font-semibold text-[#5D0F12] bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" /> Đối tác dịch vụ cưới
            </span>
          </div>
        </div>

        {/* Vendor Brief Info Card */}
        {vendorData && (
          <div className="mt-4 p-3 rounded-xl bg-white border border-[#EADCC9]/70 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#D4B896]/50 shrink-0 flex items-center justify-center">
              {vendorData.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={vendorData.avatarUrl}
                  alt={vendorData.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-5 h-5 text-[#5D0F12]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-neutral-900 truncate">
                {vendorData.businessName || 'Thương hiệu cưới'}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">
                {vendorData.city || 'Chưa cập nhật địa điểm'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="mt-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-[#5D0F12] text-[#FFFBF5] shadow-sm shadow-[#5D0F12]/20'
                    : 'text-stone-700 hover:bg-[#FAF8F5] hover:text-[#5D0F12]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tight font-medium ${
                      isActive
                        ? 'bg-white/20 text-[#FFFBF5]'
                        : 'bg-[#FAF8F5] border border-[#EADCC9] text-stone-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-[#EADCC9]/60 space-y-2">
        {vendorData?.id && (
          <Link
            href={`/marketplace/${vendorData.id}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#D4B896] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-800 hover:bg-[#FAF8F5] hover:text-[#5D0F12] transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Xem trang Marketplace</span>
          </Link>
        )}

        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về trang chủ Planora</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất Vendor</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#FFFBF5] text-stone-800 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-[#EADCC9]/70 bg-[#FFFBF5] p-6 shrink-0 sticky top-0 h-screen">
        {renderNavContent()}
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-[#EADCC9] bg-[#FFFBF5]/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5D0F12] text-[#FFFBF5] text-sm font-bold shadow-sm">
            🕊️
          </span>
          <span
            className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wider"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            Planora Vendor
          </span>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-1.5 rounded-lg border border-[#EADCC9] text-stone-700 bg-white"
        >
          {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-[#FFFBF5] h-full p-5 flex flex-col justify-between overflow-y-auto pt-16">
            {renderNavContent()}
          </div>
          <div className="flex-1" onClick={() => setIsMobileNavOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 lg:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}

