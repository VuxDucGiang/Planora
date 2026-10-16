'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Layers
} from 'lucide-react';
import { getUserJourney } from '@/services/admin';
import type { UserJourneyResponse } from '@/types/admin';

export default function UserJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id ? Number(params.id) : null;

  const [journey, setJourney] = useState<UserJourneyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || isNaN(userId)) {
      setError('ID người dùng không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchJourney = async () => {
      setLoading(true);
      try {
        const data = await getUserJourney(userId);
        setJourney(data);
      } catch (err: any) {
        console.error('Lỗi khi tải hành trình người dùng:', err);
        setError(err?.message || 'Không thể tải hành trình của người dùng.');
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, [userId]);

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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-[#FFFBF5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5D0F12] border-t-transparent"></div>
          <p className="text-xs text-stone-500">Đang tải toàn bộ hành trình người dùng...</p>
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="rounded-2xl border border-[#EADCC9] bg-white p-8 text-center max-w-lg mx-auto mt-12 shadow-sm">
        <p className="text-[#5D0F12] font-semibold mb-2">Đã có lỗi xảy ra</p>
        <p className="text-sm text-stone-600 mb-6">{error || 'Không tìm thấy thông tin người dùng.'}</p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl bg-[#5D0F12] px-4 py-2 text-xs font-semibold text-[#FFFBF5] hover:bg-[#4A0C0E] transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#EADCC9] bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-[#FAF8F5] hover:text-[#5D0F12] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Chi tiết Hành trình Người dùng</h1>
          <p className="text-xs text-stone-500">Theo dõi toàn bộ lịch sử tương tác và chuyển đổi của tài khoản #{journey.userId}</p>
        </div>
      </div>

      {/* User Profile Overview Card */}
      <div className="rounded-2xl border border-[#EADCC9] bg-white p-6 shadow-[0_4px_20px_rgba(93,15,18,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5D0F12] text-[#FFFBF5] font-bold text-xl shadow-md shadow-[#5D0F12]/20">
              {journey.fullName ? journey.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1A1A1A]">{journey.fullName || 'Người dùng'}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF8F5] border border-[#EADCC9] px-2.5 py-0.5 text-[11px] font-semibold text-stone-700">
                  <ShieldCheck className="h-3 w-3 text-[#5D0F12]" />
                  {journey.role}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-stone-400" /> {journey.email}
                </span>
                {journey.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-stone-400" /> {journey.phone}
                  </span>
                )}
                {journey.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-stone-400" /> Tham gia: {new Date(journey.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EADCC9]/70 text-right sm:min-w-[140px]">
            <span className="text-[11px] font-medium text-stone-400 uppercase">Tổng tương tác</span>
            <p className="text-2xl font-bold text-[#5D0F12] mt-0.5">{journey.activities.length}</p>
          </div>
        </div>
      </div>

      {/* User Journey Timeline */}
      <div className="rounded-2xl border border-[#EADCC9] bg-white p-6 shadow-[0_4px_20px_rgba(93,15,18,0.03)]">
        <h3 className="text-base font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#5D0F12]" /> Chuỗi thời gian hoạt động (Activity Timeline)
        </h3>

        {journey.activities.length === 0 ? (
          <p className="text-center py-10 text-stone-400 text-sm">Chưa có nhật ký hoạt động nào cho người dùng này.</p>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EADCC9]">
            {journey.activities.map((act, index) => (
              <div key={act.id || index} className="relative">
                {/* Timeline node */}
                <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-[#5D0F12]/15">
                  <span className="h-2 w-2 rounded-full bg-[#5D0F12]"></span>
                </span>

                {/* Content Box */}
                <div className="rounded-xl border border-[#EADCC9]/80 bg-[#FAF8F5]/60 p-4 hover:bg-[#FAF8F5] transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs border ${getActionBadge(act.action)}`}>
                        {act.action}
                      </span>
                      {act.entityType && (
                        <span className="text-xs font-medium text-stone-700">
                          {act.entityType} {act.entityId ? `#${act.entityId}` : ''}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-stone-400 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {new Date(act.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {/* Metadata display */}
                  {act.metadata && Object.keys(act.metadata).length > 0 && (
                    <div className="mt-3 rounded-lg bg-white p-3 border border-[#EADCC9]/70 font-mono text-xs text-stone-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(act.metadata).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between py-0.5 border-b border-stone-100 last:border-none">
                            <span className="text-stone-400">{key}:</span>
                            <span className="font-semibold text-stone-800">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
