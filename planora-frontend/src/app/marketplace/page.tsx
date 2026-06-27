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
            size: 8
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

  // Open detail popup
  const handleOpenDetail = (id: number) => {
    setSelectedVendorId(id);
    setIsModalOpen(true);
  };

  // Close detail popup
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVendorId(null);
    setVendorDetail(null);
  };

  // Render Stars
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // round to nearest 0.5
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 py-12 flex flex-col justify-start">
        
        {/* Header Breadcrumbs */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
          </Link>
        </div>

        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-hairline pb-6 mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
              <Award className="w-7 h-7 text-primary" />
              Chợ Dịch Vụ Cưới
            </h1>
            <p className="text-xs text-muted-text">
              Khám phá và kết nối với các nhà cung cấp dịch vụ tiệc cưới hàng đầu phù hợp với phong cách cưới của bạn.{activeTab === 'ALL' && totalElements > 0 && ` (Có ${totalElements} nhà cung cấp)`}
            </p>
          </div>
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
        <div className="flex border-b border-hairline mb-6">
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

        {/* Filters Toolbar - Only visible on ALL Tab */}
        {activeTab === 'ALL' && (
          <form onSubmit={handleSearchSubmit} className="p-6 bg-white border border-hairline rounded-lg shadow-sm space-y-4 mb-6">
            
            {/* Row 1: Search & Category */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Search input */}
              <div className="md:col-span-7 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên thương hiệu..."
                  className="w-full bg-canvas border border-hairline rounded-sm pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary text-ink"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="w-4 h-4 text-muted-text absolute left-3 top-3" />
              </div>

              {/* Category dropdown */}
              <div className="md:col-span-5 flex items-center gap-1.5 border border-hairline rounded-sm bg-canvas px-3 py-1">
                <Filter className="w-3.5 h-3.5 text-muted-text" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text border-r border-hairline pr-2.5 mr-1">Dịch vụ</span>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                  className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer flex-1"
                >
                  <option value="ALL">Tất cả dịch vụ</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Row 2: Location, Wedding Style, Price Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-12 gap-4 items-center">
              
              {/* City dropdown */}
              <div className="md:col-span-4 flex items-center gap-1.5 border border-hairline rounded-sm bg-canvas px-3 py-1">
                <MapPin className="w-3.5 h-3.5 text-muted-text" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text border-r border-hairline pr-2.5 mr-1">Khu vực</span>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer flex-1"
                >
                  <option value="ALL">Tất cả tỉnh thành</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                </select>
              </div>

              {/* Wedding Style dropdown */}
              <div className="md:col-span-4 flex items-center gap-1.5 border border-hairline rounded-sm bg-canvas px-3 py-1">
                <Sparkles className="w-3.5 h-3.5 text-muted-text" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text border-r border-hairline pr-2.5 mr-1">Concept</span>
                <select
                  value={selectedStyle}
                  onChange={e => setSelectedStyle(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                  className="text-xs font-semibold text-ink bg-transparent focus:outline-none cursor-pointer flex-1"
                >
                  <option value="ALL">Tất cả concept</option>
                  {styles.map(sty => (
                    <option key={sty.id} value={sty.id}>{sty.name}</option>
                  ))}
                </select>
              </div>

              {/* Price From / To */}
              <div className="md:col-span-4 flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder="Giá từ..."
                    className="w-full bg-canvas border border-hairline rounded-sm px-2.5 py-2 text-xs focus:outline-none focus:border-primary text-ink font-mono"
                    value={priceFrom}
                    onChange={e => setPriceFrom(e.target.value)}
                  />
                </div>
                <span className="text-muted-text text-xs">—</span>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder="Giá đến..."
                    className="w-full bg-canvas border border-hairline rounded-sm px-2.5 py-2 text-xs focus:outline-none focus:border-primary text-ink font-mono"
                    value={priceTo}
                    onChange={e => setPriceTo(e.target.value)}
                  />
                </div>
              </div>

            </div>

            {/* Row 3: Submit Filter Action */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-all tracking-wider uppercase font-display"
              >
                Áp dụng bộ lọc
              </button>
            </div>

          </form>
        )}

        {/* Matched Vendors Intro Header - Tab MATCHES */}
        {activeTab === 'MATCHES' && (
          <div className="p-5 mb-6 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-full animate-pulse">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink">Gợi ý từ Trí tuệ Nhân tạo (Planora Matcher)</h3>
              <p className="text-xs text-muted-text leading-relaxed">
                Hệ thống tự động chấm điểm độ tương thích và đề xuất các nhà cung cấp phù hợp nhất dựa trên: địa điểm tiệc cưới, ngân sách chi tiết của bạn và phong cách đám cưới chủ đạo bạn đã chọn trong kế hoạch.
              </p>
            </div>
          </div>
        )}

        {/* Vendors Listing Grid */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-text font-display">Đang tải danh sách nhà cung cấp...</span>
          </div>
        ) : (
          <div className="space-y-8 flex-1 flex flex-col justify-start">
            
            {/* List renders depending on Tab */}
            {activeTab === 'ALL' && (
              <>
                {vendors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <EmptyState message="Không tìm thấy nhà cung cấp nào phù hợp với bộ lọc." />
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 border-t border-hairline pt-6 mt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-2 border border-hairline rounded-sm hover:bg-canvas disabled:opacity-50 transition-colors"
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-ink font-mono">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 border border-hairline rounded-sm hover:bg-canvas disabled:opacity-50 transition-colors"
                      title="Trang sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'MATCHES' && (
              <>
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {matches.map(m => (
                      <div key={m.id} className="relative group">
                        {/* Score Tag */}
                        <div className="absolute top-2 left-2 z-10 bg-primary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-cream fill-cream" /> {Math.round(m.matchingScore * 100)}% Match
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
                  <EmptyState message="Chưa có gợi ý nào. Hệ thống cần thêm thông tin ngân sách hoặc phong cách cưới để xử lý đề xuất." />
                )}
              </>
            )}

            {activeTab === 'SHORTLIST' && (
              <>
                {shortlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <EmptyState message="Danh sách lưu trữ đang trống. Hãy thả tim ở mục tất cả nhà cung cấp để lưu lại các dịch vụ bạn ưng ý!" />
                )}
              </>
            )}

          </div>
        )}

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
  return (
    <div 
      onClick={onOpenDetail}
      className="bg-white border border-hairline rounded-lg overflow-hidden shadow-sm flex flex-col justify-between hover:border-border-strong transition-all duration-300 cursor-pointer h-full hover:shadow-md relative group"
    >
      
      {/* Top box: Heart button */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={onToggleShortlist}
          disabled={isToggling}
          className={`p-2 rounded-full border border-hairline/60 bg-white/90 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
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

      {/* Profile info block */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-start">
        
        {/* Name and Rating */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-ink truncate max-w-[130px] sm:max-w-full">
              {vendor.businessName}
            </h4>
            {vendor.verified && (
              <span className="bg-success/10 border border-success/20 text-success text-[7px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm">
                V
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="flex">{renderStars(vendor.ratingAverage)}</div>
            <span className="text-[9px] text-muted-text font-bold">({vendor.totalReviews})</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-[11px] text-muted-text line-clamp-3 leading-relaxed">
          {vendor.description || 'Hệ thống nhà cung cấp dịch vụ chuyên nghiệp hàng đầu.'}
        </p>

        {/* AI reason block - only displays when matched */}
        {reason && (
          <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-sm text-[10px] text-primary leading-relaxed">
            <span className="font-bold uppercase tracking-wide block mb-0.5">Lý do gợi ý</span>
            <span className="line-clamp-2">{reason}</span>
          </div>
        )}

      </div>

      {/* Footer details card */}
      <div className="p-4 border-t border-hairline bg-canvas/20 flex flex-col gap-2">
        
        {/* Location & Experience info */}
        <div className="flex justify-between items-center text-[10px] text-muted-text font-medium">
          <span className="flex items-center gap-0.5 font-mono truncate max-w-[110px]">
            <MapPin className="w-3 h-3 text-muted-text" /> {vendor.city}
          </span>
          <span className="flex items-center gap-0.5">
            <Briefcase className="w-3 h-3 text-muted-text" /> {vendor.experienceYears} năm EXP
          </span>
        </div>

        {/* Styles chips */}
        <div className="flex gap-1 overflow-hidden h-[16px] max-w-full">
          {vendor.styles && vendor.styles.slice(0, 2).map((s, idx) => (
            <span 
              key={idx}
              className="bg-primary/5 text-primary text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-primary/10 truncate max-w-[80px]"
            >
              {s}
            </span>
          ))}
        </div>

      </div>

    </div>
  );
}

// Subcomponent: Empty State
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center bg-white border border-hairline rounded-lg shadow-sm text-muted-text flex flex-col items-center gap-2 max-w-xl mx-auto w-full">
      <Briefcase className="w-10 h-10 text-hairline" />
      <span className="text-xs font-semibold px-6">{message}</span>
    </div>
  );
}
