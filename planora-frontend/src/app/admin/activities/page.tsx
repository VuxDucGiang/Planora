'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Search,
  Filter
} from 'lucide-react';
import { getAdminActivities } from '@/services/admin';
import type { PaginatedActivities } from '@/types/admin';

export default function AdminActivitiesPage() {
  const [data, setData] = useState<PaginatedActivities | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const fetchActivities = async (pageIndex: number) => {
    setLoading(true);
    try {
      const res = await getAdminActivities(pageIndex, 15);
      setData(res);
      setPage(pageIndex);
    } catch (err) {
      console.error('Lỗi khi tải danh sách hoạt động:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(0);
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

  const filteredContent = (data?.content || []).filter((act) => {
    const matchSearch =
      (act.userFullName && act.userFullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (act.userEmail && act.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (act.entityId && act.entityId.toString().includes(searchTerm));
    const matchAction = filterAction === 'ALL' || act.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Nhật Ký Tương Tác Hệ Thống (Audit Logs)</h1>
          <p className="text-sm text-stone-500 mt-1">
            Theo dõi chi tiết toàn bộ các sự kiện tương tác của người dùng trên nền tảng Planora.
          </p>
        </div>
        <button
          onClick={() => fetchActivities(page)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#EADCC9] bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-[#FAF8F5] hover:text-[#5D0F12] transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#5D0F12] ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên người dùng, email, ID đối tượng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#EADCC9] bg-white pl-10 pr-4 py-2 text-xs text-stone-800 focus:border-[#5D0F12] focus:outline-none shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-stone-400 shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-xl border border-[#EADCC9] bg-white px-3 py-2 text-xs text-stone-700 focus:border-[#5D0F12] focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="ALL">Tất cả hành động</option>
            <option value="LOGIN">Đăng nhập (LOGIN)</option>
            <option value="REGISTER">Đăng ký (REGISTER)</option>
            <option value="GENERATE_PLAN">Tạo Plan AI (GENERATE_PLAN)</option>
            <option value="ONBOARDING_COMPLETED">Hoàn thành Onboarding</option>
            <option value="VIEW_VENDOR">Xem Vendor (VIEW_VENDOR)</option>
            <option value="SEND_INQUIRY">Gửi Báo giá (SEND_INQUIRY)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-[#EADCC9] bg-white shadow-[0_4px_20px_rgba(93,15,18,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-[#FAF8F5] text-[11px] uppercase tracking-wider text-stone-500 border-b border-[#EADCC9]/80">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Thời gian</th>
                <th className="px-5 py-3.5">Người dùng</th>
                <th className="px-5 py-3.5">Hành động</th>
                <th className="px-5 py-3.5">Đối tượng</th>
                <th className="px-5 py-3.5">Metadata Chi tiết</th>
                <th className="px-5 py-3.5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADCC9]/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#5D0F12] border-t-transparent"></div>
                    <p className="mt-2 text-xs">Đang tải nhật ký...</p>
                  </td>
                </tr>
              ) : filteredContent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 text-sm">
                    Không tìm thấy bản ghi hoạt động nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredContent.map((act) => (
                  <tr key={act.id} className="hover:bg-[#FAF8F5]/80 transition">
                    <td className="px-5 py-3.5 font-mono text-xs text-stone-400">
                      #{act.id}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-500 whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#1A1A1A] text-sm">
                        {act.userFullName || act.userEmail || `Khách (#${act.userId || 'Guest'})`}
                      </div>
                      {act.userEmail && (
                        <div className="text-xs text-stone-400">{act.userEmail}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs border ${getActionBadge(act.action)}`}>
                        {act.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-600">
                      <span className="font-medium text-stone-800">{act.entityType || '-'}</span>
                      {act.entityId && (
                        <span className="text-stone-400 ml-1">#{act.entityId}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-stone-500 max-w-sm truncate">
                      {act.metadata ? JSON.stringify(act.metadata) : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {act.userId ? (
                        <Link
                          href={`/admin/users/${act.userId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5D0F12] bg-[#5D0F12]/10 hover:bg-[#5D0F12] hover:text-[#FFFBF5] px-2.5 py-1.5 rounded-lg transition"
                        >
                          <Eye className="h-3.5 w-3.5" /> Xem
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

        {/* Pagination Controls */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#EADCC9]/80 bg-[#FAF8F5]">
            <span className="text-xs text-stone-500">
              Trang <strong className="text-stone-800">{page + 1}</strong> / {data.totalPages} ({data.totalElements} bản ghi)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchActivities(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-[#EADCC9] bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trước
              </button>
              <button
                onClick={() => fetchActivities(Math.min(data.totalPages - 1, page + 1))}
                disabled={page >= data.totalPages - 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-[#EADCC9] bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Sau <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
