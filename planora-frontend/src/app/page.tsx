'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';

export default function Home() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm text-slate-400">Đang tải dữ liệu phiên làm việc...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col relative w-full overflow-hidden">
      <DashboardHeader logout={logout} />

      {/* Main Content: Generous vertical padding, max-width container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 py-16 flex flex-col justify-center">
        
        {/* Success Header Area */}
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex p-3 rounded-full bg-sig-mint/20 text-success border border-sig-mint mb-2">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-ink font-display">
            Xác thực thành công
          </h1>
          <p className="text-sm text-muted-text leading-relaxed">
            Bạn đã đăng nhập thành công vào hệ thống quản lý sự kiện Planora. Hãy sử dụng bảng điều khiển bên dưới để theo dõi trạng thái tích hợp.
          </p>
        </div>

        {/* Dashboard grid - Hierarchical border-radius and color blocking */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* User Profile Card - Soft surface */}
          <div className="md:col-span-4 bg-surface-soft border border-hairline rounded-lg p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-canvas border border-hairline flex items-center justify-center mb-4 text-primary shadow-sm">
              <UserIcon className="w-6 h-6" />
            </div>
            <h2 className="text-md font-medium text-ink mb-1 font-display">
              {user?.fullName}
            </h2>
            <p className="text-xs text-muted-text font-mono mb-4 break-all">
              {user?.email}
            </p>
            <span className="px-3 py-1 rounded-sm text-[9px] font-semibold uppercase tracking-wider bg-primary text-white">
              Quyền hạn: {user?.role}
            </span>
          </div>

          {/* Quick Stats/Links Card - Canvas styled */}
          <div className="md:col-span-8 bg-canvas border border-hairline rounded-lg p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2 border-b border-hairline pb-3 font-display">
                <Calendar className="w-4 h-4 text-link" />
                <span>Trạng thái kết nối dịch vụ</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Status DB */}
                <div className="p-4 bg-surface-soft rounded-sm border border-hairline flex justify-between items-center">
                  <span className="text-xs text-body-text">Cơ sở dữ liệu (MySQL)</span>
                  <span className="text-xs font-medium text-success flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Đã kết nối
                  </span>
                </div>

                {/* Status API */}
                <div className="p-4 bg-surface-soft rounded-sm border border-hairline flex justify-between items-center">
                  <span className="text-xs text-body-text">API Gateway (Proxy)</span>
                  <span className="text-xs font-medium text-success flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Hoạt động
                  </span>
                </div>

                {/* Session Active */}
                <div className="sm:col-span-2 p-4 bg-surface-soft rounded-sm border border-hairline flex justify-between items-center">
                  <span className="text-xs text-body-text">Khóa bảo mật phiên</span>
                  <span className="font-mono text-[10px] text-link bg-canvas border border-hairline px-2 py-0.5 rounded-sm">
                    Bearer JWT Token
                  </span>
                </div>

              </div>
            </div>

            {/* Cream callout card for system message */}
            <div className="p-4 bg-sig-cream border border-sig-cream/35 rounded-md text-xs text-ink flex gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-sig-coral mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-sig-coral block mb-0.5">Thông báo hệ thống</span>
                Đây là giao diện điều phối cơ sở. Các mô-đun chức năng về lập sơ đồ bàn tiệc, quản lý danh sách khách mời, theo dõi nhà cung cấp và thanh toán chi phí sẽ tự động được hiển thị tại đây khi được phân quyền tương ứng.
              </div>
            </div>
          </div>

        </div>

      </main>

      <DashboardFooter />
    </div>
  );
}
