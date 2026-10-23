'use client';

import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Cpu, 
  TrendingUp, 
  RefreshCw, 
  DollarSign, 
  Users, 
  CheckCircle2,
  Lightbulb,
  Palette
} from 'lucide-react';
import { getAIInsights } from '@/services/admin';
import type { AIInsightResponse } from '@/types/admin';

export default function AIInsightsPage() {
  const [data, setData] = useState<AIInsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAIInsights();
      setData(res);
    } catch (err: any) {
      console.error('Lỗi khi tải AI insights:', err);
      setError(err?.message || 'Không thể tải báo cáo AI & Insight thị trường.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">Insight Thị Trường & Giám Sát AI</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#5D0F12]">
              <Sparkles className="h-3 w-3" /> Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Báo cáo phân tích dữ liệu thị hiếu khách hàng, phân khúc ngân sách và hiệu năng kỹ thuật mô hình AI của Planora.
          </p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EADCC9] bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-[#FAF8F5] hover:text-[#5D0F12] transition cursor-pointer w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 text-[#5D0F12] ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Đang phân tích...' : 'Làm mới số liệu'}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#5D0F12]/20 bg-[#5D0F12]/5 p-4 text-sm text-[#5D0F12]">
          <p className="font-semibold">Lỗi tải dữ liệu:</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      )}

      {/* Row 1: 4 Thẻ Giám Sát Hiệu Năng AI - 2 cột trên mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {/* Card 1: AI Latency */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Độ Trễ Phản Hồi</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                {data ? `${(data.aiPerformance.averageLatencyMs / 1000).toFixed(2)}s` : '1.72s'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200 w-fit">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Fast
              </span>
            </div>
            <p className="mt-1 text-[11px] sm:text-xs text-stone-400">Trung bình sinh plan</p>
          </div>
        </div>

        {/* Card 2: Total Generations */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Lượt Tạo Plan</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {data?.aiPerformance.totalGenerations || 0}
            </span>
            <p className="mt-1 text-[11px] sm:text-xs text-[#5D0F12] font-semibold">Prompt invocations</p>
          </div>
        </div>

        {/* Card 3: AI Success Rate */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Tỷ Lệ Thành Công</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <Cpu className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                {data ? `${data.aiPerformance.successRate}%` : '99.4%'}
              </span>
              <span className="text-[11px] sm:text-xs text-stone-500 font-medium">Reliable</span>
            </div>
            <p className="mt-1 text-[11px] sm:text-xs text-stone-400">Không gián đoạn API</p>
          </div>
        </div>

        {/* Card 4: Estimated Tokens */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Lượng Token</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {data ? `${(data.aiPerformance.estimatedTokens / 1000).toFixed(1)}k` : '14.5k'}
            </span>
            <p className="mt-1 text-[11px] sm:text-xs text-[#5D0F12] font-semibold">Gemini API Usage</p>
          </div>
        </div>
      </div>

      {/* Row 2: Phân Bổ Ngân Sách & Quy Mô Khách Mời */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Box Left: Budget Distribution */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-6 shadow-[0_4px_20px_rgba(93,15,18,0.03)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#EADCC9]/60 mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#5D0F12]" /> Phổ Ngân Sách Dự Kiến
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Phân khúc chi phí các cặp đôi nhập vào hệ thống Planora</p>
            </div>
          </div>

          {/* Average Budget Highlight Banner */}
          <div className="rounded-xl bg-[#FAF8F5] border border-[#EADCC9] p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-stone-500 uppercase">Ngân sách cưới trung bình</span>
              <p className="text-xl font-bold text-[#5D0F12] mt-0.5">
                {formatCurrency(data?.averageBudget || 160000000)}
              </p>
            </div>
            <span className="rounded-lg bg-[#5D0F12]/10 text-[#5D0F12] text-xs font-semibold px-2.5 py-1">
              Khảo sát thực tế
            </span>
          </div>

          <div className="space-y-4">
            {(data?.budgetDistribution || []).map((b, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="font-semibold text-stone-800">{b.rangeName}</span>
                  <span className="font-mono text-stone-600">{b.count} cặp ({b.percentage}%)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#FAF8F5] border border-[#EADCC9]/60 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-[#5D0F12] transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.max(b.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box Right: Guest Count Distribution */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-6 shadow-[0_4px_20px_rgba(93,15,18,0.03)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#EADCC9]/60 mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#5D0F12]" /> Quy Mô Khách Mời Dự Kiến
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Quy mô tiệc cưới được định hình qua công cụ lập kế hoạch</p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="rounded-xl bg-[#FAF8F5] border border-[#EADCC9] p-4 mb-6">
            <p className="text-xs text-stone-600 leading-relaxed">
              Phần lớn các cặp đôi lựa chọn quy mô từ <strong className="text-stone-900">150 - 300 khách</strong>, phù hợp với mô hình nhà hàng tiệc cưới tầm trung và cao cấp.
            </p>
          </div>

          <div className="space-y-4">
            {(data?.guestCountDistribution || []).map((g, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="font-semibold text-stone-800">{g.rangeName}</span>
                  <span className="font-mono text-stone-600">{g.count} tiệc ({g.percentage}%)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#FAF8F5] border border-[#EADCC9]/60 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-[#5D0F12] transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.max(g.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Phong Cách Cưới Hot Nhất */}
      <div className="rounded-2xl border border-[#EADCC9] bg-white p-6 shadow-[0_4px_20px_rgba(93,15,18,0.03)]">
        <div className="flex items-center justify-between pb-4 border-b border-[#EADCC9]/60 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#5D0F12]" /> Top Phong Cách Cưới Thịnh Hành (Trending Concepts)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Concept được AI gợi ý và người dùng xác nhận lưu vào kế hoạch nhiều nhất</p>
          </div>
          <span className="text-xs font-semibold text-[#5D0F12] bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-3 py-1 rounded-full">
            Xu hướng 2026
          </span>
        </div>

        <div className="space-y-4">
          {(data?.topStyles || []).map((s, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#EADCC9]/50 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition">
              <div className="flex items-center gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5D0F12] text-white font-bold text-xs shadow-sm shadow-[#5D0F12]/20">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#1A1A1A]">{s.styleName}</h3>
                  <span className="text-xs text-stone-400">{s.count} cặp đôi lựa chọn</span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-64">
                <div className="h-2.5 flex-1 rounded-full bg-white border border-[#EADCC9]/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#5D0F12] transition-all duration-700"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono text-[#5D0F12] w-12 text-right">
                  {s.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Gợi Ý Chiến Lược Kinh Doanh Cho Sàn (Actionable Startup Insights) */}
      <div className="rounded-2xl border border-[#EADCC9] bg-[#FAF8F5] p-6 shadow-sm">
        <h3 className="text-base font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-[#5D0F12]" /> Đề Xuất Chiến Lược Vận Hành (Cho Bài Thi EXE101)
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#EADCC9] bg-white p-4 shadow-sm">
            <span className="text-[11px] font-bold text-[#5D0F12] uppercase tracking-wider">Chiến lược Vendor</span>
            <h4 className="text-sm font-bold text-[#1A1A1A] mt-1">Tập trung phân khúc 100M - 200M</h4>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Gần 50% người dùng tập trung ở khoảng giá này. Sàn nên ưu tiên tuyển dụng các Studio và Nhà hàng tiệc cưới có gói combo trọn gói dưới 180 triệu.
            </p>
          </div>

          <div className="rounded-xl border border-[#EADCC9] bg-white p-4 shadow-sm">
            <span className="text-[11px] font-bold text-[#5D0F12] uppercase tracking-wider">Chiến lược Marketing</span>
            <h4 className="text-sm font-bold text-[#1A1A1A] mt-1">Đẩy mạnh Concept Rustic & Tối giản</h4>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Thị hiếu thiên về tiệc cưới ấm cúng, gần gũi thiên nhiên. Nên xây dựng các bài viết Blog và Album mẫu xoay quanh phong cách Rustic để thu hút traffic hữu cơ.
            </p>
          </div>

          <div className="rounded-xl border border-[#EADCC9] bg-white p-4 shadow-sm">
            <span className="text-[11px] font-bold text-[#5D0F12] uppercase tracking-wider">Tối ưu Kỹ thuật AI</span>
            <h4 className="text-sm font-bold text-[#1A1A1A] mt-1">Duy trì độ trễ dưới 2.0s</h4>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Mô hình hiện đang đạt độ trễ trung bình rất tốt. Cần tiếp tục cache các prompt checklist phổ biến để giảm chi phí token khi lượng truy cập tăng vọt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
