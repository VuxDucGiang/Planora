'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Sparkles, 
  Send, 
  TrendingUp, 
  UserCheck, 
  RefreshCw,
  Eye,
  ArrowRight,
  Mail
} from 'lucide-react';
import { getAdminSummary, getAdminFunnel, getAdminActivities } from '@/services/admin';
import type { AdminSummaryResponse, AdminFunnelResponse, UserActivityItem } from '@/types/admin';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummaryResponse | null>(null);
  const [funnel, setFunnel] = useState<AdminFunnelResponse | null>(null);
  const [activities, setActivities] = useState<UserActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, funRes, actRes] = await Promise.all([
        getAdminSummary(),
        getAdminFunnel(),
        getAdminActivities(0, 10),
      ]);
      setSummary(sumRes);
      setFunnel(funRes);
      setActivities(actRes.content || []);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu admin:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'GENERATE_PLAN':
      case 'SAVE_PLAN':
        return 'bg-[#5D0F12]/10 text-[#5D0F12] border-[#5D0F12]/20 font-semibold';
      case 'SEND_INQUIRY':
        return 'bg-[#5D0F12] text-[#FFFBF5] border-[#5D0F12] font-semibold';
      case 'ONBOARDING_COMPLETED':
        return 'bg-[#FAF8F5] text-stone-800 border-[#EADCC9] font-medium';
      case 'VIEW_VENDOR':
        return 'bg-amber-50/70 text-amber-900 border-amber-200/60 font-medium';
      case 'LOGIN':
      case 'REGISTER':
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200 font-medium';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">Admin & User Tracking Dashboard</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Theo dõi hành vi người dùng, phễu chuyển đổi và tương tác AI trên sàn Planora theo thời gian thực.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/email"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5D0F12] px-4 py-2.5 text-xs font-semibold text-[#FFFBF5] shadow-sm hover:bg-[#4A0C0E] transition cursor-pointer w-full sm:w-auto"
          >
            <Mail className="h-4 w-4" />
            <span>Gửi Email Người Dùng</span>
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EADCC9] bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-[#FAF8F5] hover:text-[#5D0F12] transition cursor-pointer w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 text-[#5D0F12] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Đang cập nhật...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#5D0F12]/20 bg-[#5D0F12]/5 p-4 text-sm text-[#5D0F12]">
          <p className="font-semibold">Lỗi tải dữ liệu:</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      )}

      {/* 4 Thẻ KPI Nổi Bật - 2 cột trên mobile, 4 cột trên desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {/* Card 1: Users */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Tổng Người Dùng</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{summary?.totalUsers || 0}</span>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[11px] sm:text-xs text-stone-500">
              <span className="font-medium text-stone-700">{summary?.totalCouples || 0} Cặp đôi</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-medium text-stone-700">{summary?.totalVendors || 0} Vendor</span>
            </div>
          </div>
        </div>

        {/* Card 2: DAU */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Hoạt động 24h</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{summary?.dailyActiveUsers || 0}</span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#5D0F12] bg-[#5D0F12]/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-[#5D0F12]/20 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5D0F12] animate-pulse"></span>
                Active
              </span>
            </div>
            <p className="mt-1 text-[11px] sm:text-xs text-stone-400">Tài khoản trong ngày</p>
          </div>
        </div>

        {/* Card 3: AI Plans */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Kế hoạch AI</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{summary?.totalPlansGenerated || 0}</span>
            <p className="mt-1 text-[11px] sm:text-xs text-[#5D0F12] font-semibold">Plans đã tạo</p>
          </div>
        </div>

        {/* Card 4: Inquiries */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Yêu cầu Tư vấn</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{summary?.totalInquiriesSent || 0}</span>
            <p className="mt-1 text-[11px] sm:text-xs text-[#5D0F12] font-semibold">Gửi tới Vendor</p>
          </div>
        </div>
      </div>

      {/* Phễu Chuyển Đổi (Conversion Funnel) */}
      <div className="rounded-2xl border border-[#EADCC9] bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(93,15,18,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-5 border-b border-[#EADCC9]/60 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Phễu Hành Vi & Chuyển Đổi (User Funnel)</h2>
            <p className="text-xs text-stone-500 mt-0.5">Tỉ lệ cặp đôi đi từ Đăng ký tài khoản đến khi tạo kế hoạch cưới và gửi yêu cầu tư vấn</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5D0F12] bg-[#5D0F12]/10 px-3 py-1.5 rounded-full border border-[#5D0F12]/20 self-start sm:self-auto">
            <TrendingUp className="h-3.5 w-3.5" />
            Tỉ lệ tạo Plan: {summary?.planConversionRate || 0}%
          </span>
        </div>

        <div className="mt-6 space-y-5">
          {[
            { label: '1. Đăng ký tài khoản (Couples)', count: funnel?.registeredUsers || 0, max: funnel?.registeredUsers || 1 },
            { label: '2. Hoàn thành Onboarding', count: funnel?.onboardingCompleted || 0, max: funnel?.registeredUsers || 1 },
            { label: '3. Tạo Kế hoạch Cưới AI', count: funnel?.planGenerated || 0, max: funnel?.registeredUsers || 1 },
            { label: '4. Xem Hồ sơ Nhà cung cấp', count: funnel?.vendorViewed || 0, max: funnel?.registeredUsers || 1 },
            { label: '5. Gửi Yêu cầu Báo giá (Inquiry Lead)', count: funnel?.inquirySent || 0, max: funnel?.registeredUsers || 1 },
          ].map((step, idx) => {
            const percentage = Math.min(100, Math.round((step.count / (step.max || 1)) * 100));
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="font-semibold text-stone-800">{step.label}</span>
                  <span className="font-mono text-stone-600">{step.count} ({percentage}%)</span>
                </div>
                {/* Thanh tiến trình đồng bộ màu Đỏ chủ đạo Planora (#5D0F12) */}
                <div className="h-3.5 w-full rounded-full bg-[#FAF8F5] border border-[#EADCC9]/60 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-[#5D0F12] transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bảng Nhật Ký Tracking Gần Nhất (Live Action Stream) */}
      <div className="rounded-2xl border border-[#EADCC9] bg-white p-4 sm:p-6 shadow-[0_4px_20px_rgba(93,15,18,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EADCC9]/60 mb-4 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">Nhật Ký Tương Tác Gần Nhất (Live Activities)</h2>
            <p className="text-xs text-stone-500 mt-0.5">Các thao tác của người dùng trên nền tảng được ghi nhận theo thời gian thực</p>
          </div>
          <Link
            href="/admin/activities"
            className="text-xs font-semibold text-[#5D0F12] hover:text-[#4A0C0E] flex items-center gap-1 transition self-start sm:self-auto"
          >
            Xem tất cả nhật ký <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[650px] text-left text-sm text-stone-600">
            <thead className="bg-[#FAF8F5] text-[11px] uppercase tracking-wider text-stone-500 border-b border-[#EADCC9]/80">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Thời gian</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Hành động (Action)</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Metadata</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Hành trình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADCC9]/50">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 text-sm">
                    Chưa có nhật ký hoạt động nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#FAF8F5]/80 transition">
                    <td className="px-4 py-3.5 text-xs text-stone-500 whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[#1A1A1A] text-sm">
                        {act.userFullName || act.userEmail || `Khách (#${act.userId || 'Guest'})`}
                      </div>
                      {act.userEmail && (
                        <div className="text-xs text-stone-400">{act.userEmail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs border ${getActionBadge(act.action)}`}>
                        {act.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-stone-600">
                      <span className="font-medium text-stone-800">{act.entityType || '-'}</span>
                      {act.entityId && (
                        <span className="text-stone-400 ml-1">#{act.entityId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-stone-500 max-w-xs truncate">
                      {act.metadata ? JSON.stringify(act.metadata) : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {act.userId ? (
                        <Link
                          href={`/admin/users/${act.userId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5D0F12] bg-[#5D0F12]/10 hover:bg-[#5D0F12] hover:text-[#FFFBF5] px-2.5 py-1.5 rounded-lg transition"
                        >
                          <Eye className="h-3.5 w-3.5" /> Chi tiết
                        </Link>
                      ) : (
                        <span className="text-xs text-stone-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
