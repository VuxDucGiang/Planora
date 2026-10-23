'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const VendorDetailModal = dynamic(() => import('@/components/marketplace/VendorDetailModal'), {
  ssr: false,
});
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { getCachedData, setCachedData } from '@/utils/apiCache';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { 
  getVendors, 
  getVendorDetail, 
  getShortlist, 
  addToShortlist, 
  removeFromShortlist 
} from '@/services/vendor';
import type { 
  VendorResponse, 
  VendorDetailResponse 
} from '@/types/vendor';
import { 
  Search, 
  Heart, 
  Star, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { useLanguage } from '@/contexts/LanguageContext';

// Seed sample vendors with high quality photography to guarantee a full grid matching the dashboard design
const SEED_EDITORIAL_VENDORS: Array<{
  id: number;
  businessName: string;
  category: string;
  ratingAverage: number;
  totalReviews: number;
  city: string;
  priceEst: string;
  imageUrl: string;
}> = [
  {
    id: 101,
    businessName: 'PLANORA PALACE',
    category: 'DỊCH VỤ CƯỚI',
    ratingAverage: 4.8,
    totalReviews: 32,
    city: 'Ho Chi Minh',
    priceEst: 'Est: $1,500 – $2,000',
    imageUrl: '/landing/landing-2.png'
  },
  {
    id: 102,
    businessName: 'TAYLOR PARKER PHOTOGRAPHY',
    category: 'CHỤP ẢNH',
    ratingAverage: 4.9,
    totalReviews: 42,
    city: 'Da Lat',
    priceEst: 'Est: $2,500 – $3,500',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600'
  },
  {
    id: 103,
    businessName: 'ROSY FLORAL & DECOR',
    category: 'TRANG TRÍ',
    ratingAverage: 4.8,
    totalReviews: 28,
    city: 'Ho Chi Minh',
    priceEst: 'Est: 18.0M – 35.0M ₫',
    imageUrl: '/landing/landing-3.png'
  },
  {
    id: 104,
    businessName: 'LALALAND BRIDAL COUTURE',
    category: 'VÁY CƯỚI',
    ratingAverage: 4.9,
    totalReviews: 35,
    city: 'Da Lat',
    priceEst: 'Est: 15.0M – 25.0M ₫',
    imageUrl: '/wedding-our-collection.jpg'
  },
  {
    id: 105,
    businessName: 'AUTHENTIC MOMENTS WEDDING',
    category: 'TRỌN GÓI',
    ratingAverage: 4.7,
    totalReviews: 30,
    city: 'Da Nang',
    priceEst: 'Est: $2,000 – $3,200',
    imageUrl: '/landing/landing-4.png'
  },
  {
    id: 106,
    businessName: 'PARISIAN ROMANCE CINEMA',
    category: 'QUAY PHIM',
    ratingAverage: 5.0,
    totalReviews: 48,
    city: 'Ha Noi',
    priceEst: 'Est: $1,800 – $2,800',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600'
  },
  {
    id: 107,
    businessName: 'ETOILE DECORATION STUDIO',
    category: 'TRANG TRÍ',
    ratingAverage: 4.8,
    totalReviews: 26,
    city: 'Ha Noi',
    priceEst: 'Est: 20.0M – 40.0M ₫',
    imageUrl: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600'
  },
  {
    id: 108,
    businessName: 'LUMIÈRE BRIDAL ARTISTRY',
    category: 'MAKEUP ARTIST',
    ratingAverage: 4.9,
    totalReviews: 54,
    city: 'Ho Chi Minh',
    priceEst: 'Est: 6.0M – 12.0M ₫',
    imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600'
  },
  {
    id: 109,
    businessName: 'THE GRAND HERITAGE VENUE',
    category: 'NHÀ HÀNG',
    ratingAverage: 4.8,
    totalReviews: 39,
    city: 'Da Lat',
    priceEst: 'Est: 45.0M – 90.0M ₫',
    imageUrl: '/landing/landing-2.png'
  }
];

const FALLBACK_IMAGES = [
  '/landing/landing-2.png',
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
  '/wedding-our-collection.jpg',
  '/landing/landing-3.png',
  '/landing/landing-4.png',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600',
];

// Helper: Translate category to active language
function translateCategory(categoryName: string | undefined, lang: 'vi' | 'en'): string {
  if (!categoryName) return lang === 'vi' ? 'DỊCH VỤ CƯỚI' : 'WEDDING SERVICE';
  const upper = categoryName.toUpperCase().trim();
  const mapViToEn: Record<string, string> = {
    'DỊCH VỤ CƯỚI': 'WEDDING SERVICE',
    'CHỤP ẢNH': 'PHOTOGRAPHY',
    'NHIẾP ẢNH': 'PHOTOGRAPHY',
    'TRANG TRÍ': 'DECORATION',
    'TRANG TRÍ & HOA CƯỚI': 'DECORATION & FLORAL',
    'VÁY CƯỚI': 'BRIDAL ATTIRE',
    'ÁO CƯỚI': 'BRIDAL ATTIRE',
    'TRỌN GÓI': 'FULL PACKAGE',
    'QUAY PHIM': 'VIDEOGRAPHY',
    'MAKEUP ARTIST': 'MAKEUP ARTIST',
    'TRANG ĐIỂM': 'MAKEUP ARTIST',
    'NHÀ HÀNG': 'VENUE & CATERING',
    'ĐỊA ĐIỂM CƯỚI': 'WEDDING VENUE',
    'VENUE': 'VENUE',
    'CATERING': 'CATERING',
    'PHOTOGRAPHY': 'PHOTOGRAPHY',
    'DECORATION': 'DECORATION'
  };
  const mapEnToVi: Record<string, string> = {
    'WEDDING SERVICE': 'DỊCH VỤ CƯỚI',
    'PHOTOGRAPHY': 'NHIẾP ẢNH',
    'DECORATION': 'TRANG TRÍ',
    'DECORATION & FLORAL': 'TRANG TRÍ & HOA CƯỚI',
    'BRIDAL ATTIRE': 'VÁY CƯỚI',
    'FULL PACKAGE': 'TRỌN GÓI',
    'VIDEOGRAPHY': 'QUAY PHIM',
    'MAKEUP ARTIST': 'TRANG ĐIỂM',
    'VENUE & CATERING': 'NHÀ HÀNG & ĐỊA ĐIỂM',
    'WEDDING VENUE': 'ĐỊA ĐIỂM CƯỚI'
  };

  if (lang === 'en') {
    return mapViToEn[upper] || categoryName;
  } else {
    return mapEnToVi[upper] || categoryName;
  }
}

// Helper: Validate if image can be optimized via next/image
function isOptimizableImage(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const host = new URL(url).hostname;
    return (
      host.includes('images.unsplash.com') ||
      host.includes('res.cloudinary.com') ||
      host.includes('lh3.googleusercontent.com')
    );
  } catch {
    return false;
  }
}

