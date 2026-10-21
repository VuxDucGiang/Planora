'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { getVendorDetail, getShortlist, addToShortlist, removeFromShortlist } from '@/services/vendor';
import type { VendorDetailResponse } from '@/types/vendor';
import { 
  Heart, 
  Star, 
  MapPin, 
  Camera, 
  Coins, 
  Calendar as CalendarIcon, 
  Users, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Mail,
  Send,
  X,
  ShieldCheck,
  Share2,
  Clock,
  Sparkles,
  Phone,
  CheckCircle2,
  ChevronRight as ChevronBreadcrumb
} from 'lucide-react';
import { createOrGetInquiry, getCustomerInquiryDetail, sendCustomerMessage } from '@/services/inquiryService';
import type { InquiryMessage } from '@/types/inquiry';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VendorDetail(props: PageProps) {
  const params = use(props.params);
  const vendorId = parseInt(params.id);

  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { plan, daysLeft } = usePlan();
  const { language, t, formatCurrency } = useLanguage();

  // Data States
  const [vendor, setVendor] = useState<VendorDetailResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingShortlist, setIsTogglingShortlist] = useState(false);

  // Form States
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Carousel State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Live Chat Drawer States
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [activeInquiryId, setActiveInquiryId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<InquiryMessage[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);

  // Load Vendor Detail
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        setIsLoading(true);
        const detail = await getVendorDetail(vendorId);
        setVendor(detail);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết nhà cung cấp:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, vendorId]);

  // Sync Shortlist state when plan is available
  useEffect(() => {
    if (!isAuthenticated || !plan?.id) return;
    const targetPlanId = plan.id;

    async function checkShortlist(activePlanId: number) {
      try {
        const savedList = await getShortlist(activePlanId);
        const ids = new Set(savedList.map(v => v.id));
        setIsSaved(ids.has(vendorId));
      } catch (err) {
        console.error('Lỗi kiểm tra danh sách yêu thích:', err);
      }
    }

    checkShortlist(targetPlanId);
  }, [isAuthenticated, plan?.id, vendorId]);

  // Handle Save / Toggle Shortlist
  const handleToggleShortlist = async () => {
    if (!plan || !vendor) return;
    setIsTogglingShortlist(true);
    try {
      if (isSaved) {
        await removeFromShortlist(plan.id, vendor.id);
        setIsSaved(false);
      } else {
        await addToShortlist(plan.id, vendor.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Lỗi thao tác danh sách yêu thích:', err);
    } finally {
      setIsTogglingShortlist(false);
    }
  };

  // Handle Submit Inquiry via Backend API
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingDate || !guestCount || !vendor) return;
    setIsSubmittingInquiry(true);
    try {
      const inq = await createOrGetInquiry({
        vendorId: vendor.id,
        weddingPlanId: plan?.id,
        title: `Tư vấn tiệc cưới ngày ${weddingDate}`,
        message: `Xin chào ${vendor.businessName}! Tôi dự định tổ chức vào ngày ${weddingDate} với khoảng ${guestCount} khách mời. Rất mong nhận được tư vấn chi tiết từ bạn.`,
      });
      setInquirySuccess(true);
      setActiveInquiryId(inq.id);
      setChatMessages(inq.messages || []);
      setIsChatDrawerOpen(true);
      setWeddingDate('');
      setGuestCount('');
      setTimeout(() => setInquirySuccess(false), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể gửi yêu cầu tư vấn');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Handle Direct Live Chat
  const handleOpenDirectChat = async () => {
    if (!vendor) return;
    try {
      const inq = await createOrGetInquiry({
        vendorId: vendor.id,
        weddingPlanId: plan?.id,
        title: `Tư vấn trực tiếp với ${vendor.businessName}`,
        message: `Xin chào ${vendor.businessName}, tôi đang xem trang dịch vụ của bạn trên Planora và muốn được tư vấn thêm.`,
      });
      setActiveInquiryId(inq.id);
      setChatMessages(inq.messages || []);
      setIsChatDrawerOpen(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể kết nối trò chuyện');
    }
  };

  // Poll chat messages when drawer is open
  useEffect(() => {
    if (!isChatDrawerOpen || !activeInquiryId) return;
    const interval = setInterval(async () => {
      try {
        const detail = await getCustomerInquiryDetail(activeInquiryId);
        setChatMessages(detail.messages || []);
      } catch {
        // silent catch
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isChatDrawerOpen, activeInquiryId]);

  // Handle Send Customer Message in Drawer
  const handleSendCustomerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeInquiryId || isSendingChatMessage) return;
    const text = chatInputText.trim();
    setChatInputText('');
    setIsSendingChatMessage(true);
    try {
      const newMsg = await sendCustomerMessage(activeInquiryId, text);
      setChatMessages(prev => [...prev, newMsg]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể gửi tin nhắn');
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  // Copy URL Share
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'vi' ? 'Đã sao chép liên kết trang dịch vụ!' : 'Link copied to clipboard!');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-text">{t.dashboard.loadingSession}</span>
        </div>
      </div>
    );
  }

  if (isLoading || !vendor) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-text font-display">{t.marketplace.loadingDetail}</span>
        </div>
      </div>
    );
  }

  // Get consistent category and mock data
  const fallbackMeta = getVendorMeta(vendor.id);
  const fallbackPrice = getMockPriceRange(vendor.id);
  const category = vendor.primaryCategoryName || fallbackMeta.category;
  const min = (vendor.priceFrom !== undefined && vendor.priceFrom !== null) ? vendor.priceFrom : fallbackPrice.min;
  const max = (vendor.priceTo !== undefined && vendor.priceTo !== null) ? vendor.priceTo : fallbackPrice.max;
  const imageUrls = fallbackMeta.imageUrls;

  // Portfolio carousel images
  const carouselImages = vendor.portfolios && vendor.portfolios.length > 0
    ? vendor.portfolios.map(p => p.imageUrl)
    : imageUrls;

  const nextImage = () => {
    setActiveImageIndex(prev => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-stone-800 font-sans flex flex-col relative w-full overflow-x-hidden">
      <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />

      {/* Main Container */}
      <div className="flex-1 w-full flex flex-col">
        
        {/* Editorial Cinematic Hero Banner */}
        <div className="relative w-full h-[300px] sm:h-[380px] md:h-[440px] bg-stone-900 overflow-hidden">
          <img 
            src={carouselImages[activeImageIndex % carouselImages.length] || '/landing/landing-1.png'} 
            alt={vendor.businessName} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center opacity-80 filter brightness-95 scale-100 transition-all duration-1000 ease-out"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-black/30"></div>

          {/* Breadcrumb & Top Bar */}
          <div className="absolute top-6 left-0 right-0 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between text-xs text-white/90 z-10">
            <nav className="flex items-center gap-2 font-medium tracking-wider text-[11px] uppercase bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              <Link href="/marketplace" className="hover:text-cream transition">Marketplace</Link>
              <ChevronBreadcrumb className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/60">{category}</span>
              <ChevronBreadcrumb className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white font-semibold truncate max-w-[140px] sm:max-w-none">{vendor.businessName}</span>
            </nav>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={handleShare}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/15 text-white transition active:scale-95 cursor-pointer"
                title={language === 'vi' ? 'Chia sẻ liên kết' : 'Share profile'}
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={handleToggleShortlist}
                disabled={isTogglingShortlist}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/15 text-white transition active:scale-95 cursor-pointer"
                title={isSaved ? 'Đã lưu vào danh sách yêu thích' : 'Lưu vào danh sách'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Vendor Identity & Overview Card */}
        <div className="max-w-6xl w-full mx-auto px-3.5 sm:px-6 md:px-8 relative -mt-16 sm:-mt-20 md:-mt-24 z-10">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-[#EADCC9]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Left Identity Column */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center sm:items-start text-center sm:text-left gap-5">
                {/* Vendor Avatar / Monogram */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-[#FAF8F5] flex items-center justify-center">
                    {vendor.avatarUrl ? (
                      <img 
                        src={vendor.avatarUrl} 
                        alt={vendor.businessName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#5D0F12] text-[#FFFBF5] font-serif text-3xl font-bold tracking-widest">
                        {vendor.businessName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {vendor.verified && (
                    <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full shadow-md" title="Đã xác thực bởi Planora">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Name, Badges & Rating */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-block bg-[#FAF8F5] border border-[#EADCC9] text-stone-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {category}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      {t.marketplace.aiChoice}
                    </span>
                  </div>

                  <h1 
                    className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#5D0F12] font-serif leading-tight"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                  >
                    {vendor.businessName}
                  </h1>

                  {/* Rating Stars */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.round(vendor.ratingAverage) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      {vendor.ratingAverage ? Number(vendor.ratingAverage).toFixed(1) : '5.0'}
                    </span>
                    <span className="text-xs text-stone-400">
                      ({vendor.totalReviews || 0} {t.marketplace.reviewsText})
                    </span>
                  </div>

                  {/* Meta Info List */}
                  <div className="pt-3 space-y-2 text-xs text-stone-600">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <MapPin className="w-4 h-4 text-[#5D0F12] shrink-0" />
                      <span>{vendor.district ? `${vendor.district}, ` : ''}{vendor.city}, {language === 'vi' ? 'Việt Nam' : 'Vietnam'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Clock className="w-4 h-4 text-[#5D0F12] shrink-0" />
                      <span>{vendor.experienceYears || 5} {language === 'vi' ? 'năm kinh nghiệm trong ngành cưới' : 'years of wedding experience'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Coins className="w-4 h-4 text-[#5D0F12] shrink-0" />
                      <span className="font-mono font-semibold text-[#5D0F12]">
                        {formatCurrency(min)} – {formatCurrency(max)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right About & Style Column */}
              <div className="lg:col-span-7 space-y-5 lg:pl-6 lg:border-l lg:border-[#EADCC9]/60">
                <div className="space-y-2">
                  <div className="inline-block text-[#5D0F12] text-[11px] font-bold uppercase tracking-[0.2em]">
                    {t.marketplace.aboutVendorTitle}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed font-serif">
                    {vendor.description || (language === 'vi' 
                      ? `Với hơn ${vendor.experienceYears || 5} năm kinh nghiệm kiến tạo những khoảnh khắc tình yêu đẹp nhất, ${vendor.businessName} tự hào mang đến phong cách dịch vụ cưới chuyên nghiệp, tinh tế hàng đầu.`
                      : `With over ${vendor.experienceYears || 5} years of experience capturing the most beautiful love stories, ${vendor.businessName} proudly delivers premier, sophisticated wedding services.`)}
                  </p>
                </div>

                {/* Style Tags */}
                {vendor.styles && vendor.styles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      {language === 'vi' ? 'PHONG CÁCH CHỦ ĐẠO' : 'SIGNATURE STYLES'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {vendor.styles.map((st, idx) => (
                        <span 
                          key={idx}
                          className="bg-[#FAF8F5] text-stone-700 border border-[#EADCC9] text-xs font-medium px-3.5 py-1 rounded-full"
                        >
                          ✦ {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick contact tags */}
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-stone-500">
                  {vendor.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-mono">{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Subtle Editorial Divider (Clean Luxury without Lace) */}
        <div className="w-full max-w-5xl mx-auto my-12 flex items-center justify-center gap-4 px-6 select-none">
          <div className="h-px bg-gradient-to-r from-transparent via-[#EADCC9] to-[#EADCC9] flex-1"></div>
          <div className="flex items-center gap-2 text-[#D4B896] text-xs font-serif tracking-widest">
            <span>✦</span>
            <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-stone-400 font-semibold">PLANORA CURATED</span>
            <span>✦</span>
          </div>
          <div className="h-px bg-gradient-to-l from-transparent via-[#EADCC9] to-[#EADCC9] flex-1"></div>
        </div>

        {/* Main Showcase: Left Side (Gallery, Packages, Reviews) & Right Side (Inquiry Sidebar) */}
        <div className="max-w-6xl w-full mx-auto px-3.5 sm:px-6 md:px-8 pb-24 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT AREA: Gallery & Pricing & Reviews (Col span 8) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Portfolio / Gallery Showcase */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#EADCC9] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-5 h-5 text-[#5D0F12]" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest font-sans">
                      {t.marketplace.portfolioTitle}
                    </h3>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    {activeImageIndex + 1} / {carouselImages.length}
                  </span>
                </div>

                {/* Modern Framed Carousel (Clean Editorial Border) */}
                <div className="bg-white border border-[#EADCC9] rounded-3xl p-3 sm:p-4 shadow-sm overflow-hidden flex flex-col items-center">
                  <div className="relative w-full aspect-[16/10] bg-stone-100 rounded-2xl overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={carouselImages[activeImageIndex % carouselImages.length]} 
                      alt="Portfolio Showcase" 
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-102"
                    />
                    
                    {/* Left Navigation Arrow */}
                    <button 
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-[#5D0F12] text-stone-800 hover:text-white shadow-md flex items-center justify-center transition-all active:scale-90 cursor-pointer backdrop-blur-sm"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Right Navigation Arrow */}
                    <button 
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-[#5D0F12] text-stone-800 hover:text-white shadow-md flex items-center justify-center transition-all active:scale-90 cursor-pointer backdrop-blur-sm"
                      aria-label="Ảnh tiếp"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex items-center gap-2.5 mt-4 overflow-x-auto max-w-full pb-1 px-1">
                    {carouselImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          activeImageIndex === idx ? 'border-[#5D0F12] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services & Pricing Packages */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-[#EADCC9] pb-3">
                  <Coins className="w-5 h-5 text-[#5D0F12]" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest font-sans">
                    {t.marketplace.servicesPricingTitle}
                  </h3>
                </div>

                {/* If vendor has registered packages */}
                {vendor.packages && vendor.packages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendor.packages.map((pkg, idx) => {
                      const isFeatured = idx === 0;
                      return (
                        <div 
                          key={pkg.id || idx}
                          className={`rounded-[24px] p-6 flex flex-col justify-between border transition-all duration-300 relative ${
                            isFeatured 
                              ? 'bg-[#5D0F12] text-[#FFFBF5] border-[#5D0F12] shadow-xl' 
                              : 'bg-white text-stone-800 border-[#EADCC9] shadow-sm hover:shadow-md'
                          }`}
                        >
                          {isFeatured && (
                            <div className="absolute top-0 right-0 bg-[#D4B896] text-[#5D0F12] font-bold text-[9px] uppercase tracking-wider py-1 px-3.5 rounded-bl-xl">
                              {t.marketplace.popularTag}
                            </div>
                          )}

                          <div className="space-y-4">
                            <div className={`border-b pb-4 space-y-1 ${isFeatured ? 'border-white/15' : 'border-[#EADCC9]'}`}>
                              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isFeatured ? 'text-[#D4B896]' : 'text-[#5D0F12]'}`}>
                                Gói #{idx + 1}
                              </span>
                              <h4 className="text-lg font-bold font-serif leading-tight">
                                {pkg.packageName}
                              </h4>
                              <div className={`text-2xl font-bold font-mono pt-1 ${isFeatured ? 'text-white' : 'text-[#5D0F12]'}`}>
                                {formatCurrency(pkg.price)}
                              </div>
                            </div>

                            {pkg.description && (
                              <p className={`text-xs leading-relaxed whitespace-pre-line ${isFeatured ? 'text-white/80' : 'text-stone-600'}`}>
                                {pkg.description}
                              </p>
                            )}
                          </div>

                          <button 
                            type="button"
                            onClick={() => {
                              setWeddingDate(new Date().toISOString().split('T')[0]);
                              setGuestCount('150');
                              document.getElementById('inquiry-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`w-full mt-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm transition-all cursor-pointer ${
                              isFeatured 
                                ? 'bg-[#FFFBF5] text-[#5D0F12] hover:bg-white' 
                                : 'bg-[#5D0F12] text-[#FFFBF5] hover:bg-[#4A0C0E]'
                            }`}
                          >
                            {t.marketplace.inquireNow}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Fallback Mock Packages (Quiet Luxury Ivory & Burgundy) */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Premium Card */}
                    <div className="bg-[#5D0F12] text-[#FFFBF5] rounded-[24px] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-[#D4B896] text-[#5D0F12] font-bold text-[9px] uppercase tracking-wider py-1 px-3.5 rounded-bl-xl">
                        {t.marketplace.popularTag}
                      </div>
                      <div className="space-y-4">
                        <div className="border-b border-white/15 pb-4 space-y-1">
                          <span className="text-[10px] font-bold text-[#D4B896] uppercase tracking-wider block">PREMIUM PACKAGE</span>
                          <h4 className="text-3xl font-bold font-mono">
                            {formatCurrency(max)}
                          </h4>
                          <p className="text-xs text-white/70">
                            {language === 'vi' ? 'Gói trọn gói Ngày cưới & Phóng sự' : 'Comprehensive Pre-Wedding & Ceremony'}
                          </p>
                        </div>
                        <ul className="space-y-2.5 text-xs text-white/90">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#D4B896] shrink-0" />
                            <span>{language === 'vi' ? '1 Nhiếp ảnh gia chính + 1 Quay phim' : '1 Lead Photographer + 1 Videographer'}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#D4B896] shrink-0" />
                            <span>{language === 'vi' ? 'Tác nghiệp 10 giờ / Toàn bộ file gốc + Album' : '10-hour coverage / All files + Album'}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#D4B896] shrink-0" />
                            <span>{language === 'vi' ? 'Chỉnh màu cao cấp & Quay flycam' : 'Premium photo editing & drone footage'}</span>
                          </li>
                        </ul>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setWeddingDate(new Date().toISOString().split('T')[0]);
                          setGuestCount('150');
                          document.getElementById('inquiry-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full mt-6 py-2.5 bg-[#FFFBF5] hover:bg-white text-[#5D0F12] text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-colors cursor-pointer"
                      >
                        {t.marketplace.inquireNow}
                      </button>
                    </div>

                    {/* Basic Card */}
                    <div className="bg-white text-stone-800 border border-[#EADCC9] rounded-[24px] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-4">
                        <div className="border-b border-[#EADCC9] pb-4 space-y-1">
                          <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-wider block">BASIC PACKAGE</span>
                          <h4 className="text-3xl font-bold font-mono text-stone-900">
                            {formatCurrency(min)}
                          </h4>
                          <p className="text-xs text-stone-500">
                            {language === 'vi' ? 'Phóng sự cưới ngày chính lễ' : 'Journalistic Wedding Day'}
                          </p>
                        </div>
                        <ul className="space-y-2.5 text-xs text-stone-700">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#5D0F12] shrink-0" />
                            <span>{language === 'vi' ? '1 Nhiếp ảnh gia chính' : '1 Lead Photographer'}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#5D0F12] shrink-0" />
                            <span>{language === 'vi' ? 'Tác nghiệp 4 giờ / File số chất lượng cao' : '4-hour coverage / High-res digital files'}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#5D0F12] shrink-0" />
                            <span>{language === 'vi' ? 'Hậu kỳ cơ bản 150 hình ảnh chọn lọc' : 'Basic retouching of 150 select photos'}</span>
                          </li>
                        </ul>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setWeddingDate(new Date().toISOString().split('T')[0]);
                          setGuestCount('50');
                          document.getElementById('inquiry-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full mt-6 py-2.5 bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-colors cursor-pointer"
                      >
                        {t.marketplace.inquireNow}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews Section: Real Reviews & Replies */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#EADCC9] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest font-sans">
                      {t.marketplace.clientFeedbackTitle}
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    {vendor.totalReviews || 0} {t.marketplace.reviewsText}
                  </span>
                </div>

                {/* Reviews List */}
                {vendor.reviews && vendor.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {vendor.reviews.map((rev) => (
                      <div 
                        key={rev.id} 
                        className="bg-white rounded-2xl border border-[#EADCC9] p-5 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EADCC9] flex items-center justify-center font-bold text-[#5D0F12] text-xs">
                              {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-stone-900 font-sans">{rev.customerName}</h5>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed font-serif italic">
                          &ldquo;{rev.comment}&rdquo;
                        </p>

                        {/* Vendor Reply */}
                        {rev.vendorReply && (
                          <div className="bg-[#FAF8F5] border-l-2 border-[#5D0F12] rounded-r-xl p-3.5 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-[#5D0F12] text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#5D0F12]" />
                              <span>{language === 'vi' ? `Phản hồi từ ${vendor.businessName}` : `Reply from ${vendor.businessName}`}</span>
                            </div>
                            <p className="text-stone-600 text-xs leading-relaxed font-sans">
                              {rev.vendorReply}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Editorial Default Testimonial Card */
                  <div className="bg-white rounded-3xl border border-[#EADCC9] p-6 sm:p-8 shadow-sm space-y-5 text-center">
                    <p className="text-xs sm:text-sm font-serif italic leading-relaxed text-stone-700 max-w-xl mx-auto">
                      {language === 'vi'
                        ? '“Lên kế hoạch cưới ban đầu thật sự choáng ngợp, nhưng phong cách làm việc chuyên nghiệp, chu đáo của đối tác trên Planora đã giúp ngày trọng đại của chúng mình diễn ra trọn vẹn và tràn đầy cảm xúc.”'
                        : '“Planning our wedding felt overwhelming at first, but the professional and thoughtful service from Planora partners ensured our special day was seamless and emotional.”'}
                    </p>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-widest font-sans pt-1">
                        Emily &amp; James
                      </span>
                      <span className="text-[10px] text-stone-400">Tiệc cưới tại Planora, 2026</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT AREA: Sticky Send Inquiry Sidebar (Col span 4) */}
            <div 
              id="inquiry-sidebar" 
              className="lg:col-span-4 lg:sticky lg:top-24 bg-white rounded-[2rem] p-6 sm:p-7 shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-[#EADCC9] space-y-5 text-stone-800"
            >
              <div className="border-b border-[#EADCC9] pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#5D0F12]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5D0F12] font-sans">
                    {t.marketplace.sendInquiryTitle}
                  </h3>
                </div>
                <h4 
                  className="text-lg font-bold tracking-tight text-stone-900 mt-2 font-serif"
                  style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                >
                  {vendor.businessName}
                </h4>
                <p className="text-xs text-stone-500">
                  {t.marketplace.startingFrom}: <span className="font-mono font-semibold text-[#5D0F12]">{formatCurrency(min)}</span>
                </p>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                
                {/* Date Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                    {t.marketplace.selectWeddingDate}
                  </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      required
                      value={weddingDate}
                      onChange={e => setWeddingDate(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#EADCC9] rounded-xl pl-4 pr-10 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#5D0F12] focus:bg-white font-mono cursor-pointer transition"
                    />
                    <CalendarIcon className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Guest Count Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                    {t.marketplace.estimatedGuests}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      inputMode="numeric"
                      placeholder={language === 'vi' ? 'VD: 150 khách' : 'e.g. 150'}
                      required
                      value={guestCount}
                      onChange={e => setGuestCount(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#EADCC9] rounded-xl pl-4 pr-10 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#5D0F12] focus:bg-white font-mono transition"
                    />
                    <Users className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Form Message States */}
                {inquirySuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl leading-relaxed flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.marketplace.inquirySuccessMsg}</span>
                  </div>
                )}

                {/* Primary Send Button */}
                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="w-full py-3 bg-[#5D0F12] hover:bg-[#4A0C0E] disabled:bg-stone-300 disabled:cursor-not-allowed text-[#FFFBF5] font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {isSubmittingInquiry ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {t.marketplace.submitInquiryBtn}
                    </>
                  )}
                </button>

              </form>

              {/* Divider line */}
              <div className="border-t border-[#EADCC9] my-4"></div>

              {/* Action buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleOpenDirectChat}
                  className="w-full py-2.5 bg-[#FAF8F5] border border-[#EADCC9] hover:bg-[#F4EFE8] text-[#5D0F12] text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#5D0F12]" />
                  {t.marketplace.directChatBtn}
                </button>
                
                <button
                  type="button"
                  onClick={handleToggleShortlist}
                  disabled={isTogglingShortlist}
                  className="w-full py-2.5 bg-[#FAF8F5] border border-[#EADCC9] hover:bg-[#F4EFE8] text-stone-700 text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'text-rose-600 fill-rose-600' : 'text-stone-400'}`} />
                  {isSaved ? t.marketplace.shortlistBtnSaved : t.marketplace.shortlistBtnAdd}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Bottom Editorial Banner (Subtle Warm Linen without Lace) */}
        <div className="w-full py-16 bg-[#FAF8F5] border-t border-[#EADCC9] text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#5D0F12] uppercase tracking-[0.25em] block">
              PLANORA WEDDING EDITORIAL
            </span>
            <h3 
              className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-wide font-normal"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
            >
              {t.landing.ctaTitle.toUpperCase()}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed font-sans">
              {t.landing.howItWorksSubtitle}
            </p>
          </div>

          <div className="max-w-md mx-auto px-4 flex gap-2">
            <input 
              type="email" 
              placeholder={t.landing.emailPlaceholder}
              className="flex-1 bg-white border border-[#EADCC9] rounded-full px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#5D0F12] shadow-xs"
            />
            <button 
              type="button"
              onClick={() => alert(language === 'vi' ? 'Cảm ơn bạn đã đăng ký nhận thông tin từ Planora!' : 'Thank you for subscribing to Planora updates!')}
              className="px-6 py-2.5 bg-[#5D0F12] hover:bg-[#4A0C0E] text-[#FFFBF5] text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm cursor-pointer"
            >
              Đăng ký
            </button>
          </div>
        </div>

      </div>

      {/* Floating Live Chat Drawer */}
      {isChatDrawerOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-[#EADCC9] flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-3.5 bg-[#5D0F12] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {vendor.businessName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight truncate max-w-[200px]">
                  {vendor.businessName}
                </h4>
                <span className="text-[10px] text-white/70 block">
                  Trò chuyện trực tiếp &bull; Trực tuyến
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChatDrawerOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]/60 text-xs">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-stone-400 font-serif italic text-xs">
                Gửi lời chào để bắt đầu cuộc trò chuyện với {vendor.businessName}...
              </div>
            ) : (
              chatMessages.map(msg => {
                const isMe = msg.senderRole === 'USER';
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-stone-400 mb-0.5 px-1">{isMe ? 'Bạn' : vendor.businessName}</span>
                    <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      isMe ? 'bg-[#5D0F12] text-white rounded-br-none shadow-sm' : 'bg-white border border-[#EADCC9] text-stone-800 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendCustomerMessage} className="p-3 border-t border-[#EADCC9] bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatInputText}
              onChange={e => setChatInputText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-[#EADCC9] bg-[#FAF8F5]/50 text-xs focus:outline-none focus:ring-1 focus:ring-[#5D0F12]"
            />
            <button
              type="submit"
              disabled={!chatInputText.trim() || isSendingChatMessage}
              className="p-2 rounded-xl bg-[#5D0F12] text-[#FFFBF5] hover:bg-[#4A0C0E] transition disabled:opacity-40 cursor-pointer"
            >
              {isSendingChatMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}

// Helper: Consistent image and category resolver
function getVendorMeta(vendorId: number) {
  const categoriesList = ['Photography', 'Decoration', 'Makeup Artist', 'Wedding Venue'];
  
  const imagesByCategory: Record<string, string[]> = {
    'Photography': [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600',
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600'
    ],
    'Decoration': [
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600',
      'https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=600'
    ],
    'Makeup Artist': [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600'
    ],
    'Wedding Venue': [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600',
      'https://images.unsplash.com/photo-1507504038482-7621c37c2f0f?q=80&w=600',
      'https://images.unsplash.com/photo-1561542320-9a18cd340469?q=80&w=600'
    ]
  };

  const catIndex = vendorId % categoriesList.length;
  const category = categoriesList[catIndex];
  const imageUrls = imagesByCategory[category];

  return { category, imageUrls };
}

function getMockPriceRange(vendorId: number) {
  const basePrice = (vendorId % 10) * 5000000 + 15000000;
  const maxPrice = basePrice + (vendorId % 3) * 10000000 + 5000000;
  return { min: basePrice, max: maxPrice };
}
