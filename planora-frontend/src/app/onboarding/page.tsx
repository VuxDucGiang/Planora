'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getWeddingStyles, 
  getServiceCategories, 
  createOnboardingPlan 
} from '@/services/weddingPlan';
import type { WeddingStyle, ServiceCategory } from '@/types/weddingPlan';
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
  Info
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
  const [title, setTitle] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [budget, setBudget] = useState<number>(200000000); // 200,000,000 VND default
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
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
      if (selectedCategories.length === 0) {
        setErrorMessage('Vui lòng chọn ít nhất một dịch vụ bạn muốn ưu tiên đầu tư!');
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

      // Show final phase for half a second before redirecting
      setGenerationPhase(4);
      setTimeout(() => {
        router.replace('/');
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
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col relative w-full overflow-hidden">
      <DashboardHeader logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 flex flex-col justify-center relative">
        
        {/* Loading configuration data */}
        {isLoadingData ? (
          <div className="flex flex-col items-center py-20 gap-3">
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
            <div className="flex justify-between items-center max-w-md mx-auto relative mb-4">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-border-strong -z-10" />
              {[1, 2, 3, 4].map(step => (
                <button
                  key={step}
                  onClick={() => step < currentStep && setCurrentStep(step)}
                  disabled={step >= currentStep}
                  className={`w-9 h-9 rounded-full border text-xs font-semibold flex items-center justify-center transition-all ${
                    step < currentStep
                      ? 'bg-primary border-primary text-white cursor-pointer hover:opacity-90'
                      : step === currentStep
                      ? 'bg-white border-primary text-primary ring-4 ring-primary/10 shadow-sm font-bold'
                      : 'bg-white border-border-strong text-muted-text cursor-not-allowed'
                  }`}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </button>
              ))}
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start gap-3 text-sm animate-fade-in shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Form Steps Rendering */}
            <div className="bg-white rounded-lg border border-hairline p-8 md:p-10 shadow-sm transition-all duration-300">
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-hairline pb-4 mb-2">
                    <h2 className="text-xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Thông tin ngày cưới
                    </h2>
                    <p className="text-xs text-muted-text mt-1">
                      Hãy chia sẻ những thông tin cơ bản về ngày trọng đại để chúng tôi thiết kế kế hoạch phù hợp nhất.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-xs font-semibold text-ink uppercase tracking-wider">
                        Tên kế hoạch đám cưới
                      </label>
                      <input
                        type="text"
                        id="title"
                        className="w-full bg-canvas border border-hairline rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-ink"
                        placeholder="Ví dụ: Kế hoạch đám cưới của Giang & Mai"
                        value={title}
                        onChange={e => {
                          setTitle(e.target.value);
                          setErrorMessage(null);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Wedding Date */}
                      <div className="space-y-2">
                        <label htmlFor="date" className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-text" />
                          Ngày cưới mong muốn
                        </label>
                        <input
                          type="date"
                          id="date"
                          className="w-full bg-canvas border border-hairline rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-ink"
                          value={weddingDate}
                          onChange={e => {
                            setWeddingDate(e.target.value);
                            setErrorMessage(null);
                          }}
                        />
                      </div>

                      {/* Guest Count */}
                      <div className="space-y-2">
                        <label htmlFor="guests" className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-muted-text" />
                          Số lượng khách mời dự kiến
                        </label>
                        <input
                          type="number"
                          id="guests"
                          min="1"
                          className="w-full bg-canvas border border-hairline rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-ink"
                          placeholder="Ví dụ: 150"
                          value={guestCount}
                          onChange={e => {
                            setGuestCount(parseInt(e.target.value) || 0);
                            setErrorMessage(null);
                          }}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-text" />
                        Địa điểm tổ chức
                      </label>
                      <input
                        type="text"
                        id="location"
                        className="w-full bg-canvas border border-hairline rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-ink"
                        placeholder="Ví dụ: Trung tâm hội nghị tiệc cưới Hà Nội hoặc Khách sạn Lotte"
                        value={location}
                        onChange={e => {
                          setLocation(e.target.value);
                          setErrorMessage(null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Budget and Priorities */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-hairline pb-4 mb-2">
                    <h2 className="text-xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Ngân sách &amp; Dịch vụ Ưu tiên
                    </h2>
                    <p className="text-xs text-muted-text mt-1">
                      Nhập ngân sách của bạn và chọn các dịch vụ cần ưu tiên phân bổ ngân sách cao hơn.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Budget Input */}
                    <div className="space-y-2">
                      <label htmlFor="budget" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                        Tổng ngân sách dự trù (VND)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text font-mono text-sm">₫</span>
                        <input
                          type="number"
                          id="budget"
                          min="1"
                          step="1000000"
                          className="w-full bg-canvas border border-hairline rounded-sm pl-8 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-colors text-ink"
                          placeholder="Ví dụ: 200000000"
                          value={budget}
                          onChange={e => {
                            setBudget(parseInt(e.target.value) || 0);
                            setErrorMessage(null);
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-text italic">
                        Mức phân bổ đề xuất: {(budget || 0).toLocaleString('vi-VN')} VND
                      </p>
                    </div>

                    {/* Priority Categories */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
                        Chọn các dịch vụ muốn ưu tiên đặc biệt
                      </label>
                      <p className="text-[11px] text-muted-text">
                        Chúng tôi sẽ tự động tăng tỉ lệ ngân sách phân bổ cho các hạng mục này trong bảng dự chi.
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
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
                              className={`p-3 border rounded-sm text-xs font-medium text-left transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-primary/5 border-primary text-primary font-semibold ring-1 ring-primary/20'
                                  : 'bg-white border-hairline text-body-text hover:bg-canvas'
                              }`}
                            >
                              <span>{category.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Wedding Style Selection */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-hairline pb-4 mb-2">
                    <h2 className="text-xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Phong cách thiết kế
                    </h2>
                    <p className="text-xs text-muted-text mt-1">
                      Chọn phong cách đám cưới bạn mong muốn (Có thể chọn nhiều phong cách).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          className={`p-5 border rounded-lg text-left transition-all flex flex-col justify-between h-full relative group ${
                            isSelected
                              ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary/25 shadow-sm'
                              : 'bg-white border-hairline text-body-text hover:border-border-strong hover:bg-canvas/50'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <h3 className={`text-sm font-semibold transition-colors ${
                              isSelected ? 'text-primary' : 'text-ink group-hover:text-primary'
                            }`}>
                              {style.name}
                            </h3>
                            <p className="text-xs text-muted-text leading-relaxed font-normal">
                              {style.description || 'Không có mô tả thêm.'}
                            </p>
                          </div>
                          
                          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-hairline bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: Review and Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-hairline pb-4 mb-2">
                    <h2 className="text-xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary animate-pulse" />
                      Xác nhận thông tin
                    </h2>
                    <p className="text-xs text-muted-text mt-1">
                      Vui lòng xem lại thông tin đã khai báo. Hệ thống Planora AI sẽ phân bổ và đề xuất dựa trên các thông số này.
                    </p>
                  </div>

                  {/* Summary Breakdown Grid */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Section 1: Basic */}
                      <div className="p-4 bg-canvas rounded-sm border border-hairline space-y-2">
                        <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest block">Thông tin chung</span>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-text font-normal">Tên kế hoạch:</p>
                          <p className="text-sm font-semibold text-ink">{title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <p className="text-xs text-muted-text font-normal">Ngày cưới:</p>
                            <p className="text-xs font-semibold text-ink">{weddingDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-text font-normal">Khách mời:</p>
                            <p className="text-xs font-semibold text-ink">{guestCount} người</p>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Budget */}
                      <div className="p-4 bg-canvas rounded-sm border border-hairline space-y-2">
                        <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest block">Ngân sách &amp; Ưu tiên</span>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-text font-normal">Tổng ngân sách:</p>
                          <p className="text-sm font-semibold text-primary font-mono">{(budget || 0).toLocaleString('vi-VN')} ₫</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-text font-normal mb-1">Dịch vụ ưu tiên:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCategories.map(catId => {
                              const name = availableCategories.find(c => c.id === catId)?.name || '';
                              return (
                                <span key={catId} className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-medium rounded-sm">
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Styles */}
                    <div className="p-4 bg-canvas rounded-sm border border-hairline space-y-2">
                      <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest block">Phong cách thiết kế lựa chọn</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedStyles.map(styleId => {
                          const style = availableStyles.find(s => s.id === styleId);
                          return (
                            <div key={styleId} className="px-3 py-1 bg-white border border-hairline text-ink text-xs font-semibold rounded-sm">
                              {style?.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Notice Card */}
                    <div className="p-4 bg-primary/5 rounded-sm border border-primary/20 flex gap-3 text-xs text-primary leading-relaxed items-start">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold block mb-0.5">Về thuật toán phân bổ thông minh</span>
                        Hệ thống sẽ chia nhỏ ngân sách cưới dựa theo bộ lọc ưu tiên và các mốc thời gian chuẩn bị 12 tháng. Danh sách Checklist và Timeline sẽ được tự động tạo sẵn kèm gợi ý chi tiết.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-hairline">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-border-strong rounded-sm text-xs font-semibold text-body-text hover:bg-canvas transition-colors flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Quay lại
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-5 py-2.5 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    Tiếp tục
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-all flex items-center gap-2 shadow-sm font-display tracking-wide uppercase"
                  >
                    <Sparkles className="w-4 h-4 text-cream" />
                    Tạo kế hoạch tự động
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
