'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageCircle,
  Sparkles,
  User,
  Check,
  CornerDownRight,
  Edit2,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getMyVendorReviews,
  replyToReview,
  deleteReviewReply,
} from '@/services/vendorReviews';
import type { VendorReviewStatsResponse, ReviewResponse } from '@/types/vendor';

export default function VendorReviewsPage() {
  const [stats, setStats] = useState<VendorReviewStatsResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active reply form state
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getMyVendorReviews();
      setStats(data);
      setReviews(data.reviews || []);
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách đánh giá:', err);
      setErrorMessage('Không thể tải danh sách đánh giá. Vui lòng tải lại trang.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const openReplyBox = (reviewId: number, existingReply?: string) => {
    setActiveReplyReviewId(reviewId);
    setReplyText(existingReply || '');
  };

  const handleSendReply = async (reviewId: number) => {
    if (!replyText.trim() || isSubmittingReply) return;

    try {
      setIsSubmittingReply(true);
      setErrorMessage(null);
      const updatedReview = await replyToReview(reviewId, replyText.trim());

      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? updatedReview : r))
      );
      setActiveReplyReviewId(null);
      setReplyText('');
      showSuccess('Đã gửi phản hồi thành công đến cặp đôi!');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi gửi phản hồi');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) return;

    try {
      await deleteReviewReply(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, vendorReply: undefined, repliedAt: undefined } : r
        )
      );
      showSuccess('Đã xóa phản hồi!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa phản hồi');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
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

  const total = stats?.totalReviews || reviews.length || 0;
  const getPercent = (count?: number) => {
    if (!total || !count) return 0;
    return Math.round((count / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm font-serif italic text-stone-500">
            Đang tải dữ liệu đánh giá & phản hồi...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Toast Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#EADCC9] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-widest bg-[#5D0F12]/10 border border-[#5D0F12]/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Giai đoạn 4: Đánh Giá & Uy Tín
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#5D0F12] mt-2"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            Đánh Giá Của Khách Hàng & Phản Hồi
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-serif italic">
            Lắng nghe cảm nhận thực tế từ các cặp đôi và xây dựng uy tín thương hiệu vững chắc qua từng lời phản hồi ân cần.
          </p>
        </div>
      </section>

      {/* Overview Statistics Card */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Overall Rating Box */}
        <div className="rounded-[1.75rem] border border-[#EADCC9] bg-white p-6 sm:p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Điểm Đánh Giá Trung Bình
          </span>
          <div
            className="text-5xl sm:text-6xl font-bold text-[#5D0F12]"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            {stats?.ratingAverage ? stats.ratingAverage.toFixed(1) : '5.0'}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-5 h-5 fill-amber-400 text-amber-500"
              />
            ))}
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Dựa trên {total} lượt đánh giá từ dâu rể
          </p>
        </div>

        {/* Right: Stars Breakdown Progress (Col span 2) */}
        <div className="md:col-span-2 rounded-[1.75rem] border border-[#EADCC9] bg-white p-6 sm:p-8 shadow-xs space-y-3.5 justify-center flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            Phân Bố Số Lượng Sao Đánh Giá
          </h3>

          {[
            { star: 5, count: stats?.fiveStarCount || 0 },
            { star: 4, count: stats?.fourStarCount || 0 },
            { star: 3, count: stats?.threeStarCount || 0 },
            { star: 2, count: stats?.twoStarCount || 0 },
            { star: 1, count: stats?.oneStarCount || 0 },
          ].map((item) => {
            const pct = getPercent(item.count);
            return (
              <div key={item.star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-stone-700 shrink-0 flex items-center gap-1">
                  {item.star} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#FAF8F5] border border-[#EADCC9]/50 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right font-medium text-stone-500 text-[11px] shrink-0">
                  {item.count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EADCC9]/60 pb-3">
          <h2
            className="text-lg font-bold uppercase tracking-wide text-neutral-900"
            style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
          >
            Toàn Bộ Đánh Giá ({reviews.length})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="p-12 text-center rounded-[1.75rem] border-2 border-dashed border-[#EADCC9] bg-[#FAF8F5]/60 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-stone-400 border border-[#EADCC9] shadow-xs">
              <MessageCircle className="w-6 h-6 text-[#5D0F12]" />
            </div>
            <p className="text-sm font-semibold text-stone-800">Chưa có đánh giá nào từ khách hàng</p>
            <p className="text-xs text-stone-500 max-w-sm font-serif italic">
              Khi các cặp đôi hoàn thành hôn lễ hoặc trải nghiệm dịch vụ, nhận xét của họ sẽ được hiển thị đầy đủ tại đây.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-[1.75rem] border border-[#EADCC9] bg-white p-6 sm:p-7 shadow-xs hover:border-[#D4B896] transition space-y-4"
            >
              {/* Customer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EADCC9]/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#D4B896] overflow-hidden flex items-center justify-center shrink-0">
                    {rev.customerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rev.customerAvatar}
                        alt={rev.customerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {rev.customerName}
                    </h4>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 self-start sm:self-auto">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= rev.rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-1">
                    {rev.rating}.0
                  </span>
                </div>
              </div>

              {/* Customer Comment */}
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif">
                {rev.comment}
              </p>

              {/* Vendor Reply Area */}
              {rev.vendorReply ? (
                <div className="rounded-2xl bg-[#FAF8F5] border-l-4 border-l-[#5D0F12] border border-[#EADCC9] p-4 sm:p-5 space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D0F12] flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5" />
                      Phản hồi từ Nhà cung cấp • {formatDate(rev.repliedAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openReplyBox(rev.id, rev.vendorReply)}
                        className="p-1 rounded text-stone-400 hover:text-[#5D0F12] transition"
                        title="Chỉnh sửa phản hồi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReply(rev.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 transition"
                        title="Xóa phản hồi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-stone-700 font-serif leading-relaxed whitespace-pre-line">
                    {rev.vendorReply}
                  </p>
                </div>
              ) : activeReplyReviewId === rev.id ? (
                /* Inline Reply Form */
                <div className="pt-2 space-y-3">
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Viết lời cảm ơn và chia sẻ cảm xúc cùng dâu rể..."
                      className="w-full p-3.5 rounded-xl border border-[#D4B896] bg-[#FAF8F5]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5D0F12] text-xs font-serif leading-relaxed"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveReplyReviewId(null)}
                      className="px-4 py-1.5 rounded-full border border-[#EADCC9] text-xs font-semibold text-stone-600 hover:bg-[#FAF8F5]"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReply(rev.id)}
                      disabled={!replyText.trim() || isSubmittingReply}
                      className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-[#5D0F12] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider hover:bg-[#4A0C0E] transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isSubmittingReply ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Gửi phản hồi</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Button to open reply */
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => openReplyBox(rev.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5D0F12] hover:text-[#4A0C0E] transition uppercase tracking-wider cursor-pointer"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Viết phản hồi cho đánh giá này</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
