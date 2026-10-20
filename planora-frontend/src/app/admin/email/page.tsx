'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Send, 
  Users, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Copy, 
  Check, 
  Bell, 
  Eye, 
  Edit3, 
  X, 
  ArrowLeft,
  Heart,
  Briefcase,
  Shield,
  Clock
} from 'lucide-react';
import { getAdminUsers, sendAdminEmail } from '@/services/admin';
import type { AdminUserItem, AdminSendEmailResponse } from '@/types/admin';

interface EmailTemplate {
  id: string;
  name: string;
  icon: string;
  badge: string;
  subject: string;
  content: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'reengage',
    name: 'Kích hoạt lại tài khoản',
    icon: '❤️',
    badge: 'Chăm sóc cặp đôi',
    subject: '[Planora] Kế hoạch cưới trong mơ của bạn vẫn đang chờ bạn hoàn thiện ❤️',
    content: `Chào bạn,

Chúng mình nhận thấy bạn chưa ghé thăm lại bảng kế hoạch cưới trên Planora trong vài ngày qua.

Chuẩn bị ngày trọng đại là một hành trình kỳ diệu nhưng cũng cần nhiều sự chuẩn bị chu đáo. Trợ lý AI của Planora vừa cập nhật thêm nhiều danh sách việc cần làm (Checklist) và gợi ý nhà cung cấp uy tín theo đúng ngân sách của hai bạn.

Hãy đăng nhập lại ngay hôm nay để không bỏ lỡ bất kỳ thời điểm vàng nào nhé!

Thân mến,
Đội ngũ hỗ trợ Planora 🕊️`
  },
  {
    id: 'promo',
    name: 'Ưu đãi mùa cưới',
    icon: '✨',
    badge: 'Khuyến mãi độc quyền',
    subject: '[Planora Exclusive] Mở khóa ưu đãi đặt cọc mùa cưới lên đến 20% ✨',
    content: `Chào bạn,

Planora hân hạnh gửi tặng các cặp đôi gói ưu đãi đặc quyền từ các đối tác hàng đầu (Studio ảnh cưới, Địa điểm tiệc cưới, Trang trí gia tiên & Váy cưới thiết kế).

Khi liên hệ và gửi yêu cầu tư vấn (Inquiry) thông qua Planora trong tháng này, bạn sẽ nhận ngay:
- Voucher giảm giá trực tiếp tới 20% dịch vụ trọn gói
- Miễn phí nâng cấp gói hoa tươi cao cấp
- Trợ lý AI hỗ trợ rà soát hợp đồng và dự toán ngân sách chi tiết

Khám phá ngay danh sách nhà cung cấp nổi bật trên ứng dụng Planora!`
  },
  {
    id: 'feature',
    name: 'Tính năng mới & AI 2.0',
    icon: '🚀',
    badge: 'Cập nhật hệ thống',
    subject: '[Planora Update] Trợ lý AI tạo kế hoạch cưới thông minh phiên bản mới đã sẵn sàng! 🕊️',
    content: `Chào bạn,

Chúng mình rất vui mừng thông báo: Hệ thống lập kế hoạch cưới Planora đã chính thức nâng cấp tính năng Trợ lý AI Wedding Planner với khả năng phân bổ ngân sách thông minh và gợi ý phong cách cá nhân hóa chuẩn xác hơn 40%.

Bạn chỉ cần nhập địa điểm và ngân sách ước tính, hệ thống sẽ tự động tạo bảng phân bổ chi tiết cho từng hạng mục quan trọng nhất.

Hãy trải nghiệm ngay hôm nay trên ứng dụng Planora!`
  },
  {
    id: 'survey',
    name: 'Khảo sát trải nghiệm',
    icon: '💬',
    badge: 'Thu thập ý kiến',
    subject: '[Planora] Chia sẻ cảm nghĩ của bạn để cùng xây dựng Planora hoàn hảo hơn ❤️',
    content: `Chào bạn,

Để đồng hành tốt nhất cùng các cô dâu chú rể trong ngày trọng đại, sự hài lòng và đóng góp của bạn là món quà quý giá nhất đối với Planora.

Bạn có thể dành ra 2 phút để chia sẻ cảm nhận về trải nghiệm chuẩn bị đám cưới trên Planora được không? Mọi phản hồi đều giúp chúng mình hoàn thiện hơn mỗi ngày.

Chúc hai bạn có những khoảnh khắc chuẩn bị cưới ngập tràn hạnh phúc!

Trân trọng,
Đội ngũ sáng lập Planora.`
  }
];

