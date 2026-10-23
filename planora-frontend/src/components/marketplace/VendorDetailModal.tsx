'use client';

import React from 'react';
import Link from 'next/link';
import { 
  X, 
  Loader2, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Heart 
} from 'lucide-react';
import type { VendorDetailResponse } from '@/types/vendor';
import { useLanguage } from '@/contexts/LanguageContext';

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

  if (!isOpen) return null;

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
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  {t.marketplace.pricingPackages}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vendorDetail.packages.map(pkg => (
                    <div key={pkg.id} className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
                      <p className="font-bold text-sm text-neutral-900">{pkg.packageName}</p>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{pkg.description}</p>
                      <p className="text-sm font-bold text-primary mt-2 font-mono">
                        {language === 'en' ? `$${(pkg.price / 25000).toFixed(0)}` : `${pkg.price.toLocaleString()} ₫`}
                      </p>
                    </div>
                  ))}
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

