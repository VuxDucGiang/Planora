'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan } from '@/services/weddingPlan';
import { getVendorDetail, getShortlist, addToShortlist, removeFromShortlist } from '@/services/vendor';
import type { VendorDetailResponse } from '@/types/vendor';
import type { ActivePlanResponse } from '@/types/weddingPlan';
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
  Send
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VendorDetail(props: PageProps) {
  const params = use(props.params);
  const vendorId = parseInt(params.id);

  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Data States
  const [vendor, setVendor] = useState<VendorDetailResponse | null>(null);
  const [plan, setPlan] = useState<ActivePlanResponse | null>(null);
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

  // Load Vendor Detail and Active Plan
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        setIsLoading(true);
        const [detail, activePlan] = await Promise.all([
          getVendorDetail(vendorId),
          getActivePlan()
        ]);

        setVendor(detail);
        setPlan(activePlan);

        if (activePlan) {
          const savedList = await getShortlist(activePlan.id);
          const ids = new Set(savedList.map(v => v.id));
          setIsSaved(ids.has(vendorId));
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết nhà cung cấp:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, vendorId]);

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

  // Handle Submit Inquiry
  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingDate || !guestCount) return;
    setIsSubmittingInquiry(true);
    setTimeout(() => {
      setIsSubmittingInquiry(false);
      setInquirySuccess(true);
      setWeddingDate('');
      setGuestCount('');
      setTimeout(() => setInquirySuccess(false), 5000);
    }, 1500);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-text">Đang tải dữ liệu phiên làm việc...</span>
        </div>
      </div>
    );
  }

  if (isLoading || !vendor) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-text font-display">Đang tải hồ sơ nhà cung cấp...</span>
        </div>
      </div>
    );
  }

  // Get consistent category and mock data
  const { category, imageUrls } = getVendorMeta(vendor.id);
  const { min, max } = getMockPriceRange(vendor.id);
  const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + ' ₫';

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
      <DashboardHeader logout={logout} plan={plan} />

      {/* Main Container */}
      <div className="flex-1 w-full flex flex-col">
        
        {/* Banner Section */}
        <div className="relative w-full h-[300px] md:h-[400px] bg-slate-900 overflow-hidden">
          <img 
            src={carouselImages[activeImageIndex % carouselImages.length]} 
            alt="Wedding Banner" 
            className="w-full h-full object-cover opacity-60 filter blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
          
          {/* Main Visual Couple in Banner */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="relative w-full max-w-4xl h-full flex items-end pb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200" 
                alt="Banner Couple" 
                className="absolute inset-0 w-full h-full object-cover rounded-b-[40px] shadow-2xl border-b-4 border-cream/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = carouselImages[0];
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-b-[40px]"></div>
            </div>
          </div>
        </div>

        {/* Floating Profile Info & About Row */}
        <div className="max-w-6xl w-full mx-auto px-4 md:px-8 relative -mt-24 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Floating Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-xl border border-hairline relative text-center">
              {/* Floating circular icon */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-primary border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-cream/20 flex items-center justify-center text-gold">
                  <Star className="w-6 h-6 fill-gold text-gold" />
                </div>
              </div>

              {/* Title Content */}
              <div className="pt-10 space-y-4">
                <div className="space-y-1">
                  <h1 className="text-xl md:text-2xl font-semibold text-ink font-display tracking-tight">
                    {vendor.businessName}
                  </h1>
                  <div className="inline-block bg-gold/15 border border-gold/30 text-primary text-[9px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                    AI Choice
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
                    [{vendor.totalReviews} Reviews]
                  </span>
                </div>

                {/* Meta details list */}
                <div className="space-y-3.5 text-left text-xs max-w-xs mx-auto">
                  <div className="flex items-center gap-3.5 text-body-text">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{vendor.district}, {vendor.city}, Vietnam</span>
                  </div>
                  <div className="flex items-center gap-3.5 text-body-text">
                    <Camera className="w-4 h-4 text-primary shrink-0" />
                    <span className="capitalize">{category} &amp; Videography</span>
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
                About the Vendor
              </div>
              <p className="text-sm text-body-text leading-relaxed font-serif">
                {vendor.description || `Với hơn ${vendor.experienceYears} năm kinh nghiệm ghi lại những khoảnh khắc tình yêu đẹp nhất, ${vendor.businessName} tự hào mang đến phong cách dịch vụ cưới chuyên nghiệp, tinh tế hàng đầu tại Việt Nam.`}
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
        <div className="max-w-6xl w-full mx-auto px-4 md:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT AREA: Gallery & Pricing (Col span 8) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Portfolio / Gallery */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-hairline pb-3">
                  <Camera className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-display">Portfolio / Gallery</h3>
                </div>

                {/* Arched Framed Carousel */}
                <div className="relative bg-cream/30 border border-hairline rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col items-center">
                  
                  {/* Lace overlay frame style */}
                  <div className="relative w-full aspect-[16/10] max-w-2xl bg-white border-8 border-double border-gold/30 rounded-2xl overflow-hidden shadow-inner p-2">
                    <div className="w-full h-full relative overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={carouselImages[activeImageIndex % carouselImages.length]} 
                        alt="Portfolio Slide" 
                        className="object-cover w-full h-full transition-all duration-700 ease-in-out hover:scale-105"
                      />
                      
                      {/* Left Navigation Arrow */}
                      <button 
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-ink shadow-md flex items-center justify-center transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Right Navigation Arrow */}
                      <button 
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-ink shadow-md flex items-center justify-center transition-colors"
                        aria-label="Next image"
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
                        className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === idx ? 'bg-primary scale-125' : 'bg-primary/20 hover:bg-primary/50'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Services & Pricing */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-hairline pb-3">
                  <Coins className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-display">Services &amp; Pricing</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Premium Package Card */}
                  <div className="bg-primary text-cream rounded-[24px] p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute top-0 right-0 bg-gold text-primary font-bold text-[8px] uppercase tracking-wider py-1 px-3.5 rounded-bl-lg">
                      Popular
                    </div>
                    <div className="space-y-4">
                      <div className="border-b border-cream/15 pb-4 space-y-1">
                        <span className="text-[10px] font-bold text-gold-light uppercase tracking-wider block">Premium</span>
                        <h4 className="text-3xl font-bold font-mono">
                          {formatCurrency(max)}
                        </h4>
                        <p className="text-xs text-cream/70 font-display">
                          Comprehensive Pre-Wedding &amp; Ceremony
                        </p>
                      </div>
                      <ul className="space-y-2.5 text-xs text-cream/90">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-gold-light shrink-0" />
                          <span>1 Lead Photographer + 1 Videographer</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-gold-light shrink-0" />
                          <span>10-hour coverage / All files + Album</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-gold-light shrink-0" />
                          <span>Premium photo editing &amp; drone footage</span>
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
                      Inquire Now
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
                          Journalistic Wedding Day
                        </p>
                      </div>
                      <ul className="space-y-2.5 text-xs text-body-text">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>1 Lead Photographer</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>4-hour coverage / High-res digital files</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>Basic retouching of 150 select photos</span>
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
                      Inquire Now
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT AREA: Sticky Send Inquiry Sidebar (Col span 4) */}
            <div id="inquiry-sidebar" className="lg:col-span-4 lg:sticky lg:top-[70px] bg-primary text-cream rounded-[32px] p-6 md:p-8 shadow-xl border border-primary/20 space-y-6">
              <div className="border-b border-cream/15 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-light" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold-light font-display">Send Inquiry</h3>
                </div>
                <h4 className="text-lg font-semibold tracking-tight text-cream mt-2 font-display">
                  {vendor.businessName}
                </h4>
                <p className="text-[10px] text-cream/60">
                  Starting from: {formatCurrency(min)} / Premium: {formatCurrency(max)}
                </p>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                
                {/* Date Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cream/70 uppercase tracking-wider block">
                    Select Wedding Date
                  </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      required
                      value={weddingDate}
                      onChange={e => setWeddingDate(e.target.value)}
                      className="w-full bg-cream/10 border border-cream/20 rounded-lg pl-4 pr-10 py-2.5 text-xs text-cream focus:outline-none focus:border-gold font-mono"
                    />
                    <CalendarIcon className="w-4 h-4 text-cream/50 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Guest Count Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cream/70 uppercase tracking-wider block">
                    Estimated Guests
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="e.g. 150"
                      required
                      value={guestCount}
                      onChange={e => setGuestCount(e.target.value)}
                      className="w-full bg-cream/10 border border-cream/20 rounded-lg pl-4 pr-10 py-2.5 text-xs text-cream focus:outline-none focus:border-gold font-mono"
                    />
                    <Users className="w-4 h-4 text-cream/50 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Form Message States */}
                {inquirySuccess && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 text-green-200 text-[11px] rounded-lg animate-fade-in leading-relaxed">
                    ✓ Gửi yêu cầu tư vấn thành công! Nhà cung cấp sẽ liên hệ với bạn qua email/sđt sớm nhất.
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
                      Gửi yêu cầu tư vấn
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
                  onClick={() => alert('Chức năng Chat trực tiếp đang được kết nối với trung tâm tin nhắn...')}
                  className="w-full py-2 bg-cream/15 border border-cream/20 hover:bg-cream/25 text-cream text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gold-light" />
                  Chat trực tiếp
                </button>
                
                <button
                  type="button"
                  onClick={handleToggleShortlist}
                  disabled={isTogglingShortlist}
                  className="w-full py-2 bg-cream/15 border border-cream/20 hover:bg-cream/25 text-cream text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 text-gold-light ${isSaved ? 'fill-gold-light' : ''}`} />
                  {isSaved ? 'Shortlisted' : 'Add to Shortlist'}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Reviews Section: Client Feedback */}
        <div className="w-full py-16 bg-primary text-cream relative">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gold-light uppercase tracking-widest block">Services</span>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight uppercase font-display">
                Our Client Feedback
              </h3>
            </div>

            {/* Testimonial Card */}
            <div className="bg-white text-body-text rounded-[28px] p-8 max-w-2xl mx-auto shadow-2xl space-y-6 relative border border-hairline/10 animate-fade-in">
              <p className="text-xs sm:text-sm font-serif italic leading-relaxed text-ink/90">
                "Planning our wedding felt overwhelming at first, but Planora made everything so much easier. The personalized checklist kept us organized, and the vendor recommendations matched our style perfectly. The AI planning features saved us countless hours of research. From budgeting to finding the right photographer and florist, Planora helped us map out every step of the way!"
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
              PLAN YOUR PERFECT DAY
            </h3>
            <p className="text-[11px] text-muted-text max-w-xs mx-auto leading-relaxed">
              Crafting unforgettable wedding experiences.
            </p>
          </div>

          <div className="max-w-md mx-auto px-4 flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 bg-white border border-hairline rounded-sm px-4 py-2.5 text-xs text-ink focus:outline-none focus:border-primary shadow-xs"
            />
            <button 
              type="button"
              onClick={() => alert('Cảm ơn bạn đã đăng ký nhận thông tin từ Planora!')}
              className="px-6 py-2.5 bg-primary hover:bg-primary-active text-cream text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>

      </div>

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
