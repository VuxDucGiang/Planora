'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  UserX, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Mail, 
  Phone, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Send, 
  Eye, 
  X, 
  Copy, 
  Check, 
  Heart,
  ShieldAlert
} from 'lucide-react';
import { getDormantAnalysis } from '@/services/admin';
import type { DormantAnalysisResponse, DormantUserItem } from '@/types/admin';

export default function DormantUsersPage() {
  const [data, setData] = useState<DormantAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'AT_RISK' | 'DORMANT' | 'URGENT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // State modal email nhắc nhở
  const [selectedUser, setSelectedUser] = useState<DormantUserItem | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDormantData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDormantAnalysis();
      setData(res);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu tài khoản ngủ đông:', err);
      setError(err?.message || 'Không thể tải phân tích tài khoản ngủ đông.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDormantData();
  }, []);

  const filteredUsers = (data?.dormantUsers || []).filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));

    if (!matchSearch) return false;

    if (filterTab === 'AT_RISK') return u.statusRisk === 'AT_RISK';
    if (filterTab === 'DORMANT') return u.statusRisk === 'DORMANT';
    if (filterTab === 'URGENT') return u.daysUntilWedding !== null && u.daysUntilWedding !== undefined && u.daysUntilWedding <= 90;

    return true;
  });

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val?: number) => {
    if (!val) return 'Chưa nhập';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">Tài Khoản Ngủ Đông & Nguy Cơ Rời Bỏ</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#5D0F12]">
              <UserX className="h-3 w-3" /> Churn Prevention
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Nhận diện và kích hoạt lại các cặp đôi đã ngưng tương tác trên ứng dụng, ưu tiên những cặp đôi sắp đến ngày cưới.
          </p>
        </div>
        <button
          onClick={fetchDormantData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EADCC9] bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-[#FAF8F5] hover:text-[#5D0F12] transition cursor-pointer w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 text-[#5D0F12] ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Đang quét...' : 'Làm mới phân tích'}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#5D0F12]/20 bg-[#5D0F12]/5 p-4 text-sm text-[#5D0F12]">
          <p className="font-semibold">Lỗi tải dữ liệu:</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      )}

      {/* Top Cards: 4 Chỉ Số Vòng Đời Khách Hàng - 2 cột trên mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {/* Card 1: Active */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Hoạt Động Tốt</span>
            <div className="rounded-xl bg-emerald-50 p-2 sm:p-2.5 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-800">{data?.activeCount || 0}</span>
            <p className="mt-1 text-[11px] sm:text-xs text-stone-400">&lt; 7 ngày</p>
          </div>
        </div>

        {/* Card 2: At-Risk */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Nguy Cơ Rời Bỏ</span>
            <div className="rounded-xl bg-amber-50 p-2 sm:p-2.5 text-amber-700 border border-amber-200">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-amber-900">{data?.atRiskCount || 0}</span>
            <p className="mt-1 text-[11px] sm:text-xs text-amber-800 font-medium">7-29 ngày</p>
          </div>
        </div>

        {/* Card 3: Dormant */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Ngủ Đông</span>
            <div className="rounded-xl bg-[#5D0F12]/10 p-2 sm:p-2.5 text-[#5D0F12] border border-[#5D0F12]/15">
              <UserX className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#5D0F12]">{data?.dormantCount || 0}</span>
            <p className="mt-1 text-[11px] sm:text-xs text-[#5D0F12] font-semibold">&ge; 30 ngày</p>
          </div>
        </div>

        {/* Card 4: Health Score */}
        <div className="rounded-2xl border border-[#EADCC9] bg-white p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(93,15,18,0.03)] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider">Tỷ Lệ Giữ Chân</span>
            <div className="rounded-xl bg-[#FAF8F5] p-2 sm:p-2.5 text-stone-700 border border-[#EADCC9]">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-[#5D0F12]" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{data?.healthScore || 0}%</span>
            <p className="mt-1 text-[11px] sm:text-xs text-stone-400">Trên {data?.totalCouples || 0} cặp đôi</p>
          </div>
        </div>
      </div>

      {/* Main Table Section with Tabs & Search */}
      <div className="rounded-2xl border border-[#EADCC9] bg-white shadow-[0_4px_20px_rgba(93,15,18,0.03)] overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#EADCC9]/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5]/50">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Tất cả', count: data?.dormantUsers.length || 0 },
              { id: 'URGENT', label: '🚨 Sắp cưới (< 90 ngày)', count: (data?.dormantUsers || []).filter(u => u.daysUntilWedding && u.daysUntilWedding <= 90).length },
              { id: 'AT_RISK', label: 'Nguy cơ (7-29 ngày)', count: data?.atRiskCount || 0 },
              { id: 'DORMANT', label: 'Ngủ đông (≥ 30 ngày)', count: data?.dormantCount || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  filterTab === tab.id
                    ? 'bg-[#5D0F12] text-[#FFFBF5] shadow-sm'
                    : 'bg-white text-stone-600 border border-[#EADCC9] hover:bg-[#FAF8F5]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#EADCC9] bg-white pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-xs text-stone-800 focus:border-[#5D0F12] focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[700px] text-left text-sm text-stone-600">
            <thead className="bg-[#FAF8F5] text-[11px] uppercase tracking-wider text-stone-500 border-b border-[#EADCC9]/80">
              <tr>
                <th className="px-5 py-3.5">Cặp Đôi</th>
                <th className="px-5 py-3.5">Mức Độ Rủi Ro</th>
                <th className="px-5 py-3.5">Vắng Mặt</th>
                <th className="px-5 py-3.5">Ngày Cưới Dự Kiến</th>
                <th className="px-5 py-3.5">Ngân Sách Plan</th>
                <th className="px-5 py-3.5">Thao Tác Kích Hoạt Lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADCC9]/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#5D0F12] border-t-transparent"></div>
                    <p className="mt-2 text-xs">Đang quét danh sách tài khoản...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 text-sm">
                    Không có tài khoản nào thuộc diện lọc hiện tại. Tất cả người dùng đang hoạt động tích cực!
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-[#FAF8F5]/80 transition">
                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#1A1A1A] text-sm">{user.fullName}</div>
                      <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {user.phone}
                        </div>
                      )}
                    </td>

                    {/* Risk Tag */}
                    <td className="px-5 py-4">
                      {user.statusRisk === 'DORMANT' ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-1 text-xs font-bold text-[#5D0F12]">
                          <UserX className="h-3.5 w-3.5" /> Ngủ đông
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800">
                          <AlertTriangle className="h-3.5 w-3.5" /> Nguy cơ rời bỏ
                        </span>
                      )}
                    </td>

                    {/* Days inactive */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-stone-800 text-sm">{user.daysInactive} ngày trước</div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {user.lastAction}
                      </div>
                    </td>

                    {/* Wedding Date Countdown */}
                    <td className="px-5 py-4">
                      {user.weddingDate ? (
                        <div>
                          <div className="font-medium text-stone-800 text-xs flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-[#5D0F12]" />
                            {new Date(user.weddingDate).toLocaleDateString('vi-VN')}
                          </div>
                          {user.daysUntilWedding !== null && user.daysUntilWedding !== undefined && (
                            <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              user.daysUntilWedding <= 60 
                                ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200' 
                                : 'bg-stone-100 text-stone-700'
                            }`}>
                              {user.daysUntilWedding > 0 ? `Còn ${user.daysUntilWedding} ngày nữa` : 'Đã qua ngày cưới'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400">Chưa đặt ngày</span>
                      )}
                    </td>

                    {/* Budget */}
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-stone-700">
                      {formatCurrency(user.budget)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5D0F12] px-3 py-1.5 text-xs font-semibold text-[#FFFBF5] hover:bg-[#4A0C0E] transition shadow-sm cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" /> Mẫu Email Nhắc
                        </button>
                        <Link
                          href={`/admin/users/${user.userId}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#EADCC9] bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-[#FAF8F5] transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mẫu Email Nhắc Nhở Cá Nhân Hóa (Re-engagement Email Modal) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#EADCC9] bg-white p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADCC9]">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#5D0F12]" />
                <h3 className="font-bold text-[#1A1A1A] text-sm sm:text-base">Mẫu Email Tái Kích Hoạt (Re-engagement)</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-stone-700">Gửi tới:</span>
                <p className="font-mono text-stone-900 bg-[#FAF8F5] p-2 rounded-lg border border-[#EADCC9] mt-1 break-all">
                  {selectedUser.fullName} &lt;{selectedUser.email}&gt;
                </p>
              </div>

              <div>
                <span className="font-semibold text-stone-700">Tiêu đề đề xuất:</span>
                <p className="font-semibold text-[#5D0F12] bg-[#FAF8F5] p-2 rounded-lg border border-[#EADCC9] mt-1">
                  {selectedUser.daysUntilWedding && selectedUser.daysUntilWedding > 0
                    ? `[Planora] Chỉ còn ${selectedUser.daysUntilWedding} ngày nữa là đến lễ cưới của bạn!`
                    : `[Planora] Kế hoạch cưới của bạn vẫn đang chờ bạn hoàn thiện ❤️`}
                </p>
              </div>

              <div>
                <span className="font-semibold text-stone-700">Nội dung mẫu:</span>
                <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EADCC9] text-stone-700 font-sans space-y-2 mt-1 whitespace-pre-line leading-relaxed text-xs">
{`Chào ${selectedUser.fullName},

Chúng mình thấy đã ${selectedUser.daysInactive} ngày bạn chưa ghé thăm lại bảng kế hoạch cưới trên Planora.
${selectedUser.daysUntilWedding && selectedUser.daysUntilWedding > 0 
  ? `Chỉ còn ${selectedUser.daysUntilWedding} ngày nữa là đến ngày trọng đại (${new Date(selectedUser.weddingDate!).toLocaleDateString('vi-VN')}) rồi!` 
  : 'Chuẩn bị đám cưới là một hành trình dài và Planora luôn ở đây để đồng hành cùng hai bạn.'}

Hiện tại trợ lý AI đã cập nhật thêm nhiều gợi ý nhà cung cấp (Studio ảnh, Decor, Váy cưới) phù hợp với ngân sách dự kiến của bạn.

Hãy truy cập lại Planora để không bỏ sót các đầu việc quan trọng nhé!

Thân mến,
Đội ngũ hỗ trợ Planora 🕊️`}
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-[#EADCC9]">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full sm:w-auto rounded-xl border border-[#EADCC9] px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#FAF8F5] cursor-pointer text-center"
              >
                Đóng
              </button>
              <button
                onClick={() =>
                  handleCopyEmail(
`Chào ${selectedUser.fullName},

Chúng mình thấy đã ${selectedUser.daysInactive} ngày bạn chưa ghé thăm lại bảng kế hoạch cưới trên Planora.
Chỉ còn ${selectedUser.daysUntilWedding || 'vài'} ngày nữa là đến ngày trọng đại rồi!

Hãy truy cập lại Planora để tiếp tục chuẩn bị chu đáo nhé!
Trân trọng, Đội ngũ Planora.`
                  )
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5D0F12] px-4 py-2 text-xs font-semibold text-[#FFFBF5] hover:bg-[#4A0C0E] transition cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Đã sao chép!' : 'Sao chép nội dung email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