function AdminEmailBroadcastContent() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email');
  const prefillTemplate = searchParams.get('template');

  // Dữ liệu người dùng & bộ lọc
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'VENDOR' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE'>('ALL');

  // Danh sách email được chọn
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Form soạn thảo email
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');

  // Trạng thái gửi
  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendResult, setSendResult] = useState<AdminSendEmailResponse | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Sao chép nhanh email
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Tải danh sách người dùng
  const loadUsers = async () => {
    setLoadingUsers(true);
    setFetchError(null);
    try {
      const data = await getAdminUsers();
      setUsers(data);

      // Nếu có query param email được truyền vào từ trang Dormant
      if (prefillEmail) {
        setSelectedEmails(new Set([prefillEmail.toLowerCase()]));
      }
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      setFetchError((err as Error)?.message || 'Không thể tải danh sách người dùng từ hệ thống.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Áp dụng mẫu nếu có query param template
  useEffect(() => {
    if (prefillTemplate) {
      const foundTpl = EMAIL_TEMPLATES.find(t => t.id === prefillTemplate || (prefillTemplate === 'dormant' && t.id === 'reengage'));
      if (foundTpl) {
        setSubject(foundTpl.subject);
        setContent(foundTpl.content);
      }
    } else if (!subject && !content) {
      // Mặc định chọn mẫu đầu tiên
      setSubject(EMAIL_TEMPLATES[0].subject);
      setContent(EMAIL_TEMPLATES[0].content);
    }
  }, [prefillTemplate]);

  // Bộ lọc danh sách người dùng hiển thị
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchTerm.toLowerCase().trim();
      const matchSearch = !search || 
        (u.fullName && u.fullName.toLowerCase().includes(search)) ||
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.phone && u.phone.includes(search));

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Chọn / bỏ chọn 1 email
  const toggleSelectEmail = (email: string) => {
    const norm = email.toLowerCase().trim();
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(norm)) {
        next.delete(norm);
      } else {
        next.add(norm);
      }
      return next;
    });
  };

  // Chọn tất cả email đang hiển thị trên bảng
  const selectAllFiltered = () => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      filteredUsers.forEach(u => next.add(u.email.toLowerCase().trim()));
      return next;
    });
  };

  // Bỏ chọn tất cả email đang hiển thị
  const deselectAllFiltered = () => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      filteredUsers.forEach(u => next.delete(u.email.toLowerCase().trim()));
      return next;
    });
  };

  // Xóa toàn bộ lựa chọn
  const clearAllSelected = () => {
    setSelectedEmails(new Set());
  };

  // Chọn mẫu email
  const applyTemplate = (tpl: EmailTemplate) => {
    setSubject(tpl.subject);
    setContent(tpl.content);
    setSendResult(null);
  };

  // Sao chép email
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1800);
  };

  // Xử lý gửi email
  const handleSendEmail = async () => {
    if (selectedEmails.size === 0) {
      alert('Vui lòng chọn ít nhất 1 email người nhận.');
      return;
    }
    if (!subject.trim()) {
      alert('Vui lòng nhập tiêu đề email.');
      return;
    }
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung email.');
      return;
    }

    setShowConfirmModal(false);
    setSending(true);
    setSendError(null);
    setSendResult(null);

    try {
      const res = await sendAdminEmail({
        recipientEmails: Array.from(selectedEmails),
        subject: subject.trim(),
        content: content.trim(),
        sendNotification
      });
      setSendResult(res);
    } catch (err: unknown) {
      console.error('Lỗi khi gửi email:', err);
      setSendError((err as Error)?.message || 'Có lỗi xảy ra trong quá trình gửi email.');
    } finally {
      setSending(false);
    }
  };

  // Định dạng thời gian hoạt động
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Mới tham gia';
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 10) return 'Vừa truy cập';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 30) return `${diffDays} ngày trước`;
      return d.toLocaleDateString('vi-VN');
    } catch {
      return 'Gần đây';
    }
  };

  const isAllFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedEmails.has(u.email.toLowerCase().trim()));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Back Link */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-[#5D0F12] transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Bảng điều khiển
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-medium text-[#5D0F12]">Gửi Email Người Dùng</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              GỬI EMAIL THÔNG BÁO CHO NGƯỜI DÙNG
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-3 py-0.5 text-xs font-semibold text-[#5D0F12]">
              <Mail className="h-3.5 w-3.5" /> Email Broadcast
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            Soạn thảo và gửi thông báo, bản tin hoặc ưu đãi trực tiếp tới các cặp đôi & người dùng đang dùng ứng dụng Planora.
          </p>
        </div>

        {/* Nút làm mới danh sách */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadUsers}
            disabled={loadingUsers}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#EADCC9] bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-[#FAF8F5] hover:text-[#5D0F12] transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#5D0F12] ${loadingUsers ? 'animate-spin' : ''}`} />
            <span>{loadingUsers ? 'Đang cập nhật...' : 'Làm mới người dùng'}</span>
          </button>
        </div>
      </div>

      {/* Thông báo kết quả gửi (Banner) */}
      {sendResult && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 sm:p-5 shadow-sm text-emerald-900 transition animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-emerald-600 text-white p-1 mt-0.5 shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-sm sm:text-base text-emerald-900">
                Gửi email hoàn tất!
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800">
                {sendResult.message}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-emerald-800">
                <span className="inline-flex items-center gap-1">
                  <strong>Tổng người nhận:</strong> {sendResult.totalRecipients}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <strong>Thành công:</strong> {sendResult.successCount}
                </span>
                {sendResult.failedCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-rose-700">
                    <strong>Thất bại:</strong> {sendResult.failedCount} ({sendResult.failedEmails?.join(', ')})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSendResult(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {sendError && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-sm transition">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <strong className="font-bold">Lỗi gửi email:</strong> {sendError}
            </div>
            <button
              onClick={() => setSendError(null)}
              className="text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Layout 2 cột: Trái (Soạn email) - Phải (Chọn người dùng) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* CỘT TRÁI: KHUNG SOẠN EMAIL (5/12) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-[1.5rem] border border-[#EADCC9] bg-white p-4 sm:p-6 shadow-[0_10px_30px_rgba(93,15,18,0.03)] space-y-5">
            
            {/* Header Khung Soạn Thảo */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EADCC9]/70">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5D0F12]/10 text-[#5D0F12]">
                  <Edit3 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A]">Nội Dung Email</h3>
                  <p className="text-[11px] text-stone-500">Soạn thảo hoặc chọn mẫu email dựng sẵn</p>
                </div>
              </div>

              {/* Tab chuyển đổi Soạn / Xem trước */}
              <div className="flex rounded-full bg-[#FAF8F5] p-1 border border-[#EADCC9]">
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'compose'
                      ? 'bg-[#5D0F12] text-[#FFFBF5] shadow-sm'
                      : 'text-stone-600 hover:text-[#5D0F12]'
                  }`}
                >
                  <Edit3 className="h-3 w-3" /> Soạn
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-[#5D0F12] text-[#FFFBF5] shadow-sm'
                      : 'text-stone-600 hover:text-[#5D0F12]'
                  }`}
                >
                  <Eye className="h-3 w-3" /> Xem trước
                </button>
              </div>
            </div>

            {/* Mẫu Email Nhanh (Templates) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Mẫu Thư Gợi Ý (Quick Templates)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EMAIL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="flex flex-col items-start p-2.5 rounded-xl border border-[#EADCC9]/80 bg-[#FAF8F5] hover:bg-[#5D0F12]/5 hover:border-[#5D0F12]/40 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <span className="text-sm">{tpl.icon}</span>
                      <span className="text-xs font-bold text-stone-800 group-hover:text-[#5D0F12] line-clamp-1">
                        {tpl.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                      {tpl.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'compose' ? (
              <div className="space-y-4">
                {/* Ô nhập Tiêu đề */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tiêu Đề Thư (Subject) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ví dụ: [Planora] Thông báo quan trọng về kế hoạch cưới..."
                    className="w-full rounded-xl border border-[#EADCC9] bg-[#FAF8F5] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-800 placeholder-stone-400 focus:border-[#5D0F12] focus:bg-white focus:outline-none transition shadow-inner"
                  />
                </div>

                {/* Ô nhập Nội dung */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Nội Dung Email <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {content.length} ký tự
                    </span>
                  </div>
                  <textarea
                    rows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung thư gửi đến người dùng..."
                    className="w-full rounded-xl border border-[#EADCC9] bg-[#FAF8F5] p-3.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:border-[#5D0F12] focus:bg-white focus:outline-none transition leading-relaxed shadow-inner"
                  />
                  <p className="mt-1 text-[11px] text-stone-500">
                    💡 Thư sẽ tự động được đóng gói trong giao diện sang trọng chuẩn nhận diện thương hiệu Planora.
                  </p>
                </div>
              </div>
            ) : (
              /* TAB XEM TRƯỚC (PREVIEW) */
              <div className="space-y-3">
                <div className="rounded-xl border border-[#EADCC9] overflow-hidden bg-[#FFFBF5] text-stone-800 shadow-sm text-xs">
                  {/* Mock Mail Header */}
                  <div className="bg-[#5D0F12] px-4 py-3 text-center text-[#FFFBF5]">
                    <div className="text-lg">🕊️</div>
                    <div className="font-serif font-bold text-sm tracking-widest uppercase text-[#FFFBF5]">
                      PLANORA
                    </div>
                    <div className="text-[9px] text-[#D4B896] tracking-wider uppercase">
                      Luxury Wedding Planner & AI Assistant
                    </div>
                  </div>

                  {/* Mock Mail Body */}
                  <div className="p-4 sm:p-5 bg-white space-y-3">
                    <h3 className="font-serif font-bold text-sm text-[#5D0F12]">
                      {subject || '(Chưa nhập tiêu đề)'}
                    </h3>
                    <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed border-t border-stone-100 pt-3">
                      {content || '(Chưa có nội dung thư)'}
                    </div>
                    <div className="pt-3 text-center">
                      <span className="inline-block rounded-full bg-[#5D0F12] px-4 py-1.5 text-[11px] font-bold text-[#FFFBF5] uppercase tracking-wider shadow-sm">
                        Mở ứng dụng Planora
                      </span>
                    </div>
                  </div>

                  {/* Mock Mail Footer */}
                  <div className="bg-[#FAF8F5] px-4 py-3 border-t border-[#EADCC9] text-center text-[10px] text-stone-500 space-y-1">
                    <p>Bạn nhận được email này vì bạn là thành viên đã đăng ký trên hệ thống Planora.</p>
                    <p>© 2026 Planora Wedding Platform.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tùy chọn gửi kèm thông báo In-App */}
            <div className="rounded-xl bg-[#FAF8F5] border border-[#EADCC9] p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#5D0F12]" />
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Thông báo chuông In-App</span>
                  <span className="text-[10px] text-stone-500 block">Tạo thông báo trong ứng dụng cho người nhận có tài khoản</span>
                </div>
              </div>
              <input
                type="checkbox"
                id="sendNotificationToggle"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="h-4 w-4 rounded accent-[#5D0F12] cursor-pointer"
              />
            </div>

            {/* Tóm tắt người nhận & Nút Gửi */}
            <div className="pt-2 border-t border-[#EADCC9]/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-600">Đã chọn:</span>
                <span className="font-bold text-[#5D0F12] bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 rounded-full">
                  {selectedEmails.size} người nhận
                </span>
              </div>

              {selectedEmails.size > 0 && (
                <div className="max-h-24 overflow-y-auto no-scrollbar flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#FAF8F5] border border-[#EADCC9]/80">
                  {Array.from(selectedEmails).map((em) => (
                    <span
                      key={em}
                      className="inline-flex items-center gap-1 rounded-full bg-white border border-[#EADCC9] px-2 py-0.5 text-[11px] text-stone-700 shadow-2xs"
                    >
                      <span className="font-mono">{em}</span>
                      <button
                        type="button"
                        onClick={() => toggleSelectEmail(em)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={sending || selectedEmails.size === 0 || !subject.trim() || !content.trim()}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-md cursor-pointer ${
                  sending || selectedEmails.size === 0 || !subject.trim() || !content.trim()
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                    : 'bg-[#5D0F12] text-[#FFFBF5] hover:bg-[#4A0C0E] shadow-[#5D0F12]/20'
                }`}
              >
                {sending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang gửi email...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Gửi Email Tới {selectedEmails.size} Người Nhận</span>
                  </>
                )}
              </button>

              {selectedEmails.size === 0 && (
                <p className="text-center text-[11px] text-stone-400 italic">
                  * Hãy chọn ít nhất 1 email ở danh sách bên phải để kích hoạt gửi.
                </p>
              )}
            </div>

          </div>
        </div>

        {/* CỘT PHẢI: BẢNG DANH SÁCH USER VÀ CHỌN EMAIL (7/12) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[1.5rem] border border-[#EADCC9] bg-white p-4 sm:p-6 shadow-[0_10px_30px_rgba(93,15,18,0.03)] space-y-4">
            
            {/* Header Danh Sách */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADCC9]/70">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5D0F12]/10 text-[#5D0F12]">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A]">
                    Chọn Người Nhận
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Hiển thị {filteredUsers.length} / {users.length} người dùng đang hoạt động
                  </p>
                </div>
              </div>

              {/* Nút Chọn / Bỏ chọn nhanh */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isAllFilteredSelected ? deselectAllFiltered : selectAllFiltered}
                  disabled={filteredUsers.length === 0}
                  className="rounded-full border border-[#EADCC9] bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  {isAllFilteredSelected ? 'Bỏ chọn đang lọc' : 'Chọn tất cả đang lọc'}
                </button>
                {selectedEmails.size > 0 && (
                  <button
                    type="button"
                    onClick={clearAllSelected}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    Bỏ chọn hết ({selectedEmails.size})
                  </button>
                )}
              </div>
            </div>

            {/* Thanh Tìm Kiếm & Lọc */}
            <div className="space-y-3">
              {/* Ô tìm kiếm */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên người dùng, email, số điện thoại..."
                  className="w-full rounded-full border border-[#EADCC9] bg-[#FAF8F5] pl-9 pr-8 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:border-[#5D0F12] focus:bg-white focus:outline-none transition shadow-2xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Bộ lọc vai trò & trạng thái */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-semibold text-stone-500 mr-1">Vai trò:</span>
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'USER', label: 'Cặp đôi (USER)' },
                  { id: 'VENDOR', label: 'Nhà cung cấp (VENDOR)' },
                  { id: 'ADMIN', label: 'Admin' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRoleFilter(item.id as 'ALL' | 'USER' | 'VENDOR' | 'ADMIN')}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      roleFilter === item.id
                        ? 'bg-[#5D0F12] text-[#FFFBF5]'
                        : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200/60 border border-[#EADCC9]/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <div className="h-4 w-px bg-stone-300 mx-1 hidden sm:block"></div>

                <span className="text-[11px] font-semibold text-stone-500 mr-1">Trạng thái:</span>
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'ACTIVE', label: 'Đang hoạt động' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatusFilter(item.id as 'ALL' | 'ACTIVE')}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      statusFilter === item.id
                        ? 'bg-stone-800 text-white'
                        : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200/60 border border-[#EADCC9]/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* BẢNG DANH SÁCH NGƯỜI DÙNG */}
            <div className="rounded-2xl border border-[#EADCC9] overflow-hidden">
              {loadingUsers ? (
                <div className="p-12 text-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#5D0F12] border-t-transparent mx-auto"></div>
                  <p className="text-xs text-stone-500">Đang tải danh sách người dùng...</p>
                </div>
              ) : fetchError ? (
                <div className="p-8 text-center space-y-2 text-rose-700">
                  <AlertTriangle className="h-6 w-6 mx-auto text-rose-500" />
                  <p className="text-xs font-semibold">{fetchError}</p>
                  <button
                    onClick={loadUsers}
                    className="rounded-full bg-white border border-rose-300 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50"
                  >
                    Thử lại
                  </button>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <p className="text-sm font-semibold text-stone-700">Không tìm thấy người dùng phù hợp</p>
                  <p className="text-xs text-stone-500">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc.</p>
                </div>
              ) : (
                <div className="max-h-[560px] overflow-y-auto divide-y divide-[#EADCC9]/60">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedEmails.has(user.email.toLowerCase().trim());
                    const initials = user.fullName
                      ? user.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(-2)
                          .join('')
                          .toUpperCase()
                      : 'U';

                    return (
                      <div
                        key={user.id + user.email}
                        onClick={() => toggleSelectEmail(user.email)}
                        className={`flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#5D0F12]/5 border-l-4 border-l-[#5D0F12]'
                            : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          {/* Checkbox */}
                          <div className="pt-0.5 sm:pt-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by row click
                              className="h-4 w-4 rounded accent-[#5D0F12] cursor-pointer"
                            />
                          </div>

                          {/* Avatar Circle */}
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs shadow-2xs ${
                            user.role === 'VENDOR'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : user.role === 'ADMIN'
                              ? 'bg-stone-800 text-white'
                              : 'bg-[#5D0F12]/10 text-[#5D0F12] border border-[#5D0F12]/20'
                          }`}>
                            {initials}
                          </div>

                          {/* Tên & Email */}
                          <div className="overflow-hidden">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-[#1A1A1A]">
                                {user.fullName}
                              </span>
                              
                              {/* Badge Vai Trò */}
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                user.role === 'VENDOR'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : user.role === 'ADMIN'
                                  ? 'bg-stone-100 text-stone-800 border border-stone-300'
                                  : 'bg-[#5D0F12]/10 text-[#5D0F12] border border-[#5D0F12]/20'
                              }`}>
                                {user.role === 'VENDOR' ? (
                                  <>
                                    <Briefcase className="h-2.5 w-2.5" /> Đối tác
                                  </>
                                ) : user.role === 'ADMIN' ? (
                                  <>
                                    <Shield className="h-2.5 w-2.5" /> Quản trị
                                  </>
                                ) : (
                                  <>
                                    <Heart className="h-2.5 w-2.5" /> Cặp đôi
                                  </>
                                )}
                              </span>

                              {/* Trạng thái hoạt động */}
                              <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(user.lastActiveAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-stone-600 truncate">
                                {user.email}
                              </span>
                              <button
                                type="button"
                                title="Sao chép email"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyEmail(user.email);
                                }}
                                className="text-stone-400 hover:text-[#5D0F12] p-0.5 cursor-pointer"
                              >
                                {copiedEmail === user.email ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>

                            {user.weddingTitle && (
                              <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                                💍 <span className="italic">{user.weddingTitle}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Nút trạng thái check */}
                        <div className="shrink-0 self-center">
                          {isSelected ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5D0F12] text-[#FFFBF5] text-xs shadow-sm">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-stone-400 group-hover:text-stone-600">
                              Chọn
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer tóm tắt bảng */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-stone-500">
              <span>Đang hiển thị {filteredUsers.length} người dùng</span>
              <span className="font-semibold text-[#5D0F12]">
                Đã chọn {selectedEmails.size} người nhận
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* MODAL XÁC NHẬN GỬI EMAIL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#EADCC9] bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADCC9]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5D0F12]/10 text-[#5D0F12]">
                  <Send className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-[#1A1A1A] text-base">Xác Nhận Gửi Email Hàng Loạt</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#EADCC9] space-y-1.5">
                <p className="text-stone-600">
                  Bạn chuẩn bị gửi email tới: <strong className="text-[#5D0F12] font-bold text-sm">{selectedEmails.size} người dùng</strong>
                </p>
                <p className="text-stone-600">
                  Tiêu đề: <strong className="text-stone-900">{subject}</strong>
                </p>
                <p className="text-stone-500">
                  Thông báo chuông (In-App): {sendNotification ? '✅ Có gửi kèm' : '❌ Không'}
                </p>
              </div>

              <div>
                <span className="font-bold text-stone-700 block mb-1">Danh sách người nhận:</span>
                <div className="max-h-36 overflow-y-auto no-scrollbar rounded-xl border border-[#EADCC9] bg-[#FAF8F5] p-2.5 space-y-1 font-mono text-[11px] text-stone-700">
                  {Array.from(selectedEmails).map((em, i) => (
                    <div key={em} className="truncate">
                      {i + 1}. {em}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Email sẽ được gửi đi với giao diện thương hiệu Planora. Vui lòng kiểm tra kỹ nội dung trước khi xác nhận.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-[#EADCC9]">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full sm:w-auto rounded-full border border-[#EADCC9] px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#FAF8F5] cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#5D0F12] px-5 py-2 text-xs font-bold text-[#FFFBF5] hover:bg-[#4A0C0E] transition cursor-pointer shadow-md shadow-[#5D0F12]/20"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Xác nhận gửi ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminEmailBroadcastPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center bg-[#FFFBF5]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#5D0F12] border-t-transparent"></div>
            <p className="text-xs text-stone-500 font-medium">Đang tải trình soạn thảo email...</p>
          </div>
        </div>
      }
    >
      <AdminEmailBroadcastContent />
    </Suspense>
  );
}
