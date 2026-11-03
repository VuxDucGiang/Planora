'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Loader2, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Heart,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import type { VendorDetailResponse, PackageResponse } from '@/types/vendor';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlan } from '@/contexts/PlanContext';
import { createOrGetInquiry } from '@/services/inquiryService';

interface VendorDetailModalProps {
  isOpen: boolean;
  isLoading: boolean;
  vendorDetail: VendorDetailResponse | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleShortlist: (e: React.MouseEvent) => void;
}

export default function VendorDetailModal({
  isOpen,
  isLoading,
  vendorDetail,
  isSaved,
  onClose,
  onToggleShortlist,
}: VendorDetailModalProps) {
  const { language, t } = useLanguage();
  const { plan } = usePlan();
  const router = useRouter();
  const [sendingPackageId, setSendingPackageId] = useState<number | null>(null);

  if (!isOpen) return null;

  // Find matched category in plan
  const matchedBudgetItem = (() => {
    if (!plan?.budgetItems || !vendorDetail?.primaryCategoryName) return null;
    const vendorCat = vendorDetail.primaryCategoryName.toLowerCase().trim();
    return plan.budgetItems.find((item) => {
      const itemCat = item.categoryName.toLowerCase().trim();
      return itemCat.includes(vendorCat) || vendorCat.includes(itemCat);
    });
  })();

  const handleQuickInquirePackage = async (pkg: PackageResponse) => {
    if (!vendorDetail) return;
    setSendingPackageId(pkg.id);
    try {
      const priceText = language === 'en' ? `$${(pkg.price / 25000).toFixed(0)}` : `${pkg.price.toLocaleString()} ₫`;
      const dateText = plan?.weddingDate || 'sắp tới';
      const guestText = plan?.guestCount ? `${plan.guestCount} khách` : 'tiệc thân mật';
      const locText = plan?.location || vendorDetail.city || '';

      const msg = [
        `Xin chào ${vendorDetail.businessName}! Tôi quan tâm đến gói dịch vụ "${pkg.packageName}" (${priceText}).`,
        `Thông tin đám cưới của tôi:`,
        `- Ngày tổ chức: ${dateText}`,
        `- Quy mô tiệc: ${guestText}`,
        locText ? `- Địa điểm: ${locText}` : '',
        `Bạn có thể kiểm tra lịch trống và gửi thông tin chi tiết gói này giúp tôi qua tin nhắn được không? Cảm ơn bạn!`
      ].filter(Boolean).join('\n');

      const inq = await createOrGetInquiry({
        vendorId: vendorDetail.id,
        weddingPlanId: plan?.id,
        title: `Tư vấn gói [${pkg.packageName}] - ${vendorDetail.businessName}`,
        message: msg,
      });

      onClose();
      router.push(`/messages?inquiryId=${inq.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể gửi yêu cầu tư vấn gói');
    } finally {
      setSendingPackageId(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative border-t sm:border border-hairline/80 p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-neutral-500">{t.marketplace.loadingDetail}</span>
          </div>
        ) : vendorDetail ? (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                {vendorDetail.primaryCategoryName || (language === 'vi' ? 'Dịch vụ cưới' : 'Wedding Service')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 uppercase">
                {vendorDetail.businessName}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  ★ {(vendorDetail.ratingAverage || 4.8).toFixed(1)}
                </span>
                <span>&bull;</span>
                <span>{vendorDetail.totalReviews || 32} {t.common.reviews}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {vendorDetail.city}, {vendorDetail.district}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              {vendorDetail.description}
            </p>

            {/* Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-sm">
              <div className="flex items-center gap-2 text-neutral-700">
                <Phone className="w-4 h-4 text-primary" />
                <span>{vendorDetail.phone || '0909 888 999'}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Mail className="w-4 h-4 text-primary" />
                <span>{vendorDetail.email || 'contact@planora.vn'}</span>
              </div>
            </div>

            {/* Packages */}
            {vendorDetail.packages && vendorDetail.packages.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    {t.marketplace.pricingPackages}
                  </h4>
                  <span className="text-xs text-neutral-400">Gửi tư vấn thẳng qua tin nhắn</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vendorDetail.packages.map(pkg => {
                    const isSending = sendingPackageId === pkg.id;
                    const isWithinBudget = matchedBudgetItem?.estimatedCost && pkg.price <= matchedBudgetItem.estimatedCost;
                    return (
                      <div key={pkg.id} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="font-bold text-sm text-neutral-900">{pkg.packageName}</p>
                            {isWithinBudget && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 shrink-0">
                                <Sparkles className="w-2.5 h-2.5" /> Khớp ngân sách
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{pkg.description}</p>
                          <p className="text-sm font-bold text-primary mt-2 font-mono">
                            {language === 'en' ? `$${(pkg.price / 25000).toFixed(0)}` : `${pkg.price.toLocaleString()} ₫`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickInquirePackage(pkg)}
                          disabled={sendingPackageId !== null}
                          className="mt-3 w-full py-1.5 px-3 rounded-lg border border-[#5D0F12] text-[#5D0F12] hover:bg-[#5D0F12] hover:text-white transition text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang kết nối...</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Nhận tư vấn gói này</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons inside modal */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <Link
                href={`/marketplace/${vendorDetail.id}`}
                className="text-sm font-semibold text-neutral-600 hover:text-[#5D0F12] flex items-center gap-1 hover:underline"
              >
                {t.marketplace.viewFullDetail} <ExternalLink className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  {t.marketplace.closeModal}
                </button>
                <button
                  onClick={onToggleShortlist}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                    isSaved
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-[#5D0F12] text-white hover:bg-[#4A0C0E] !text-[#FFFBF5]'
                  }`}
                  style={!isSaved ? { backgroundColor: '#5D0F12', color: '#FFFBF5' } : undefined}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-600' : ''}`} />
                  {isSaved ? t.marketplace.removeFromShortlistBtn : t.marketplace.saveToShortlistBtn}
                </button>
              </div>
            </div>

          </div>
        ) : (
          <p className="text-center py-10 text-sm text-neutral-500">{t.common.notFound}</p>
        )}
      </div>
    </div>
  );
}

