'use client';

import React, { useState, useEffect, use } from 'react';
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
  X
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
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col relative w-full overflow-x-hidden">
      <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />

      {/* Main Container */}
      <div className="flex-1 w-full flex flex-col">
        
        {/* Banner Section */}
        <div className="relative w-full h-[240px] sm:h-[320px] md:h-[400px] bg-slate-900 overflow-hidden">
          <img 
            src={carouselImages[activeImageIndex % carouselImages.length]} 
            alt="Wedding Banner" 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-60 filter blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
          
          {/* Main Visual Couple in Banner */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="relative w-full max-w-4xl h-full flex items-end pb-4 sm:pb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200" 
                alt="Banner Couple" 
                className="absolute inset-0 w-full h-full object-cover rounded-b-[28px] sm:rounded-b-[40px] shadow-2xl border-b-4 border-cream/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = carouselImages[0];
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-b-[28px] sm:rounded-b-[40px]"></div>
            </div>
          </div>
        </div>

        {/* Floating Profile Info & About Row */}
        <div className="max-w-6xl w-full mx-auto px-3.5 sm:px-6 md:px-8 relative -mt-14 sm:-mt-20 md:-mt-24 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left Floating Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-hairline relative text-center">
              {/* Floating circular icon */}
              <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-cream/20 flex items-center justify-center text-gold">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-gold text-gold" />
                </div>
              </div>

              {/* Title Content */}
              <div className="pt-7 sm:pt-10 space-y-4">
                <div className="space-y-1">
                  <h1 className="text-xl md:text-2xl font-semibold text-ink font-display tracking-tight">
                    {vendor.businessName}
                  </h1>
                  <div className="inline-block bg-gold/15 border border-gold/30 text-primary text-[9px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                    {t.marketplace.aiChoice}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-center justify-center gap-0.5 border-y border-hairline py-3 my-2">
                  <div className="flex items-center gap-1 justify-center">
                    <div className="flex text-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(vendor.ratingAverage) ? 'fill-gold text-gold' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-ink">({vendor.ratingAverage})</span>
                  </div>
                  <span className="text-[10px] text-muted-text font-bold uppercase tracking-wide">
                    [{vendor.totalReviews} {t.marketplace.reviewsText}]
                  </span>
                </div>

                {/* Meta details list */}
                <div className="space-y-3.5 text-left text-xs max-w-xs mx-auto">
                  <div className="flex items-center gap-3.5 text-body-text">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{vendor.district}, {vendor.city}, {language === 'vi' ? 'Việt Nam' : 'Vietnam'}</span>
                  </div>
                  <div className="flex items-center gap-3.5 text-body-text">
                    <Camera className="w-4 h-4 text-primary shrink-0" />
                    <span className="capitalize">
                      {language === 'vi' 
                        ? `${category.toLowerCase().includes('ảnh') || category.toLowerCase().includes('photo') ? 'Nhiếp ảnh' : category} & Quay phim`
                        : `${category} & Videography`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5 text-body-text">
                    <Coins className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-mono font-semibold text-primary">
                      {formatCurrency(min)} - {formatCurrency(max)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right About Info */}
            <div className="lg:col-span-7 pt-4 lg:pt-16 space-y-4">
              <div className="inline-block bg-primary text-cream text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full">
                {t.marketplace.aboutVendorTitle}
              </div>
              <p className="text-sm text-body-text leading-relaxed font-serif">
                {vendor.description || (language === 'vi' 
                  ? `Với hơn ${vendor.experienceYears} năm kinh nghiệm ghi lại những khoảnh khắc tình yêu đẹp nhất, ${vendor.businessName} tự hào mang đến phong cách dịch vụ cưới chuyên nghiệp, tinh tế hàng đầu tại Việt Nam.`
                  : `With over ${vendor.experienceYears} years of experience capturing the most beautiful love stories, ${vendor.businessName} proudly delivers premier, sophisticated wedding services.`)}
              </p>
            </div>

          </div>
        </div>

        {/* Horizontal Scalloped Lace Divider */}
        <div className="w-full my-12 relative h-5 select-none opacity-80"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='16' viewBox='0 0 40 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,16 C10,16 10,2 20,2 C30,2 30,16 40,16' stroke='%23FAF5EE' stroke-width='2' fill='none'/%3E%3Cpath d='M0,16 C10,16 10,6 20,6 C30,6 30,16 40,16' stroke='%235D0F12' stroke-width='1.5' fill='none' opacity='0.2'/%3E%3Ccircle cx='20' cy='9' r='1.5' fill='%235D0F12' opacity='0.3'/%3E%3Ccircle cx='10' cy='13' r='1' fill='%235D0F12' opacity='0.2'/%3E%3Ccircle cx='30' cy='13' r='1' fill='%235D0F12' opacity='0.2'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '40px 16px'
          }}
        ></div>

        {/* Two-Column Grid: Portfolio + Pricing on Left, Send Inquiry Sidebar on Right */}
        <div className="max-w-6xl w-full mx-auto px-3.5 sm:px-6 md:px-8 pb-24 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT AREA: Gallery & Pricing (Col span 8) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Portfolio / Gallery */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-hairline pb-3">
                  <Camera className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-display">{t.marketplace.portfolioTitle}</h3>
                </div>

                {/* Arched Framed Carousel */}
                <div className="relative bg-cream/30 border border-hairline rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col items-center">
                  
                  {/* Lace overlay frame style */}
                  <div className="relative w-full aspect-[16/10] max-w-2xl bg-white border-4 sm:border-8 border-double border-gold/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner p-1 sm:p-2">
                    <div className="w-full h-full relative overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={carouselImages[activeImageIndex % carouselImages.length]} 
                        alt="Portfolio Slide" 
                        loading="lazy"
                        decoding="async"
                        className="object-cover w-full h-full transition-all duration-700 ease-in-out hover:scale-105"
                      />
                      
                      {/* Left Navigation Arrow */}
                      <button 
                        onClick={prevImage}
                        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-ink shadow-md flex items-center justify-center transition-colors cursor-pointer"
                        aria-label={language === 'vi' ? 'Ảnh trước' : 'Previous image'}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Right Navigation Arrow */}
                      <button 
                        onClick={nextImage}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-ink shadow-md flex items-center justify-center transition-colors cursor-pointer"
                        aria-label={language === 'vi' ? 'Ảnh tiếp' : 'Next image'}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Carousel Indicators Dots */}
                  <div className="flex gap-2 mt-4">
                    {carouselImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${activeImageIndex === idx ? 'bg-primary scale-125' : 'bg-primary/20 hover:bg-primary/50'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Services & Pricing */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-hairline pb-3">
                  <Coins className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-display">{t.marketplace.servicesPricingTitle}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Premium Package Card */}
                  <div className="bg-primary text-cream rounded-[24px] p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute top-0 right-0 bg-gold text-primary font-bold text-[8px] uppercase tracking-wider py-1 px-3.5 rounded-bl-lg">
                      {t.marketplace.popularTag}
                    </div>
                    <div className="space-y-4">
                      <div className="border-b border-cream/15 pb-4 space-y-1">
                        <span className="text-[10px] font-bold text-gold-light uppercase tracking-wider block">Premium</span>
                        <h4 className="text-3xl font-bold font-mono">
                          {formatCurrency(max)}
                        </h4>
                        <p className="text-xs text-cream/70 font-display">
                          {language === 'vi' ? 'Gói trọn gói Ngày cưới & Phóng sự' : 'Comprehensive Pre-Wedding & Ceremony'}
                        </p>
                      </div>
                      <ul className="space-y-2.5 text-xs text-cream/90">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-gold-light shrink-0" />
                          <span>{language === 'vi' ? '1 Nhiếp ảnh gia chính + 1 Quay phim' : '1 Lead Photographer + 1 Videographer'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-gold-light shrink-0" />
                          <span>{language === 'vi' ? 'Tác nghiệp 10 giờ / Toàn bộ file gốc + Album' : '10-hour coverage / All files + Album'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-gold-light shrink-0" />
                          <span>{language === 'vi' ? 'Chỉnh màu cao cấp & Quay flycam' : 'Premium photo editing & drone footage'}</span>
                        </li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => {
                        setWeddingDate(new Date().toISOString().split('T')[0]);
                        setGuestCount('150');
                        document.getElementById('inquiry-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full mt-6 py-2.5 bg-cream hover:bg-warm-white text-primary text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md transition-colors cursor-pointer"
                    >
                      {t.marketplace.inquireNow}
                    </button>
                  </div>

                  {/* Basic Package Card */}
                  <div className="bg-[#FFFBF5] text-body-text border border-hairline rounded-[24px] p-6 flex flex-col justify-between shadow-md hover:scale-[1.01] transition-transform duration-300">
                    <div className="space-y-4">
                      <div className="border-b border-hairline pb-4 space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Basic</span>
                        <h4 className="text-3xl font-bold font-mono text-ink">
                          {formatCurrency(min)}
                        </h4>
                        <p className="text-xs text-muted-text">
                          {language === 'vi' ? 'Phóng sự cưới ngày chính lễ' : 'Journalistic Wedding Day'}
                        </p>
                      </div>
                      <ul className="space-y-2.5 text-xs text-body-text">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>{language === 'vi' ? '1 Nhiếp ảnh gia chính' : '1 Lead Photographer'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>{language === 'vi' ? 'Tác nghiệp 4 giờ / File số chất lượng cao' : '4-hour coverage / High-res digital files'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>{language === 'vi' ? 'Hậu kỳ cơ bản 150 hình ảnh chọn lọc' : 'Basic retouching of 150 select photos'}</span>
                        </li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => {
                        setWeddingDate(new Date().toISOString().split('T')[0]);
                        setGuestCount('50');
                        document.getElementById('inquiry-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full mt-6 py-2.5 bg-primary hover:bg-primary-active text-cream text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md transition-colors cursor-pointer"
                    >
                      {t.marketplace.inquireNow}
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT AREA: Sticky Send Inquiry Sidebar (Col span 4) */}
            <div id="inquiry-sidebar" className="lg:col-span-4 lg:sticky lg:top-[70px] bg-primary text-cream rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-xl border border-primary/20 space-y-5 sm:space-y-6">
              <div className="border-b border-cream/15 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-light" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold-light font-display">{t.marketplace.sendInquiryTitle}</h3>
                </div>
                <h4 className="text-lg font-semibold tracking-tight text-cream mt-2 font-display">
                  {vendor.businessName}
                </h4>
                <p className="text-[10px] text-cream/60">
                  {t.marketplace.startingFrom}: {formatCurrency(min)} / Premium: {formatCurrency(max)}
                </p>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                
                {/* Date Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cream/70 uppercase tracking-wider block">
                    {t.marketplace.selectWeddingDate}
                  </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      required
                      value={weddingDate}
                      onChange={e => setWeddingDate(e.target.value)}
                      className="w-full bg-cream/10 border border-cream/20 rounded-lg pl-4 pr-10 py-2.5 text-base sm:text-xs text-cream focus:outline-none focus:border-gold font-mono cursor-pointer"
                    />
                    <CalendarIcon className="w-4 h-4 text-cream/50 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Guest Count Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cream/70 uppercase tracking-wider block">
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
                      className="w-full bg-cream/10 border border-cream/20 rounded-lg pl-4 pr-10 py-2.5 text-base sm:text-xs text-cream focus:outline-none focus:border-gold font-mono"
                    />
                    <Users className="w-4 h-4 text-cream/50 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Form Message States */}
                {inquirySuccess && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 text-green-200 text-[11px] rounded-lg animate-fade-in leading-relaxed">
                    {t.marketplace.inquirySuccessMsg}
                  </div>
                )}

                {/* Primary Send Button */}
                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="w-full py-2.5 bg-gold hover:bg-gold-light disabled:bg-gold/40 disabled:cursor-not-allowed text-primary font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="border-t border-cream/10 my-4"></div>

              {/* Action buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleOpenDirectChat}
                  className="w-full py-2 bg-cream/15 border border-cream/20 hover:bg-cream/25 text-cream text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gold-light" />
                  {t.marketplace.directChatBtn}
                </button>
                
                <button
                  type="button"
                  onClick={handleToggleShortlist}
                  disabled={isTogglingShortlist}
                  className="w-full py-2 bg-cream/15 border border-cream/20 hover:bg-cream/25 text-cream text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 text-gold-light ${isSaved ? 'fill-gold-light' : ''}`} />
                  {isSaved ? t.marketplace.shortlistBtnSaved : t.marketplace.shortlistBtnAdd}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Reviews Section: Client Feedback */}
        <div className="w-full py-16 bg-primary text-cream relative">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gold-light uppercase tracking-widest block">{t.marketplace.servicesTag}</span>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight uppercase font-display">
                {t.marketplace.clientFeedbackTitle}
              </h3>
            </div>

            {/* Testimonial Card */}
            <div className="bg-white text-body-text rounded-[28px] p-8 max-w-2xl mx-auto shadow-2xl space-y-6 relative border border-hairline/10 animate-fade-in">
              <p className="text-xs sm:text-sm font-serif italic leading-relaxed text-ink/90">
                {language === 'vi'
                  ? '"Lên kế hoạch cưới ban đầu thật sự choáng ngợp, nhưng Planora đã khiến mọi thứ trở nên nhẹ nhàng hơn rất nhiều. Danh sách việc cần làm được cá nhân hóa giúp chúng tôi luôn chuẩn bị đúng hạn, và các gợi ý nhà cung cấp hoàn toàn đúng gu của hai vợ chồng. Tính năng lên kế hoạch thông minh đã tiết kiệm cho chúng tôi vô số thời gian."'
                  : '"Planning our wedding felt overwhelming at first, but Planora made everything so much easier. The personalized checklist kept us organized, and the vendor recommendations matched our style perfectly. The AI planning features saved us countless hours of research. From budgeting to finding the right photographer and florist, Planora helped us map out every step of the way!"'}
              </p>
              
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex text-gold justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-xs font-bold text-ink uppercase tracking-wider font-display block">
                  Emily &amp; James
                </span>
              </div>
            </div>

            {/* Feedback Page Dots */}
            <div className="flex justify-center gap-1.5 pt-2">
              <div className="w-2 h-2 rounded-full bg-cream"></div>
              <div className="w-2 h-2 rounded-full bg-cream/30"></div>
              <div className="w-2 h-2 rounded-full bg-cream/30"></div>
            </div>
          </div>
        </div>

        {/* Bottom Scalloped Lace Divider */}
        <div className="w-full relative h-5 select-none opacity-80 bg-primary"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='16' viewBox='0 0 40 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,16 C10,16 10,2 20,2 C30,2 30,16 40,16' stroke='%23FFFBF5' stroke-width='2' fill='none'/%3E%3Ccircle cx='20' cy='9' r='1.5' fill='%23FFFBF5' opacity='0.3'/%3E%3Ccircle cx='10' cy='13' r='1' fill='%23FFFBF5' opacity='0.2'/%3E%3Ccircle cx='30' cy='13' r='1' fill='%23FFFBF5' opacity='0.2'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '40px 16px',
            transform: 'rotate(180deg) translateY(-2px)'
          }}
        ></div>

        {/* Bottom CTA Newsletter Section */}
        <div className="w-full py-16 bg-[#FFFBF5] text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] block">Planora</span>
            <h3 className="text-2xl font-serif text-ink tracking-wide">
              {t.landing.ctaTitle.toUpperCase()}
            </h3>
            <p className="text-[11px] text-muted-text max-w-xs mx-auto leading-relaxed">
              {t.landing.howItWorksSubtitle}
            </p>
          </div>

          <div className="max-w-md mx-auto px-4 flex gap-2">
            <input 
              type="email" 
              placeholder={t.landing.emailPlaceholder}
              className="flex-1 bg-white border border-hairline rounded-sm px-4 py-2.5 text-xs text-ink focus:outline-none focus:border-primary shadow-xs"
            />
            <button 
              type="button"
              onClick={() => alert(language === 'vi' ? 'Cảm ơn bạn đã đăng ký nhận thông tin từ Planora!' : 'Thank you for subscribing to Planora updates!')}
              className="px-6 py-2.5 bg-primary hover:bg-primary-active text-cream text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm cursor-pointer"
            >
              {t.landing.signUpBtn}
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-hairline p-3 px-4 shadow-lg flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleToggleShortlist}
          disabled={isTogglingShortlist}
          className={`p-3 rounded-full border transition-all cursor-pointer ${
            isSaved 
              ? 'bg-red-50 border-red-200 text-red-600' 
              : 'bg-canvas border-hairline text-neutral-600 hover:text-red-500'
          }`}
          title={isSaved ? t.marketplace.shortlistBtnSaved : t.marketplace.shortlistBtnAdd}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-600' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => {
            document.getElementById('inquiry-sidebar')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 py-3 bg-[#5D0F12] text-[#FFFBF5] rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#4A0C0E] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
        >
          <Mail className="w-4 h-4 text-gold-light" />
          <span>{t.marketplace.sendInquiryTitle || 'Gửi yêu cầu báo giá'}</span>
        </button>
      </div>

      {/* Live Chat Drawer */}
      {isChatDrawerOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 bg-white rounded-t-3xl sm:rounded-3xl border border-[#EADCC9] shadow-2xl flex flex-col h-[520px] max-h-[85vh] overflow-hidden animate-fade-in">
          {/* Drawer Header */}
          <div className="bg-[#5D0F12] text-[#FFFBF5] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs uppercase">
                {vendor.businessName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider line-clamp-1">{vendor.businessName}</h4>
                <span className="text-[10px] text-cream/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Đang trực tuyến
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChatDrawerOpen(false)}
              className="p-1 rounded-full text-cream/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
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
                  <div key={msg.id} className={lex flex-col }>
                    <span className="text-[9px] text-stone-400 mb-0.5 px-1">{isMe ? 'Bạn' : vendor.businessName}</span>
                    <div className={p-3 rounded-2xl max-w-[85%] leading-relaxed }>
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
