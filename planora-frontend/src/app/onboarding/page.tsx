'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { 
  getWeddingStyles, 
  getServiceCategories, 
  createOnboardingPlan,
  getActivePlan
} from '@/services/weddingPlan';
import type { WeddingStyle, ServiceCategory, ActivePlanResponse } from '@/types/weddingPlan';
import { 
  Users, 
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
  CalendarDays,
  Gem,
  Camera,
  Shirt,
  Eye,
  X,
  Globe,
  ChevronDown,
  Music
} from 'lucide-react';
import { WEDDING_STYLES_CATALOG, WeddingStyleDetail } from '@/constants/weddingStyles';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { formatVND, calculateLiveInsights, generateSmartBlueprint } from '@/utils/weddingBlueprint';
import { useLanguage } from '@/contexts/LanguageContext';

const COUNTRIES_AND_CITIES: Record<string, string[]> = {
  'Việt Nam': [
    'TP. Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Nha Trang (Khánh Hòa)',
    'Phú Quốc (Kiên Giang)',
    'Đà Lạt (Lâm Đồng)',
    'Hội An (Quảng Nam)',
    'Huế (Thừa Thiên Huế)',
    'Hải Phòng',
    'Cần Thơ',
    'Vũng Tàu (Bà Rịa - Vũng Tàu)',
    'Phan Thiết - Mũi Né (Bình Thuận)',
    'Hạ Long (Quảng Ninh)',
    'Sa Pa (Lào Cai)',
    'Ninh Bình',
    'Quy Nhơn (Bình Định)',
    'Buôn Ma Thuột (Đắk Lắk)',
    'Bình Dương',
    'Đồng Nai',
    'Khác (Nhập tùy chỉnh)',
  ],
  'Thái Lan': ['Bangkok', 'Phuket', 'Chiang Mai', 'Koh Samui', 'Krabi', 'Pattaya', 'Khác (Nhập tùy chỉnh)'],
  'Nhật Bản': ['Tokyo', 'Kyoto', 'Osaka', 'Hokkaido', 'Okinawa', 'Yokohama', 'Khác (Nhập tùy chỉnh)'],
  'Hàn Quốc': ['Seoul', 'Đảo Jeju', 'Busan', 'Incheon', 'Gangwon', 'Khác (Nhập tùy chỉnh)'],
  'Singapore': ['Singapore City', 'Đảo Sentosa', 'Marina Bay', 'Khác (Nhập tùy chỉnh)'],
  'Indonesia': ['Bali (Ubud / Seminyak / Uluwatu)', 'Jakarta', 'Lombok', 'Khác (Nhập tùy chỉnh)'],
  'Pháp': ['Paris', 'Nice - Côte d’Azur', 'Provence', 'Bordeaux', 'Lyon', 'Khác (Nhập tùy chỉnh)'],
  'Ý (Italy)': ['Rome', 'Florence / Tuscany', 'Venice', 'Amalfi Coast', 'Lake Como', 'Khác (Nhập tùy chỉnh)'],
  'Hoa Kỳ (USA)': ['Hawaii', 'California', 'New York', 'Las Vegas', 'Florida', 'Khác (Nhập tùy chỉnh)'],
  'Úc (Australia)': ['Sydney', 'Melbourne', 'Gold Coast', 'Khác (Nhập tùy chỉnh)'],
  'Quốc gia khác': ['Nhập tùy chỉnh'],
};

interface CategoryMetaItem {
  viTitle: string;
  enTitle: string;
  viDesc: string;
  enDesc: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}

const PRIORITY_CATEGORY_META: Record<string, CategoryMetaItem> = {
  'studio': {
    viTitle: 'Studio Cưới',
    enTitle: 'Photo Studio',
    viDesc: 'Album Pre-wedding & ảnh cổng',
    enDesc: 'Pre-wedding album & shoot',
    IconComponent: Camera,
  },
  'makeup': {
    viTitle: 'Trang Điểm',
    enTitle: 'Bridal Makeup',
    viDesc: 'Makeup cô dâu lễ sáng & tiệc tối',
    enDesc: 'Ceremony & evening reception',
    IconComponent: Sparkles,
  },
  'wedding planner': {
    viTitle: 'Wedding Planner',
    enTitle: 'Wedding Planner',
    viDesc: 'Ý tưởng & điều phối chuyên nghiệp',
    enDesc: 'Full planning & coordination',
    IconComponent: Heart,
  },
  'decor': {
    viTitle: 'Trang Trí Tiệc Cưới',
    enTitle: 'Decor & Florals',
    viDesc: 'Cổng hoa, gia tiên & sân khấu',
    enDesc: 'Floral arches, gallery & stage',
    IconComponent: Palette,
  },
  'dress rental': {
    viTitle: 'Váy Cưới & Trang Phục',
    enTitle: 'Bridal Gowns & Suits',
    viDesc: 'Váy cưới chính, áo dài & vest',
    enDesc: 'Gowns, ao dai & tuxedos',
    IconComponent: Shirt,
  },
  'photographer': {
    viTitle: 'Nhiếp Ảnh Gia',
    enTitle: 'Photographer',
    viDesc: 'Phóng sự cưới ngày chính lễ',
    enDesc: 'Day-of photo & video coverage',
    IconComponent: Camera,
  },
  'venue': {
    viTitle: 'Sảnh Tiệc & Địa Điểm',
    enTitle: 'Venue & Banquet',
    viDesc: 'Không gian tiệc & thực đơn ẩm thực',
    enDesc: 'Banquet hall & culinary service',
    IconComponent: UtensilsCrossed,
  },
  'music & mc': {
    viTitle: 'Âm Thanh & Ban Nhạc',
    enTitle: 'Music & MC',
    viDesc: 'MC, hòa tấu & ban nhạc tiệc cưới',
    enDesc: 'Live band, MC & sound lighting',
    IconComponent: Music,
  },
  'music': {
    viTitle: 'Âm Thanh & Ban Nhạc',
    enTitle: 'Music & MC',
    viDesc: 'MC, hòa tấu & ban nhạc tiệc cưới',
    enDesc: 'Live band, MC & sound lighting',
    IconComponent: Music,
  },
  'mc': {
    viTitle: 'Âm Thanh & Ban Nhạc',
    enTitle: 'Music & MC',
    viDesc: 'MC, hòa tấu & ban nhạc tiệc cưới',
    enDesc: 'Live band, MC & sound lighting',
    IconComponent: Music,
  },
};

