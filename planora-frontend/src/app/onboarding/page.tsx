'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ListTodo,
  PieChart,
  Clock,
  Palette,
  ShieldAlert,
  UtensilsCrossed,
  CheckCircle2,
  CalendarDays,
  Gem,
  Camera,
  Shirt,
  Sparkle,
  Eye,
  X,
  Images,
  Grid
} from 'lucide-react';
import { WEDDING_STYLES_CATALOG, WeddingStyleDetail } from '@/constants/weddingStyles';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { formatVND, calculateLiveInsights, generateSmartBlueprint } from '@/utils/weddingBlueprint';

export default function Onboarding() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Onboarding Step State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 5 Tab State
  const [blueprintTab, setBlueprintTab] = useState<'budget' | 'checklist' | 'timeline' | 'concept'>('budget');

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

  // Step 3 Wedding Style Gallery Lightbox States
  const [galleryStyle, setGalleryStyle] = useState<WeddingStyleDetail | null>(null);
  const [galleryPhotoIndex, setGalleryPhotoIndex] = useState<number>(0);

  // Keyboard navigation for style photo gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGalleryStyle(null);
      } else if (galleryStyle) {
        if (e.key === 'ArrowRight') {
          setGalleryPhotoIndex(prev => (prev + 1) % galleryStyle.gallery.length);
        } else if (e.key === 'ArrowLeft') {
          setGalleryPhotoIndex(prev => (prev - 1 + galleryStyle.gallery.length) % galleryStyle.gallery.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryStyle]);

  // Merge backend availableStyles with rich catalog details
  const displayStyles: WeddingStyleDetail[] = WEDDING_STYLES_CATALOG.map(catalogItem => {
    const backendMatch = availableStyles.find(
      s => s.id === catalogItem.id || s.name.toLowerCase().includes(catalogItem.matchKey)
    );
    return {
      ...catalogItem,
      id: backendMatch ? backendMatch.id : catalogItem.id,
      name: backendMatch ? backendMatch.name : catalogItem.name,
      description: backendMatch?.description || catalogItem.description
    };
  });

  // Live Logistics and Budget Insights
  const liveInsights = calculateLiveInsights(guestCount, budget);

  // Helper to handle formatted numeric inputs with commas
  const handleFormattedNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: number) => void
  ) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const rawBeforeCursor = input.value.slice(0, cursorPosition).replace(/\D/g, '');
    const rawAll = input.value.replace(/\D/g, '');
    const val = rawAll ? parseInt(rawAll, 10) : 0;
    setter(val);
    setErrorMessage(null);

    requestAnimationFrame(() => {
      if (!input) return;
      const formatted = val ? val.toLocaleString('en-US') : '';
      let targetDigits = rawBeforeCursor.length;
      let newCursor = 0;
      while (newCursor < formatted.length && targetDigits > 0) {
        if (/\d/.test(formatted[newCursor])) {
          targetDigits--;
        }
        newCursor++;
      }
      input.setSelectionRange(newCursor, newCursor);
    });
  };

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

    // Generate immediate client-side smart blueprint fallback
    const fallbackBlueprint = generateSmartBlueprint({
      totalBudget: budget,
      guestCount,
      weddingDate,
      location,
      priorityCategoryIds: selectedCategories,
      selectedStyles: availableStyles.filter(s => selectedStyles.includes(s.id)),
    });

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
      try {
        const activePlan = await getActivePlan();
        if (activePlan) {
          setGeneratedPlan({
            ...fallbackBlueprint,
            ...activePlan,
            budgetItems: (activePlan.budgetItems && activePlan.budgetItems.length > 0) 
              ? activePlan.budgetItems 
              : fallbackBlueprint.budgetItems,
            checklistTasks: (activePlan.checklistTasks && activePlan.checklistTasks.length > 0) 
              ? activePlan.checklistTasks 
              : fallbackBlueprint.checklistTasks,
            timelineEvents: (activePlan.timelineEvents && activePlan.timelineEvents.length > 0) 
              ? activePlan.timelineEvents 
              : fallbackBlueprint.timelineEvents,
            budgetAnalytics: activePlan.budgetAnalytics || fallbackBlueprint.budgetAnalytics,
            conceptSuggestions: (activePlan.conceptSuggestions && activePlan.conceptSuggestions.length > 0) 
              ? activePlan.conceptSuggestions 
              : fallbackBlueprint.conceptSuggestions,
          });
        } else {
          setGeneratedPlan(fallbackBlueprint);
        }
      } catch (fetchErr) {
        console.warn('Could not fetch active plan from server, using smart blueprint fallback:', fetchErr);
        setGeneratedPlan(fallbackBlueprint);
      }

      // Show final phase briefly before displaying Step 5
      setGenerationPhase(4);
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep(5);
      }, 1000);

    } catch (err) {
      console.error('Lỗi tạo kế hoạch:', err);
      // Even if network or API has a temporary glitch, allow user to inspect the generated smart blueprint
      setGeneratedPlan(fallbackBlueprint);
      setGenerationPhase(4);
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep(5);
      }, 1000);
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
      <main className={`flex-1 w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center relative transition-all duration-500 ${
        currentStep === 3 ? 'max-w-[1280px]' : currentStep === 5 ? 'max-w-[880px]' : 'max-w-3xl'
      }`}>
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
            <div className={`bg-[#FFFBF5] rounded-2xl border border-primary/10 p-5 sm:p-8 shadow-md w-full mx-auto z-10 transition-all duration-500 ${
              currentStep === 3 ? 'max-w-[1240px]' : currentStep === 5 ? 'max-w-[840px]' : 'max-w-[520px]'
            }`}>
              
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
                            type="text"
                            inputMode="numeric"
                            value={guestCount ? guestCount.toLocaleString('en-US') : ''}
                            onChange={e => handleFormattedNumberChange(e, setGuestCount)}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-ink font-sans focus:ring-0 focus:outline-none"
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
                            <span className="absolute right-0 text-[11px] font-sans text-primary/60">500+</span>
                          </div>
                        </div>
                      </div>

                      {/* Live Logistics Analysis Pill */}
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/15 flex items-center justify-between text-xs mt-2 transition-all">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-ink font-medium">Ước tính quy mô bàn tiệc:</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 bg-white rounded-full font-bold text-primary shadow-xs border border-primary/20 text-xs">
                            ~{liveInsights.tables} bàn
                          </span>
                          <span className="text-[10px] text-muted-text hidden sm:inline">(10 khách/bàn + 1 dự phòng)</span>
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
                            type="text"
                            inputMode="numeric"
                            id="budget"
                            value={budget ? budget.toLocaleString('en-US') : ''}
                            onChange={e => handleFormattedNumberChange(e, setBudget)}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-ink font-sans focus:ring-0 focus:outline-none"
                            placeholder="Ví dụ: 200,000,000"
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-sans text-muted-text italic ml-2">
                          VND
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-text italic pl-1">
                        Mức phân bổ đề xuất: {(budget || 0).toLocaleString('en-US')} VND
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
                          <span className="absolute right-0 text-[10px] sm:text-[11px] font-sans text-primary/60">1 Tỷ+</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Smart Budget Insights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col gap-1 shadow-xs">
                        <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          <span>Chi phí Tiệc cưới & Đồ uống (~50%)</span>
                        </div>
                        <span className="text-sm font-bold text-ink">{formatVND(liveInsights.banquetEstimated)}</span>
                        <span className="text-[10px] text-muted-text">~{formatVND(liveInsights.costPerTable)} / bàn ({liveInsights.venueTier})</span>
                      </div>
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex flex-col gap-1 shadow-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quỹ dự phòng an toàn (4%)</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{formatVND(liveInsights.contingencyFund)}</span>
                        <span className="text-[10px] text-emerald-600/80">Phòng ngừa chi phí phát sinh ngày lễ</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 3: Wedding Style Selection with Wide Panoramic Layout */}
              {currentStep === 3 && (
                <div className="space-y-6 py-2 animate-fade-in">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-hairline/70 pb-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-[11px] font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>Step 3 of 4 • Wedding Style</span>
                      </div>
                      <h2 
                        className="text-[26px] sm:text-[30px] italic leading-tight"
                        style={{ 
                          fontFamily: "'IM Fell French Canon', serif", 
                          fontWeight: 400, 
                          color: '#2C0600'
                        }}
                      >
                        Pick your dream wedding style
                      </h2>
                      <p className="text-xs text-muted-text max-w-lg font-sans">
                        Khám phá không gian thực tế và chọn phong cách bạn yêu thích (có thể chọn nhiều phong cách).
                      </p>
                    </div>

                    {/* Status Pill on the Right */}
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-primary/20 shadow-xs">
                      <span className="text-xs text-body-text font-medium">
                        {selectedStyles.length > 0 ? (
                          <>
                            Đã chọn: <strong className="text-primary">{selectedStyles.length}</strong> phong cách
                          </>
                        ) : (
                          <span className="text-muted-text italic">Chưa chọn phong cách nào</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Ribbon Banner: NOW CHOOSE YOUR STYLE */}
                  <div className="flex items-center justify-between px-5 py-2.5 rounded-full bg-primary text-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                      <span className="text-xs sm:text-sm font-bold tracking-wider uppercase font-display">
                        NOW CHOOSE YOUR STYLE
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 italic hidden sm:inline">
                      Bấm vào từng thẻ để chọn phong cách • Bấm &quot;Xem ảnh&quot; để ngắm không gian chi tiết
                    </span>
                  </div>

                  {/* 5-Column Wide Panoramic Cards (Rộng sang 2 bên) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    {displayStyles.map((style) => {
                      const isSelected = selectedStyles.includes(style.id);
                      return (
                        <div
                          key={style.id}
                          onClick={() => {
                            toggleStyle(style.id);
                            setErrorMessage(null);
                          }}
                          className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                            isSelected
                              ? 'border-primary ring-2 ring-primary shadow-md bg-primary/5 transform -translate-y-1'
                              : 'border-primary/20 bg-white hover:border-primary/50 shadow-2xs hover:shadow-sm'
                          }`}
                        >
                          {/* Card Image (Portrait aspect 3:4 theo chiều dọc) */}
                          <div className="relative aspect-[3/4] w-full overflow-hidden bg-primary/10">
                            <img
                              src={style.coverImage}
                              alt={style.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                            {/* Tag Badge (Top-Left) */}
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md shadow-2xs border border-white/50">
                              <span className="text-[10px] font-bold text-primary tracking-wider uppercase font-sans">
                                {style.tag}
                              </span>
                            </div>

                            {/* Select Checkbox (Top-Right) */}
                            <div 
                              className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-primary text-white ring-2 ring-white shadow-xs'
                                  : 'bg-black/35 backdrop-blur-xs text-white/80 group-hover:bg-white group-hover:text-primary'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <div className="w-2 h-2 rounded-full border border-white/70" />
                              )}
                            </div>

                            {/* "Xem 4 ảnh" Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGalleryStyle(style);
                                setGalleryPhotoIndex(0);
                              }}
                              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-primary text-[10px] font-bold tracking-wide shadow-xs flex items-center gap-1 transition-all hover:scale-105"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Xem {style.gallery.length} ảnh</span>
                            </button>
                          </div>

                          {/* Card Body */}
                          <div className="p-3 bg-white flex-1 flex flex-col justify-between text-center border-t border-hairline/60">
                            <div>
                              <h3 
                                className="text-sm font-bold text-ink"
                                style={{ fontFamily: "'IM Fell French Canon', serif" }}
                              >
                                {style.tag}
                              </h3>
                              <p className="text-[10px] text-muted-text truncate mt-0.5">
                                {style.vietnameseTitle}
                              </p>
                            </div>

                            {/* Mini Color Palette Dots */}
                            <div className="flex items-center justify-center gap-1 my-2">
                              {style.palette.slice(0, 4).map((c, i) => (
                                <span 
                                  key={i} 
                                  className="w-2.5 h-2.5 rounded-full border border-black/10" 
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                            </div>

                            {/* Selection Action Button */}
                            <span className={`text-[10px] font-semibold py-1 px-2 rounded-full transition-all block ${
                              isSelected 
                                ? 'bg-primary text-white' 
                                : 'bg-primary/5 text-primary group-hover:bg-primary/10'
                            }`}>
                              {isSelected ? '✓ Đã chọn' : '+ Chọn phong cách'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Footer */}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-body-text">
                        {selectedStyles.length > 0 ? (
                          <>
                            Đã chọn <strong>{selectedStyles.length} phong cách</strong>:{' '}
                            <span className="text-primary font-semibold">
                              {displayStyles
                                .filter(s => selectedStyles.includes(s.id))
                                .map(s => s.tag)
                                .join(', ')}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-text italic">
                            Chưa chọn phong cách nào. Bấm vào thẻ phía trên để lựa chọn phong cách bạn yêu thích.
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-text italic">
                      Planora AI sẽ phối hợp các phong cách bạn đã chọn để tạo bản thiết kế độc bản
                    </span>
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

                    {/* Priority Impact Notification */}
                    {selectedCategories.length > 0 ? (
                      <div className="p-3 bg-primary/10 rounded-xl border border-primary/25 flex gap-2.5 text-[11px] text-primary leading-relaxed items-center animate-fade-in">
                        <Sparkles className="w-4 h-4 flex-shrink-0 text-gold" />
                        <div>
                          <span className="font-bold block text-primary">Đã chọn {selectedCategories.length} dịch vụ ưu tiên:</span>
                          <span className="text-body-text">Các hạng mục này sẽ được tự động tăng <strong>+25% ngân sách</strong> để bạn có thể chọn các nhà cung cấp chất lượng cao nhất.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex gap-2.5 text-[11px] text-amber-800 leading-relaxed items-center">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                        <span>Hãy chọn ít nhất 1 dịch vụ bạn mong muốn đầu tư nhiều nhất để thuật toán tối ưu phân bổ.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Master Wedding Blueprint Result */}
              {currentStep === 5 && (
                <div className="space-y-6 py-2 animate-fade-in">
                  {/* Header */}
                  <div className="text-center space-y-1 mb-6">
                    <h2 
                      className="text-[26px] md:text-[32px] italic text-[#2C0600]"
                      style={{ fontFamily: "'IM Fell French Canon', serif", fontWeight: 400, lineHeight: '38px' }}
                    >
                      Master Wedding Blueprint
                    </h2>
                    <p 
                      className="text-xs sm:text-sm font-normal text-muted-text max-w-lg mx-auto"
                      style={{ fontFamily: "'IM Fell French Canon', serif", fontWeight: 400, lineHeight: '22px' }}
                    >
                      Bản kế hoạch cưới chi tiết được cá nhân hóa tự động theo ngân sách, quy mô bàn tiệc và phong cách của hai bạn.
                    </p>
                  </div>

                  {/* 4 Core KPI Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Tổng dự toán</span>
                      <div className="mt-1">
                        <span className="text-sm sm:text-base font-bold text-primary block leading-tight">
                          {formatVND(budget)}
                        </span>
                        <span className="text-[10px] text-muted-text mt-0.5 block truncate">
                          {liveInsights.venueTier}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Quy mô tiệc</span>
                      <div className="mt-1">
                        <span className="text-sm sm:text-base font-bold text-ink block leading-tight">
                          {guestCount.toLocaleString('en-US')} khách
                        </span>
                        <span className="text-[10px] text-primary font-medium mt-0.5 block">
                          ~{liveInsights.tables} bàn tiệc
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Lộ trình Checklist</span>
                      <div className="mt-1">
                        <span className="text-sm sm:text-base font-bold text-ink block leading-tight">
                          {generatedPlan?.checklistTasks?.length || 24} công việc
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                          6 giai đoạn thích ứng
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">Kịch bản ngày cưới</span>
                      <div className="mt-1">
                        <span className="text-sm sm:text-base font-bold text-ink block leading-tight">
                          {generatedPlan?.timelineEvents?.length || 10} sự kiện
                        </span>
                        <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
                          Gia tiên & Đãi tiệc
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blueprint Navigation Tabs */}
                  <div className="flex border-b border-hairline gap-1 overflow-x-auto pb-1 dashboard-scroll">
                    {[
                      { id: 'budget', label: '💰 Ngân sách 10 hạng mục', icon: PieChart },
                      { id: 'checklist', label: '📋 Checklist 6 giai đoạn', icon: ListTodo },
                      { id: 'timeline', label: '⏱️ Kịch bản ngày cưới', icon: Clock },
                      { id: 'concept', label: '🎨 Concept & Bảng màu', icon: Palette }
                    ].map(tab => {
                      const isActive = blueprintTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setBlueprintTab(tab.id as any)}
                          className={`px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-white border-t border-x border-primary/20 text-primary shadow-xs -mb-[1px]'
                              : 'text-muted-text hover:text-ink hover:bg-white/40'
                          }`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab 1: Budget Breakdown */}
                  {blueprintTab === 'budget' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Budget Analytics Banner */}
                      <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4 text-primary" />
                          <span className="text-ink">
                            Tiệc & Đồ uống (~50%): <strong>{formatVND(liveInsights.banquetEstimated)}</strong> (~{formatVND(liveInsights.costPerTable)}/bàn)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-emerald-700" />
                          <span className="text-emerald-800 font-medium">
                            Quỹ dự phòng an toàn (4%): <strong>{formatVND(liveInsights.contingencyFund)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* 10 Categories List */}
                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 dashboard-scroll">
                        {generatedPlan?.budgetItems && generatedPlan.budgetItems.length > 0 ? (
                          generatedPlan.budgetItems.map((item, idx) => {
                            const pct = item.percentage ?? Math.round(((item.estimatedCost || 0) / (budget || 1)) * 100);
                            return (
                              <div 
                                key={idx} 
                                className={`p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                                  item.isPriority 
                                    ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20 shadow-xs' 
                                    : 'bg-white/70 border-primary/10'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                    <span className="text-xs font-bold text-ink">{item.categoryName}</span>
                                    {item.isPriority && (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[9px] uppercase tracking-wider border border-amber-300">
                                        Ưu tiên +25%
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-semibold text-muted-text">{pct}%</span>
                                    <span className="text-xs font-bold font-mono text-primary">
                                      {formatVND(item.estimatedCost || 0)}
                                    </span>
                                  </div>
                                </div>
                                {/* Percentage bar */}
                                <div className="w-full h-1.5 bg-hairline rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      item.isPriority ? 'bg-amber-600' : 'bg-primary'
                                    }`} 
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-muted-text italic">
                            Không có dữ liệu phân bổ ngân sách.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Adaptive Checklist */}
                  {blueprintTab === 'checklist' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Notice Banner */}
                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 flex gap-2 text-xs text-blue-900 items-center">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>
                          Thuật toán đã tự động tính toán và co giãn thời hạn các mốc công việc theo ngày cưới của bạn để bạn không bị quá tải.
                        </span>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 dashboard-scroll">
                        {generatedPlan?.checklistTasks && generatedPlan.checklistTasks.length > 0 ? (
                          generatedPlan.checklistTasks.map((task, idx) => {
                            const isHigh = task.priority === 'HIGH';
                            const isMed = task.priority === 'MEDIUM';
                            return (
                              <div 
                                key={idx} 
                                className="p-3 rounded-xl border border-primary/10 bg-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white transition-all shadow-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-ink">{task.title}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                      isHigh 
                                        ? 'bg-red-100 text-red-700 border border-red-200' 
                                        : isMed 
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}>
                                      {task.priority || 'NORMAL'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-muted-text">
                                    {task.phase && <span>{task.phase}</span>}
                                    {task.categoryName && (
                                      <>
                                        <span>•</span>
                                        <span className="text-primary font-medium">{task.categoryName}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="px-2.5 py-1 rounded-full bg-primary/5 border border-primary/15 text-primary text-[11px] font-mono font-semibold">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Theo lộ trình'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-muted-text italic">
                            Không có công việc nào trong danh sách.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Timeline */}
                  {blueprintTab === 'timeline' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Notice Banner */}
                      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 flex gap-2 text-xs text-amber-900 items-center">
                        <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <span>
                          Kịch bản bao gồm đầy đủ 2 phần quan trọng nhất của đám cưới Việt: <strong>Nghi lễ Gia Tiên (Sáng)</strong> và <strong>Tiệc Cưới Đãi Khách (Tối)</strong>.
                        </span>
                      </div>

                      {/* Events List */}
                      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 dashboard-scroll">
                        {generatedPlan?.timelineEvents && generatedPlan.timelineEvents.length > 0 ? (
                          generatedPlan.timelineEvents.map((evt, idx) => {
                            const displayTime = evt.startTime || (evt.eventDate && evt.eventDate.includes(' ') ? evt.eventDate.split(' ')[1] : '08:00');
                            return (
                              <div 
                                key={idx} 
                                className="p-3 rounded-xl border border-primary/10 bg-white/80 flex items-start gap-3 shadow-xs hover:border-primary/30 transition-all"
                              >
                                <div className="px-2.5 py-1 rounded-lg bg-primary text-white font-mono font-bold text-xs flex-shrink-0 text-center shadow-xs">
                                  {displayTime}
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h4 className="text-xs font-bold text-ink">{evt.title}</h4>
                                    {evt.location && (
                                      <span className="text-[10px] text-primary font-semibold px-2 py-0.5 rounded-full bg-primary/5 border border-primary/15">
                                        📍 {evt.location}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-body-text leading-relaxed">
                                    {evt.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-muted-text italic">
                            Không có mốc sự kiện nào trong kịch bản.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Concept & Color Palette */}
                  {blueprintTab === 'concept' && (
                    <div className="space-y-4 animate-fade-in">
                      {generatedPlan?.conceptSuggestions && generatedPlan.conceptSuggestions.length > 0 ? (
                        generatedPlan.conceptSuggestions.map((concept, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-primary/15 bg-white/80 space-y-3.5 shadow-xs">
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-primary flex items-center gap-2 font-display">
                                <Sparkles className="w-4 h-4 text-gold" />
                                {concept.conceptName}
                              </h4>
                              <p className="text-xs text-body-text leading-relaxed">
                                {concept.description}
                              </p>
                            </div>

                            {/* Color Palette Swatches */}
                            {concept.colorPalette && concept.colorPalette.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">
                                  Bảng màu chủ đạo (Color Palette)
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {concept.colorPalette.map((color, cIdx) => (
                                    <div 
                                      key={cIdx} 
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-hairline bg-white shadow-xs"
                                    >
                                      <span 
                                        className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0" 
                                        style={{ backgroundColor: color }}
                                      />
                                      <span className="text-[10px] font-mono font-semibold text-ink uppercase">
                                        {color}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Floral & Decor Insights */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-hairline text-xs">
                              {concept.floralTheme && (
                                <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                                  <span className="font-bold text-primary block mb-0.5 text-[11px]">
                                    🌸 Hoa tươi trang trí:
                                  </span>
                                  <span className="text-[11px] text-body-text">{concept.floralTheme}</span>
                                </div>
                              )}
                              {concept.decorNote && (
                                <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                                  <span className="font-bold text-primary block mb-0.5 text-[11px]">
                                    ✨ Gợi ý không gian:
                                  </span>
                                  <span className="text-[11px] text-body-text">{concept.decorNote}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-muted-text italic">
                          Không có phong cách đề xuất nào.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary General Info Footnote */}
                  <div className="p-3 bg-white/60 rounded-xl border border-primary/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-text">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      <span>Ngày cưới: <strong>{weddingDate ? new Date(weddingDate).toLocaleDateString('vi-VN') : 'Chưa định ngày'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-text">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>Địa điểm: <strong>{location || 'Chưa định địa điểm'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-text">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Khách mời: <strong>{guestCount.toLocaleString('en-US')} người (~{liveInsights.tables} bàn)</strong></span>
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

      {/* Lightbox / Interactive Photo Gallery Modal for Wedding Styles */}
      {galleryStyle && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setGalleryStyle(null)}
        >
          <div 
            className="bg-[#FFFBF5] rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-primary/20 shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-hairline flex items-center justify-between bg-white/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider font-sans">
                    {galleryStyle.tag}
                  </span>
                  <h3 
                    className="text-lg sm:text-xl font-bold text-ink"
                    style={{ fontFamily: "'IM Fell French Canon', serif" }}
                  >
                    {galleryStyle.vietnameseTitle}
                  </h3>
                </div>
                <p className="text-xs text-muted-text">
                  {galleryStyle.vibe}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGalleryStyle(null)}
                className="w-8 h-8 rounded-full border border-primary/20 text-muted-text hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Main Photo Preview with Controls */}
            <div className="p-4 sm:p-5 space-y-4">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/5 shadow-inner group">
                <img
                  src={galleryStyle.gallery[galleryPhotoIndex]?.url || galleryStyle.coverImage}
                  alt={galleryStyle.gallery[galleryPhotoIndex]?.caption || galleryStyle.name}
                  className="w-full h-full object-cover object-center transition-opacity duration-300"
                />

                {/* Left & Right navigation buttons */}
                {galleryStyle.gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setGalleryPhotoIndex(prev => (prev - 1 + galleryStyle.gallery.length) % galleryStyle.gallery.length)}
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryPhotoIndex(prev => (prev + 1) % galleryStyle.gallery.length)}
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Photo Caption Pill */}
                <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs flex items-center justify-between">
                  <span className="truncate pr-2 font-medium">
                    {galleryStyle.gallery[galleryPhotoIndex]?.caption}
                  </span>
                  <span className="text-[11px] text-white/70 flex-shrink-0 font-mono">
                    {galleryPhotoIndex + 1} / {galleryStyle.gallery.length}
                  </span>
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-4 gap-2">
                {galleryStyle.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGalleryPhotoIndex(idx)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      galleryPhotoIndex === idx
                        ? 'border-primary ring-2 ring-primary/30 scale-102'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>

              {/* Style Insights & Color Palette */}
              <div className="p-3.5 bg-white rounded-xl border border-primary/10 space-y-2.5">
                <p className="text-xs text-body-text leading-relaxed">
                  {galleryStyle.description}
                </p>

                {/* Color Palette Swatches */}
                <div className="space-y-1 pt-1 border-t border-hairline">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block">
                    Bảng màu chủ đạo đề xuất:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {galleryStyle.palette.map((color, cIdx) => (
                      <div 
                        key={cIdx} 
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-hairline bg-canvas shadow-2xs"
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0" 
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[10px] font-mono font-semibold text-ink">
                          {color.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-hairline bg-white/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setGalleryStyle(null)}
                className="px-4 py-2 border border-primary/30 text-primary hover:bg-primary/5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleStyle(galleryStyle.id);
                  setErrorMessage(null);
                }}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                  selectedStyles.includes(galleryStyle.id)
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-primary text-white hover:bg-primary-active'
                }`}
              >
                {selectedStyles.includes(galleryStyle.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Đã chọn phong cách này (Bấm để hủy)
                  </>
                ) : (
                  <>
                    + Chọn phong cách này
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}