'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Paperclip,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  User,
  X,
  FileText,
} from 'lucide-react';
import {
  getVendorInquiries,
  getVendorInquiryDetail,
  sendVendorMessage,
  updateInquiryStatus,
} from '@/services/inquiryService';
import { uploadImage } from '@/services/vendorProfile';
import type {
  InquirySummary,
  InquiryDetail,
  InquiryMessage,
  InquiryStatus,
} from '@/types/inquiry';

export default function VendorChatPage() {
  // Main Data States
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [activeInquiry, setActiveInquiry] = useState<InquiryDetail | null>(null);

  // Loading & Error States
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Input State
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load inquiries list
  useEffect(() => {
    async function loadInquiries() {
      try {
        setIsLoadingList(true);
        const data = await getVendorInquiries();
        setInquiries(data);
        if (data.length > 0 && !selectedInquiryId) {
          setSelectedInquiryId(data[0].id);
        }
      } catch (err: unknown) {
        console.error('Lỗi khi tải danh sách cuộc trò chuyện:', err);
      } finally {
        setIsLoadingList(false);
      }
    }

    loadInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load active inquiry detail when selected
  useEffect(() => {
    if (!selectedInquiryId) return;

    let isMounted = true;

    async function loadDetail() {
      try {
        setIsLoadingChat(true);
        const detail = await getVendorInquiryDetail(selectedInquiryId!);
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

    // Polling every 5 seconds for new messages
    const interval = setInterval(async () => {
      try {
        const refreshed = await getVendorInquiryDetail(selectedInquiryId!);
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
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedInquiryId]);

  useEffect(() => {
    scrollToBottom();
  }, [activeInquiry?.messages]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedInquiryId || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const newMsg = await sendVendorMessage(selectedInquiryId, textToSend);

      setActiveInquiry((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'RESPONDED',
          messages: [...prev.messages, newMsg],
        };
      });

      // Update in conversation list
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === selectedInquiryId
            ? { ...inq, status: 'RESPONDED', latestMessage: textToSend }
            : inq
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Status Change
  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (!selectedInquiryId || !activeInquiry) return;

    try {
      await updateInquiryStatus(selectedInquiryId, newStatus);
      setActiveInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === selectedInquiryId ? { ...inq, status: newStatus } : inq))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái');
    }
  };

  // Upload image in chat via Cloudinary
  const handleAttachImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedInquiryId) return;

    try {
      setIsUploadingAttachment(true);
      const res = await uploadImage(file, 'vendors/chat-attachments');
      const imgMarkdown = `[Hình ảnh đính kèm]: ${res.url}`;
      await sendVendorMessage(selectedInquiryId, imgMarkdown);

      // Refresh chat
      const refreshed = await getVendorInquiryDetail(selectedInquiryId);
      setActiveInquiry(refreshed);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể tải ảnh đính kèm');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  // Quick reply snippet
  const insertQuickSnippet = (snippet: string) => {
    setInputText((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

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

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      inq.customerName.toLowerCase().includes(q) ||
      (inq.title && inq.title.toLowerCase().includes(q)) ||
      (inq.latestMessage && inq.latestMessage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col bg-[#FFFBF5] overflow-hidden">
      {/* Top Bar Header */}
      <header className="px-6 py-4 border-b border-[#EADCC9]/80 bg-white/70 backdrop-blur-md flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-xl font-bold uppercase tracking-wide text-[#5D0F12]"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              Hộp Thư Tư Vấn Khách Hàng (Inquiries & Chat)
            </h1>
            <span className="text-[10px] font-bold text-[#5D0F12] bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Realtime
            </span>
          </div>
          <p className="text-xs text-stone-500 font-serif italic mt-0.5">
            Trò chuyện trực tiếp và đồng hành cùng các cặp đôi trong hành trình chuẩn bị ngày cưới.
          </p>
        </div>

        {activeInquiry && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 hidden sm:inline">Trạng thái:</span>
            <select
              value={activeInquiry.status}
              onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D4B896] bg-[#FAF8F5] text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5D0F12] cursor-pointer uppercase tracking-wider"
            >
              <option value="PENDING">Chờ phản hồi (PENDING)</option>
              <option value="RESPONDED">Đã phản hồi (RESPONDED)</option>
              <option value="CLOSED">Đã hoàn tất (CLOSED)</option>
            </select>
          </div>
        )}
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= COLUMN 1: Inquiries List ================= */}
        <aside className="w-full sm:w-80 md:w-96 border-r border-[#EADCC9]/80 bg-white/50 flex flex-col shrink-0">
          {/* Search Box */}
          <div className="p-3.5 border-b border-[#EADCC9]/60">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm dâu rể hoặc tin nhắn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/80 text-xs focus:outline-none focus:ring-1 focus:ring-[#5D0F12] transition"
              />
            </div>
          </div>

          {/* List of Conversations */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#EADCC9]/40">
            {isLoadingList ? (
              <div className="p-8 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#5D0F12]" />
                <span>Đang tải danh sách tin nhắn...</span>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 font-serif italic">
                Chưa có yêu cầu tư vấn nào từ dâu rể.
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = selectedInquiryId === inq.id;
                return (
                  <button
                    key={inq.id}
                    type="button"
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`w-full text-left p-4 transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF8F5] border-l-4 border-l-[#5D0F12]'
                        : 'hover:bg-[#FAF8F5]/60'
                    }`}
                  >
                    {/* Customer Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#D4B896] overflow-hidden shrink-0 flex items-center justify-center">
                      {inq.customerAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={inq.customerAvatar}
                          alt={inq.customerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-stone-400" />
                      )}
                    </div>

                    {/* Brief Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-neutral-900 truncate">
                          {inq.customerName}
                        </span>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {formatTime(inq.updatedAt)}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 truncate mt-0.5 font-medium">
                        {inq.latestMessage || inq.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-500">
                        {inq.weddingDate && (
                          <span className="flex items-center gap-1 text-[#5D0F12] font-semibold">
                            <Calendar className="w-3 h-3" />
                            {formatDate(inq.weddingDate)}
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.2 rounded-full uppercase tracking-tight text-[9px] font-bold ${
                            inq.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : inq.status === 'RESPONDED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ================= COLUMN 2: Chat Thread Window ================= */}
        <section className="flex-1 flex flex-col bg-[#FFFBF5] overflow-hidden">
          {activeInquiry ? (
            <>
              {/* Chat Thread Header */}
              <div className="px-6 py-3 border-b border-[#EADCC9]/60 bg-white/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#D4B896] overflow-hidden flex items-center justify-center">
                    {activeInquiry.customerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeInquiry.customerAvatar}
                        alt={activeInquiry.customerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-neutral-900">
                      {activeInquiry.customerName}
                    </h2>
                    <p className="text-[11px] text-stone-500 flex items-center gap-2">
                      <span>{activeInquiry.customerEmail}</span>
                      {activeInquiry.customerPhone && (
                        <span>• {activeInquiry.customerPhone}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Mobile View Toggle */}
                <div className="xl:hidden text-xs text-[#5D0F12] font-bold bg-[#5D0F12]/10 px-2.5 py-1 rounded-full">
                  Tiệc cưới: {formatDate(activeInquiry.weddingDate)}
                </div>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {isLoadingChat ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5D0F12]" />
                  </div>
                ) : activeInquiry.messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-stone-500 font-serif italic">
                    Bắt đầu cuộc trò chuyện tư vấn với {activeInquiry.customerName}...
                  </div>
                ) : (
                  activeInquiry.messages.map((msg) => {
                    const isVendor = msg.senderRole === 'VENDOR';
                    const isImage = msg.message.startsWith('[Hình ảnh đính kèm]: ');
                    const imageUrl = isImage ? msg.message.replace('[Hình ảnh đính kèm]: ', '') : '';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-semibold text-stone-500">
                            {isVendor ? 'Bạn (Nhà cung cấp)' : msg.senderName}
                          </span>
                          <span className="text-[9px] text-stone-400">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                            isVendor
                              ? 'bg-[#5D0F12] text-[#FFFBF5] rounded-tr-none'
                              : 'bg-white text-stone-800 border border-[#EADCC9] rounded-tl-none font-medium'
                          }`}
                        >
                          {isImage ? (
                            <div className="rounded-xl overflow-hidden border border-white/20 mt-1 max-w-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imageUrl} alt="Đính kèm" className="w-full h-auto object-cover" />
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

              {/* Quick Snippets Pill Toolbar */}
              <div className="px-4 py-2 border-t border-[#EADCC9]/50 bg-[#FAF8F5]/50 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
                <span className="text-stone-400 font-serif italic shrink-0">Mẫu trả lời:</span>
                <button
                  type="button"
                  onClick={() =>
                    insertQuickSnippet(
                      'Chào bạn! Rất vui được đồng hành cùng ngày trọng đại của bạn. Bên mình đã nhận được yêu cầu và xin gửi thông tin chi tiết.'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white border border-[#EADCC9] text-stone-700 hover:text-[#5D0F12] hover:border-[#D4B896] transition shrink-0 cursor-pointer"
                >
                  Lời chào mừng
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertQuickSnippet(
                      'Ngày cưới dự kiến của bạn bên mình vẫn còn lịch trống. Bạn có thể ghé studio để xem mẫu váy/concept trực tiếp không?'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white border border-[#EADCC9] text-stone-700 hover:text-[#5D0F12] hover:border-[#D4B896] transition shrink-0 cursor-pointer"
                >
                  Xác nhận còn lịch
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertQuickSnippet(
                      'Bên mình xin gửi bảng báo giá gói dịch vụ chi tiết kèm ưu đãi dành riêng cho tiệc cưới của bạn.'
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white border border-[#EADCC9] text-stone-700 hover:text-[#5D0F12] hover:border-[#D4B896] transition shrink-0 cursor-pointer"
                >
                  Gửi báo giá ưu đãi
                </button>
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-[#EADCC9]/80 bg-white flex items-center gap-2 shrink-0"
              >
                {/* Upload Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAttachment}
                  className="p-2.5 rounded-xl border border-[#EADCC9] text-stone-500 hover:text-[#5D0F12] hover:bg-[#FAF8F5] transition cursor-pointer"
                  title="Gửi ảnh mẫu thực tế qua Cloudinary"
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

                {/* Textarea Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập nội dung tư vấn cho cặp đôi..."
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
              <MessageSquare className="w-12 h-12 text-[#EADCC9] mb-3" />
              <p className="text-sm font-semibold text-stone-700">Chọn một cuộc trò chuyện từ danh sách</p>
              <p className="text-xs text-stone-500 max-w-sm mt-1 font-serif italic">
                Các câu hỏi và yêu cầu tư vấn từ cặp đôi khi ghé thăm gian hàng của bạn sẽ được hiển thị tại đây.
              </p>
            </div>
          )}
        </section>

        {/* ================= COLUMN 3: Wedding Context Panel (Desktop) ================= */}
        {activeInquiry && (
          <aside className="hidden xl:flex w-80 border-l border-[#EADCC9]/80 bg-white/70 flex-col p-6 space-y-6 shrink-0 overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-widest bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Hồ sơ tiệc cưới
              </span>
              <h3
                className="text-base font-bold uppercase tracking-wide text-neutral-900 mt-2"
                style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
              >
                Bối Cảnh Ngày Trọng Đại
              </h3>
              <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                Dữ liệu từ kế hoạch cưới của cặp đôi giúp bạn tư vấn chính xác nhất.
              </p>
            </div>

            {/* Wedding Context Cards */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADCC9] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#5D0F12]" />
                  Ngày cưới dự kiến
                </span>
                <p className="text-xs font-bold text-neutral-900">
                  {formatDate(activeInquiry.weddingDate)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADCC9] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#5D0F12]" />
                  Quy mô khách mời
                </span>
                <p className="text-xs font-bold text-neutral-900">
                  {activeInquiry.guestCount ? `${activeInquiry.guestCount} khách` : 'Chưa xác định'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADCC9] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-[#5D0F12]" />
                  Dự trù ngân sách
                </span>
                <p className="text-xs font-bold text-[#5D0F12]">
                  {formatVND(activeInquiry.budget)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EADCC9] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#5D0F12]" />
                  Địa điểm tổ chức
                </span>
                <p className="text-xs font-bold text-neutral-900">
                  {activeInquiry.location || 'Chưa ấn định'}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="pt-4 border-t border-[#EADCC9]/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Thông Tin Liên Hệ
              </h4>
              <div className="text-xs text-stone-600 space-y-1">
                <p className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-semibold">{activeInquiry.customerName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{activeInquiry.customerEmail}</span>
                </p>
                {activeInquiry.customerPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{activeInquiry.customerPhone}</span>
                  </p>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