function getCategoryDetails(name: string, lang: 'vi' | 'en') {
  const lower = name.toLowerCase().trim();
  for (const [key, meta] of Object.entries(PRIORITY_CATEGORY_META)) {
    if (lower.includes(key) || key.includes(lower)) {
      return {
        title: lang === 'vi' ? meta.viTitle : meta.enTitle,
        desc: lang === 'vi' ? meta.viDesc : meta.enDesc,
        IconComponent: meta.IconComponent,
      };
    }
  }

  let FallbackIcon = Gem;
  if (lower.includes('photo') || lower.includes('ảnh') || lower.includes('chụp')) FallbackIcon = Camera;
  else if (lower.includes('make') || lower.includes('điểm')) FallbackIcon = Sparkles;
  else if (lower.includes('hoa') || lower.includes('trí')) FallbackIcon = Palette;
  else if (lower.includes('váy') || lower.includes('áo') || lower.includes('vest')) FallbackIcon = Shirt;
  else if (lower.includes('tiệc') || lower.includes('nhà hàng') || lower.includes('ăn')) FallbackIcon = UtensilsCrossed;

  return {
    title: name,
    desc: lang === 'vi' ? 'Dịch vụ cưới cao cấp' : 'Premier wedding service',
    IconComponent: FallbackIcon,
  };
}