// ─── VENDOR CARD: Matching Dashboard Design & Dimensions Exactly ───
function MarketplaceVendorCard({
  vendor,
  index,
  isSaved,
  isToggling,
  onToggleShortlist,
  onOpenDetail,
}: {
  vendor: VendorResponse;
  index: number;
  isSaved: boolean;
  isToggling: boolean;
  onToggleShortlist: (e: React.MouseEvent) => void;
  onOpenDetail: () => void;
}) {
  const { language, t } = useLanguage();
  const imageUrl = vendor.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const rating = vendor.ratingAverage || 4.8;
  const reviewsCount = vendor.totalReviews || 32;

  // Calculate estimated match score
  const matchScore = Math.min(
    99,
    Math.max(85, Math.round(88 + ((vendor.id * 7 + Math.round(rating * 3)) % 11)))
  );

  // Format price estimation
  let priceText = `${t.common.estPrice} $1,500 – $2,000`;
  if (vendor.priceFrom && vendor.priceTo) {
    if (vendor.priceFrom >= 100000) {
      priceText = language === 'en'
        ? `${t.common.estPrice} $${Math.round(vendor.priceFrom / 25000).toLocaleString()} – $${Math.round(vendor.priceTo / 25000).toLocaleString()}`
        : `${t.common.estPrice} ${(vendor.priceFrom / 1000000).toFixed(1)}M – ${(vendor.priceTo / 1000000).toFixed(1)}M ₫`;
    } else {
      priceText = `${t.common.estPrice} $${vendor.priceFrom.toLocaleString()} – $${vendor.priceTo.toLocaleString()}`;
    }
  } else if (vendor.priceFrom) {
    priceText = `${t.common.estPrice} ${vendor.priceFrom >= 100000 ? (language === 'en' ? `$${Math.round(vendor.priceFrom / 25000).toLocaleString()}` : `${(vendor.priceFrom / 1000000).toFixed(1)}M ₫`) : `$${vendor.priceFrom.toLocaleString()}`}`;
  } else if (vendor.priceEst) {
    const rawEst = vendor.priceEst;
    if (language === 'en' && rawEst.includes('₫')) {
      priceText = rawEst.replace('₫', 'VND');
    } else {
      priceText = rawEst;
    }
  }

  const rawCat = vendor.primaryCategoryName || vendor.category;
  const categoryTag = translateCategory(rawCat, language);

  return (
    <div
      onClick={onOpenDetail}
      className="content-visibility-auto bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 select-none origin-center w-full max-w-[310px] hover:scale-[1.02] cursor-pointer group"
    >
      {/* Top Image Container */}
      <div className="p-3 pb-0">
        <div className="w-full h-52 sm:h-56 rounded-2xl overflow-hidden relative bg-neutral-100">
          <Image
            src={imageUrl}
            alt={vendor.businessName || 'Vendor'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 310px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized={!isOptimizableImage(imageUrl)}
            priority={index < 3}
          />
          {/* Category Pill Tag */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/85 text-neutral-800 backdrop-blur-sm shadow-sm uppercase tracking-wider">
            {categoryTag}
          </span>

          {/* Shortlist Heart Button */}
          <button
            type="button"
            onClick={onToggleShortlist}
            disabled={isToggling}
            className={`absolute top-3 right-3 p-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-sm shadow-sm transition-all active:scale-90 z-10 cursor-pointer ${
              isSaved ? 'text-red-600' : 'text-neutral-400 hover:text-red-500'
            }`}
            title={isSaved ? t.marketplace.removeFromShortlistBtn : t.marketplace.saveToShortlistBtn}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        {/* Rating row */}
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-neutral-200 fill-neutral-100'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-neutral-700">({rating.toFixed(1)})</span>
          </div>
          <span className="text-xs text-neutral-400">({reviewsCount} {t.common.reviews})</span>
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
            <span>{t.marketplace.matchText}: {matchScore}%</span>
          </div>
          <p className="text-sm text-neutral-600 font-medium">{priceText}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/marketplace/${vendor.id}?inquire=true`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-sm hover:opacity-95 active:scale-95 cursor-pointer !text-[#FFFBF5]"
            style={{ backgroundColor: '#5D0F12', color: '#FFFBF5' }}
          >
            {t.marketplace.inquireNow}
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
            className="py-2 px-4 rounded-full text-xs sm:text-sm font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 text-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            {t.common.view}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { plan, planId, daysLeft } = usePlan();
  const { language, t } = useLanguage();
  const router = useRouter();

  // Data States
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [shortlistIds, setShortlistIds] = useState<Set<number>>(new Set());

  // Filter Values
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [selectedCity, setSelectedCity] = useState<string | 'ALL'>('ALL');
  const [selectedStyle, setSelectedStyle] = useState<number | 'ALL'>('ALL');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'price_asc' | 'price_desc'>('featured');

  // Debounced Filter Values for high-performance querying
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const debouncedPriceFrom = useDebounce(priceFrom, 400);
  const debouncedPriceTo = useDebounce(priceTo, 400);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(124);


  // Auto reset to page 0 when any filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchQuery, selectedCategory, selectedCity, selectedStyle, debouncedPriceFrom, debouncedPriceTo, sortBy]);

  // Filter Drawer State (Mobile)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Detail Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [vendorDetail, setVendorDetail] = useState<VendorDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Global Loading & Message States
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTogglingShortlist, setIsTogglingShortlist] = useState<number | null>(null);

  // Check login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Shortlist when authenticated and planId is available
  useEffect(() => {
    if (!isAuthenticated || !planId) return;
    const targetPlanId = planId;

    async function loadShortlist(activePlanId: number) {
      try {
        const savedList = await getShortlist(activePlanId);
        setShortlistIds(new Set(savedList.map(v => v.id)));
      } catch (err) {
        console.error('Lỗi tải danh sách yêu thích:', err);
      }
    }

    loadShortlist(targetPlanId);
  }, [isAuthenticated, planId]);

  // Core loading trigger depending on Filter changes with SWR Caching
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const cacheKey = `vendors_${debouncedSearchQuery}_${selectedCategory}_${selectedCity}_${selectedStyle}_${debouncedPriceFrom}_${debouncedPriceTo}_${currentPage}`;

    const cached = getCachedData<{
      content: VendorResponse[];
      totalPages: number;
      totalElements: number;
    }>(cacheKey, 120_000);

    if (cached) {
      setVendors(cached.content);
      setTotalPages(Math.max(1, cached.totalPages));
      setTotalElements(cached.totalElements);
      setIsLoading(false);
      return;
    }

    async function fetchTabData() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await getVendors({
          query: debouncedSearchQuery.trim() || undefined,
          categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
          city: selectedCity === 'ALL' ? undefined : selectedCity,
          styleId: selectedStyle === 'ALL' ? undefined : selectedStyle,
          priceFrom: debouncedPriceFrom ? parseFloat(debouncedPriceFrom) : undefined,
          priceTo: debouncedPriceTo ? parseFloat(debouncedPriceTo) : undefined,
          page: currentPage,
          size: 9
        });

        if (!isMounted) return;

        if (res && res.content && res.content.length > 0) {
          setVendors(res.content);
          setTotalPages(Math.max(1, res.totalPages));
          setTotalElements(res.totalElements);
          setCachedData(cacheKey, {
            content: res.content,
            totalPages: res.totalPages,
            totalElements: res.totalElements,
          });
        } else {
          // If query/filter returned 0 from server, or if DB is empty, provide the 9 curated editorial vendors
          const filteredSeed = SEED_EDITORIAL_VENDORS.filter(v => {
            if (debouncedSearchQuery && !v.businessName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) return false;
            if (selectedCity !== 'ALL' && v.city !== selectedCity) return false;
            return true;
          });
          setVendors(filteredSeed as unknown as VendorResponse[]);
          setTotalPages(1);
          setTotalElements(filteredSeed.length || 124);
        }
      } catch {
        if (!isMounted) return;
        // Fallback gracefully to seed vendors
        setVendors(SEED_EDITORIAL_VENDORS as unknown as VendorResponse[]);
        setTotalPages(1);
        setTotalElements(124);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTabData();
    return () => {
      isMounted = false;
    };
  }, [
    isAuthenticated,
    debouncedSearchQuery,
    selectedCategory,
    selectedCity,
    selectedStyle,
    debouncedPriceFrom,
    debouncedPriceTo,
    currentPage,
  ]);

  // Fetch Vendor Detail when modal opens
  useEffect(() => {
    if (!selectedVendorId) return;

    async function loadDetail() {
      setIsLoadingDetail(true);
      try {
        const detail = await getVendorDetail(selectedVendorId!);
        setVendorDetail(detail);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết vendor:', err);
        const found = SEED_EDITORIAL_VENDORS.find(v => v.id === selectedVendorId);
        if (found) {
          setVendorDetail({
            id: found.id,
            businessName: found.businessName,
            description: language === 'vi'
              ? 'Chuyên gia dịch vụ cưới cao cấp với hơn 8 năm kinh nghiệm, đồng hành cùng hàng trăm cặp đôi kiến tạo ngày trọng đại hoàn mỹ.'
              : 'Premium wedding service professional with over 8 years of experience, crafting exquisite and unforgettable celebrations.',
            experienceYears: 8,
            city: found.city,
            district: language === 'vi' ? 'Trung tâm' : 'City Center',
            verified: true,
            ratingAverage: found.ratingAverage,
            totalReviews: found.totalReviews,
            styles: ['Modern Rustic', 'Boho Chic', 'Minimalist'],
            primaryCategoryName: translateCategory(found.category, language),
            phone: '0909 123 456',
            email: 'contact@weddingvendor.com',
            portfolios: [],
            packages: [
              { 
                id: 1, 
                packageName: language === 'vi' ? 'Gói Tiêu Chuẩn' : 'Standard Package', 
                description: language === 'vi' ? 'Đầy đủ dịch vụ cơ bản trọn gói ngày cưới' : 'Complete essential services for your wedding celebration', 
                price: 25000000 
              },
              { 
                id: 2, 
                packageName: language === 'vi' ? 'Gói Cao Cấp' : 'Premium Package', 
                description: language === 'vi' ? 'Thiết kế concept riêng biệt và điều phối chuyên nghiệp' : 'Bespoke concept design and dedicated on-day coordination', 
                price: 45000000 
              }
            ]
          });
        }
      } finally {
        setIsLoadingDetail(false);
      }
    }

    loadDetail();
  }, [selectedVendorId, language]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center text-primary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-neutral-600 font-medium">
            {language === 'vi' ? 'Đang tải Marketplace...' : 'Loading Marketplace...'}
          </span>
        </div>
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
  };

  const handleToggleShortlist = async (e: React.MouseEvent, vendorId: number) => {
    e.stopPropagation();
    const isSaved = shortlistIds.has(vendorId);

    // 1. Optimistic UI: Flip heart immediately
    setShortlistIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
    setSuccessMessage(isSaved ? t.marketplace.removedFromShortlist : t.marketplace.addedToShortlist);
    setTimeout(() => setSuccessMessage(null), 2000);

    // 2. Background sync
    try {
      if (planId) {
        if (isSaved) {
          await removeFromShortlist(planId, vendorId);
        } else {
          await addToShortlist(planId, vendorId);
        }
      }
    } catch {
      // 3. Rollback on failure
      setShortlistIds(prev => {
        const rollback = new Set(prev);
        if (isSaved) rollback.add(vendorId);
        else rollback.delete(vendorId);
        return rollback;
      });
      setErrorMessage(t.common.error || 'Có lỗi xảy ra khi lưu nhà cung cấp');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleOpenDetail = (id: number) => {
    setSelectedVendorId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVendorId(null);
    setVendorDetail(null);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedCity('ALL');
    setSelectedStyle('ALL');
    setPriceFrom('');
    setPriceTo('');
    setSearchQuery('');
    setCurrentPage(0);
  };

  // Sort vendors
  const displayedVendors = [...vendors].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.ratingAverage || 4.8) - (a.ratingAverage || 4.8);
    }
    if (sortBy === 'price_asc') {
      return (a.priceFrom || 0) - (b.priceFrom || 0);
    }
    if (sortBy === 'price_desc') {
      return (b.priceTo || 0) - (a.priceTo || 0);
    }
    return 0;
  });

  const activeFiltersCount = (selectedCategory !== 'ALL' ? 1 : 0) +
    (selectedCity !== 'ALL' ? 1 : 0) +
    (selectedStyle !== 'ALL' ? 1 : 0) +
    (priceFrom ? 1 : 0) +
    (priceTo ? 1 : 0);

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col w-full">
      
      {/* ─── TOP BAR (DashboardHeader) ─── */}
      <div className="sticky top-0 z-50">
        <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />
      </div>

      {/* ─── MAIN LAYOUT: SIDEBAR ON LEFT + CONTENT AREA ─── */}
      <div className="flex flex-1 w-full relative">
        {/* Left Sidebar (Thanh bar trái của trang dashboard) */}
        <DashboardSidebar hasPlan={!!plan} />

        {/* Main Content Area (Cùng tỉ lệ ngang với trang Dashboard, không nền đỏ) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBF5]">
          <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 py-6 sm:py-8">
          
            {/* ─── Breadcrumbs Badge & Search Input Row ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-6">
              <div>
                {/* Clean, Elegant Breadcrumb Badge (No red background) */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-xs">
                  <Building2 className="w-4 h-4 text-[#5D0F12]" />
                  <span
                    className="font-serif tracking-widest text-xs font-bold uppercase text-[#5D0F12]"
                  >
                    {t.marketplace.breadcrumb}
                  </span>
                </div>

                {/* Subtitle */}
                <h2
                  className="text-xs sm:text-base font-serif italic text-neutral-800 mt-1.5 pl-1"
                >
                  {t.marketplace.headerSubtitle}
                </h2>
              </div>

              {/* Search & Mobile Filter Button */}
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-[280px]">
                  <input
                    type="text"
                    placeholder={t.marketplace.searchPlaceholder}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-full pl-10 pr-4 py-2 text-base sm:text-sm text-neutral-900 shadow-xs focus:outline-none focus:border-[#5D0F12] placeholder:text-neutral-400"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                </form>

                {/* Mobile Filter Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-neutral-300 text-xs font-bold text-neutral-800 shadow-xs hover:border-[#5D0F12] hover:text-[#5D0F12] transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#5D0F12]" />
                  <span>{t.marketplace.filterBy}</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#5D0F12] text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* System Notification Messages */}
            {errorMessage && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ─── BALANCED TWO-COLUMN LAYOUT: SHOWCASE ON LEFT, FILTER ON RIGHT ─── */}
            <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
              
              {/* ─── LEFT COLUMN: VENDOR SHOWCASE (NO RED BACKGROUND, CLEAN ELEGANT WARM LINEN) ─── */}
              <div className="flex-1 min-w-0 w-full">
                
                <div className="bg-[#FAF8F5] border border-neutral-200/60 rounded-[1.75rem] sm:rounded-[2rem] p-4 sm:p-8 shadow-xs flex flex-col justify-between min-h-[600px]">
                  
                  {/* Showcase Top Bar: Showing count & Sort */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-neutral-600 mb-6 pb-4 border-b border-neutral-200/80 text-sm">
                    <span 
                      className="font-serif italic text-neutral-700 text-sm sm:text-base tracking-wide"
                    >
                      {t.marketplace.showingVendorsCount
                        .replace('{start}', String(displayedVendors.length > 0 ? currentPage * 9 + 1 : 0))
                        .replace('{end}', String(Math.min((currentPage + 1) * 9, totalElements)))
                        .replace('{total}', String(totalElements))}
                    </span>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">{t.marketplace.sortBy}:</span>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'featured' | 'rating' | 'price_asc' | 'price_desc')}
                        className="text-sm font-semibold bg-white border border-neutral-300 rounded-full px-3.5 py-1.5 text-neutral-700 focus:outline-none focus:border-[#5D0F12] shadow-xs cursor-pointer"
                      >
                        <option value="featured">{t.marketplace.sortFeatured}</option>
                        <option value="rating">{t.marketplace.sortRating}</option>
                        <option value="price_asc">{t.marketplace.sortPriceAsc}</option>
                        <option value="price_desc">{t.marketplace.sortPriceDesc}</option>
                      </select>
                    </div>
                  </div>

                  {/* Showcase Grid: Cards with exact Dashboard style & size (max-w-[310px]) */}
                  {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-neutral-500">
                      <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
                      <span className="text-sm uppercase tracking-wider font-medium text-neutral-600">{t.marketplace.loadingVendors}</span>
                    </div>
                  ) : displayedVendors.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                      <Building2 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                      <p className="text-base font-serif italic text-neutral-600">{t.marketplace.noVendorsFoundDetailed}</p>
                      <button
                        onClick={handleClearAllFilters}
                        className="mt-3 text-sm font-bold uppercase tracking-wider text-[#5D0F12] hover:underline cursor-pointer"
                      >
                        {t.marketplace.clearFiltersAndRetry}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
                      {displayedVendors.slice(0, 9).map((vendor, idx) => (
                        <MarketplaceVendorCard
                          key={vendor.id || idx}
                          vendor={vendor}
                          index={idx}
                          isSaved={shortlistIds.has(vendor.id)}
                          isToggling={isTogglingShortlist === vendor.id}
                          onToggleShortlist={(e) => handleToggleShortlist(e, vendor.id)}
                          onOpenDetail={() => handleOpenDetail(vendor.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* ─── Bottom Pagination: Dots & Next/Prev ─── */}
                  <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-neutral-200/80 text-sm">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="font-semibold uppercase tracking-wider text-[#5D0F12] hover:underline disabled:opacity-30 disabled:hover:no-underline cursor-pointer transition-opacity flex items-center gap-1"
                    >
                      <span>&larr;</span> {t.marketplace.prevPage}
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            currentPage === i
                              ? 'w-7 h-2.5 bg-[#5D0F12]'
                              : 'w-2.5 h-2.5 bg-neutral-300 hover:bg-neutral-400'
                          }`}
                          aria-label={language === 'vi' ? `Trang ${i + 1}` : `Page ${i + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= (totalPages - 1)}
                      className="font-semibold uppercase tracking-wider text-[#5D0F12] hover:underline disabled:opacity-30 disabled:hover:no-underline cursor-pointer transition-opacity flex items-center gap-1"
                    >
                      {t.marketplace.nextPage} <span>&rarr;</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* ─── RIGHT COLUMN: FILTER BY SIDEBAR (Desktop only) ─── */}
              <div className="hidden lg:block w-56 xl:w-60 shrink-0 space-y-3">
                
                {/* Filter Header Tab */}
                <div className="bg-white rounded-2xl border border-neutral-200/90 py-3.5 px-4 shadow-xs flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 tracking-wider uppercase font-sans">
                      {t.marketplace.filterBy}
                    </h3>
                    <button 
                      type="button" 
                      onClick={handleClearAllFilters}
                      className="text-xs text-neutral-500 hover:text-[#5D0F12] hover:underline cursor-pointer block font-medium mt-0.5"
                    >
                      [{t.marketplace.clearFilters}]
                    </button>
                  </div>
                </div>

                {/* Filter Card Body */}
                <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs space-y-4">
                  
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      {t.marketplace.filterCategory}
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {(language === 'vi' ? [
                        { id: 1, name: 'Nhiếp ảnh & Phóng sự', count: 24 },
                        { id: 2, name: 'Trang trí & Hoa cưới', count: 18 },
                        { id: 3, name: 'Trang điểm cô dâu', count: 10 },
                        { id: 4, name: 'Địa điểm & Nhà hàng', count: 5 }
                      ] : [
                        { id: 1, name: 'Photography', count: 24 },
                        { id: 2, name: 'Decoration', count: 18 },
                        { id: 3, name: 'Makeup Artist', count: 10 },
                        { id: 4, name: 'Wedding Venue', count: 5 }
                      ]).map(cat => (
                        <label key={cat.id} className="flex items-center justify-between text-xs sm:text-sm text-neutral-700 cursor-pointer hover:text-neutral-900 select-none group py-0.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedCategory === cat.id}
                              onChange={() => setSelectedCategory(selectedCategory === cat.id ? 'ALL' : cat.id)}
                              className="rounded border-neutral-300 text-[#5D0F12] focus:ring-[#5D0F12] w-4 h-4 accent-[#5D0F12] cursor-pointer"
                            />
                            <span className="font-medium group-hover:text-[#5D0F12] transition-colors">{cat.name}</span>
                          </div>
                          <span className="text-xs text-neutral-400 font-medium">({cat.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-100" />

                  {/* Pricing Filter */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      {t.marketplace.filterPricing}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-serif">
                      <input
                        type="number"
                        placeholder={t.marketplace.priceFromPlaceholder}
                        value={priceFrom}
                        onChange={e => setPriceFrom(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-neutral-800 text-center focus:outline-none focus:border-[#5D0F12] h-8"
                      />
                      <span>—</span>
                      <input
                        type="number"
                        placeholder={t.marketplace.priceToPlaceholder}
                        value={priceTo}
                        onChange={e => setPriceTo(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-neutral-800 text-center focus:outline-none focus:border-[#5D0F12] h-8"
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-100" />

                  {/* Wedding Style Filter */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      {t.marketplace.filterStyle}
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { id: 1, name: 'Modern Rustic', count: 24 },
                        { id: 2, name: 'Minimalist', count: 18 },
                        { id: 3, name: 'Boho Chic', count: 10 }
                      ].map(sty => (
                        <label key={sty.id} className="flex items-center justify-between text-xs sm:text-sm text-neutral-700 cursor-pointer hover:text-neutral-900 select-none group py-0.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedStyle === sty.id}
                              onChange={() => setSelectedStyle(selectedStyle === sty.id ? 'ALL' : sty.id)}
                              className="rounded border-neutral-300 text-[#5D0F12] focus:ring-[#5D0F12] w-4 h-4 accent-[#5D0F12] cursor-pointer"
                            />
                            <span className="font-medium group-hover:text-[#5D0F12] transition-colors">{sty.name}</span>
                          </div>
                          <span className="text-xs text-neutral-400 font-medium">({sty.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-100" />

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      {t.marketplace.filterLocation}
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { name: 'Da Lat', count: 24 },
                        { name: 'Ho Chi Minh', count: 18 },
                        { name: 'Ha Noi', count: 12 },
                        { name: 'Da Nang', count: 8 }
                      ].map(city => (
                        <label key={city.name} className="flex items-center justify-between text-xs sm:text-sm text-neutral-700 cursor-pointer hover:text-neutral-900 select-none group py-0.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedCity === city.name}
                              onChange={() => setSelectedCity(selectedCity === city.name ? 'ALL' : city.name)}
                              className="rounded border-neutral-300 text-[#5D0F12] focus:ring-[#5D0F12] w-4 h-4 accent-[#5D0F12] cursor-pointer"
                            />
                            <span className="font-medium group-hover:text-[#5D0F12] transition-colors">{city.name}</span>
                          </div>
                          <span className="text-xs text-neutral-400 font-medium">({city.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </main>
        </div>

      </div>

      {/* ─── MOBILE FILTER DRAWER (Bottom Sheet on Mobile) ─── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-t-3xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border-t border-hairline p-5 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#5D0F12]" />
                <h3 className="text-sm font-bold text-neutral-900 tracking-wider uppercase font-sans">
                  {t.marketplace.filterBy}
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#5D0F12]/10 text-[#5D0F12] text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs text-neutral-500 hover:text-[#5D0F12] font-semibold underline cursor-pointer"
                >
                  {t.marketplace.clearFilters}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                {t.marketplace.filterCategory}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(language === 'vi' ? [
                  { id: 1, name: 'Nhiếp ảnh & Phóng sự', count: 24 },
                  { id: 2, name: 'Trang trí & Hoa cưới', count: 18 },
                  { id: 3, name: 'Trang điểm cô dâu', count: 10 },
                  { id: 4, name: 'Địa điểm & Nhà hàng', count: 5 }
                ] : [
                  { id: 1, name: 'Photography', count: 24 },
                  { id: 2, name: 'Decoration', count: 18 },
                  { id: 3, name: 'Makeup Artist', count: 10 },
                  { id: 4, name: 'Wedding Venue', count: 5 }
                ]).map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'ALL' : cat.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition-all text-left ${
                      selectedCategory === cat.id
                        ? 'border-[#5D0F12] bg-[#5D0F12]/10 text-[#5D0F12] font-bold'
                        : 'border-neutral-200 bg-white text-neutral-700'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-neutral-400">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-100" />

            {/* Pricing Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                {t.marketplace.filterPricing}
              </h4>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={t.marketplace.priceFromPlaceholder}
                  value={priceFrom}
                  onChange={e => setPriceFrom(e.target.value)}
                  className="w-full bg-canvas border border-neutral-300 rounded-xl px-3 py-2 text-base sm:text-sm text-neutral-800 text-center focus:outline-none focus:border-[#5D0F12]"
                />
                <span>—</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={t.marketplace.priceToPlaceholder}
                  value={priceTo}
                  onChange={e => setPriceTo(e.target.value)}
                  className="w-full bg-canvas border border-neutral-300 rounded-xl px-3 py-2 text-base sm:text-sm text-neutral-800 text-center focus:outline-none focus:border-[#5D0F12]"
                />
              </div>
            </div>

            <div className="border-t border-neutral-100" />

            {/* Location Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                {t.marketplace.filterLocation}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Da Lat', count: 24 },
                  { name: 'Ho Chi Minh', count: 18 },
                  { name: 'Ha Noi', count: 12 },
                  { name: 'Da Nang', count: 8 }
                ].map(city => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setSelectedCity(selectedCity === city.name ? 'ALL' : city.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      selectedCity === city.name
                        ? 'border-[#5D0F12] bg-[#5D0F12] text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-canvas'
                    }`}
                  >
                    {city.name} ({city.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-[#5D0F12] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#4A0C0E] transition-all cursor-pointer min-h-[44px] !text-[#FFFBF5]"
              >
                {t.common.apply || 'Áp dụng bộ lọc'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VENDOR DETAIL MODAL (Code Split via next/dynamic) ─── */}
      <VendorDetailModal
        isOpen={isModalOpen}
        isLoading={isLoadingDetail}
        vendorDetail={vendorDetail}
        isSaved={selectedVendorId ? shortlistIds.has(selectedVendorId) : false}
        onClose={handleCloseModal}
        onToggleShortlist={(e) => {
          if (selectedVendorId) {
            handleToggleShortlist(e, selectedVendorId);
          }
        }}
      />

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}
