'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
  Sparkles,
  Calendar,
  Users,
  Coins,
  MapPin,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { getVendorAnalytics } from '@/services/vendorAnalytics';
import type { VendorAnalyticsResponse } from '@/types/vendor';

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<VendorAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const res = await getVendorAnalytics();
        setData(res);
      } catch (err: unknown) {
        console.error('Lỗi khi tải thống kê analytics:', err);
        setErrorMessage('Không thể tải dữ liệu thống kê. Vui lòng tải lại trang.');
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  const formatVND = (amount?: number) => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Chưa ấn định';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm font-serif italic text-stone-500">
            Đang phân tích dữ liệu hiệu quả kinh doanh...
          </span>
        </div>
      </div>
    );
  }

  const inquiriesTotal = data?.totalInquiries || 0;
  const pendingCount = data?.pendingInquiries || 0;
  const respondedCount = data?.respondedInquiries || 0;
  const closedCount = data?.closedInquiries || 0;

  const responseRate = inquiriesTotal > 0
    ? Math.round(((respondedCount + closedCount) / inquiriesTotal) * 100)
    : 100;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {errorMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-widest bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Giai đoạn 4: Hiệu Quả & Thống Kê
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#5D0F12] mt-2"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            Báo Cáo Hiệu Quả Kinh Doanh & Tiềm Năng
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-serif italic">
            Theo dõi mức độ tương tác của dâu rể, tỷ lệ phản hồi tư vấn và tiếp cận các cặp đôi phù hợp qua thuật toán Smart AI Matching.
          </p>
        </div>
      </section>

      {/* 4 Core KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Shortlist Saves */}
        <div className="rounded-[1.75rem] border border-[#EADCC9] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Lượt Lưu Yêu Thích
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
          </div>
          <div
            className="text-3xl font-bold text-[#5D0F12]"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            {data?.totalShortlists || 0}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Cặp đôi đã thêm vào Shortlist kế hoạch
          </p>
        </div>

        {/* Rating Score */}
        <div className="rounded-[1.75rem] border border-[#EADCC9] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Điểm Đánh Giá
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div
            className="text-3xl font-bold text-[#5D0F12]"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            {data?.ratingAverage ? data.ratingAverage.toFixed(1) : '5.0'} / 5.0
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Từ {data?.totalReviews || 0} lượt nhận xét của dâu rể
          </p>
        </div>

        {/* Response Rate */}
        <div className="rounded-[1.75rem] border border-[#EADCC9] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Tỷ Lệ Phản Hồi Chat
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-3xl font-bold text-[#5D0F12]"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            {responseRate}%
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            {respondedCount + closedCount} / {inquiriesTotal} cuộc tư vấn đã xử lý
          </p>
        </div>

        {/* Catalog & Portfolios */}
        <div className="rounded-[1.75rem] border border-[#EADCC9] bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Quy Mô Gian Hàng
            </span>
            <div className="p-2 rounded-xl bg-stone-100 text-[#5D0F12] border border-stone-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-3xl font-bold text-[#5D0F12]"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            {data?.totalPackagesCount || 0}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Gói dịch vụ & {data?.portfolioImagesCount || 0} ảnh Portfolio
          </p>
        </div>
      </section>

      {/* Analytics Breakdown Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiry Funnel Status */}
        <div className="rounded-[1.75rem] border border-[#EADCC9] bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EADCC9]/50 pb-3">
            <div>
              <h2
                className="text-base font-bold uppercase tracking-wide text-neutral-900"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                Phễu Chuyển Đổi Yêu Cầu Tư Vấn
              </h2>
              <p className="text-xs text-stone-500 font-serif italic">
                Theo dõi tiến độ từ lúc nhận tin nhắn đến khi chốt hợp đồng.
              </p>
            </div>
            <Link
              href="/vendor/chat"
              className="text-xs font-bold text-[#5D0F12] hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>Vào hộp chat</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {/* Pending */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Đang chờ phản hồi (Pending)</h4>
                  <p className="text-[10px] text-stone-500">Cần phản hồi sớm để tăng cơ hội chốt dịch vụ</p>
                </div>
              </div>
              <span className="text-base font-bold text-amber-700">{pendingCount}</span>
            </div>

            {/* Responded */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Đã phản hồi (Responded)</h4>
                  <p className="text-[10px] text-stone-500">Đang trong quá trình trao đổi & báo giá</p>
                </div>
              </div>
              <span className="text-base font-bold text-emerald-700">{respondedCount}</span>
            </div>

            {/* Closed */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-stone-600" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Đã hoàn tất (Closed)</h4>
                  <p className="text-[10px] text-stone-500">Đã chốt thỏa thuận hoặc hoàn tất tư vấn</p>
                </div>
              </div>
              <span className="text-base font-bold text-stone-700">{closedCount}</span>
            </div>
          </div>
        </div>

        {/* Rating Health Overview */}
        <div className="rounded-[1.75rem] border border-[#EADCC9] bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EADCC9]/50 pb-3">
            <div>
              <h2
                className="text-base font-bold uppercase tracking-wide text-neutral-900"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                Chỉ Số Hài Lòng & Uy Tín
              </h2>
              <p className="text-xs text-stone-500 font-serif italic">
                Tỷ lệ đánh giá tích cực giúp gian hàng hiển thị ở vị trí ưu tiên.
              </p>
            </div>
            <Link
              href="/vendor/reviews"
              className="text-xs font-bold text-[#5D0F12] hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>Xem nhận xét</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="text-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADCC9] shrink-0 w-32">
              <span
                className="text-4xl font-bold text-[#5D0F12] block"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                {data?.ratingAverage ? data.ratingAverage.toFixed(1) : '5.0'}
              </span>
              <div className="flex justify-center my-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <span className="text-[10px] text-stone-500 font-semibold block uppercase">
                Tuyệt vời
              </span>
            </div>

            <div className="flex-1 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>5 Sao (Xuất sắc):</span>
                <span className="font-bold text-neutral-900">{data?.fiveStarCount || 0}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>4 Sao (Rất tốt):</span>
                <span className="font-bold text-neutral-900">{data?.fourStarCount || 0}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>3 Sao trở xuống:</span>
                <span className="font-bold text-stone-500">
                  {(data?.threeStarCount || 0) + (data?.twoStarCount || 0) + (data?.oneStarCount || 0)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium pt-1">
                ✓ 100% đánh giá đáp ứng tiêu chuẩn đối tác uy tín Planora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Smart AI Matching Leads */}
      <section className="rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EADCC9]/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-widest bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Recommendation
              </span>
            </div>
            <h2
              className="text-xl font-bold uppercase tracking-wide text-neutral-900 mt-1"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              Cặp Đôi Tiềm Năng (Smart Matching Leads)
            </h2>
            <p className="text-xs text-stone-500 font-serif italic mt-0.5">
              Thuật toán Planora tự động gợi ý các kế hoạch cưới có phong cách, địa điểm và dự trù ngân sách trùng khớp với dịch vụ của bạn.
            </p>
          </div>
        </div>

        {/* Matching Leads List */}
        {data?.recentMatchingLeads && data.recentMatchingLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentMatchingLeads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-[#EADCC9] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] hover:border-[#D4B896] transition p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-900">
                      {lead.customerName}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      ✦ Match: {Math.round(lead.matchingScore)}%
                    </span>
                  </div>

                  {lead.reason && (
                    <p className="text-xs text-stone-600 font-serif italic leading-relaxed">
                      {lead.reason}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#5D0F12]" />
                      <span>{formatDate(lead.weddingDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#5D0F12]" />
                      <span>{lead.guestCount ? `${lead.guestCount} khách` : 'Chưa định'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-[#5D0F12]" />
                      <span className="font-semibold text-[#5D0F12]">{formatVND(lead.budget)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5D0F12]" />
                      <span className="truncate">{lead.location || 'Chưa định'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EADCC9]/50 flex justify-end">
                  <Link
                    href="/vendor/chat"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5D0F12] hover:underline"
                  >
                    <span>Mở hội thoại tư vấn</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-[#EADCC9] bg-[#FAF8F5]/50">
            <p className="text-xs text-stone-600">
              Hiện tại chưa có dữ liệu ghép nối mới từ thuật toán AI Matching. Khi các cặp đôi tạo kế hoạch cưới phù hợp với phong cách của bạn, danh sách sẽ được cập nhật tự động.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

