'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getWeddingStyles, 
  getServiceCategories, 
  createOnboardingPlan,
  getActivePlan
} from '@/services/weddingPlan';
import type { WeddingStyle, ServiceCategory, ActivePlanResponse } from '@/types/weddingPlan';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertCircle, 
  Loader2,
  Heart,
  Info,
  ListTodo
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';

export default function Onboarding() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Onboarding Step State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Data from Backend
  const [availableStyles, setAvailableStyles] = useState<WeddingStyle[]>([]);
  const [availableCategories, setAvailableCategories] = useState<ServiceCategory[]>([]);

  // Form States
  const [title, setTitle] = useState('Kế hoạch đám cưới của tôi');
  const [weddingDate, setWeddingDate] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(50);
    const [budget, setBudget] = useState<number>(200000000); // 200,000,000 VND default
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<ActivePlanResponse | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load styles and categories on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        setIsLoadingData(true);
        const [styles, categories] = await Promise.all([
          getWeddingStyles(),
          getServiceCategories()
        ]);
        setAvailableStyles(styles);
        setAvailableCategories(categories);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu onboarding:', err);
        setErrorMessage('Không thể tải cấu hình khảo sát từ hệ thống. Vui lòng tải lại trang!');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  // Handle generation loading text progression
  useEffect(() => {
    if (!isGenerating) return;

    const timer = setInterval(() => {
      setGenerationPhase(prev => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isGenerating]);

  // Auto-generate title for the wedding plan based on date and location
  useEffect(() => {
    if (weddingDate || location) {
      const datePart = weddingDate ? new Date(weddingDate).toLocaleDateString('vi-VN') : '';
      const locPart = location.trim() ? ` tại ${location.trim()}` : '';
      setTitle(`Kế hoạch đám cưới${datePart ? ' ngày ' + datePart : ''}${locPart}`);
    } else {
      setTitle('Kế hoạch đám cưới của tôi');
    }
  }, [weddingDate, location]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-slate-400">Đang tải dữ liệu phiên làm việc...</span>
        </div>
      </div>
    );
  }

  // Next and Previous Step Handlers
  const handleNextStep = () => {
    // Basic validation
    if (currentStep === 1) {
      if (!title.trim()) {
        setErrorMessage('Vui lòng điền tên kế hoạch đám cưới!');
        return;
      }
      if (!weddingDate) {
        setErrorMessage('Vui lòng chọn ngày tổ chức cưới!');
        return;
      }
      if (!location.trim()) {
        setErrorMessage('Vui lòng điền địa điểm cưới!');
        return;
      }
      if (guestCount <= 0) {
        setErrorMessage('Số lượng khách mời phải lớn hơn 0!');
        return;
      }
    }

    if (currentStep === 2) {
      if (budget <= 0) {
        setErrorMessage('Tổng ngân sách dự kiến phải lớn hơn 0!');
        return;
      }
    }

    if (currentStep === 3) {
      if (selectedStyles.length === 0) {
        setErrorMessage('Vui lòng chọn ít nhất một phong cách đám cưới bạn mong muốn!');
        return;
      }
    }

    setErrorMessage(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep(prev => prev - 1);
  };

  // Select/Deselect Styles
  const toggleStyle = (id: number) => {
    setSelectedStyles(prev => 
      prev.includes(id) ? prev.filter(styleId => styleId !== id) : [...prev, id]
    );
  };

  // Select/Deselect Categories
  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

    // Submit and Auto Generate Plan
  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một dịch vụ bạn muốn ưu tiên đầu tư!');
      return;
    }
    setIsGenerating(true);
    setGenerationPhase(0);
    setErrorMessage(null);

    try {
      await createOnboardingPlan({
        title,
        weddingDate,
        location,
        guestCount,
        budget,
        styleIds: selectedStyles,
        priorityCategoryIds: selectedCategories,
      });

      // Fetch active plan details for Step 5 summary
      const activePlan = await getActivePlan();
      setGeneratedPlan(activePlan);

      // Show final phase briefly before displaying Step 5
      setGenerationPhase(4);
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep(5);
      }, 1000);

    } catch (err) {
      console.error('Lỗi tạo kế hoạch:', err);
      setIsGenerating(false);
      setErrorMessage(err instanceof Error ? err.message : 'Tạo kế hoạch thất bại. Vui lòng thử lại!');
    }
  };

  // Loading texts for plan generation
  const generationTexts = [
    'Đang phân tích thông tin khảo sát và đề xuất phong cách...',
    'Đang tự động phân bổ ngân sách tối ưu theo hạng mục ưu tiên của bạn...',
    'Đang tự động thiết lập danh sách công việc cần chuẩn bị theo mốc thời gian...',
    'Đang xây dựng dòng thời gian chi tiết cho ngày cưới của bạn...',
    'Kế hoạch của bạn đã sẵn sàng! Đang tải bảng điều khiển...'
  ];

  return (
    <div 
      className="min-h-screen text-body-text font-sans flex flex-col relative w-full overflow-hidden"
      style={{ 
        backgroundImage: `url('/onboarding/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <DashboardHeader logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 flex flex-col justify-center relative">
        {isLoadingData ? (
          <div className="flex flex-col items-center py-20 gap-3 bg-white/80 backdrop-blur-sm rounded-xl border border-hairline p-8 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-text font-display">Đang chuẩn bị khảo sát thông minh...</span>
          </div>
        ) : isGenerating ? (
          /* Premium Loading Screen for Plan Generation (Screen 10) */
          <div className="py-16 px-8 rounded-lg bg-surface-soft border border-hairline flex flex-col items-center text-center space-y-8 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-strong">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${(generationPhase + 1) * 20}%` }}
              />
            </div>

            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-primary shadow-md border border-hairline relative">
              <Sparkles className="w-10 h-10 animate-pulse text-primary" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>

            <div className="space-y-3 max-w-lg">
              <h2 className="text-xl font-medium tracking-tight text-ink font-display">
                Đang tạo kế hoạch cưới thông minh của bạn
              </h2>
              <p className="text-xs text-muted-text max-w-sm mx-auto uppercase tracking-widest font-semibold">
                Độc quyền bởi Planora AI
              </p>
              <div className="h-12 flex items-center justify-center">
                <p className="text-sm text-body-text font-medium transition-opacity duration-300">
                  {generationTexts[generationPhase]}
                </p>
              </div>
            </div>

            {/* Micro-animations list */}
            <div className="text-left max-w-xs mx-auto space-y-2 pt-4 border-t border-hairline w-full">
              <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${generationPhase >= 0 ? 'text-primary font-medium' : 'text-light-grey'}`}>
                <Check className={`w-3.5 h-3.5 ${generationPhase >= 0 ? 'opacity-100' : 'opacity-0'}`} />
                <span>Phân tích phong cách đám cưới</span>
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${generationPhase >= 1 ? 'text-primary font-medium' : 'text-light-grey'}`}>
                <Check className={`w-3.5 h-3.5 ${generationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`} />
                <span>Thiết lập phân bổ ngân sách</span>
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${generationPhase >= 2 ? 'text-primary font-medium' : 'text-light-grey'}`}>
                <Check className={`w-3.5 h-3.5 ${generationPhase >= 2 ? 'opacity-100' : 'opacity-0'}`} />
                <span>Sinh tự động checklist chuẩn bị</span>
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${generationPhase >= 3 ? 'text-primary font-medium' : 'text-light-grey'}`}>
                <Check className={`w-3.5 h-3.5 ${generationPhase >= 3 ? 'opacity-100' : 'opacity-0'}`} />
                <span>Tạo dòng thời gian ngày cưới</span>
              </div>
            </div>
          </div>
        ) : (
          /* Active Multi-step Survey form */
          <div className="space-y-8">
            
                        {/* Step Indicators */}
            {currentStep <= 4 && (
            <div className="max-w-2xl mx-auto mb-6 mt-2 animate-fade-in bg-transparent px-4 sm:px-8">
              <div className="relative">
                {/* Horizontal line running behind all dots */}
                <div className="absolute left-[12%] right-[12%] top-[5px] h-[1px] bg-white/40" />
                
                <div className="flex justify-between items-center relative">
                  {[
                    { number: 1, label: 'Wedding Details' },
                    { number: 2, label: 'Budget' },
                    { number: 3, label: 'Wedding Style' },
                    { number: 4, label: 'Priority Services' }
                  ].map((step) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;
                    
                    return (
                      <div key={step.number} className="flex flex-col items-center z-10 w-[22%]">
                        <div className="h-[10px] flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                            disabled={step.number >= currentStep}
                            className={`w-2.5 h-2.5 rounded-full border border-white transition-all ${
                              isCompleted || isActive
                                ? 'bg-white'
                                : 'bg-transparent'
                            } ${step.number < currentStep ? 'cursor-pointer hover:scale-125' : 'cursor-not-allowed'}`}
                          />
                        </div>
                        <span 
                          className="text-[10px] sm:text-xs text-center whitespace-nowrap text-white italic mt-2.5 transition-all duration-300"
                          style={{ 
                            fontFamily: 'EB Garamond, Georgia, serif',
                            opacity: isActive ? 1 : 0.65,
                            transform: isActive ? 'scale(1.03)' : 'scale(1)'
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                                </div>
              </div>
            </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start gap-2.5 text-xs animate-fade-in shadow-sm">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-500 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

                        {/* Form Steps Rendering - centered card */}
            <div className={`bg-[#FFFBF5] rounded-2xl border border-primary/10 p-6 sm:p-8 shadow-md w-full mx-auto z-10 transition-all duration-500 ${currentStep === 5 ? 'max-w-[680px]' : 'max-w-[500px]'}`}>
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-8 py-2">
                  {/* Header */}
                  <div className="text-center space-y-1 mb-8">
                    <h2 
                      className="text-[28px] md:text-[32px] italic"
                      style={{ 
                        fontFamily: "'IM Fell French Canon', serif", 
                        fontWeight: 400, 
                        lineHeight: '40px',
                        color: '#2C0600'
                      }}
                    >
                      Let's start with the essentials
                    </h2>
                    <p 
                      className="text-sm sm:text-base font-normal"
                      style={{ 
                        fontFamily: "'IM Fell French Canon', serif", 
                        fontWeight: 400, 
                        lineHeight: '40px',
                        color: '#2C0600'
                      }}
                    >
                      Tell us a bit about your upcoming wedding day.
                    </p>
                  </div>

                                    <div className="space-y-6">
                                        {/* Wedding Date Capsule */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="date" 
                        className="block text-xs font-bold text-primary tracking-wider pl-1"
                      >
                        Wedding Date *
                      </label>
                      <div className="w-full h-14 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-6 transition-all relative">
                        <input
                          type="date"
                          id="date"
                          className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-ink font-sans cursor-pointer pr-8 focus:ring-0 focus:outline-none custom-date-input"
                          value={weddingDate}
                          onChange={e => {
                            setWeddingDate(e.target.value);
                            setErrorMessage(null);
                          }}
                          style={{ colorScheme: 'light' }}
                        />
                        <Calendar className="w-5 h-5 text-primary absolute right-6 pointer-events-none" />
                      </div>
                    </div>

                    {/* Location Capsule */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="location" 
                        className="block text-xs font-bold text-primary tracking-wider pl-1"
                      >
                        Location *
                      </label>
                      <div className="w-full h-14 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-6 transition-all relative">
                        <input
                          type="text"
                          id="location"
                          className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-ink font-sans placeholder:text-muted-text/60 focus:ring-0 focus:outline-none"
                          placeholder="Select city or destination"
                          value={location}
                          onChange={e => {
                            setLocation(e.target.value);
                            setErrorMessage(null);
                          }}
                        />
                        <div className="absolute right-6 pointer-events-none">
                          <svg 
                            className="w-3.5 h-3.5 text-primary fill-none stroke-current stroke-2" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Guest Count Capsule */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label 
                          className="block text-xs font-bold text-primary tracking-wider pl-1"
                        >
                          Estimated Guest Count *
                        </label>
                        <div className="w-full h-14 rounded-full border border-primary/30 bg-transparent flex items-center justify-between px-6 transition-all focus-within:border-primary/80">
                          <input
                            type="number"
                            min="1"
                            value={guestCount || ''}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              setGuestCount(val);
                              setErrorMessage(null);
                            }}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-ink font-sans focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Ví dụ: 150"
                          />
                          <span className="text-xs sm:text-sm font-sans text-muted-text italic ml-2">
                            guests
                          </span>
                        </div>
                      </div>

                      {/* Custom Slider */}
                      <div className="px-1 pt-1 pb-2">
                        <div className="relative w-full px-1 flex flex-col gap-2">
                          <input
                            type="range"
                            min="50"
                            max="500"
                            step="10"
                            value={guestCount > 500 ? 500 : guestCount < 50 ? 50 : guestCount}
                            onChange={e => {
                              setGuestCount(parseInt(e.target.value));
                              setErrorMessage(null);
                            }}
                            className="w-full h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          {/* Labels container */}
                          <div className="relative w-full h-4 mt-0.5">
                            <span className="absolute left-0 text-[11px] font-sans text-primary/60">50</span>
                            <span className="absolute left-[22.2%] -translate-x-1/2 text-[11px] font-sans text-primary/60">150</span>
                            <span className="absolute right-0 text-[11px] font-sans text-primary/60">500+</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

                            {/* STEP 2: Budget */}
              {currentStep === 2 && (
                <div className="space-y-8 py-2">
                  {/* Header */}
                  <div className="text-center space-y-1 mb-8">
                    <h2 
                      className="text-[28px] md:text-[32px] italic"
                      style={{ 
                        fontFamily: "'IM Fell French Canon', serif", 
                        fontWeight: 400, 
                        lineHeight: '40px',
                        color: '#2C0600'
                      }}
                    >
                      What is your estimated budget?
                    </h2>
                    <p 
                      className="text-sm sm:text-base font-normal"
                      style={{ 
                        fontFamily: "'IM Fell French Canon', serif", 
                        fontWeight: 400, 
                        lineHeight: '40px',
                        color: '#2C0600'
                      }}
                    >
                      Planora AI will automatically allocate it for you.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Budget Input Capsule */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="budget" 
                        className="block text-xs font-bold text-primary tracking-wider pl-1"
                      >
                        Total Budget *
                      </label>
                      <div className="w-full h-14 rounded-full border border-primary/30 bg-transparent flex items-center justify-between px-6 transition-all focus-within:border-primary/80">
                        <div className="flex items-center w-full">
                          <span className="text-xs sm:text-sm font-sans text-muted-text mr-1.5">₫</span>
                          <input
                            type="number"
                            id="budget"
                            min="1"
                            value={budget || ''}
                            onChange={e => {
                              setBudget(parseInt(e.target.value) || 0);
                              setErrorMessage(null);
                            }}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-ink font-sans focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Ví dụ: 200000000"
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-sans text-muted-text italic ml-2">
                          VND
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-text italic pl-1">
                        Mức phân bổ đề xuất: {(budget || 0).toLocaleString('vi-VN')} VND
                      </p>
                    </div>

                    {/* Custom Slider */}
                    <div className="px-1 pt-1 pb-2">
                      <div className="relative w-full px-1 flex flex-col gap-2">
                        <input
                          type="range"
                          min="50000000"
                          max="1000000000"
                          step="10000000"
                          value={budget > 1000000000 ? 1000000000 : budget < 50000000 ? 50000000 : budget}
                          onChange={e => {
                            setBudget(parseInt(e.target.value));
                            setErrorMessage(null);
                          }}
                          className="w-full h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        {/* Labels container */}
                        <div className="relative w-full h-4 mt-0.5">
                          <span className="absolute left-0 text-[10px] sm:text-[11px] font-sans text-primary/60">50 Triệu</span>
                          <span className="absolute left-[15.8%] -translate-x-1/2 text-[10px] sm:text-[11px] font-sans text-primary/60">200 Triệu</span>
                          <span className="absolute right-0 text-[10px] sm:text-[11px] font-sans text-primary/60">1 Tỷ+</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 3: Wedding Style Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-hairline pb-3 mb-1">
                    <h2 className="text-base font-medium tracking-tight text-ink font-display flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Phong cách thiết kế
                    </h2>
                    <p className="text-[11px] text-muted-text mt-0.5">
                      Chọn phong cách đám cưới bạn mong muốn (Có thể chọn nhiều phong cách).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 dashboard-scroll">
                    {availableStyles.map(style => {
                      const isSelected = selectedStyles.includes(style.id);
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            toggleStyle(style.id);
                            setErrorMessage(null);
                          }}
                          className={`p-3 border rounded-lg text-left transition-all flex flex-col justify-between relative group ${
                            isSelected
                              ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary/25 shadow-sm'
                              : 'bg-white border-hairline text-body-text hover:border-border-strong hover:bg-canvas/50'
                          }`}
                        >
                          <div className="space-y-1 pr-4">
                            <h3 className={`text-xs font-semibold transition-colors ${
                              isSelected ? 'text-primary' : 'text-ink group-hover:text-primary'
                            }`}>
                              {style.name}
                            </h3>
                            <p className="text-[10px] text-muted-text leading-relaxed font-normal line-clamp-2">
                              {style.description || 'Không có mô tả thêm.'}
                            </p>
                          </div>
                          
                          <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-hairline bg-white'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Priority Services */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-hairline pb-3 mb-1">
                    <h2 className="text-base font-medium tracking-tight text-ink font-display flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Dịch vụ Ưu tiên (Priority Services)
                    </h2>
                    <p className="text-[11px] text-muted-text mt-0.5">
                      Chọn các dịch vụ bạn muốn ưu tiên đặc biệt. Chúng tôi sẽ phân bổ ngân sách tối ưu cho các hạng mục này.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-[160px] overflow-y-auto pr-1 dashboard-scroll">
                      {availableCategories.map(category => {
                        const isSelected = selectedCategories.includes(category.id);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              toggleCategory(category.id);
                              setErrorMessage(null);
                            }}
                            className={`p-2 border rounded-sm text-xs font-medium text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-primary/5 border-primary text-primary font-semibold ring-1 ring-primary/20'
                                : 'bg-white border-hairline text-body-text hover:bg-canvas'
                            }`}
                          >
                            <span className="truncate">{category.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                                        {/* AI Notice Card */}
                    <div className="p-3 bg-primary/5 rounded-sm border border-primary/20 flex gap-2 text-[10px] text-primary leading-relaxed items-start mt-2">
                      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold block mb-0.5">Về thuật toán phân bổ thông minh</span>
                        Hệ thống sẽ chia nhỏ ngân sách cưới dựa theo bộ lọc ưu tiên và các mốc thời gian chuẩn bị 12 tháng. Danh sách Checklist và Dòng thời gian sẽ được tự động tạo sẵn.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Wedding Plan Result Summary */}
              {currentStep === 5 && (
                <div className="space-y-6 py-2 animate-fade-in">
                  {/* Header */}
                  <div className="text-center space-y-1 mb-6">
                    <h2 
                      className="text-[28px] md:text-[32px] italic text-[#2C0600]"
                      style={{ fontFamily: "'IM Fell French Canon', serif", fontWeight: 400, lineHeight: '40px' }}
                    >
                      Your Wedding Plan is Ready!
                    </h2>
                    <p 
                      className="text-xs sm:text-sm font-normal text-[#2C0600]"
                      style={{ fontFamily: "'IM Fell French Canon', serif", fontWeight: 400, lineHeight: '24px' }}
                    >
                      Dưới đây là dự toán chi tiết và kế hoạch được thiết kế riêng cho ngày trọng đại của bạn.
                    </p>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Left: General info & Styles */}
                    <div className="space-y-4">
                      {/* Overview details */}
                      <div className="p-4 rounded-xl border border-primary/10 bg-white/40 space-y-3">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider pl-1">Thông tin ngày cưới</h3>
                        <div className="grid grid-cols-2 gap-3 text-[11px] font-sans text-ink">
                          <div>
                            <span className="text-muted-text block">Ngày cưới:</span>
                            <span className="font-semibold">{weddingDate ? new Date(weddingDate).toLocaleDateString('vi-VN') : 'Chưa chọn'}</span>
                          </div>
                          <div>
                            <span className="text-muted-text block">Địa điểm:</span>
                            <span className="font-semibold truncate block">{location}</span>
                          </div>
                          <div>
                            <span className="text-muted-text block">Số lượng khách:</span>
                            <span className="font-semibold">{guestCount} guests</span>
                          </div>
                          <div>
                            <span className="text-muted-text block">Tổng ngân sách:</span>
                            <span className="font-semibold text-primary">{(budget || 0).toLocaleString('vi-VN')} ₫</span>
                          </div>
                        </div>
                      </div>

                      {/* Styles/Concept */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider pl-1">Phong cách Đám cưới đề xuất</h3>
                        {generatedPlan?.conceptSuggestions && generatedPlan.conceptSuggestions.length > 0 ? (
                          <div className="space-y-2">
                            {generatedPlan.conceptSuggestions.map((concept, index) => (
                              <div key={index} className="p-3.5 rounded-xl border border-primary/15 bg-primary/5 space-y-1.5">
                                <h4 className="text-xs font-bold text-primary font-display flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                                  {concept.conceptName}
                                </h4>
                                <p className="text-[11px] text-body-text leading-relaxed">
                                  {concept.description || 'Gợi ý phong cách thiết kế không gian trang trí cho tiệc cưới của bạn.'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl border border-primary/10 bg-white/40 text-center">
                            <span className="text-[11px] text-muted-text italic">Không tìm thấy phong cách phù hợp</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Budget Breakdown */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-wider pl-1">Bảng phân bổ ngân sách đề xuất</h3>
                      {generatedPlan?.budgetItems && generatedPlan.budgetItems.length > 0 ? (
                        <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 dashboard-scroll">
                          {generatedPlan.budgetItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2.5 rounded-full border border-primary/10 bg-white/60 px-4">
                              <span className="text-[11px] font-semibold text-ink truncate max-w-[170px]">{item.categoryName}</span>
                              <span className="text-[11px] font-mono font-bold text-primary">{(item.estimatedCost || 0).toLocaleString('vi-VN')} ₫</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-primary/10 bg-white/40 text-center">
                          <span className="text-[11px] text-muted-text italic">Không có dữ liệu phân bổ</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Checklist Auto-generation Stat */}
                  <div className="p-3.5 rounded-xl border border-primary/10 bg-white/50 flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <ListTodo className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-ink block">Kế hoạch công việc tự động</span>
                      <span className="text-[11px] text-muted-text leading-normal">
                        Planora AI đã tạo sẵn <strong>{generatedPlan?.checklistStats?.totalTasks || 0} công việc</strong> cần chuẩn bị và sắp xếp theo trình tự thời gian đám cưới của bạn.
                      </span>
                    </div>
                  </div>
                </div>
              )}

                            {/* Form Navigation Controls */}
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-hairline">
                {currentStep > 1 && currentStep <= 4 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2 border border-primary/30 text-primary hover:bg-primary/5 rounded-full text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Quay lại
                  </button>
                ) : currentStep === 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2 border border-primary/30 text-primary hover:bg-primary/5 rounded-full text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Tùy chỉnh lại
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-active text-white rounded-full text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
                  >
                    Tiếp tục
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : currentStep === 4 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-active text-white rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm font-display tracking-wide uppercase"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cream" />
                    Tạo kế hoạch tự động
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.replace('/')}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-active text-white rounded-full text-xs font-semibold transition-all flex items-center gap-1 shadow-sm uppercase tracking-wide"
                  >
                    Xác nhận & Vào Dashboard
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

          </div>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
}