export default function Onboarding() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshPlan } = usePlan();
  const { language } = useLanguage();
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
  const [weddingDate, setWeddingDate] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(50);
  const [budget, setBudget] = useState<number>(200000000); // 200,000,000 VND default

  // Step 1: Couple Name / Owner State
  const [coupleName, setCoupleName] = useState('');

  // Auto-generate title in format: "Đám cưới của [Tên]"
  const title = useMemo(() => {
    const rawName = coupleName.trim() || user?.fullName || (user?.email ? user.email.split('@')[0] : '');
    const cleanName = rawName || (language === 'vi' ? 'hai bạn' : 'the Couple');
    return language === 'vi' ? `Đám cưới của ${cleanName}` : `Wedding of ${cleanName}`;
  }, [coupleName, user, language]);
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<ActivePlanResponse | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Step 1: Detailed Date States (Ngày / Tháng / Năm)
  const [weddingDay, setWeddingDay] = useState<string>('');
  const [weddingMonth, setWeddingMonth] = useState<string>('');
  const [weddingYear, setWeddingYear] = useState<string>('');

  // Step 1: Detailed Location States (Quốc gia / Thành phố)
  const [selectedCountry, setSelectedCountry] = useState<string>('Việt Nam');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('');

  // Helper: Min wedding date is at least 1 month from current time
  const getMinWeddingDate = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() + 1);
    return d;
  };

  const minDateObj = getMinWeddingDate();
  const minDateDisplay = `${String(minDateObj.getDate()).padStart(2, '0')}/${String(minDateObj.getMonth() + 1).padStart(2, '0')}/${minDateObj.getFullYear()}`;

  // Check if chosen day/month/year is less than 1 month away
  const checkIsDateTooSoon = (d: string, m: string, y: string) => {
    if (!d || !m || !y) return false;
    const chosen = new Date(Number(y), Number(m) - 1, Number(d));
    chosen.setHours(0, 0, 0, 0);
    return chosen < getMinWeddingDate();
  };

  const isDateTooSoon = checkIsDateTooSoon(weddingDay, weddingMonth, weddingYear);

  // Sync date parts to ISO weddingDate string
  const updateWeddingDate = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const formatted = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      setWeddingDate(formatted);
    } else {
      setWeddingDate('');
    }
  };

  const handleDayChange = (d: string) => {
    setWeddingDay(d);
    setErrorMessage(null);
    updateWeddingDate(d, weddingMonth, weddingYear);
  };

  const handleMonthChange = (m: string) => {
    setWeddingMonth(m);
    setErrorMessage(null);
    let adjustedDay = weddingDay;
    if (m && weddingYear && weddingDay) {
      const maxDays = new Date(Number(weddingYear), Number(m), 0).getDate();
      if (Number(weddingDay) > maxDays) {
        adjustedDay = String(maxDays);
        setWeddingDay(adjustedDay);
      }
    }
    updateWeddingDate(adjustedDay, m, weddingYear);
  };

  const handleYearChange = (y: string) => {
    setWeddingYear(y);
    setErrorMessage(null);
    let adjustedDay = weddingDay;
    if (weddingMonth && y && weddingDay) {
      const maxDays = new Date(Number(y), Number(weddingMonth), 0).getDate();
      if (Number(weddingDay) > maxDays) {
        adjustedDay = String(maxDays);
        setWeddingDay(adjustedDay);
      }
    }
    updateWeddingDate(adjustedDay, weddingMonth, y);
  };

  // Location Handlers
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity('');
    setCustomCity('');
    setLocation('');
    setErrorMessage(null);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setErrorMessage(null);
    if (city === 'Khác (Nhập tùy chỉnh)' || city === 'Nhập tùy chỉnh') {
      setLocation(customCity.trim() ? `${customCity.trim()}, ${selectedCountry}` : '');
    } else if (city) {
      setLocation(`${city}, ${selectedCountry}`);
    } else {
      setLocation('');
    }
  };

  const handleCustomCityChange = (custom: string) => {
    setCustomCity(custom);
    setErrorMessage(null);
    if (custom.trim()) {
      setLocation(`${custom.trim()}, ${selectedCountry}`);
    } else {
      setLocation('');
    }
  };

  // Days list for date selector
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const daysInSelectedMonth = (weddingMonth && weddingYear)
    ? new Date(Number(weddingYear), Number(weddingMonth), 0).getDate()
    : 31;
  const availableDays = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  const daysUntilWedding = (() => {
    if (!weddingDay || !weddingMonth || !weddingYear) return 0;
    const chosen = new Date(Number(weddingYear), Number(weddingMonth) - 1, Number(weddingDay));
    chosen.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = chosen.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

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
        const cats = (categories && categories.length > 0) ? [...categories] : [
          { id: 1, name: 'Studio' },
          { id: 2, name: 'Makeup' },
          { id: 3, name: 'Wedding Planner' },
          { id: 4, name: 'Decor' },
          { id: 5, name: 'Dress Rental' },
          { id: 6, name: 'Photographer' },
          { id: 7, name: 'Venue' },
          { id: 8, name: 'Music & MC' }
        ];
        const hasMusic = cats.some(c => c.name.toLowerCase().includes('music') || c.name.toLowerCase().includes('mc') || c.name.toLowerCase().includes('âm thanh') || c.name.toLowerCase().includes('nhạc'));
        if (!hasMusic) {
          cats.push({ id: 8, name: 'Music & MC' });
        }
        setAvailableCategories(cats);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu onboarding:', err);
        setAvailableCategories([
          { id: 1, name: 'Studio' },
          { id: 2, name: 'Makeup' },
          { id: 3, name: 'Wedding Planner' },
          { id: 4, name: 'Decor' },
          { id: 5, name: 'Dress Rental' },
          { id: 6, name: 'Photographer' },
          { id: 7, name: 'Venue' },
          { id: 8, name: 'Music & MC' }
        ]);
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
        setErrorMessage(language === 'vi' ? 'Vui lòng điền tên kế hoạch đám cưới!' : 'Please enter a wedding plan title!');
        return;
      }
      if (!weddingDay || !weddingMonth || !weddingYear || !weddingDate) {
        setErrorMessage(language === 'vi' ? 'Vui lòng chọn đầy đủ Ngày, Tháng và Năm tổ chức cưới!' : 'Please select Day, Month, and Year for your wedding!');
        return;
      }
      const chosen = new Date(Number(weddingYear), Number(weddingMonth) - 1, Number(weddingDay));
      chosen.setHours(0, 0, 0, 0);
      const minDate = getMinWeddingDate();

      if (chosen < minDate) {
        setErrorMessage(language === 'vi' 
          ? `Thời gian tổ chức tiệc cưới phải cách thời điểm hiện tại ít nhất 1 tháng (sớm nhất từ ngày ${minDateDisplay})!`
          : `Wedding date must be at least 1 month from today (earliest is ${minDateDisplay})!`);
        return;
      }
      if (!location.trim()) {
        setErrorMessage(language === 'vi' ? 'Vui lòng chọn Thành phố và Quốc gia tổ chức đám cưới!' : 'Please select wedding city and country!');
        return;
      }
      if (guestCount <= 0) {
        setErrorMessage(language === 'vi' ? 'Số lượng khách mời phải lớn hơn 0!' : 'Guest count must be greater than 0!');
        return;
      }
    }

    if (currentStep === 2) {
      if (budget <= 0) {
        setErrorMessage(language === 'vi' ? 'Tổng ngân sách dự kiến phải lớn hơn 0!' : 'Estimated budget must be greater than 0!');
        return;
      }
    }

    if (currentStep === 3) {
      if (selectedStyles.length === 0) {
        setErrorMessage(language === 'vi' ? 'Vui lòng chọn ít nhất một phong cách đám cưới bạn mong muốn!' : 'Please select at least one wedding style!');
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
      setErrorMessage(language === 'vi' ? 'Vui lòng chọn ít nhất một dịch vụ bạn muốn ưu tiên đầu tư!' : 'Please select at least one priority service!');
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
          refreshPlan();
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
  const generationTextsVi = [
    'Đang phân tích thông tin khảo sát và đề xuất phong cách...',
    'Đang tự động phân bổ ngân sách tối ưu theo hạng mục ưu tiên của bạn...',
    'Đang tự động thiết lập danh sách công việc cần chuẩn bị theo mốc thời gian...',
    'Đang xây dựng dòng thời gian chi tiết cho ngày cưới của bạn...',
    'Kế hoạch của bạn đã sẵn sàng! Đang tải bảng điều khiển...'
  ];
  const generationTextsEn = [
    'Analyzing survey details and matching wedding aesthetics...',
    'Optimizing budget allocation across your priority categories...',
    'Generating milestone checklist tasks adaptive to your timeline...',
    'Crafting chronological day-of wedding schedule...',
    'Your wedding blueprint is ready! Loading your dashboard...'
  ];
  const generationTexts = language === 'vi' ? generationTextsVi : generationTextsEn;

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
            <span className="text-sm text-muted-text font-display">
              {language === 'vi' ? 'Đang chuẩn bị khảo sát thông minh...' : 'Preparing smart wedding survey...'}
            </span>
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
                {language === 'vi' ? 'Đang tạo kế hoạch cưới thông minh của bạn' : 'Generating your smart wedding blueprint'}
              </h2>
              <p className="text-xs text-muted-text max-w-sm mx-auto uppercase tracking-widest font-semibold">
                {language === 'vi' ? 'Độc quyền bởi Planora AI' : 'Powered exclusively by Planora AI'}
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
                <span>{language === 'vi' ? 'Phân tích phong cách đám cưới' : 'Analyzing wedding aesthetic'}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${generationPhase >= 1 ? 'text-primary font-medium' : 'text-light-grey'}`}>
                <Check className={`w-3.5 h-3.5 ${generationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`} />
                <span>{language === 'vi' ? 'Thiết lập phân bổ ngân sách' : 'Setting up budget allocation'}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${generationPhase >= 2 ? 'text-primary font-medium' : 'text-light-grey'}`}>
                <Check className={`w-3.5 h-3.5 ${generationPhase >= 2 ? 'opacity-100' : 'opacity-0'}`} />
                <span>{language === 'vi' ? 'Sinh tự động checklist chuẩn bị' : 'Generating milestone checklist'}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${generationPhase >= 3 ? 'text-primary font-medium' : 'text-light-grey'}`}>
                <Check className={`w-3.5 h-3.5 ${generationPhase >= 3 ? 'opacity-100' : 'opacity-0'}`} />
                <span>{language === 'vi' ? 'Tạo dòng thời gian ngày cưới' : 'Building event schedule'}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Active Multi-step Survey form */
          <div className="space-y-5 sm:space-y-8">
            {/* Top Navigation Bar: Back to Home / Exit Survey */}
            <div className="w-full flex items-center justify-between animate-fade-in">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-cream bg-black/45 hover:bg-black/65 border border-cream/20 backdrop-blur-md transition-all shadow-sm cursor-pointer group active:scale-95 whitespace-nowrap"
                title={language === 'vi' ? 'Quay lại trang chính' : 'Return to main dashboard'}
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                <span>{language === 'vi' ? 'Quay lại trang chủ' : 'Back to Home'}</span>
              </button>

              <span className="hidden sm:inline text-xs text-white/80 italic drop-shadow-sm font-serif">
                {language === 'vi' ? 'Bạn có thể tiếp tục tạo kế hoạch bất cứ lúc nào' : 'You can resume your plan at any time'}
              </span>
            </div>

            {/* Step Indicators */}
            {currentStep <= 4 && (
            <div className="max-w-2xl mx-auto mb-6 mt-2 animate-fade-in bg-transparent px-2 sm:px-8">
              <div className="relative">
                {/* Horizontal line running behind all dots */}
                <div className="absolute left-[12%] right-[12%] top-[5px] h-[1px] bg-white/40" />
                
                <div className="flex justify-between items-start relative">
                  {[
                    { number: 1, label: language === 'vi' ? 'Thông tin' : 'Details' },
                    { number: 2, label: language === 'vi' ? 'Ngân sách' : 'Budget' },
                    { number: 3, label: language === 'vi' ? 'Phong cách' : 'Style' },
                    { number: 4, label: language === 'vi' ? 'Dịch vụ' : 'Services' }
                  ].map((step) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;
                    
                    return (
                      <div key={step.number} className="flex flex-col items-center z-10 w-[24%]">
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
                          className="text-[11px] sm:text-xs md:text-sm text-center text-white italic mt-2 transition-all duration-300 leading-tight block truncate max-w-full"
                          style={{ 
                            fontFamily: 'var(--font-serif)',
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
            <div className={`bg-[#FFFBF5] rounded-2xl border border-primary/10 shadow-md w-full mx-auto z-10 transition-all duration-500 ${
              currentStep === 4 ? 'p-5 sm:p-6' : 'p-5 sm:p-8'
            } ${
              currentStep === 3 ? 'max-w-[1240px]' : currentStep === 5 ? 'max-w-[840px]' : currentStep === 4 ? 'max-w-[1100px]' : 'max-w-[520px]'
            }`}>
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-8 py-2">
                  {/* Header */}
                  <div className="text-center space-y-1 mb-8">
                    <h2 
                      className="text-[28px] md:text-[32px] italic font-serif text-[#2C0600] font-normal leading-[40px]"
                    >
                      {language === 'vi' ? 'Bắt đầu với những thông tin cơ bản' : "Let's start with the essentials"}
                    </h2>
                    <p 
                      className="text-sm sm:text-base font-serif font-normal text-[#2C0600] leading-[40px]"
                    >
                      {language === 'vi' ? 'Hãy chia sẻ một chút về ngày trọng đại sắp tới của hai bạn.' : 'Tell us a bit about your upcoming wedding day.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Tên cặp đôi / Chủ nhân tiệc cưới */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pl-1">
                        <label className="block text-xs sm:text-sm font-bold text-primary tracking-wider">
                          {language === 'vi' ? 'Đám cưới của ai? (Tên cô dâu & chú rể) *' : 'Whose wedding is this? *'}
                        </label>
                        <span className="text-xs text-muted-text font-sans">
                          {language === 'vi' ? 'VD: Nam & Mai, hoặc tên bạn' : 'e.g. John & Jane'}
                        </span>
                      </div>
                      <div className="w-full h-14 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-5 transition-all">
                        <input
                          type="text"
                          value={coupleName}
                          onChange={(e) => setCoupleName(e.target.value)}
                          placeholder={
                            user?.fullName
                              ? user.fullName
                              : (language === 'vi' ? 'Nhập tên cô dâu & chú rể hoặc tên bạn...' : 'Enter couple names or your name...')
                          }
                          className="w-full bg-transparent border-none outline-none text-base sm:text-sm font-medium text-ink placeholder:text-ink/40 font-sans focus:ring-0 focus:outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-muted-text pl-2 italic">
                        {language === 'vi'
                          ? `Tên hiển thị: "${title}"`
                          : `Plan title: "${title}"`}
                      </p>
                    </div>

                    {/* Wedding Date Selector (Ngày / Tháng / Năm) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pl-1">
                        <label 
                          className="block text-xs sm:text-sm font-bold text-primary tracking-wider"
                        >
                          {language === 'vi' ? 'Ngày cưới dự kiến *' : 'Estimated Wedding Date *'}
                        </label>
                        <span className="text-xs text-muted-text font-sans">
                          {language === 'vi' ? 'Tối thiểu 1 tháng kể từ hôm nay' : 'At least 1 month from today'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {/* Ngày (Day) */}
                        <div className="space-y-1">
                          <span className="block text-xs font-semibold text-ink/70 pl-2">
                            {language === 'vi' ? 'Ngày' : 'Day'}
                          </span>
                          <div className="w-full h-14 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-4 transition-all relative">
                            <select
                              aria-label={language === 'vi' ? 'Chọn ngày tổ chức' : 'Select wedding day'}
                              className="w-full bg-transparent border-none outline-none text-base sm:text-sm font-medium text-ink font-sans cursor-pointer pr-6 focus:ring-0 focus:outline-none appearance-none"
                              value={weddingDay}
                              onChange={e => handleDayChange(e.target.value)}
                            >
                              <option value="" className="bg-[#FAF8F5] text-muted-text">
                                {language === 'vi' ? 'Ngày' : 'Day'}
                              </option>
                              {availableDays.map(d => (
                                <option key={d} value={d} className="bg-[#FAF8F5] text-ink">
                                  {language === 'vi' ? `Ngày ${d}` : `Day ${d}`}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-primary absolute right-4 pointer-events-none" />
                          </div>
                        </div>

                        {/* Tháng (Month) */}
                        <div className="space-y-1">
                          <span className="block text-xs font-semibold text-ink/70 pl-2">
                            {language === 'vi' ? 'Tháng' : 'Month'}
                          </span>
                          <div className="w-full h-14 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-4 transition-all relative">
                            <select
                              aria-label={language === 'vi' ? 'Chọn tháng tổ chức' : 'Select wedding month'}
                              className="w-full bg-transparent border-none outline-none text-base sm:text-sm font-medium text-ink font-sans cursor-pointer pr-6 focus:ring-0 focus:outline-none appearance-none"
                              value={weddingMonth}
                              onChange={e => handleMonthChange(e.target.value)}
                            >
                              <option value="" className="bg-[#FAF8F5] text-muted-text">
                                {language === 'vi' ? 'Tháng' : 'Month'}
                              </option>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m} className="bg-[#FAF8F5] text-ink">
                                  {language === 'vi' ? `Tháng ${m}` : `Month ${m}`}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-primary absolute right-4 pointer-events-none" />
                          </div>
                        </div>

                        {/* Năm (Year) */}
                        <div className="space-y-1">
                          <span className="block text-xs font-semibold text-ink/70 pl-2">
                            {language === 'vi' ? 'Năm' : 'Year'}
                          </span>
                          <div className="w-full h-14 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-4 transition-all relative">
                            <select
                              aria-label={language === 'vi' ? 'Chọn năm tổ chức' : 'Select wedding year'}
                              className="w-full bg-transparent border-none outline-none text-base sm:text-sm font-medium text-ink font-sans cursor-pointer pr-6 focus:ring-0 focus:outline-none appearance-none"
                              value={weddingYear}
                              onChange={e => handleYearChange(e.target.value)}
                            >
                              <option value="" className="bg-[#FAF8F5] text-muted-text">
                                {language === 'vi' ? 'Năm' : 'Year'}
                              </option>
                              {availableYears.map(y => (
                                <option key={y} value={y} className="bg-[#FAF8F5] text-ink">
                                  {language === 'vi' ? `Năm ${y}` : `Year ${y}`}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-primary absolute right-4 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Date Validation Alert / Confirmation Pill */}
                      {weddingDay && weddingMonth && weddingYear && (
                        <>
                          {isDateTooSoon ? (
                            <div className="p-3.5 bg-amber-50 border border-amber-300/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 mt-2.5">
                              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <p className="font-semibold text-amber-950">
                                  {language === 'vi' ? 'Ngày cưới phải cách hiện tại ít nhất 1 tháng' : 'Wedding date must be at least 1 month away'}
                                </p>
                                <p className="text-amber-800/90 leading-relaxed text-xs">
                                  {language === 'vi' ? (
                                    <>Để đảm bảo đủ thời gian chuẩn bị và đặt các nhà cung cấp (vendors), ngày cưới sớm nhất có thể chọn là từ ngày <strong>{minDateDisplay}</strong> trở đi.</>
                                  ) : (
                                    <>To ensure sufficient preparation time for booking vendors, the earliest wedding date you can select is from <strong>{minDateDisplay}</strong> onwards.</>
                                  )}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-primary/5 border border-primary/15 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-ink mt-2.5">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="font-medium text-primary">
                                  {language === 'vi' ? 'Ngày cưới đã chọn: ' : 'Selected wedding date: '}{String(weddingDay).padStart(2, '0')}/{String(weddingMonth).padStart(2, '0')}/{weddingYear}
                                </span>
                              </div>
                              {daysUntilWedding > 0 && (
                                <span className="px-2.5 py-0.5 bg-white rounded-full font-bold text-primary border border-primary/20 text-xs shadow-xs">
                                  {language === 'vi' ? `Còn ~${daysUntilWedding} ngày` : `~${daysUntilWedding} days left`}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Location Selector (Bấm chọn Quốc gia & Thành phố) */}
                    <div className="space-y-2">
                      <label 
                        className="block text-xs sm:text-sm font-bold text-primary tracking-wider pl-1"
                      >
                        {language === 'vi' ? 'Địa điểm tổ chức *' : 'Wedding Location *'}
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Quốc gia (Country) */}
                        <div className="space-y-1">
                          <span className="block text-xs font-semibold text-ink/70 pl-2">
                            {language === 'vi' ? 'Quốc gia' : 'Country'}
                          </span>
                          <div className="w-full h-14 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-4 transition-all relative">
                            <Globe className="w-4 h-4 text-primary absolute left-4 pointer-events-none" />
                            <select
                              aria-label={language === 'vi' ? 'Chọn quốc gia' : 'Select country'}
                              className="w-full bg-transparent border-none outline-none text-base sm:text-sm font-medium text-ink font-sans cursor-pointer pl-7 pr-6 focus:ring-0 focus:outline-none appearance-none"
                              value={selectedCountry}
                              onChange={e => handleCountryChange(e.target.value)}
                            >
                              {Object.keys(COUNTRIES_AND_CITIES).map(country => (
                                <option key={country} value={country} className="bg-[#FAF8F5] text-ink">
                                  {country}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-primary absolute right-4 pointer-events-none" />
                          </div>
                        </div>

                        {/* Thành phố (City) */}
                        <div className="space-y-1">
                          <span className="block text-xs font-semibold text-ink/70 pl-2">
                            {language === 'vi' ? 'Thành phố / Điểm đến' : 'City / Destination'}
                          </span>
                          <div className="w-full h-14 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-4 transition-all relative">
                            <MapPin className="w-4 h-4 text-primary absolute left-4 pointer-events-none" />
                            <select
                              aria-label={language === 'vi' ? 'Chọn thành phố' : 'Select city'}
                              className="w-full bg-transparent border-none outline-none text-base sm:text-sm font-medium text-ink font-sans cursor-pointer pl-7 pr-6 focus:ring-0 focus:outline-none appearance-none"
                              value={selectedCity}
                              onChange={e => handleCityChange(e.target.value)}
                            >
                              <option value="" className="bg-[#FAF8F5] text-muted-text">
                                {language === 'vi' ? '-- Chọn thành phố --' : '-- Select city --'}
                              </option>
                              {(COUNTRIES_AND_CITIES[selectedCountry] || ['Khác (Nhập tùy chỉnh)']).map(city => (
                                <option key={city} value={city} className="bg-[#FAF8F5] text-ink">
                                  {city}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-primary absolute right-4 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Custom City input if "Khác (Nhập tùy chỉnh)" or "Quốc gia khác" is selected */}
                      {(selectedCity.includes('Khác') || selectedCountry === 'Quốc gia khác') && (
                        <div className="pt-1.5 pl-1">
                          <div className="w-full h-12 rounded-full border border-primary/30 focus-within:border-primary/80 bg-transparent flex items-center px-5 transition-all">
                            <input
                              type="text"
                              placeholder={language === 'vi' ? 'Nhập tên thành phố / địa điểm cụ thể...' : 'Enter city or specific destination...'}
                              value={customCity}
                              onChange={e => handleCustomCityChange(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-sm text-ink font-sans placeholder:text-muted-text/60 focus:ring-0 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Pill xác nhận địa điểm đã chọn */}
                      {location && (
                        <div className="flex items-center gap-1.5 pl-2 pt-1 text-xs text-primary font-medium">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{language === 'vi' ? 'Địa điểm đã chọn: ' : 'Selected location: '}<strong className="text-primary">{location}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Estimated Guest Count Capsule */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label 
                          className="block text-xs sm:text-sm font-bold text-primary tracking-wider pl-1"
                        >
                          {language === 'vi' ? 'Số lượng khách mời dự kiến *' : 'Estimated Guest Count *'}
                        </label>
                        <div className="w-full h-14 rounded-full border border-primary/30 bg-transparent flex items-center justify-between px-6 transition-all focus-within:border-primary/80">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={guestCount ? guestCount.toLocaleString('en-US') : ''}
                            onChange={e => handleFormattedNumberChange(e, setGuestCount)}
                            className="w-full bg-transparent border-none outline-none text-sm sm:text-base font-medium text-ink font-sans focus:ring-0 focus:outline-none"
                            placeholder={language === 'vi' ? 'Ví dụ: 150' : 'e.g., 150'}
                          />
                          <span className="text-sm font-sans text-muted-text italic ml-2">
                            {language === 'vi' ? 'khách' : 'guests'}
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
                            <span className="absolute left-0 text-xs font-sans text-primary/60">50</span>
                            <span className="absolute right-0 text-xs font-sans text-primary/60">500+</span>
                          </div>
                        </div>
                      </div>

                      {/* Live Logistics Analysis Pill */}
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/15 flex items-center justify-between text-xs mt-2 transition-all">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-ink font-medium">
                            {language === 'vi' ? 'Ước tính quy mô bàn tiệc:' : 'Estimated banquet tables:'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 bg-white rounded-full font-bold text-primary shadow-xs border border-primary/20 text-xs">
                            {language === 'vi' ? `~${liveInsights.tables} bàn` : `~${liveInsights.tables} tables`}
                          </span>
                          <span className="text-[11px] text-muted-text hidden sm:inline">
                            {language === 'vi' ? '(10 khách/bàn + 1 dự phòng)' : '(10 guests/table + 1 backup)'}
                          </span>
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
                      className="text-[28px] md:text-[32px] italic font-serif text-[#2C0600] font-normal leading-[40px]"
                    >
                      {language === 'vi' ? 'Ngân sách dự kiến của bạn là bao nhiêu?' : 'What is your estimated budget?'}
                    </h2>
                    <p 
                      className="text-sm sm:text-base font-serif font-normal text-[#2C0600] leading-[40px]"
                    >
                      {language === 'vi' ? 'Planora AI sẽ tự động phân bổ ngân sách chi tiết cho bạn.' : 'Planora AI will automatically allocate it for you.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Budget Input Capsule */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="budget" 
                        className="block text-xs sm:text-sm font-bold text-primary tracking-wider pl-1"
                      >
                        {language === 'vi' ? 'Tổng ngân sách dự toán *' : 'Total Budget *'}
                      </label>
                      <div className="w-full h-14 rounded-full border border-primary/30 bg-transparent flex items-center justify-between px-6 transition-all focus-within:border-primary/80">
                        <div className="flex items-center w-full">
                          <span className="text-sm font-sans text-muted-text mr-1.5">₫</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            id="budget"
                            value={budget ? budget.toLocaleString('en-US') : ''}
                            onChange={e => handleFormattedNumberChange(e, setBudget)}
                            className="w-full bg-transparent border-none outline-none text-sm sm:text-base font-bold font-mono text-ink font-sans focus:ring-0 focus:outline-none"
                            placeholder={language === 'vi' ? 'Ví dụ: 200,000,000' : 'e.g., 200,000,000'}
                          />
                        </div>
                        <span className="text-sm font-sans text-muted-text italic ml-2">
                          VND
                        </span>
                      </div>
                      <p className="text-xs text-muted-text italic pl-1">
                        {language === 'vi' 
                          ? `Mức phân bổ đề xuất: ${(budget || 0).toLocaleString('en-US')} VND`
                          : `Suggested budget allocation: ${(budget || 0).toLocaleString('en-US')} VND`}
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
                          <span className="absolute left-0 text-[10px] sm:text-[11px] font-sans text-primary/60">
                            {language === 'vi' ? '50 Triệu' : '50M VND'}
                          </span>
                          <span className="absolute right-0 text-[10px] sm:text-[11px] font-sans text-primary/60">
                            {language === 'vi' ? '1 Tỷ+' : '1B+ VND'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Smart Budget Insights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col gap-1 shadow-xs">
                        <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          <span>{language === 'vi' ? 'Chi phí Tiệc cưới & Đồ uống (~50%)' : 'Banquet & Beverage (~50%)'}</span>
                        </div>
                        <span className="text-sm font-bold text-ink">{formatVND(liveInsights.banquetEstimated)}</span>
                        <span className="text-[10px] text-muted-text">
                          ~{formatVND(liveInsights.costPerTable)} / {language === 'vi' ? 'bàn' : 'table'} ({liveInsights.venueTier})
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex flex-col gap-1 shadow-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'vi' ? 'Quỹ dự phòng an toàn (4%)' : 'Contingency Fund (4%)'}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{formatVND(liveInsights.contingencyFund)}</span>
                        <span className="text-[10px] text-emerald-600/80">
                          {language === 'vi' ? 'Phòng ngừa chi phí phát sinh ngày lễ' : 'Buffer for unforeseen day-of expenses'}
                        </span>
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
                        <span>{language === 'vi' ? 'Bước 3 / 4 • Phong cách tiệc cưới' : 'Step 3 of 4 • Wedding Style'}</span>
                      </div>
                      <h2 
                        className="text-[26px] sm:text-[30px] italic leading-tight font-serif text-[#2C0600] font-normal"
                      >
                        {language === 'vi' ? 'Chọn phong cách cưới mơ ước' : 'Pick your dream wedding style'}
                      </h2>
                      <p className="text-xs text-muted-text max-w-lg font-sans">
                        {language === 'vi' 
                          ? 'Khám phá không gian thực tế và chọn phong cách bạn yêu thích (có thể chọn nhiều phong cách).' 
                          : 'Explore real aesthetics and select styles you love (multiple selections allowed).'}
                      </p>
                    </div>

                    {/* Status Pill on the Right */}
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-primary/20 shadow-xs">
                      <span className="text-xs text-body-text font-medium">
                        {selectedStyles.length > 0 ? (
                          <>
                            {language === 'vi' ? 'Đã chọn: ' : 'Selected: '}
                            <strong className="text-primary">{selectedStyles.length}</strong>{' '}
                            {language === 'vi' ? 'phong cách' : 'styles'}
                          </>
                        ) : (
                          <span className="text-muted-text italic">
                            {language === 'vi' ? 'Chưa chọn phong cách nào' : 'No style selected'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Ribbon Banner: NOW CHOOSE YOUR STYLE */}
                  <div className="flex items-center justify-between px-5 py-2.5 rounded-full bg-primary text-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                      <span className="text-xs sm:text-sm font-bold tracking-wider uppercase font-display">
                        {language === 'vi' ? 'CHỌN PHONG CÁCH TIỆC CƯỚI' : 'NOW CHOOSE YOUR STYLE'}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/85 italic hidden sm:inline">
                      {language === 'vi' 
                        ? 'Bấm vào từng thẻ để chọn phong cách • Bấm "Xem ảnh" để ngắm không gian chi tiết' 
                        : 'Click any card to select • Click "View photos" to inspect aesthetic galleries'}
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
                              <span>{language === 'vi' ? `Xem ${style.gallery.length} ảnh` : `View ${style.gallery.length} photos`}</span>
                            </button>
                          </div>

                          {/* Card Body */}
                          <div className="p-3 bg-white flex-1 flex flex-col justify-between text-center border-t border-hairline/60">
                            <div>
                              <h3 
                                className="text-sm font-bold text-ink font-serif"
                              >
                                {style.tag}
                              </h3>
                              <p className="text-[10px] text-muted-text truncate mt-0.5">
                                {language === 'vi' ? style.vietnameseTitle : style.name}
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
                              {isSelected 
                                ? (language === 'vi' ? '✓ Đã chọn' : '✓ Selected') 
                                : (language === 'vi' ? '+ Chọn phong cách' : '+ Select style')}
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
                            {language === 'vi' ? 'Đã chọn ' : 'Selected '}
                            <strong>{selectedStyles.length} {language === 'vi' ? 'phong cách' : 'styles'}</strong>:{' '}
                            <span className="text-primary font-semibold">
                              {displayStyles
                                .filter(s => selectedStyles.includes(s.id))
                                .map(s => s.tag)
                                .join(', ')}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-text italic">
                            {language === 'vi' 
                              ? 'Chưa chọn phong cách nào. Bấm vào thẻ phía trên để lựa chọn phong cách bạn yêu thích.' 
                              : 'No styles selected yet. Click the cards above to choose your favorite styles.'}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-text italic">
                      {language === 'vi' 
                        ? 'Planora AI sẽ phối hợp các phong cách bạn đã chọn để tạo bản thiết kế độc bản' 
                        : 'Planora AI will blend your selected aesthetics into a bespoke concept'}
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 4: Priority Services */}
              {currentStep === 4 && (
                <div className="space-y-4 py-1 animate-fade-in">
                  {/* Unified Header matching Step 1, 2, 3, 5 */}
                  <div className="text-center space-y-1.5 mb-3.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-[11px] font-medium tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>{language === 'vi' ? 'Bước 4 / 4 • Dịch vụ ưu tiên' : 'Step 4 of 4 • Priority Services'}</span>
                    </div>
                    <h2 
                      className="text-[24px] md:text-[28px] italic leading-tight font-serif text-[#2C0600] font-normal"
                    >
                      {language === 'vi' ? 'Dịch vụ bạn muốn ưu tiên' : 'Select your priority services'}
                    </h2>
                    <p 
                      className="text-xs sm:text-sm font-normal text-muted-text max-w-2xl mx-auto font-serif text-[#2C0600] leading-[20px]"
                    >
                      {language === 'vi' 
                        ? 'Chọn các dịch vụ bạn muốn ưu tiên đặc biệt. Planora AI sẽ tự động phân bổ thêm ngân sách cho các hạng mục này.' 
                        : 'Select services you wish to prioritize. Planora AI will boost budget allocation for these essential categories.'}
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Grid 2x4: 2 rows x 4 columns on md+ screens, expanding horizontally */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-0.5">
                      {availableCategories.map(category => {
                        const isSelected = selectedCategories.includes(category.id);
                        const { title, desc, IconComponent } = getCategoryDetails(category.name, language);

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              toggleCategory(category.id);
                              setErrorMessage(null);
                            }}
                            className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between gap-2 cursor-pointer select-none ${
                              isSelected
                                ? 'bg-primary/5 border-primary shadow-md ring-2 ring-primary/15 scale-[1.01]'
                                : 'bg-white border-primary/15 hover:border-primary/45 hover:bg-white hover:shadow-xs hover:scale-[1.005]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div
                                className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'bg-primary/10 text-primary'
                                }`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-primary border-primary text-white scale-110 shadow-2xs'
                                    : 'border-primary/30 bg-transparent'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <span
                                className={`block text-[13px] sm:text-sm font-bold tracking-tight truncate transition-colors ${
                                  isSelected ? 'text-primary' : 'text-neutral-900'
                                }`}
                              >
                                {title}
                              </span>
                              <span className="block text-[10.5px] sm:text-[11px] text-neutral-500 font-normal truncate mt-0.5">
                                {desc}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-primary/10 flex items-center justify-between">
                              <span
                                className={`text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider ${
                                  isSelected ? 'text-primary' : 'text-neutral-400'
                                }`}
                              >
                                {isSelected
                                  ? (language === 'vi' ? '✦ Ưu tiên +25%' : '✦ Boosted +25%')
                                  : (language === 'vi' ? 'Tiêu chuẩn' : 'Standard')}
                              </span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Priority Impact Notification Box */}
                    {selectedCategories.length > 0 ? (
                      <div className="p-3 sm:p-3.5 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-3 text-xs text-primary leading-relaxed shadow-xs animate-fade-in">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                          <span className="font-bold text-xs sm:text-sm text-primary whitespace-nowrap">
                            {language === 'vi' ? `Đã chọn ${selectedCategories.length} dịch vụ ưu tiên:` : `Selected ${selectedCategories.length} priority services:`}
                          </span>
                          <span className="text-body-text text-xs leading-normal">
                            {language === 'vi' ? (
                              <>Được tự động tăng <strong>+25% ngân sách</strong> để bạn chọn nhà cung cấp cao cấp nhất.</>
                            ) : (
                              <>Automatically receive a <strong>+25% budget boost</strong> for top-tier vendors.</>
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800 leading-relaxed shadow-xs">
                        <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-amber-600" />
                        <span>
                          {language === 'vi' 
                            ? 'Hãy chọn ít nhất 1 dịch vụ bạn mong muốn đầu tư nhiều nhất để thuật toán tối ưu phân bổ.' 
                            : 'Please select at least 1 priority service to help the algorithm optimize your allocation.'}
                        </span>
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
                      className="text-[26px] md:text-[32px] italic text-[#2C0600] font-serif font-normal leading-[38px]"
                    >
                      {language === 'vi' ? 'Bản Kế Hoạch Cưới Chuẩn Mực' : 'Master Wedding Blueprint'}
                    </h2>
                    <p 
                      className="text-xs sm:text-sm font-normal text-muted-text max-w-lg mx-auto font-serif leading-[22px]"
                    >
                      {language === 'vi' 
                        ? 'Bản kế hoạch cưới chi tiết được cá nhân hóa tự động theo ngân sách, quy mô bàn tiệc và phong cách của hai bạn.' 
                        : 'Your personalized master plan generated automatically according to your budget, guest count, and styles.'}
                    </p>
                  </div>

                  {/* 4 Core KPI Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        {language === 'vi' ? 'Tổng dự toán' : 'Total Budget'}
                      </span>
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        {language === 'vi' ? 'Quy mô tiệc' : 'Guest Count'}
                      </span>
                      <div className="mt-1">
                        <span className="text-sm sm:text-base font-bold text-ink block leading-tight">
                          {guestCount.toLocaleString('en-US')} {language === 'vi' ? 'khách' : 'guests'}
                        </span>
                        <span className="text-[10px] text-primary font-medium mt-0.5 block">
                          ~{liveInsights.tables} {language === 'vi' ? 'bàn tiệc' : 'tables'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        {language === 'vi' ? 'Lộ trình Checklist' : 'Checklist Tasks'}
                      </span>
                      <div className="mt-1">
                        <span className="text-sm sm:text-base font-bold text-ink block leading-tight">
                          {generatedPlan?.checklistTasks?.length || 24} {language === 'vi' ? 'công việc' : 'tasks'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                          {language === 'vi' ? '6 giai đoạn thích ứng' : '6 adaptive phases'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-primary/15 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        {language === 'vi' ? 'Kịch bản ngày cưới' : 'Day-of Timeline'}
                      </span>
                      <div className="mt-1">
                        <span className="text-sm sm:text-base font-bold text-ink block leading-tight">
                          {generatedPlan?.timelineEvents?.length || 10} {language === 'vi' ? 'sự kiện' : 'events'}
                        </span>
                        <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
                          {language === 'vi' ? 'Gia tiên & Đãi tiệc' : 'Ceremony & Banquet'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blueprint Navigation Tabs */}
                  <div className="flex border-b border-hairline gap-1 overflow-x-auto pb-1 dashboard-scroll">
                    {(
                      [
                        { id: 'budget', label: language === 'vi' ? '💰 Ngân sách 10 hạng mục' : '💰 Budget Breakdown', icon: PieChart },
                        { id: 'checklist', label: language === 'vi' ? '📋 Checklist 6 giai đoạn' : '📋 Adaptive Checklist', icon: ListTodo },
                        { id: 'timeline', label: language === 'vi' ? '⏱️ Kịch bản ngày cưới' : '⏱️ Day-of Timeline', icon: Clock },
                        { id: 'concept', label: language === 'vi' ? '🎨 Concept & Bảng màu' : '🎨 Concept & Palette', icon: Palette }
                      ] as const
                    ).map(tab => {
                      const isActive = blueprintTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setBlueprintTab(tab.id)}
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
                            {language === 'vi' ? 'Tiệc & Đồ uống (~50%):' : 'Banquet & Drinks (~50%):'} <strong>{formatVND(liveInsights.banquetEstimated)}</strong> (~{formatVND(liveInsights.costPerTable)}/{language === 'vi' ? 'bàn' : 'table'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-emerald-700" />
                          <span className="text-emerald-800 font-medium">
                            {language === 'vi' ? 'Quỹ dự phòng an toàn (4%):' : 'Contingency Fund (4%):'} <strong>{formatVND(liveInsights.contingencyFund)}</strong>
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
                                        {language === 'vi' ? 'Ưu tiên +25%' : 'Priority +25%'}
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
                            {language === 'vi' ? 'Không có dữ liệu phân bổ ngân sách.' : 'No budget data available.'}
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
                          {language === 'vi' 
                            ? 'Thuật toán đã tự động tính toán và co giãn thời hạn các mốc công việc theo ngày cưới của bạn để bạn không bị quá tải.' 
                            : 'The algorithm has automatically scheduled task deadlines relative to your wedding date to keep planning stress-free.'}
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
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : (language === 'vi' ? 'Theo lộ trình' : 'On schedule')}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-muted-text italic">
                            {language === 'vi' ? 'Không có công việc nào trong danh sách.' : 'No tasks in the checklist.'}
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
                          {language === 'vi' ? (
                            <>Kịch bản bao gồm đầy đủ 2 phần quan trọng nhất của đám cưới Việt: <strong>Nghi lễ Gia Tiên (Sáng)</strong> và <strong>Tiệc Cưới Đãi Khách (Tối)</strong>.</>
                          ) : (
                            <>The schedule comprehensively covers both key ceremonies: <strong>Traditional Morning Rituals</strong> and <strong>Evening Wedding Banquet</strong>.</>
                          )}
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
                            {language === 'vi' ? 'Không có mốc sự kiện nào trong kịch bản.' : 'No events in the schedule.'}
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
                                  {language === 'vi' ? 'Bảng màu chủ đạo (Color Palette)' : 'Color Palette'}
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
                                    {language === 'vi' ? '🌸 Hoa tươi trang trí:' : '🌸 Floral Aesthetic:'}
                                  </span>
                                  <span className="text-[11px] text-body-text">{concept.floralTheme}</span>
                                </div>
                              )}
                              {concept.decorNote && (
                                <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                                  <span className="font-bold text-primary block mb-0.5 text-[11px]">
                                    {language === 'vi' ? '✨ Gợi ý không gian:' : '✨ Decor & Ambience:'}
                                  </span>
                                  <span className="text-[11px] text-body-text">{concept.decorNote}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-muted-text italic">
                          {language === 'vi' ? 'Không có phong cách đề xuất nào.' : 'No concept suggestions available.'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary General Info Footnote */}
                  <div className="p-3 bg-white/60 rounded-xl border border-primary/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-text">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      <span>{language === 'vi' ? 'Ngày cưới: ' : 'Wedding Date: '}<strong>{weddingDate ? new Date(weddingDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : (language === 'vi' ? 'Chưa định ngày' : 'Not set')}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-text">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{language === 'vi' ? 'Địa điểm: ' : 'Location: '}<strong>{location || (language === 'vi' ? 'Chưa định địa điểm' : 'Not set')}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-text">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>{language === 'vi' ? 'Khách mời: ' : 'Guests: '}<strong>{guestCount.toLocaleString('en-US')} {language === 'vi' ? 'người' : 'guests'} (~{liveInsights.tables} {language === 'vi' ? 'bàn' : 'tables'})</strong></span>
                    </div>
                  </div>
                </div>
              )}

                            {/* Form Navigation Controls */}
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-hairline gap-3">
                {currentStep > 1 && currentStep <= 4 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 border border-primary/30 text-primary hover:bg-primary/5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Quay lại' : 'Back'}</span>
                  </button>
                ) : currentStep === 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 border border-primary/30 text-primary hover:bg-primary/5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Tùy chỉnh lại' : 'Re-customize'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 border border-neutral-300 text-neutral-600 hover:text-primary hover:border-primary/40 hover:bg-primary/5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Quay lại' : 'Back'}</span>
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-7 py-2.5 bg-primary hover:bg-primary-active text-white rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {language === 'vi' ? 'Tiếp tục' : 'Continue'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : currentStep === 4 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-7 py-2.5 bg-primary hover:bg-primary-active text-white rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm font-display tracking-wider uppercase cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-cream" />
                    {language === 'vi' ? 'Tạo kế hoạch tự động' : 'Generate Blueprint'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      await refreshPlan();
                      router.replace('/');
                    }}
                    className="px-7 py-2.5 bg-primary hover:bg-primary-active text-white rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm uppercase tracking-wider cursor-pointer"
                  >
                    {language === 'vi' ? 'Xác nhận & Vào Dashboard' : 'Confirm & Open Dashboard'}
                    <ChevronRight className="w-4 h-4" />
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
                    className="text-lg sm:text-xl font-bold text-ink font-serif"
                  >
                    {language === 'vi' ? galleryStyle.vietnameseTitle : galleryStyle.name}
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
                    {language === 'vi' ? 'Bảng màu chủ đạo đề xuất:' : 'Recommended Color Palette:'}
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
                {language === 'vi' ? 'Đóng' : 'Close'}
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
                    {language === 'vi' ? 'Đã chọn phong cách này (Bấm để hủy)' : 'Selected this style (Click to unselect)'}
                  </>
                ) : (
                  <>
                    {language === 'vi' ? '+ Chọn phong cách này' : '+ Select this style'}
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