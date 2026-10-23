'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, AlertCircle, Plus, ChevronRight } from 'lucide-react';
import type { VendorResponse } from '@/types/vendor';

const FALLBACK_IMAGES = [
  '/landing/landing-2.png',
  '/landing/landing-3.png',
  '/landing/landing-4.png',
  '/wedding-our-collection.jpg',
];

interface SavedVendorsCarouselProps {
  vendors: VendorResponse[];
}

function StarRating({ rating = 5 }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rounded ? 'text-amber-500 fill-amber-500' : 'text-neutral-200 fill-neutral-100'
          }`}
        />
      ))}
    </div>
  );
}

import { useLanguage } from '@/contexts/LanguageContext';

function VendorCard({
  vendor,
  index,
  isActive = true,
  isNeighbor = false,
  isCarousel = false,
}: {
  vendor: VendorResponse;
  index: number;
  isActive?: boolean;
  isNeighbor?: boolean;
  isCarousel?: boolean;
}) {
  const { t, language } = useLanguage();
  const imageUrl = vendor.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const rating = vendor.ratingAverage || 4.8;
  const reviewsCount = vendor.totalReviews || 32;

  // Calculate estimated match score
  const matchScore = Math.min(
    99,
    Math.max(85, Math.round(88 + ((vendor.id * 7 + Math.round(rating * 3)) % 11)))
  );

  // Format price estimation
  let priceText = language === 'vi' ? 'Ước tính: 15.0M – 25.0M ₫' : 'Est: $1,500 – $2,000';
  if (vendor.priceFrom && vendor.priceTo) {
    if (vendor.priceFrom >= 100000) {
      priceText = `${t.common.estPrice}: ${(vendor.priceFrom / 1000000).toFixed(1)}M – ${(vendor.priceTo / 1000000).toFixed(1)}M ₫`;
    } else {
      priceText = `${t.common.estPrice}: $${vendor.priceFrom.toLocaleString()} – $${vendor.priceTo.toLocaleString()}`;
    }
  } else if (vendor.priceFrom) {
    priceText = `${t.common.estPrice}: ${vendor.priceFrom.toLocaleString()} ₫`;
  }

  return (
    <div
      className={`bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col transition-all duration-500 select-none origin-center ${
        isCarousel
          ? `w-[280px] sm:w-[310px] flex-shrink-0 ${
              isActive
                ? 'scale-100 shadow-[0_16px_40px_rgba(0,0,0,0.12)] z-20 opacity-100'
                : isNeighbor
                ? 'scale-[0.95] opacity-90 z-10 shadow-md'
                : 'scale-[0.88] opacity-35 blur-[0.4px] z-0'
            }`
          : 'w-full max-w-[310px] hover:scale-[1.02] shadow-md hover:shadow-xl'
      }`}
      style={
        isCarousel
          ? {
              transform: isActive ? 'scale(1)' : isNeighbor ? 'scale(0.95)' : 'scale(0.88)',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
            }
          : undefined
      }
    >
      {/* Top Image Container */}
      <div className="p-3 pb-0">
        <div className="w-full h-52 sm:h-56 rounded-2xl overflow-hidden relative group bg-neutral-100">
          <img
            src={imageUrl}
            alt={vendor.businessName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {vendor.primaryCategoryName && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/85 text-neutral-800 backdrop-blur-sm shadow-sm uppercase tracking-wider">
              {vendor.primaryCategoryName}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        {/* Rating row */}
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
          <div className="flex items-center gap-1.5">
            <StarRating rating={rating} />
            <span className="font-semibold text-neutral-700">({rating.toFixed(1)})</span>
          </div>
          <span className="text-xs text-neutral-400">
            ({reviewsCount} {t.common.reviews})
          </span>
        </div>

        {/* Vendor Name */}
        <h4
          className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wide line-clamp-1 mb-1 text-[#5D0F12]"
        >
          {vendor.businessName}
        </h4>

        {/* Match and Price */}
        <div className="space-y-0.5 mb-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
            <span className="text-amber-700 text-xs">✦</span>
            <span>{t.common.match}: {matchScore}%</span>
          </div>
          <p className="text-sm text-neutral-600 font-medium">{priceText}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/marketplace/${vendor.id}?inquire=true`}
            className="flex-1 py-2 px-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-sm hover:opacity-95 active:scale-95 cursor-pointer !text-[#FFFBF5]"
            style={{ backgroundColor: '#5D0F12', color: '#FFFBF5' }}
          >
            {t.common.inquireNow}
          </Link>
          <Link
            href={`/marketplace/${vendor.id}`}
            className="py-2 px-4 rounded-full text-xs sm:text-sm font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 text-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            {t.common.view}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SavedVendorsCarousel({ vendors }: SavedVendorsCarouselProps) {
  const { t, language } = useLanguage();
  const isCarousel = vendors.length > 3;
  const n = vendors.length;

  // For infinite carousel: duplicate list 3 times (previous, current, next)
  const extendedVendors = isCarousel ? [...vendors, ...vendors, ...vendors] : vendors;

  // Middle set starts at index n
  const [currentIndex, setCurrentIndex] = useState(n);
  const [prevN, setPrevN] = useState(n);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  // Sync currentIndex if vendors count changes during render
  if (isCarousel && prevN !== n) {
    setPrevN(n);
    setCurrentIndex(n);
  }

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const scrollPrev = () => {
    if (!isTransitionEnabled) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const scrollNext = () => {
    if (!isTransitionEnabled) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      scrollNext();
    } else if (diff < -45) {
      scrollPrev();
    }
    setTouchStartX(null);
  };

  const handleTransitionEnd = () => {
    if (!isCarousel) return;

    if (currentIndex >= 2 * n) {
      setIsTransitionEnabled(false);
      setCurrentIndex(currentIndex - n);
    } else if (currentIndex < n) {
      setIsTransitionEnabled(false);
      setCurrentIndex(currentIndex + n);
    }
  };

  useEffect(() => {
    if (!isTransitionEnabled) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitionEnabled]);

  // If no vendors are saved
  if (vendors.length === 0) {
    return (
      <div className="bg-[#FAF8F5] border border-neutral-200/60 rounded-[1.75rem] sm:rounded-[2rem] p-8 sm:p-12 text-center shadow-xs">
        <h3
          className="text-lg sm:text-xl font-serif font-bold tracking-wide uppercase mb-2 text-center text-[#5D0F12]"
        >
          {language === 'vi' ? 'ĐỐI TÁC ĐÃ LƯU' : 'SAVED VENDORS'}
        </h3>
        <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto my-3" />
        <p className="text-xs sm:text-sm text-neutral-500 font-serif italic mb-4">
          {language === 'vi' ? 'Chưa có đối tác nào được lưu vào danh sách yêu thích của bạn.' : 'No vendors saved to your shortlist yet.'}
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5D0F12] hover:bg-[#4A0C0E] !text-[#FFFBF5] shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.dashboard.exploreVendorsBtn || 'Khám phá Marketplace'} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Active dot calculation for pagination
  const activeDotIndex = isCarousel ? ((currentIndex % n) + n) % n : 0;

  return (
    <div className="bg-[#FAF8F5] border border-neutral-200/60 rounded-[1.75rem] sm:rounded-[2rem] py-6 sm:py-8 px-4 sm:px-8 shadow-xs relative overflow-hidden">
      {/* Title Header */}
      <div className="text-center mb-6">
        <h3
          className="text-lg sm:text-xl font-serif font-bold tracking-wide uppercase text-[#5D0F12]"
        >
          {language === 'vi' ? 'ĐỐI TÁC ĐÃ LƯU' : 'SAVED VENDORS'}
        </h3>
      </div>

      {/* When <= 3 vendors: display directly without carousel or arrows */}
      {!isCarousel ? (
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 max-w-7xl w-full mx-auto">
          {vendors.map((vendor, idx) => (
            <VendorCard
              key={`${vendor.id}-${idx}`}
              vendor={vendor}
              index={idx}
              isActive={true}
              isNeighbor={false}
              isCarousel={false}
            />
          ))}
        </div>
      ) : (
        /* When > 3 vendors: infinite loop carousel with touch swipe */
        <div 
          className="relative w-full overflow-hidden py-4 select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
              :root {
                --dash-card-width: 260px;
                --dash-card-gap: 16px;
              }
              @media (min-width: 640px) {
                :root {
                  --dash-card-width: 310px;
                  --dash-card-gap: 28px;
                }
              }
            `,
            }}
          />

          <div
            className="flex items-center gap-[var(--dash-card-gap)] py-4"
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translateX(calc(50% - (var(--dash-card-width) / 2) - ${currentIndex} * (var(--dash-card-width) + var(--dash-card-gap))))`,
              transition: isTransitionEnabled ? 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }}
          >
            {extendedVendors.map((vendor, idx) => {
              const isActive = idx === currentIndex;
              const isNeighbor = idx === currentIndex - 1 || idx === currentIndex + 1;

              return (
                <VendorCard
                  key={`${vendor.id}-${idx}`}
                  vendor={vendor}
                  index={idx}
                  isActive={isActive}
                  isNeighbor={isNeighbor}
                  isCarousel={true}
                />
              );
            })}
          </div>

          {/* Bottom Controls: Dots Indicator & Left/Right Arrows */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 mt-5 sm:mt-6">
            {/* Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {vendors.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (isTransitionEnabled) {
                      setCurrentIndex(n + i);
                    }
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    activeDotIndex === i
                      ? 'w-6 sm:w-7 h-2 bg-[#5D0F12]'
                      : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <button
                onClick={scrollPrev}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-neutral-200/90 shadow-2xs flex items-center justify-center text-neutral-800 hover:text-[#5D0F12] hover:border-[#5D0F12]/30 active:scale-95 transition-all cursor-pointer font-bold"
                aria-label="Previous vendor"
              >
                ←
              </button>
              <button
                onClick={scrollNext}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-neutral-200/90 shadow-2xs flex items-center justify-center text-neutral-800 hover:text-[#5D0F12] hover:border-[#5D0F12]/30 active:scale-95 transition-all cursor-pointer font-bold"
                aria-label="Next vendor"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse More Link at bottom */}
      <div className="text-center mt-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 hover:text-[#5D0F12] px-5 py-2.5 rounded-full transition-all uppercase tracking-wider shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#5D0F12]" />
          {t.dashboard.exploreVendorsBtn}
        </Link>
      </div>
    </div>
  );
}
