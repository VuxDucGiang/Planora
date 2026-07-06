'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan, getServiceCategories, getWeddingStyles } from '@/services/weddingPlan';
import { 
  getVendors, 
  getVendorDetail, 
  getShortlist, 
  addToShortlist, 
  removeFromShortlist, 
  getMatches 
} from '@/services/vendor';
import type { 
  VendorResponse, 
  VendorDetailResponse, 
  VendorMatchResponse 
} from '@/types/vendor';
import type { ServiceCategory, WeddingStyle } from '@/types/weddingPlan';
import { 
  Search, 
  Filter, 
  Heart, 
  Star, 
  Award, 
  Briefcase, 
  MapPin, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  ArrowLeft,
  X,
  FileImage,
  Coins,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import Link from 'next/link';

type ActiveTab = 'ALL' | 'MATCHES' | 'SHORTLIST';

export default function Marketplace() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Authentication & Plan State
  const [planId, setPlanId] = useState<number | null>(null);

  // Tabs & Lists States
  const [activeTab, setActiveTab] = useState<ActiveTab>('ALL');
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [matches, setMatches] = useState<VendorMatchResponse[]>([]);
  const [shortlist, setShortlist] = useState<VendorResponse[]>([]);
  const [shortlistIds, setShortlistIds] = useState<Set<number>>(new Set());

  // Filter Categories & Styles Metadata
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [styles, setStyles] = useState<WeddingStyle[]>([]);

  // Filter Values
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [selectedCity, setSelectedCity] = useState<string | 'ALL'>('ALL');
  const [selectedStyle, setSelectedStyle] = useState<number | 'ALL'>('ALL');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Detail Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [vendorDetail, setVendorDetail] = useState<VendorDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Global Loading & Message States
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Submission
  const [isTogglingShortlist, setIsTogglingShortlist] = useState<number | null>(null);

  // Check login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Initial Metadata and Active Plan
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [activePlan, cats, stys] = await Promise.all([
          getActivePlan(),
          getServiceCategories(),
          getWeddingStyles()
        ]);

        setCategories(cats);
        setStyles(stys);

        if (activePlan) {
          setPlanId(activePlan.id);
          // Initial loads for shortlisted items to highlight hearts
          const savedList = await getShortlist(activePlan.id);
          setShortlist(savedList);
          setShortlistIds(new Set(savedList.map(v => v.id)));
        } else {
          router.replace('/');
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu ban đầu:', err);
        setErrorMessage('Không thể tải dữ liệu thị trường dịch vụ cưới.');
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [isAuthenticated, router]);

  // Core loading trigger depending on Tab and Filter changes
  useEffect(() => {
    const currentPlanId = planId;
    if (!isAuthenticated || !currentPlanId) return;

    async function fetchTabData() {
      if (!currentPlanId) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        if (activeTab === 'ALL') {
          const res = await getVendors({
            query: searchQuery.trim() || undefined,
            categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
            city: selectedCity === 'ALL' ? undefined : selectedCity,
            styleId: selectedStyle === 'ALL' ? undefined : selectedStyle,
            priceFrom: priceFrom ? parseFloat(priceFrom) : undefined,
            priceTo: priceTo ? parseFloat(priceTo) : undefined,
            page: currentPage,
            size: 9
          });
          setVendors(res.content);
          setTotalPages(res.totalPages);
          setTotalElements(res.totalElements);
        } else if (activeTab === 'MATCHES') {
          const res = await getMatches(currentPlanId);
          setMatches(res);
        } else if (activeTab === 'SHORTLIST') {
          const res = await getShortlist(currentPlanId);
          setShortlist(res);
          setShortlistIds(new Set(res.map(v => v.id)));
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách:', err);
        setErrorMessage('Tải danh sách nhà cung cấp thất bại. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTabData();
  }, [
    activeTab, 
    planId, 
    currentPage, 
    selectedCategory, 
    selectedCity, 
    selectedStyle, 
    priceFrom, 
    priceTo,
    searchQuery,
    isAuthenticated
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
        setErrorMessage('Không thể tải thông tin chi tiết nhà cung cấp.');
      } finally {
        setIsLoadingDetail(false);
      }
    }

    loadDetail();
  }, [selectedVendorId]);

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

  // Format currency VND
  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Trigger search manual submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
  };

  // Toggle Shortlist Action
  const handleToggleShortlist = async (e: React.MouseEvent, vendorId: number) => {
    e.stopPropagation(); // Avoid opening detail modal
    if (!planId) return;

    setIsTogglingShortlist(vendorId);
    const isSaved = shortlistIds.has(vendorId);

    try {
      if (isSaved) {
        await removeFromShortlist(planId, vendorId);
        setShortlistIds(prev => {
          const next = new Set(prev);
          next.delete(vendorId);
          return next;
        });
        setShortlist(prev => prev.filter(v => v.id !== vendorId));
        setSuccessMessage('Đã xoá khỏi danh sách yêu thích!');
      } else {
        await addToShortlist(planId, vendorId);
        setShortlistIds(prev => {
          const next = new Set(prev);
          next.add(vendorId);
          return next;
        });
        setSuccessMessage('Đã lưu vào danh sách yêu thích!');
      }
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      console.error('Lỗi lưu shortlist:', err);
      setErrorMessage('Thao tác thất bại. Vui lòng thử lại!');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsTogglingShortlist(null);
    }
  };

  // Open detail page
  const handleOpenDetail = (id: number) => {
    router.push(`/marketplace/${id}`);
  };

  // Close detail popup
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

  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <div key={i} className="relative inline-block w-3.5 h-3.5">
            <Star className="w-3.5 h-3.5 text-slate-300 absolute top-0 left-0" />
            <div className="w-[50%] overflow-hidden absolute top-0 left-0">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-slate-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col relative w-full overflow-hidden">
      <DashboardHeader logout={logout} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col justify-start">
        
        {/* Header Breadcrumbs & Search Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link 
              href="/marketplace" 
              className="bg-primary text-cream text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 rounded-sm hover:bg-primary-active transition-all"
            >
              Marketplace &gt; All Wedding Vendors
            </Link>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-[280px]">
            <input
              type="text"
              placeholder="Search vendor name..."
              className="w-full bg-white border border-hairline rounded-full pl-5 pr-10 py-2.5 text-xs focus:outline-none focus:border-primary text-ink shadow-sm placeholder:text-muted-text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3.5 top-3 text-muted-text hover:text-primary transition-colors">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink font-display">
            Explore Top Wedding Vendors
          </h2>
        </div>

        {/* System Messages */}
        {errorMessage && (
          <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-sm flex items-start gap-3 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-hairline mb-8">
          <button
            onClick={() => { setActiveTab('ALL'); setCurrentPage(0); }}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'ALL' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-text hover:text-ink'
            }`}
          >
            Tất cả nhà cung cấp
          </button>
          <button
            onClick={() => { setActiveTab('MATCHES'); setCurrentPage(0); }}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'MATCHES' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-text hover:text-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gợi ý phù hợp
          </button>
          <button
            onClick={() => { setActiveTab('SHORTLIST'); setCurrentPage(0); }}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'SHORTLIST' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-text hover:text-ink'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Đã lưu ({shortlistIds.size})
          </button>
        </div>

        {/* Main Grid: Filters on Left, Vendors in Red Box on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left: Filter Panel */}
          <div className="space-y-6 lg:col-span-1 bg-white border border-hairline rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Filter By</h3>
              <button 
                type="button" 
                onClick={handleClearAllFilters}
                className="text-[10px] font-semibold text-primary hover:underline uppercase tracking-wider"
              >
                [Clear All]
              </button>
            </div>

            {/* Category Section */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider">Category</h4>
              <div className="flex flex-col gap-2">
                {categories.map(cat => {
                  const count = getMockCount(cat.name);
                  return (
                    <label key={cat.id} className="flex items-center justify-between text-xs text-body-text cursor-pointer hover:text-ink select-none">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(selectedCategory === cat.id ? 'ALL' : cat.id)}
                          className="rounded-xs border-hairline text-primary focus:ring-primary w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-text font-medium">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider">Pricing (VND)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full bg-canvas border border-hairline rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-ink font-mono text-center"
                  value={priceFrom}
                  onChange={e => setPriceFrom(e.target.value)}
                />
                <span className="text-muted-text text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full bg-canvas border border-hairline rounded-sm px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-ink font-mono text-center"
                  value={priceTo}
                  onChange={e => setPriceTo(e.target.value)}
                />
              </div>
            </div>

            {/* Wedding Style Section */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider">Wedding Style</h4>
              <div className="flex flex-col gap-2">
                {styles.map(sty => {
                  const count = getMockCount(sty.name + "style");
                  return (
                    <label key={sty.id} className="flex items-center justify-between text-xs text-body-text cursor-pointer hover:text-ink select-none">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedStyle === sty.id}
                          onChange={() => setSelectedStyle(selectedStyle === sty.id ? 'ALL' : sty.id)}
                          className="rounded-xs border-hairline text-primary focus:ring-primary w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                        <span>{sty.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-text font-medium">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider">Location</h4>
              <div className="flex flex-col gap-2">
                {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt', 'Nha Trang'].map(city => {
                  const count = getMockCount(city + "city");
                  return (
                    <label key={city} className="flex items-center justify-between text-xs text-body-text cursor-pointer hover:text-ink select-none">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCity === city}
                          onChange={() => setSelectedCity(selectedCity === city ? 'ALL' : city)}
                          className="rounded-xs border-hairline text-primary focus:ring-primary w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                        <span>{city}</span>
                      </div>
                      <span className="text-[10px] text-muted-text font-medium">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Red Box with Vendor Cards */}
          <div className="lg:col-span-3">
            <div 
              className="relative bg-primary rounded-3xl p-6 md:p-8 pl-10 md:pl-14 shadow-xl overflow-hidden min-h-[600px] flex flex-col justify-between"
            >
              {/* Lace SVG Border on the left */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-8 opacity-90"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='40' viewBox='0 0 20 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='2' y1='0' x2='2' y2='40' stroke='%23FFFBF5' stroke-width='1' stroke-dasharray='2 2' opacity='0.3'/%3E%3Cpath d='M2,5 C10,5 18,13 18,20 C18,27 10,35 2,35' stroke='%23FFFBF5' stroke-width='1.5' fill='none'/%3E%3Cpath d='M2,10 C7,10 13,15 13,20 C13,25 7,30 2,30' stroke='%23FFFBF5' stroke-width='1' fill='none' opacity='0.7'/%3E%3Ccircle cx='18' cy='20' r='1.5' fill='%23FFFBF5'/%3E%3Ccircle cx='13' cy='12' r='1' fill='%23FFFBF5'/%3E%3Ccircle cx='13' cy='28' r='1' fill='%23FFFBF5'/%3E%3Cpath d='M2,0 C4,1 4,4 2,5' stroke='%23FFFBF5' stroke-width='1' fill='none'/%3E%3Cpath d='M2,35 C4,36 4,39 2,40' stroke='%23FFFBF5' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat-y',
                  backgroundSize: '20px 40px'
                }}
              ></div>

              {/* Grid Header inside Red Box */}
              <div className="flex justify-between items-center text-cream mb-6 text-xs border-b border-cream/10 pb-4">
                <span className="italic font-light">
                  {activeTab === 'ALL' && `Showing ${vendors.length > 0 ? currentPage * 9 + 1 : 0}-${Math.min((currentPage + 1) * 9, totalElements)} of ${totalElements} trusted vendors`}
                  {activeTab === 'MATCHES' && `Showing ${matches.length} matched vendors`}
                  {activeTab === 'SHORTLIST' && `Showing ${shortlist.length} shortlisted vendors`}
                </span>
                <span className="font-semibold cursor-pointer hover:underline uppercase tracking-wider text-[10px]">
                  [ Sort: Featured ▾ ]
                </span>
              </div>

              {/* Loader or Grid Content */}
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-cream">
                  <Loader2 className="w-8 h-8 animate-spin text-gold" />
                  <span className="text-xs uppercase tracking-wider text-cream/70">Loading Vendors...</span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between gap-8">
                  {/* Grid items */}
                  {activeTab === 'ALL' && (
                    <>
                      {vendors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {vendors.map(v => (
                            <VendorCard 
                              key={v.id} 
                              vendor={v} 
                              isSaved={shortlistIds.has(v.id)}
                              isToggling={isTogglingShortlist === v.id}
                              onToggleShortlist={(e) => handleToggleShortlist(e, v.id)}
                              onOpenDetail={() => handleOpenDetail(v.id)}
                              renderStars={renderStars}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="No vendors match your criteria. Try adjusting or resetting filters." />
                      )}
                    </>
                  )}

                  {activeTab === 'MATCHES' && (
                    <>
                      {matches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {matches.map(m => (
                            <div key={m.id} className="relative group">
                              <div className="absolute top-2 left-2 z-10 bg-gold text-primary text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-primary fill-primary" /> {Math.round(m.matchingScore * 100)}% Match
                              </div>
                              <VendorCard 
                                vendor={m.vendor} 
                                isSaved={shortlistIds.has(m.vendor.id)}
                                isToggling={isTogglingShortlist === m.vendor.id}
                                onToggleShortlist={(e) => handleToggleShortlist(e, m.vendor.id)}
                                onOpenDetail={() => handleOpenDetail(m.vendor.id)}
                                renderStars={renderStars}
                                reason={m.reason}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="No suggestions available. Please complete your budget or wedding style settings to get matched recommendations." />
                      )}
                    </>
                  )}

                  {activeTab === 'SHORTLIST' && (
                    <>
                      {shortlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {shortlist.map(v => (
                            <VendorCard 
                              key={v.id} 
                              vendor={v} 
                              isSaved={true}
                              isToggling={isTogglingShortlist === v.id}
                              onToggleShortlist={(e) => handleToggleShortlist(e, v.id)}
                              onOpenDetail={() => handleOpenDetail(v.id)}
                              renderStars={renderStars}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="Your shortlist is empty. Save your favorite vendors by clicking the heart button!" />
                      )}
                    </>
                  )}

                  {/* Pagination Dots at Bottom */}
                  {activeTab === 'ALL' && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6 mt-4">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            currentPage === idx 
                              ? 'bg-cream scale-125' 
                              : 'bg-cream/40 hover:bg-cream/70'
                          }`}
                          title={`Page ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Vendor Profile Detail Modal Popup */}
      {isModalOpen && selectedVendorId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-lg w-full max-w-2xl p-6 shadow-xl animate-scale-up space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-hairline pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-ink font-display">
                    {vendorDetail?.businessName || 'Chi tiết nhà cung cấp'}
                  </h3>
                  {vendorDetail?.verified && (
                    <span className="bg-success/10 border border-success/20 text-success text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      Đã xác thực
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-text">
                  <span className="flex items-center gap-1 font-mono font-medium">
                    <MapPin className="w-3.5 h-3.5" /> {vendorDetail?.district}, {vendorDetail?.city}
                  </span>
                  <span className="text-light-grey font-semibold">•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> {vendorDetail?.experienceYears} năm kinh nghiệm
                  </span>
                  {vendorDetail && vendorDetail.ratingAverage > 0 && (
                    <>
                      <span className="text-light-grey font-semibold">•</span>
                      <div className="flex items-center gap-1">
                        <div className="flex">{renderStars(vendorDetail.ratingAverage)}</div>
                        <span className="text-[10px] font-bold text-ink">({vendorDetail.totalReviews} đánh giá)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleCloseModal}
                className="text-muted-text hover:text-ink text-sm font-semibold p-1 hover:bg-canvas rounded-sm flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <span className="text-xs text-muted-text font-display">Đang tải hồ sơ nhà cung cấp...</span>
              </div>
            ) : vendorDetail ? (
              <div className="space-y-6">
                
                {/* Description info */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">Giới thiệu dịch vụ</span>
                  <p className="text-xs text-body-text leading-relaxed whitespace-pre-line">
                    {vendorDetail.description}
                  </p>
                </div>

                {/* Concept Styles supported */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">Concept phong cách chuyên trường</span>
                  <div className="flex flex-wrap gap-1.5">
                    {vendorDetail.styles && vendorDetail.styles.length > 0 ? (
                      vendorDetail.styles.map((style, index) => (
                        <span 
                          key={index}
                          className="bg-primary/5 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
                        >
                          {style}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-light-grey italic">Chưa đăng ký phong cách.</span>
                    )}
                  </div>
                </div>

                {/* Portfolio Gallery */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">Danh mục dự án thực hiện (Portfolio)</span>
                  {vendorDetail.portfolios && vendorDetail.portfolios.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vendorDetail.portfolios.map(p => (
                        <div key={p.id} className="border border-hairline rounded-lg overflow-hidden shadow-xs flex flex-col">
                          {/* Image box */}
                          <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-hairline">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback placeholder if URL doesn't load
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600';
                              }}
                            />
                          </div>
                          {/* Info box */}
                          <div className="p-3.5 space-y-1 flex-1">
                            <h5 className="text-xs font-bold text-ink">{p.title}</h5>
                            {p.description && (
                              <p className="text-[10px] text-muted-text leading-relaxed">{p.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-dashed border-hairline rounded-lg text-muted-text flex flex-col items-center gap-1.5 bg-canvas/30">
                      <FileImage className="w-6 h-6 text-light-grey" />
                      <span className="text-xs italic text-light-grey">Hồ sơ hình ảnh đang được cập nhật.</span>
                    </div>
                  )}
                </div>

                {/* Service Packages */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">Các gói dịch vụ &amp; Báo giá</span>
                  {vendorDetail.packages && vendorDetail.packages.length > 0 ? (
                    <div className="space-y-3">
                      {vendorDetail.packages.map(pkg => (
                        <div key={pkg.id} className="p-4 bg-canvas rounded-sm border border-hairline flex justify-between items-center gap-4">
                          <div className="space-y-1 min-w-0">
                            <h5 className="text-xs font-bold text-ink">{pkg.packageName}</h5>
                            {pkg.description && (
                              <p className="text-[10px] text-muted-text leading-relaxed break-words">{pkg.description}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className="text-xs font-bold text-primary font-mono block">
                              {formatCurrency(pkg.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-dashed border-hairline rounded-lg text-muted-text flex flex-col items-center gap-1.5 bg-canvas/30">
                      <Coins className="w-6 h-6 text-light-grey" />
                      <span className="text-xs italic text-light-grey">Bảng giá chi tiết đang được thương lượng. Vui lòng liên hệ trực tiếp!</span>
                    </div>
                  )}
                </div>

                {/* Footer Save Action */}
                <div className="pt-4 border-t border-hairline flex justify-end gap-3.5">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-border-strong rounded-sm text-xs font-semibold text-body-text hover:bg-canvas transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={(e) => {
                      handleToggleShortlist(e, vendorDetail.id);
                    }}
                    className={`px-5 py-2 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      shortlistIds.has(vendorDetail.id)
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                        : 'bg-primary text-white hover:bg-primary-active'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${shortlistIds.has(vendorDetail.id) ? 'fill-red-600' : ''}`} />
                    {shortlistIds.has(vendorDetail.id) ? 'Bỏ lưu yêu thích' : 'Lưu vào yêu thích'}
                  </button>
                </div>

              </div>
            ) : (
              <p className="text-center py-10 text-xs text-muted-text italic">Không tìm thấy thông tin nhà cung cấp.</p>
            )}

          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}

// Subcomponent: Vendor Card
interface VendorCardProps {
  vendor: VendorResponse;
  isSaved: boolean;
  isToggling: boolean;
  onToggleShortlist: (e: React.MouseEvent) => void;
  onOpenDetail: () => void;
  renderStars: (rating: number) => React.ReactNode;
  reason?: string;
}

function VendorCard({ 
  vendor, 
  isSaved, 
  isToggling,
  onToggleShortlist, 
  onOpenDetail, 
  renderStars,
  reason
}: VendorCardProps) {
  const { category, imageUrl } = getVendorCategoryAndImage(vendor.id);
  const { min, max } = getMockPriceRange(vendor.id);

  // Format currency VND local helper
  const formatCurrencyLocal = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div 
      onClick={onOpenDetail}
      className="bg-white rounded-[24px] overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full shadow-lg border border-hairline/65 p-3 pb-4 relative group"
    >
      
      {/* Arched Image Container */}
      <div className="relative aspect-[4/5] w-full bg-cream/35 rounded-t-[18px] overflow-hidden p-2.5 flex items-center justify-center">
        {/* Heart icon at top-right of image */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onToggleShortlist}
            disabled={isToggling}
            className={`p-2 rounded-full border border-hairline/40 bg-white/95 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
              isSaved ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-red-400'
            }`}
            title={isSaved ? 'Bỏ lưu nhà cung cấp' : 'Lưu nhà cung cấp'}
          >
            {isToggling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500' : ''}`} />
            )}
          </button>
        </div>

        <div className="w-full h-full rounded-t-full overflow-hidden relative border border-primary/5 bg-white shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt={vendor.businessName} 
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600';
            }}
          />
        </div>
      </div>

      {/* Card Content details */}
      <div className="pt-4 px-2 pb-1 space-y-2.5 flex-1 flex flex-col justify-between text-center">
        
        <div className="space-y-1.5">
          {/* Rating */}
          <div className="flex items-center justify-center gap-1">
            <div className="flex text-gold">
              {renderStars(vendor.ratingAverage)}
            </div>
            <span className="text-[9px] text-muted-text font-bold">({vendor.totalReviews})</span>
          </div>

          {/* Category */}
          <div className="text-[10px] text-muted-text italic tracking-wide uppercase font-medium">
            {category}
          </div>

          {/* Business Name */}
          <h4 className="text-xs font-semibold tracking-wider text-ink font-display uppercase line-clamp-1">
            {vendor.businessName}
          </h4>

          {/* Price Range */}
          <div className="text-[11px] font-bold text-primary font-mono">
            Est. {formatCurrencyLocal(min)} - {formatCurrencyLocal(max)}
          </div>
        </div>

        {/* AI reason block - only displays when matched */}
        {reason && (
          <div className="p-2 bg-primary/5 border border-primary/10 rounded-lg text-[9px] text-primary leading-relaxed text-left">
            <span className="line-clamp-2">{reason}</span>
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex items-center justify-center gap-2 pt-2.5 border-t border-hairline/50">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}
            className="px-3.5 py-1.5 bg-primary text-cream text-[9px] font-bold tracking-wider uppercase rounded-full hover:bg-primary-active transition-all"
          >
            Inquire Now
          </button>
          <button
            onClick={onToggleShortlist}
            disabled={isToggling}
            className={`px-3.5 py-1.5 text-[9px] font-bold tracking-wider uppercase rounded-full border transition-all ${
              isSaved 
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                : 'bg-white text-body-text border-border-strong hover:bg-canvas'
            }`}
          >
            {isSaved ? 'Shortlisted' : 'Shortlist'}
          </button>
        </div>
        
      </div>

    </div>
  );
}

// Subcomponent: Empty State
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-cream/70 flex flex-col items-center gap-3 w-full">
      <Briefcase className="w-10 h-10 text-gold-light" />
      <span className="text-xs font-semibold max-w-md px-6 leading-relaxed">{message}</span>
    </div>
  );
}

const getMockCount = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 21) + 4; // Generate consistent counts like (4) to (24)
};

const getVendorCategoryAndImage = (vendorId: number) => {
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
  
  const imgList = imagesByCategory[category];
  const imgIndex = (vendorId * 7) % imgList.length;
  const imageUrl = imgList[imgIndex];

  return { category, imageUrl };
};

const getMockPriceRange = (vendorId: number) => {
  const basePrice = (vendorId % 10) * 5000000 + 15000000;
  const maxPrice = basePrice + (vendorId % 3) * 10000000 + 5000000;
  return { min: basePrice, max: maxPrice };
};
