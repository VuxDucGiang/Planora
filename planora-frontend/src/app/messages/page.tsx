'use client';

import React, { useState, useEffect, useRef, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Calendar,
  Users,
  Coins,
  MapPin,
  Clock,
  Phone,
  Mail,
  Loader2,
  Paperclip,
  Search,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Store,
  Filter,
  Info,
  X,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getMyCustomerInquiries,
  getCustomerInquiryDetail,
  sendCustomerMessage,
} from '@/services/inquiryService';
import { uploadImage } from '@/services/vendorProfile';
import type {
  InquirySummary,
  InquiryDetail,
  InquiryStatus,
} from '@/types/inquiry';

type FilterType = 'ALL' | 'PENDING' | 'RESPONDED' | 'CLOSED';

function MessagesContent() {
  const searchParams = useSearchParams();
  const inquiryIdParam = searchParams.get('inquiryId');

  const { logout, user } = useAuth();
  const { plan, daysLeft } = usePlan();
  const { language, t } = useLanguage();

  // Inquiries & Chat State
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    inquiryIdParam ? Number(inquiryIdParam) : null
  );
  const [activeInquiry, setActiveInquiry] = useState<InquiryDetail | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('ALL');

  // Loading States
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // UI Interactive States
  const [inputText, setInputText] = useState('');
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initial Load of Inquiries List
  useEffect(() => {
    let isMounted = true;
    async function loadInquiries() {
      try {
        setIsLoadingList(true);
        const data = await getMyCustomerInquiries();
        if (!isMounted) return;
        setInquiries(data);

        // If URL has inquiryIdParam, select it
        if (inquiryIdParam) {
          const matched = data.find((i) => i.id === Number(inquiryIdParam));
          if (matched) {
            setSelectedInquiryId(matched.id);
            setShowMobileThread(true);
          } else if (data.length > 0) {
            setSelectedInquiryId(Number(inquiryIdParam));
            setShowMobileThread(true);
          }
        } else if (data.length > 0 && window.innerWidth >= 768) {
          // On desktop, auto-select first conversation
          setSelectedInquiryId(data[0].id);
        }
      } catch (err: unknown) {
        console.error('Lỗi khi tải danh sách cuộc trò chuyện:', err);
      } finally {
        if (isMounted) setIsLoadingList(false);
      }
    }

    loadInquiries();
    return () => {
      isMounted = false;
    };
  }, [inquiryIdParam]);

  // 2. Load and Poll Active Inquiry Details
  useEffect(() => {
    if (!selectedInquiryId) {
      setActiveInquiry(null);
      return;
    }

    let isMounted = true;

    async function loadDetail() {
      try {
        setIsLoadingChat(true);
        const detail = await getCustomerInquiryDetail(selectedInquiryId!);
        if (isMounted) {
          setActiveInquiry(detail);
        }
      } catch (err: unknown) {
        console.error('Lỗi khi tải chi tiết cuộc hội thoại:', err);
      } finally {
        if (isMounted) setIsLoadingChat(false);
      }
    }

    loadDetail();

    // 4s polling for realtime updates
    const interval = setInterval(async () => {
      try {
        const refreshed = await getCustomerInquiryDetail(selectedInquiryId!);
        if (isMounted) {
          setActiveInquiry((prev) => {
            if (!prev || prev.messages.length !== refreshed.messages.length) {
              return refreshed;
            }
            return prev;
          });
        }
      } catch {
        // silent polling catch
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedInquiryId]);

  useEffect(() => {
    scrollToBottom();
  }, [activeInquiry?.messages]);

  // Select Inquiry handler
  const handleSelectInquiry = (id: number) => {
    setSelectedInquiryId(id);
    setShowMobileThread(true);
  };

  // Back to list on mobile
  const handleBackToList = () => {
    setShowMobileThread(false);
  };

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedInquiryId || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const newMsg = await sendCustomerMessage(selectedInquiryId, textToSend);

      setActiveInquiry((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMsg],
        };
      });

      // Update in conversation list
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === selectedInquiryId
            ? { ...inq, latestMessage: textToSend, updatedAt: new Date().toISOString() }
            : inq
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  // Attach Image via Cloudinary
  const handleAttachImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedInquiryId) return;

    try {
      setIsUploadingAttachment(true);
      const res = await uploadImage(file, 'customers/chat-attachments');
      const imgMarkdown = `[Hình ảnh đính kèm]: ${res.url}`;
      const newMsg = await sendCustomerMessage(selectedInquiryId, imgMarkdown);

      setActiveInquiry((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMsg],
        };
      });

      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === selectedInquiryId
            ? { ...inq, latestMessage: '[Hình ảnh]', updatedAt: new Date().toISOString() }
            : inq
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể tải ảnh đính kèm');
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Quick Questions Suggestions
  const quickQuestions = [
    'Bên bạn còn nhận tiệc vào ngày cưới dự kiến của mình không?',
    'Bạn có thể gửi cho mình bảng báo giá chi tiết từng gói dịch vụ được không?',
    'Chi phí các gói đã bao gồm phí vận chuyển và lắp đặt chưa ạ?',
    'Bên bạn hiện có chương trình ưu đãi hay quà tặng nào cho dâu rể không?',
  ];

  const handleApplyQuickQuestion = (question: string) => {
    setInputText((prev) => (prev ? `${prev} ${question}` : question));
  };

  // Formatting helpers
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

  const formatListTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    if (filterStatus !== 'ALL' && inq.status !== filterStatus) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      inq.vendorName.toLowerCase().includes(q) ||
      (inq.title && inq.title.toLowerCase().includes(q)) ||
      (inq.latestMessage && inq.latestMessage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col selection:bg-[#5D0F12]/15 selection:text-[#5D0F12]">
      {/* ─── TOP BAR (DashboardHeader) ─── */}
      <div className="sticky top-0 z-50">
        <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />
      </div>

      {/* ─── MAIN LAYOUT: SIDEBAR ON LEFT + MESSAGES WORKSPACE ─── */}
      <div className="flex flex-1 w-full relative h-[calc(100vh-52px)] overflow-hidden">
        {/* Left Sidebar (Standard Dashboard Navigation) */}
        <DashboardSidebar hasPlan={!!plan} />

        {/* Messages Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBF5] overflow-hidden">
          {/* Subheader / Page Title Bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-[#EADCC9]/80 bg-white/70 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-base sm:text-lg font-bold uppercase tracking-wide text-[#5D0F12]"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                  >
                    Hộp Thư Tư Vấn Nhà Cung Cấp
                  </h1>
                  <span className="text-[10px] font-bold text-[#5D0F12] bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {inquiries.length} hội thoại
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-serif italic hidden sm:block">
                  Trao đổi trực tiếp, nhận bảng báo giá và giải đáp mọi thắc mắc cùng các đối tác cưới tin cậy.
                </p>
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4B896] bg-[#FAF8F5] hover:bg-[#5D0F12] text-[#5D0F12] hover:text-white transition-all text-xs font-semibold shadow-xs"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khám phá Marketplace</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 3-Column Split Workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* ═════════ COLUMN 1: Conversation List ═════════ */}
            <aside
              className={`w-full md:w-80 lg:w-96 border-r border-[#EADCC9]/80 bg-white/60 flex flex-col shrink-0 ${
                showMobileThread ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* Search Bar */}
              <div className="p-3 border-b border-[#EADCC9]/60">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm tên nhà cung cấp hoặc tin nhắn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/80 text-xs focus:outline-none focus:ring-1 focus:ring-[#5D0F12] transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Status Pills */}
                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto text-[10px] font-bold uppercase tracking-wider pb-0.5">
                  {(
                    [
                      { key: 'ALL', label: 'Tất cả' },
                      { key: 'PENDING', label: 'Chờ phản hồi' },
                      { key: 'RESPONDED', label: 'Đã phản hồi' },
                      { key: 'CLOSED', label: 'Đã đóng' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilterStatus(tab.key)}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                        filterStatus === tab.key
                          ? 'bg-[#5D0F12] text-[#FFFBF5]'
                          : 'bg-[#FAF8F5] text-stone-600 hover:bg-[#EADCC9]/60'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversations List Scrollable */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#EADCC9]/40">
                {isLoadingList ? (
                  <div className="p-10 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5D0F12]" />
                    <span>Đang tải danh sách hộp thư...</span>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EADCC9] flex items-center justify-center text-[#5D0F12]/60">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-stone-600 font-serif italic">
                      {searchQuery
                        ? 'Không tìm thấy cuộc trò chuyện nào phù hợp.'
                        : 'Bạn chưa có yêu cầu tư vấn nào gửi đến nhà cung cấp.'}
                    </p>
                    <Link
                      href="/marketplace"
                      className="px-3.5 py-1.5 rounded-full bg-[#5D0F12] text-[#FFFBF5] text-xs font-semibold uppercase tracking-wider hover:bg-[#4A0C0E] transition shadow-xs"
                    >
                      Khám phá dịch vụ cưới
                    </Link>
                  </div>
                ) : (
                  filteredInquiries.map((inq) => {
                    const isSelected = selectedInquiryId === inq.id;
                    return (
                      <button
                        key={inq.id}
                        type="button"
                        onClick={() => handleSelectInquiry(inq.id)}
                        className={`w-full text-left p-3.5 transition flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF8F5] border-l-4 border-l-[#5D0F12]'
                            : 'hover:bg-[#FAF8F5]/60'
                        }`}
                      >
                        {/* Vendor Avatar */}
                        <div className="w-11 h-11 rounded-full bg-[#FAF8F5] border border-[#D4B896] overflow-hidden shrink-0 flex items-center justify-center">
                          {inq.vendorAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={inq.vendorAvatar}
                              alt={inq.vendorName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Store className="w-5 h-5 text-[#5D0F12]" />
                          )}
                        </div>

                        {/* Summary Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-neutral-900 truncate">
                              {inq.vendorName}
                            </span>
                            <span className="text-[10px] text-stone-400 shrink-0">
                              {formatListTimestamp(inq.updatedAt)}
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 truncate mt-0.5 font-medium">
                            {inq.latestMessage || inq.title || 'Trao đổi dịch vụ cưới'}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                inq.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : inq.status === 'RESPONDED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {inq.status === 'PENDING'
                                ? 'Chờ phản hồi'
                                : inq.status === 'RESPONDED'
                                ? 'Đã phản hồi'
                                : 'Đã đóng'}
                            </span>

                            {inq.weddingDate && (
                              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#5D0F12]" />
                                {formatDate(inq.weddingDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* ═════════ COLUMN 2: Active Chat Window ═════════ */}
            <section
              className={`flex-1 flex flex-col bg-[#FFFBF5] overflow-hidden ${
                !showMobileThread && !selectedInquiryId ? 'hidden md:flex' : 'flex'
              }`}
            >
              {activeInquiry ? (
                <>
                  {/* Chat Thread Header */}
                  <div className="px-4 sm:px-6 py-3 border-b border-[#EADCC9]/80 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Mobile Back Button */}
                      <button
                        type="button"
                        onClick={handleBackToList}
                        className="md:hidden p-1.5 -ml-1 text-stone-600 hover:text-[#5D0F12] transition"
                        title="Quay lại danh sách"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      {/* Vendor Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#D4B896] overflow-hidden shrink-0 flex items-center justify-center">
                        {activeInquiry.vendorAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={activeInquiry.vendorAvatar}
                            alt={activeInquiry.vendorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-5 h-5 text-[#5D0F12]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                            {activeInquiry.vendorName}
                          </h2>
                          <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Đối tác Planora
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-serif italic truncate">
                          {activeInquiry.title || 'Trao đổi dịch vụ tiệc cưới'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/marketplace/${activeInquiry.vendorId}`}
                        title="Xem gian hàng của đối tác"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#5D0F12] bg-[#FAF8F5] border border-[#D4B896] hover:bg-[#5D0F12] hover:text-white transition shadow-xs"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Xem gian hàng</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                        title="Xem hồ sơ tiệc cưới liên kết"
                        className={`p-2 rounded-full border transition cursor-pointer ${
                          showInfoDrawer
                            ? 'bg-[#5D0F12] text-white border-[#5D0F12]'
                            : 'border-[#EADCC9] bg-white text-stone-600 hover:text-[#5D0F12]'
                        }`}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Thread Body */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {isLoadingChat ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#5D0F12]" />
                      </div>
                    ) : activeInquiry.messages.length === 0 ? (
                      <div className="text-center py-12 text-xs text-stone-500 font-serif italic max-w-md mx-auto space-y-2">
                        <Sparkles className="w-8 h-8 text-[#D4B896] mx-auto" />
                        <p className="text-stone-700 font-bold">
                          Bắt đầu cuộc trò chuyện với {activeInquiry.vendorName}
                        </p>
                        <p>
                          Hãy đặt những câu hỏi về bảng giá, gói dịch vụ hoặc tình trạng lịch cưới
                          để nhận tư vấn trực tiếp từ nhà cung cấp.
                        </p>
                      </div>
                    ) : (
                      activeInquiry.messages.map((msg) => {
                        const isVendor =
                          msg.senderRole === 'VENDOR' || msg.senderRole === 'ROLE_VENDOR';
                        const isMe = user?.id ? msg.senderId === user.id : !isVendor;

                        const isImage = msg.message.startsWith('[Hình ảnh đính kèm]: ');
                        const imageUrl = isImage
                          ? msg.message.replace('[Hình ảnh đính kèm]: ', '').trim()
                          : '';

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <span className="text-[10px] font-semibold text-stone-500">
                                {isMe ? 'Bạn' : activeInquiry.vendorName}
                              </span>
                              <span className="text-[9px] text-stone-400">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                            </div>

                            {/* Bubble */}
                            <div
                              className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                                isMe
                                  ? 'bg-[#5D0F12] text-[#FFFBF5] rounded-tr-none'
                                  : 'bg-white text-stone-800 border border-[#EADCC9] rounded-tl-none font-medium'
                              }`}
                            >
                              {isImage ? (
                                <div className="space-y-1.5">
                                  <div
                                    onClick={() => setPreviewImage(imageUrl)}
                                    className="rounded-xl overflow-hidden border border-white/20 max-w-xs cursor-pointer group relative"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={imageUrl}
                                      alt="Hình ảnh đính kèm"
                                      className="w-full h-auto object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                      <Maximize2 className="w-5 h-5" />
                                    </div>
                                  </div>
                                  <span className="text-[10px] opacity-80 block italic">
                                    Nhấp vào ảnh để phóng to
                                  </span>
                                </div>
                              ) : (
                                <p className="whitespace-pre-line">{msg.message}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Questions Pills Toolbar */}
                  <div className="px-4 py-2 border-t border-[#EADCC9]/50 bg-[#FAF8F5]/60 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
                    <span className="text-stone-400 font-serif italic shrink-0">Gợi ý câu hỏi:</span>
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyQuickQuestion(q)}
                        className="px-3 py-1 rounded-full bg-white border border-[#EADCC9] text-stone-700 hover:text-[#5D0F12] hover:border-[#D4B896] transition shrink-0 cursor-pointer text-xs"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 sm:p-4 border-t border-[#EADCC9]/80 bg-white flex items-center gap-2 shrink-0"
                  >
                    {/* Attachment Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAttachment}
                      className="p-2.5 rounded-xl border border-[#EADCC9] text-stone-500 hover:text-[#5D0F12] hover:bg-[#FAF8F5] transition cursor-pointer"
                      title="Gửi ảnh trao đổi mẫu qua Cloudinary"
                    >
                      {isUploadingAttachment ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#5D0F12]" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAttachImage}
                    />

                    {/* Text Input */}
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Nhập nội dung trao đổi với nhà cung cấp..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5D0F12] text-xs font-medium transition"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-40 cursor-pointer"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Gửi</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                  <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#EADCC9] flex items-center justify-center text-[#D4B896] mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3
                    className="text-lg font-bold text-neutral-900 uppercase tracking-wide"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                  >
                    Chọn một cuộc trò chuyện từ danh sách
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mt-1 font-serif italic">
                    Toàn bộ lịch sử trao đổi, báo giá và tư vấn từ các nhà cung cấp sẽ hiển thị tại
                    đây để bạn dễ dàng quản lý trọn vẹn hành trình cưới.
                  </p>
                  <Link
                    href="/marketplace"
                    className="mt-4 px-4 py-2 rounded-full bg-[#5D0F12] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#4A0C0E] transition shadow-xs"
                  >
                    Ghé thăm Marketplace
                  </Link>
                </div>
              )}
            </section>

            {/* ═════════ COLUMN 3: Vendor & Event Profile Card ═════════ */}
            {activeInquiry && (
              <aside
                className={`w-80 border-l border-[#EADCC9]/80 bg-white/70 flex-col p-5 space-y-5 shrink-0 overflow-y-auto ${
                  showInfoDrawer ? 'flex' : 'hidden xl:flex'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-widest bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Hồ sơ đối tác
                  </span>
                  {showInfoDrawer && (
                    <button
                      type="button"
                      onClick={() => setShowInfoDrawer(false)}
                      className="xl:hidden p-1 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Vendor Overview Card */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADCC9] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white border border-[#D4B896] overflow-hidden shrink-0 flex items-center justify-center">
                      {activeInquiry.vendorAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activeInquiry.vendorAvatar}
                          alt={activeInquiry.vendorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-[#5D0F12]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {activeInquiry.vendorName}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-serif italic">
                        Đối tác cưới Planora
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/marketplace/${activeInquiry.vendorId}`}
                    className="w-full py-2 px-3 rounded-xl bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <span>Xem dịch vụ & báo giá</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Wedding Plan Context Attached */}
                <div className="space-y-3">
                  <h4
                    className="text-xs font-bold uppercase tracking-wide text-neutral-900"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                  >
                    Bối Cảnh Kế Hoạch Cưới
                  </h4>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADCC9] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#5D0F12]" />
                      Ngày cưới dự kiến
                    </span>
                    <p className="text-xs font-bold text-neutral-900">
                      {formatDate(activeInquiry.weddingDate)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADCC9] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#5D0F12]" />
                      Quy mô khách mời
                    </span>
                    <p className="text-xs font-bold text-neutral-900">
                      {activeInquiry.guestCount
                        ? `${activeInquiry.guestCount} khách`
                        : 'Chưa xác định'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADCC9] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-[#5D0F12]" />
                      Dự trù ngân sách
                    </span>
                    <p className="text-xs font-bold text-[#5D0F12]">
                      {formatVND(activeInquiry.budget)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADCC9] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5D0F12]" />
                      Địa điểm tổ chức
                    </span>
                    <p className="text-xs font-bold text-neutral-900">
                      {activeInquiry.location || 'Chưa ấn định'}
                    </p>
                  </div>
                </div>

                {/* Helpful Note */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#EADCC9] text-[11px] text-stone-600 space-y-1 font-serif italic">
                  <p className="font-sans font-bold not-italic text-[#5D0F12] text-xs">
                    Lưu ý hữu ích:
                  </p>
                  <p>
                    Thông tin kế hoạch cưới được đồng bộ giúp nhà cung cấp chuẩn bị báo giá chính
                    xác nhất với nhu cầu của bạn.
                  </p>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* ─── IMAGE LIGHTBOX PREVIEW MODAL ─── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-900 text-white flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide">Hình ảnh đính kèm</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
                  title="Mở trong tab mới"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-auto p-2 flex items-center justify-center bg-stone-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Hình ảnh đính kèm chi tiết"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
            <span className="text-xs text-stone-500 font-serif italic">
              Đang tải hộp thư tin nhắn...
            </span>
          </div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
