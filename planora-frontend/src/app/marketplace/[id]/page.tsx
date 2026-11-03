'use client';

import React, { useState, useEffect, use, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { getVendorDetail, getShortlist, addToShortlist, removeFromShortlist } from '@/services/vendor';
import type { VendorDetailResponse } from '@/types/vendor';
import { createOrGetInquiry, getCustomerInquiryDetail, sendCustomerMessage } from '@/services/inquiryService';
import type { InquiryMessage } from '@/types/inquiry';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, X, Send, ExternalLink, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

type IconName = 
  | 'arrow' 
  | 'calendar' 
  | 'chat' 
  | 'chevron' 
  | 'clock' 
  | 'guests' 
  | 'heart' 
  | 'instagram' 
  | 'location' 
  | 'mail' 
  | 'phone' 
  | 'send' 
  | 'share' 
  | 'sparkle' 
  | 'star' 
  | 'verified';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    chat: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    guests: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
    ),
    send: <path d="m22 2-7 20-4-9-9-4Zm-11 11L22 2" />,
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
      </>
    ),
    sparkle: (
      <path d="M12 2 14.4 9.6 22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4Z" />
    ),
    star: (
      <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9Z" />
    ),
    verified: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m8 12 2.7 2.7L16.5 9" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="icon shrink-0"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
    >
      {paths[name]}
    </svg>
  );
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// Fallback high quality photography from Figma Template
const TEMPLATE_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1665607437981-973dcd6a22bb?auto=format&fit=crop&w=1800&q=88',
    alt: 'Không gian tiệc cưới sang trọng với hoa tươi',
    caption: 'Garden Vows',
    year: '2025',
  },
  {
    src: 'https://images.unsplash.com/photo-1561593367-66c79c2294e6?auto=format&fit=crop&w=1200&q=86',
    alt: 'Bàn tiệc cưới được bài trí tinh tế',
    caption: 'Classic Romance',
    year: '2025',
  },
  {
    src: 'https://images.unsplash.com/photo-1751257547111-9641cb540f4d?auto=format&fit=crop&w=1200&q=86',
    alt: 'Bàn tiệc trang trí với hoa pastel',
    caption: 'Pastel Dream',
    year: '2026',
  },
  {
    src: 'https://images.unsplash.com/photo-1660511057210-f7fba78d2741?auto=format&fit=crop&w=1200&q=86',
    alt: 'Hoa trắng và nến trên bàn tiệc',
    caption: 'Pure Elegance',
    year: '2026',
  },
];

export default function VendorDetail(props: PageProps) {
  const params = use(props.params);
  const vendorId = parseInt(params.id);

  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { plan, daysLeft } = usePlan();
  const { language, t, formatCurrency } = useLanguage();

  // Data States
  const [vendor, setVendor] = useState<VendorDetailResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingShortlist, setIsTogglingShortlist] = useState(false);

  // Gallery active index
  const [activePhoto, setActivePhoto] = useState(0);

  // Inquiry Form State
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [budgetEstimate, setBudgetEstimate] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasAutoFilledFromPlan, setHasAutoFilledFromPlan] = useState(false);

  // Direct package inquiry state
  const [submittingPackageId, setSubmittingPackageId] = useState<number | null>(null);
  const [packageInquirySuccess, setPackageInquirySuccess] = useState<string | null>(null);

  // Live Chat Drawer States
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [activeInquiryId, setActiveInquiryId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<InquiryMessage[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);

  // Find matched category in user's wedding plan budget
  const budgetItems = plan?.budgetItems;
  const vendorCategoryName = vendor?.primaryCategoryName;
  const matchedBudgetItem = React.useMemo(() => {
    if (!budgetItems || !vendorCategoryName) return null;
    const vendorCat = vendorCategoryName.toLowerCase().trim();
    return budgetItems.find((item) => {
      const itemCat = item.categoryName.toLowerCase().trim();
      return itemCat.includes(vendorCat) || vendorCat.includes(itemCat);
    });
  }, [budgetItems, vendorCategoryName]);

  // Pre-fill form from user's active wedding plan
  const handleApplyPlanData = React.useCallback(() => {
    if (!plan) return;

    if (plan.weddingDate) {
      const dateFormatted = plan.weddingDate.includes('T')
        ? plan.weddingDate.split('T')[0]
        : plan.weddingDate;
      setWeddingDate(dateFormatted);
    }

    if (plan.guestCount) {
      if (plan.guestCount < 100) {
        setGuestCount('Dưới 100 khách');
      } else if (plan.guestCount <= 200) {
        setGuestCount('100–200 khách');
      } else if (plan.guestCount <= 400) {
        setGuestCount('200–400 khách');
      } else {
        setGuestCount('Trên 400 khách');
      }
    }

    if (plan.location) {
      setLocation(plan.location);
    }

    if (matchedBudgetItem?.estimatedCost) {
      setBudgetEstimate(formatCurrency(matchedBudgetItem.estimatedCost));
    } else if (plan.budget) {
      setBudgetEstimate(formatCurrency(plan.budget));
    }

    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('planora_user_phone');
      if (savedPhone) setPhoneNumber(savedPhone);
    }

    setHasAutoFilledFromPlan(true);
  }, [plan, matchedBudgetItem, formatCurrency]);

  // Auto pre-fill on first load when plan is available
  useEffect(() => {
    if (plan && !hasAutoFilledFromPlan) {
      handleApplyPlanData();
    }
  }, [plan, hasAutoFilledFromPlan, handleApplyPlanData]);

  // Check ?inquire=true in query to smooth scroll to inquiry form
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('inquire') === 'true') {
        setTimeout(() => {
          document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
        }, 450);
      }
    }
  }, []);

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

  // Sync Shortlist state
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

  // Handle Save / Toggle Shortlist (Optimistic UI)
  const handleToggleShortlist = async () => {
    if (!plan || !vendor) return;
    const previousState = isSaved;
    // 1. Flip state immediately
    setIsSaved(!previousState);

    try {
      if (previousState) {
        await removeFromShortlist(plan.id, vendor.id);
      } else {
        await addToShortlist(plan.id, vendor.id);
      }
    } catch (err) {
      // 2. Rollback on error
      setIsSaved(previousState);
      console.error('Lỗi thao tác danh sách yêu thích:', err);
    }
  };

  // Handle Submit Inquiry via Backend API with pre-filled wedding plan details
  const handleSubmitInquiry = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!weddingDate || !vendor) return;
    setIsSubmittingInquiry(true);

    if (phoneNumber && typeof window !== 'undefined') {
      localStorage.setItem('planora_user_phone', phoneNumber);
    }

    try {
      const chosenGuests = guestCount || (plan?.guestCount ? `${plan.guestCount} khách` : '100–200 khách');
      const chosenLoc = location || plan?.location || '';

      const detailsList = [
        `Xin chào ${vendor.businessName}! Tôi quan tâm đến dịch vụ của bạn trên Planora và muốn nhận báo giá tư vấn.`,
        `Thông tin kế hoạch cưới của tôi:`,
        `- Ngày tổ chức dự kiến: ${weddingDate}`,
        `- Quy mô tiệc: ${chosenGuests}`,
        chosenLoc ? `- Địa điểm: ${chosenLoc}` : '',
        budgetEstimate ? `- Dự trù ngân sách: ${budgetEstimate}` : '',
        phoneNumber ? `- SĐT liên hệ: ${phoneNumber}` : '',
        noteMessage ? `- Yêu cầu cụ thể: ${noteMessage}` : '',
        `Rất mong sớm nhận được phản hồi và thông tin chi tiết từ bạn. Cảm ơn bạn!`
      ].filter(Boolean).join('\n');

      const inq = await createOrGetInquiry({
        vendorId: vendor.id,
        weddingPlanId: plan?.id,
        title: `Yêu cầu báo giá ngày ${weddingDate} - ${vendor.businessName}`,
        message: detailsList,
      });

      setSubmitted(true);
      setActiveInquiryId(inq.id);
      setChatMessages(inq.messages || []);
      setIsChatDrawerOpen(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể gửi yêu cầu tư vấn');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Handle Direct Package Inquiry sent straight to vendor via chat
  const handleInquirePackage = async (
    pkg: { id?: number; packageName: string; price: number; description?: string },
    index: number
  ) => {
    if (!vendor) return;
    const pkgIdentifier = pkg.id ?? index;
    setSubmittingPackageId(pkgIdentifier);

    try {
      const formattedPrice = formatCurrency(pkg.price);
      const chosenDate = weddingDate || plan?.weddingDate || 'sắp tới';
      const chosenGuests = guestCount || (plan?.guestCount ? `${plan.guestCount} khách` : 'tiệc thân mật');
      const chosenLocation = location || plan?.location || vendor.city || '';

      const packageMsg = [
        `Xin chào ${vendor.businessName}! Tôi đang quan tâm đến gói dịch vụ sau trên Planora:`,
        `[Gói dịch vụ]: ${pkg.packageName}`,
        `[Chi phí]: ${formattedPrice}`,
        pkg.description ? `[Chi tiết gói]: ${pkg.description}` : '',
        `---`,
        `Thông tin ngày cưới của tôi:`,
        `- Ngày tổ chức dự kiến: ${chosenDate}`,
        `- Quy mô tiệc: ${chosenGuests}`,
        chosenLocation ? `- Địa điểm: ${chosenLocation}` : '',
        phoneNumber ? `- SĐT liên hệ: ${phoneNumber}` : '',
        `Bạn có thể kiểm tra lịch trống cho ngày này và tư vấn chi tiết hơn về các hạng mục trong gói giúp tôi được không? Cảm ơn bạn!`
      ].filter(Boolean).join('\n');

      const inq = await createOrGetInquiry({
        vendorId: vendor.id,
        weddingPlanId: plan?.id,
        title: `Tư vấn gói [${pkg.packageName}] - ${vendor.businessName}`,
        message: packageMsg,
      });

      setActiveInquiryId(inq.id);
      setChatMessages(inq.messages || []);
      setIsChatDrawerOpen(true);
      setPackageInquirySuccess(pkg.packageName);

      // Auto clear success notice after 5s
      setTimeout(() => setPackageInquirySuccess(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể gửi tin nhắn tư vấn gói dịch vụ');
    } finally {
      setSubmittingPackageId(null);
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

  // Poll chat messages when drawer is open (Adaptive Polling)
  useEffect(() => {
    if (!isChatDrawerOpen || !activeInquiryId) return;

    const pollDrawerChat = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const detail = await getCustomerInquiryDetail(activeInquiryId);
        setChatMessages(detail.messages || []);
      } catch {
        // silent catch
      }
    };

    const interval = setInterval(pollDrawerChat, 4000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pollDrawerChat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isChatDrawerOpen, activeInquiryId]);

  // Handle Send Customer Message in Drawer (Optimistic UI)
  const handleSendCustomerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeInquiryId || isSendingChatMessage) return;
    const text = chatInputText.trim();
    setChatInputText('');
    setIsSendingChatMessage(true);

    const tempId = Date.now();
    const optimisticMsg: InquiryMessage = {
      id: tempId,
      inquiryId: activeInquiryId,
      senderId: 0,
      senderName: 'Bạn',
      senderRole: 'CUSTOMER',
      message: text,
      createdAt: new Date().toISOString(),
    };

    // 1. Immediately append optimistic message
    setChatMessages(prev => [...prev, optimisticMsg]);

    try {
      const newMsg = await sendCustomerMessage(activeInquiryId, text);
      // 2. Replace with confirmed server message
      setChatMessages(prev => prev.map(m => m.id === tempId ? newMsg : m));
    } catch (err: unknown) {
      // 3. Rollback on failure
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
      alert(err instanceof Error ? err.message : 'Không thể gửi tin nhắn');
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  // Copy URL Share
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'vi' ? 'Đã sao chép liên kết trang nhà cung cấp!' : 'Link copied to clipboard!');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm text-stone-500">{t.dashboard.loadingSession}</span>
        </div>
      </div>
    );
  }

  if (isLoading || !vendor) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm text-stone-500 font-serif">{t.marketplace.loadingDetail}</span>
        </div>
      </div>
    );
  }

  // Consistent photography & fallback data (supports multi-album collections & legacy portfolios)
  const photos = (() => {
    if (vendor.collections && vendor.collections.length > 0) {
      const colPhotos = vendor.collections.flatMap((c) =>
        (c.images || []).map((img) => ({
          src: img.imageUrl,
          alt: img.title || c.title || vendor.businessName,
          caption: `${c.title}${img.title ? ` • ${img.title}` : ''}`,
          year: '2026',
        }))
      );
      if (colPhotos.length > 0) return colPhotos;
    }
    if (vendor.portfolios && vendor.portfolios.length > 0) {
      return vendor.portfolios.map((p) => ({
        src: p.imageUrl,
        alt: p.title || vendor.businessName,
        caption: p.title || 'Không gian tác nghiệp',
        year: '2026',
      }));
    }
    return TEMPLATE_PHOTOS;
  })();

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

  const category = vendor.primaryCategoryName || 'Trang trí cưới';
  const minPrice = vendor.priceFrom || 15000000;
  const maxPrice = vendor.priceTo || 35000000;

  return (
    <div className="vendor-showcase-page">
      {/* Planora App Header (Retained as requested) */}
      <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />

      <main id="top">
        {/* HERO BANNER SECTION (FIGMA TEMPLATE) */}
        <section className="hero">
          <Image
            alt={vendor.businessName || 'Vendor Banner'}
            className="hero-image"
            src={photos[0].src}
            fill
            sizes="100vw"
            priority
            unoptimized={!isOptimizableImage(photos[0].src)}
          />
          <div className="hero-overlay" />
          <div className="hero-content page-width">
            <div className="breadcrumbs">
              <Link href="/marketplace">Trang chủ</Link>
              <Icon name="chevron" size={13} />
              <span>{category}</span>
              <Icon name="chevron" size={13} />
              <span>{vendor.businessName}</span>
            </div>
            <p className="hero-kicker">
              Selected wedding vendor · {vendor.city || 'Đà Lạt'}
            </p>
            <h1>
              Những khoảnh khắc ngày trọng đại
              <br />
              kể câu chuyện của riêng bạn.
            </h1>
          </div>
          <div className="hero-tools">
            <button
              aria-label="Chia sẻ"
              className="round-button glass"
              type="button"
              onClick={handleShare}
            >
              <Icon name="share" />
            </button>
            <button
              aria-label={isSaved ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
              className={isSaved ? 'round-button glass active' : 'round-button glass'}
              onClick={handleToggleShortlist}
              disabled={isTogglingShortlist}
              type="button"
            >
              <Icon name="heart" />
            </button>
          </div>
        </section>

        {/* FLOATING VENDOR IDENTITY CARD (FIGMA TEMPLATE) */}
        <section
          className="vendor-card page-width"
          aria-label="Thông tin nhà cung cấp"
        >
          <div className="vendor-identity">
            <div className="vendor-avatar">
              {vendor.avatarUrl ? (
                <img
                  src={vendor.avatarUrl}
                  alt={vendor.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{vendor.businessName.slice(0, 2).toUpperCase()}</span>
              )}
              <span className="verified-dot" title="Đã xác thực bởi Planora">
                <Icon name="verified" size={14} />
              </span>
            </div>
            <div>
              <div className="pills">
                <span>{category}</span>
                <span className="choice">
                  <Icon name="sparkle" size={11} /> Planora&apos;s choice
                </span>
              </div>
              <h2>{vendor.businessName}</h2>
              <div className="rating-row">
                <span className="stars">★★★★★</span>
                <strong>{vendor.ratingAverage ? Number(vendor.ratingAverage).toFixed(1) : '4.9'}</strong>
                <span>· {vendor.totalReviews || 122} đánh giá</span>
              </div>
            </div>
          </div>

          <div className="vendor-about">
            <span className="eyebrow">Về nhà cung cấp</span>
            <p>
              {vendor.description || 
                'Chuyên thiết kế không gian cưới tinh tế, nơi hoa, ánh sáng và cảm xúc hòa quyện thành một dấu ấn duy nhất cho ngày trọng đại.'}
            </p>
            <div className="style-tags">
              {vendor.styles && vendor.styles.length > 0 ? (
                vendor.styles.map((st, i) => <span key={i}>{st}</span>)
              ) : (
                <>
                  <span>Garden wedding</span>
                  <span>Minimalist</span>
                  <span>Romantic</span>
                </>
              )}
            </div>
          </div>

          <div className="vendor-meta">
            <div>
              <Icon name="location" size={17} />
              <span>{vendor.district ? `${vendor.district}, ` : ''}{vendor.city || 'Đà Lạt'}</span>
            </div>
            <div>
              <Icon name="clock" size={17} />
              <span>{vendor.experienceYears || 6} năm kinh nghiệm</span>
            </div>
            <div>
              <Icon name="phone" size={17} />
              <span>{vendor.phone || '0912 111 111'}</span>
            </div>
          </div>
        </section>

        {/* MAIN TWO-COLUMN CONTENT GRID (FIGMA TEMPLATE) */}
        <div className="content-grid page-width">
          {/* LEFT: MAIN CONTENT */}
          <div className="main-content">
            {/* Story / Concept Philosophy */}
            <section className="story-section">
              <span className="eyebrow">{vendor.businessName}</span>
              <blockquote>
                “Mỗi đám cưới là một câu chuyện riêng — chúng tôi chỉ giúp tình yêu ấy nở hoa rực rỡ.”
              </blockquote>
              <p>
                Từ lễ đường ngập tràn ánh nắng đến bữa tiệc thân mật dưới tán cây, đội ngũ {vendor.businessName} luôn theo đuổi vẻ đẹp tự nhiên, cảm xúc chân thực và tinh tế dành riêng cho từng cặp đôi.
              </p>
            </section>

            {/* Portfolio Gallery Section */}
            <section className="portfolio-section" id="portfolio">
              <SectionTitle
                eyebrow={`Portfolio 01 — 0${photos.length}`}
                title={`Không gian do ${vendor.businessName} kiến tạo`}
                action={
                  <button className="text-button" type="button" onClick={() => setActivePhoto((activePhoto + 1) % photos.length)}>
                    Xem tiếp <Icon name="arrow" />
                  </button>
                }
              />
              <div className="gallery">
                <button
                  aria-label="Ảnh trước"
                  className="gallery-arrow previous"
                  onClick={() =>
                    setActivePhoto(
                      (activePhoto + photos.length - 1) % photos.length,
                    )
                  }
                  type="button"
                >
                  <Icon name="chevron" />
                </button>
                <img
                  alt={photos[activePhoto].alt}
                  className="gallery-main"
                  src={photos[activePhoto].src}
                />
                <button
                  aria-label="Ảnh tiếp theo"
                  className="gallery-arrow next"
                  onClick={() =>
                    setActivePhoto((activePhoto + 1) % photos.length)
                  }
                  type="button"
                >
                  <Icon name="chevron" />
                </button>
                <div className="gallery-caption">
                  <span>{photos[activePhoto].caption}</span>
                  <span>{vendor.city || 'Đà Lạt'} · {photos[activePhoto].year}</span>
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="thumbnails">
                {photos.map((photo, index) => (
                  <button
                    aria-label={`Xem ảnh ${index + 1}`}
                    className={
                      activePhoto === index ? 'thumbnail active' : 'thumbnail'
                    }
                    key={photo.src + index}
                    onClick={() => setActivePhoto(index)}
                    type="button"
                  >
                    <img alt="" src={photo.src} />
                  </button>
                ))}
              </div>
            </section>

                      </div>

          {/* RIGHT: INQUIRY SIDEBAR (FIGMA TEMPLATE) */}
          <aside className="inquiry-card" id="inquiry">
            <div className="inquiry-header">
              <span className="eyebrow">Gửi yêu cầu</span>
              <h2>Hãy bắt đầu từ ngày cưới của bạn</h2>
              <p>{vendor.businessName} thường phản hồi trong vòng 2 giờ.</p>
            </div>

            {/* Synced with active wedding plan notice */}
            {plan && (
              <div className="mt-3 p-3 rounded-xl bg-[#FAF6F0] border border-[#dfd5c7] flex items-start justify-between gap-2 text-left">
                <div className="flex items-start gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#8E7044] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#5D0F12] leading-tight">
                      Đã điền tự động từ Kế hoạch cưới
                    </p>
                    <p className="text-[11px] text-stone-600 truncate mt-0.5">
                      {plan.title || 'Đám cưới của bạn'} {daysLeft > 0 ? `• Còn ${daysLeft} ngày` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyPlanData}
                  title="Đồng bộ lại từ Kế hoạch cưới"
                  className="text-[11px] font-semibold text-[#8E7044] hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Điền lại
                </button>
              </div>
            )}

            <div className="starting-price">
              <span>Chi phí từ</span>
              <strong>{formatCurrency(minPrice)}</strong>
            </div>

            <form onSubmit={handleSubmitInquiry}>
              <label>
                Ngày cưới dự kiến
                <span className="input-wrap">
                  <Icon name="calendar" size={17} />
                  <input 
                    aria-label="Ngày cưới dự kiến" 
                    required 
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                  />
                </span>
              </label>

              <label>
                Số lượng khách
                <span className="input-wrap">
                  <Icon name="guests" size={17} />
                  <select 
                    aria-label="Số lượng khách" 
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    required
                  >
                    <option disabled value="">
                      Chọn quy mô tiệc
                    </option>
                    <option value="Dưới 100 khách">Dưới 100 khách {plan?.guestCount && plan.guestCount < 100 ? `(Kế hoạch: ${plan.guestCount})` : ''}</option>
                    <option value="100–200 khách">100–200 khách {plan?.guestCount && plan.guestCount >= 100 && plan.guestCount <= 200 ? `(Kế hoạch: ${plan.guestCount})` : ''}</option>
                    <option value="200–400 khách">200–400 khách {plan?.guestCount && plan.guestCount > 200 && plan.guestCount <= 400 ? `(Kế hoạch: ${plan.guestCount})` : ''}</option>
                    <option value="Trên 400 khách">Trên 400 khách {plan?.guestCount && plan.guestCount > 400 ? `(Kế hoạch: ${plan.guestCount})` : ''}</option>
                  </select>
                </span>
              </label>

              <label>
                Địa điểm tổ chức
                <span className="input-wrap">
                  <Icon name="location" size={17} />
                  <input
                    aria-label="Địa điểm tổ chức"
                    placeholder="Ví dụ: TP. Hồ Chí Minh, Hà Nội, Đà Lạt..."
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </span>
              </label>

              <label>
                Số điện thoại
                <span className="input-wrap">
                  <Icon name="phone" size={17} />
                  <input
                    aria-label="Số điện thoại"
                    placeholder="Nhập số điện thoại"
                    required
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </span>
              </label>

              <label>
                Lời nhắn &amp; Yêu cầu cụ thể (Tùy chọn)
                <span className="input-wrap !items-start !p-2.5">
                  <textarea
                    aria-label="Lời nhắn"
                    placeholder="Ví dụ: Mong muốn tư vấn concept hoa pastel, tiệc ngoài trời..."
                    rows={2}
                    value={noteMessage}
                    onChange={(e) => setNoteMessage(e.target.value)}
                    className="w-full bg-transparent border-0 text-stone-800 text-xs outline-none resize-none min-h-[46px]"
                  />
                </span>
              </label>

              <button 
                className="primary-button cursor-pointer" 
                type="submit"
                disabled={isSubmittingInquiry}
              >
                {isSubmittingInquiry ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Icon name="send" size={17} />
                    {submitted ? 'Đã gửi yêu cầu' : 'Yêu cầu báo giá'}
                  </>
                )}
              </button>
            </form>

            <div className="or-divider">
              <span>hoặc</span>
            </div>

            <button 
              className="secondary-button cursor-pointer" 
              type="button"
              onClick={handleOpenDirectChat}
            >
              <Icon name="chat" size={17} /> Trò chuyện trực tiếp
            </button>

            <button
              className={isSaved ? 'save-button saved cursor-pointer' : 'save-button cursor-pointer'}
              onClick={handleToggleShortlist}
              disabled={isTogglingShortlist}
              type="button"
            >
              <Icon name="heart" size={17} />
              {isSaved ? 'Đã lưu vào danh sách' : 'Lưu nhà cung cấp'}
            </button>

            <div className="assurance">
              <Icon name="verified" size={18} />
              <span>
                Thông tin của bạn được bảo mật và chỉ chia sẻ với {vendor.businessName}.
              </span>
            </div>
          </aside>
        </div>

        {/* Services & Packages Section */}
            <section className="services-section page-width" id="services">
              <div className="section-heading">
                <span className="eyebrow">BẢNG GIÁ DỊCH VỤ</span>
                <h2>Dịch vụ & chi phí</h2>
                <p className="section-subtitle">
                  Chọn gói trải nghiệm phù hợp cho ngày trọng đại của hai bạn — Gửi tư vấn trực tiếp qua tin nhắn
                </p>
              </div>
              <div className="service-grid">
                {vendor.packages && vendor.packages.length > 0 ? (
                  vendor.packages.map((pkg, idx) => {
                    const isFeatured = idx === 0;
                    const isSendingThis = submittingPackageId === (pkg.id ?? idx);

                    // Smart Budget Compatibility Badge
                    let budgetMatchBadge = null;
                    if (matchedBudgetItem?.estimatedCost) {
                      if (pkg.price <= matchedBudgetItem.estimatedCost) {
                        budgetMatchBadge = (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-medium my-2">
                            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Trong ngân sách dự trù ({formatCurrency(matchedBudgetItem.estimatedCost)})</span>
                          </div>
                        );
                      } else {
                        const diff = pkg.price - matchedBudgetItem.estimatedCost;
                        budgetMatchBadge = (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-medium my-2">
                            <span>Dự trù: {formatCurrency(matchedBudgetItem.estimatedCost)} (+{formatCurrency(diff)})</span>
                          </div>
                        );
                      }
                    } else if (plan?.budget) {
                      const pct = Math.round((pkg.price / plan.budget) * 100);
                      budgetMatchBadge = (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] my-2">
                          <span>Chiếm ~{pct}% ngân sách cưới</span>
                        </div>
                      );
                    }

                    return (
                      <article 
                        key={pkg.id || idx} 
                        className={isFeatured ? 'service-card featured' : 'service-card'}
                      >
                        <div>
                          <div className="service-topline">
                            <span className="eyebrow">Gói 0{idx + 1}</span>
                            {isFeatured && <span className="popular">Được yêu thích</span>}
                          </div>
                          <h3>{pkg.packageName}</h3>
                          <p className="price">
                            <span>Từ</span> {formatCurrency(pkg.price)}
                          </p>
                          {budgetMatchBadge}
                          <p>{pkg.description || 'Gói dịch vụ cao cấp được thiết kế chuẩn mực theo yêu cầu của hai bạn.'}</p>
                          <ul>
                            <li>Tư vấn concept & bảng màu chủ đạo</li>
                            <li>Tác nghiệp trọn gói cùng ekip chuyên nghiệp</li>
                            <li>Hậu kỳ & bàn giao toàn bộ sản phẩm chất lượng cao</li>
                          </ul>
                        </div>
                        <button 
                          className="service-link cursor-pointer disabled:opacity-60"
                          type="button"
                          disabled={submittingPackageId !== null}
                          onClick={() => handleInquirePackage(pkg, idx)}
                        >
                          {isSendingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang gửi tin nhắn...</span>
                            </>
                          ) : (
                            <>
                              <span>Nhận tư vấn gói này</span>
                              <Icon name="arrow" />
                            </>
                          )}
                        </button>
                      </article>
                    );
                  })
                ) : (
                  /* Figma Template Default Packages */
                  <>
                    <article className="service-card featured">
                      <div>
                        <div className="service-topline">
                          <span className="eyebrow">Gói 01</span>
                          <span className="popular">Được yêu thích</span>
                        </div>
                        <h3>Garden Ceremony</h3>
                        <p className="price">
                          <span>Từ</span> {formatCurrency(minPrice)}
                        </p>
                        {matchedBudgetItem?.estimatedCost && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-medium my-2">
                            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Trong ngân sách ({formatCurrency(matchedBudgetItem.estimatedCost)})</span>
                          </div>
                        )}
                        <p>
                          Thiết kế khu vực lễ chính, cổng hoa và lối dẫn theo concept riêng.
                        </p>
                        <ul>
                          <li>01 buổi tư vấn concept</li>
                          <li>Hoa tươi theo mùa & hoa nhập khẩu</li>
                          <li>Thi công & tháo dỡ trọn gói</li>
                        </ul>
                      </div>
                      <button 
                        className="service-link cursor-pointer disabled:opacity-60"
                        type="button"
                        disabled={submittingPackageId !== null}
                        onClick={() => handleInquirePackage({
                          packageName: 'Garden Ceremony',
                          price: minPrice,
                          description: 'Thiết kế khu vực lễ chính, cổng hoa và lối dẫn theo concept riêng.'
                        }, 0)}
                      >
                        {submittingPackageId === 0 ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang gửi tin nhắn...</span>
                          </>
                        ) : (
                          <>
                            <span>Nhận tư vấn gói này</span>
                            <Icon name="arrow" />
                          </>
                        )}
                      </button>
                    </article>

                    <article className="service-card">
                      <div>
                        <div className="service-topline">
                          <span className="eyebrow">Gói 02</span>
                        </div>
                        <h3>Full Wedding Styling</h3>
                        <p className="price">
                          <span>Từ</span> {formatCurrency(maxPrice)}
                        </p>
                        {matchedBudgetItem?.estimatedCost && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-medium my-2">
                            <span>Dự trù: {formatCurrency(matchedBudgetItem.estimatedCost)}</span>
                          </div>
                        )}
                        <p>
                          Đồng bộ không gian lễ, bàn tiệc, photobooth và hệ thống hoa trang trí.
                        </p>
                        <ul>
                          <li>Concept & moodboard độc quyền</li>
                          <li>Thiết kế toàn bộ không gian ngày cưới</li>
                          <li>Điều phối styling trực tiếp trong ngày</li>
                        </ul>
                      </div>
                      <button 
                        className="service-link cursor-pointer disabled:opacity-60"
                        type="button"
                        disabled={submittingPackageId !== null}
                        onClick={() => handleInquirePackage({
                          packageName: 'Full Wedding Styling',
                          price: maxPrice,
                          description: 'Đồng bộ không gian lễ, bàn tiệc, photobooth và hệ thống hoa trang trí.'
                        }, 1)}
                      >
                        {submittingPackageId === 1 ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang gửi tin nhắn...</span>
                          </>
                        ) : (
                          <>
                            <span>Nhận tư vấn gói này</span>
                            <Icon name="arrow" />
                          </>
                        )}
                      </button>
                    </article>
                  </>
                )}
              </div>
            </section>

            {/* Customer Reviews Section */}
            <section className="reviews-section page-width" id="reviews">
              <div className="section-heading">
                <span className="eyebrow">ĐÁNH GIÁ TỪ CẶP ĐÔI</span>
                <h2>Lời nhắn từ khách hàng</h2>
                <p className="section-subtitle">
                  Những câu chuyện đã nở hoa · {vendor.ratingAverage ? Number(vendor.ratingAverage).toFixed(1) : '4.9'} / 5 sao ({vendor.totalReviews || 122} đánh giá)
                </p>
              </div>

              {vendor.reviews && vendor.reviews.length > 0 ? (
                <div className="space-y-5">
                  {vendor.reviews.map((rev) => (
                    <article key={rev.id} className="review-card">
                      <div className="quote-mark">“</div>
                      <div>
                        <div className="stars">
                          {'★'.repeat(Math.round(rev.rating)) + '☆'.repeat(5 - Math.round(rev.rating))}
                        </div>
                        <blockquote>
                          {rev.comment}
                        </blockquote>
                        <div className="review-author">
                          <span className="author-avatar">
                            {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'U'}
                          </span>
                          <span>
                            <strong>{rev.customerName}</strong>
                            <small>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</small>
                          </span>
                        </div>

                        {rev.vendorReply && (
                          <div className="vendor-reply-bubble">
                            <span className="font-semibold text-[#5D0F12] block mb-1">
                              Phản hồi từ {vendor.businessName}:
                            </span>
                            <span className="text-stone-600">{rev.vendorReply}</span>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                /* Figma Template Default Testimonial */
                <article className="review-card">
                  <div className="quote-mark">“</div>
                  <div>
                    <div className="stars">★★★★★</div>
                    <blockquote>
                      {vendor.businessName} đã biến buổi lễ trong mơ của chúng tôi thành hiện thực.
                      Mọi chi tiết đều tinh tế, nhưng vẫn rất tự nhiên và đúng với câu chuyện của hai đứa.
                    </blockquote>
                    <div className="review-author">
                      <span className="author-avatar">EJ</span>
                      <span>
                        <strong>Emily &amp; James</strong>
                        <small>Đám cưới tại {vendor.city || 'Đà Lạt'} · 03.2025</small>
                      </span>
                    </div>
                  </div>
                </article>
              )}
            </section>


        {/* EDITORIAL CTA SECTION (FIGMA TEMPLATE) */}
        <section className="editorial-cta">
          <div className="cta-image">
            <img alt="Bàn tiệc cưới với hoa và nến" src={photos[photos.length - 1].src} />
          </div>
          <div className="cta-content">
            <span className="eyebrow">Planora wedding editorial</span>
            <h2>
              Ngày trọng đại,
              <br />
              <em>được kể theo cách của bạn.</em>
            </h2>
            <p>
              Khám phá những nhà cung cấp được tuyển chọn và bắt đầu kế hoạch cưới trong mơ cùng Planora.
            </p>
            <Link className="primary-button" href="/marketplace">
              Khám phá nhà cung cấp <Icon name="arrow" />
            </Link>
          </div>
        </section>
      </main>

      {/* FLOATING LIVE CHAT DRAWER (REAL-TIME CONVERSATION) */}
      {isChatDrawerOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[420px] h-[550px] bg-white rounded-2xl shadow-2xl border border-[#dfd5c7] flex flex-col overflow-hidden animate-slide-up">
          {/* Drawer Header */}
          <div className="p-3.5 bg-[#711218] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold ring-1 ring-white/30">
                {vendor.businessName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight truncate max-w-[210px]">
                  {vendor.businessName}
                </h4>
                <span className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Trò chuyện trực tiếp &bull; Trực tuyến
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {activeInquiryId && (
                <Link
                  href={`/messages?inquiryId=${activeInquiryId}`}
                  title="Mở toàn màn hình trong Hộp Thư Tin Nhắn"
                  className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(false)}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Package Inquiry Success Notice */}
          {packageInquirySuccess && (
            <div className="bg-[#FAF6F0] border-b border-[#dfd5c7] px-3.5 py-2 flex items-center justify-between text-xs text-[#5D0F12]">
              <div className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  Đã gửi yêu cầu tư vấn gói <strong>{packageInquirySuccess}</strong>!
                </span>
              </div>
              <span className="text-[10px] text-stone-500 font-sans">Vừa xong</span>
            </div>
          )}

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8f4ec]/60 text-xs">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-stone-400 font-serif italic text-xs">
                Gửi lời chào để bắt đầu cuộc trò chuyện với {vendor.businessName}...
              </div>
            ) : (
              chatMessages.map(msg => {
                const isMe = msg.senderRole === 'USER' || msg.senderRole === 'CUSTOMER';
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-stone-400 mb-0.5 px-1">{isMe ? 'Bạn' : vendor.businessName}</span>
                    <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                      isMe ? 'bg-[#711218] text-white rounded-br-none shadow-sm' : 'bg-white border border-[#dfd5c7] text-stone-800 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 pt-2 pb-1.5 bg-white border-t border-[#dfd5c7]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-stone-400 text-[10px] whitespace-nowrap">Hỏi nhanh:</span>
            {[
              `Còn trống lịch ${weddingDate || 'ngày cưới'} không?`,
              'Gói này có ưu đãi gì hiện tại?',
              'Chính sách đặt cọc ra sao?',
              'Có phát sinh phí di chuyển?',
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setChatInputText(chip)}
                className="px-2.5 py-1 rounded-full bg-[#FAF6F0] hover:bg-[#f2ece2] text-stone-700 whitespace-nowrap border border-[#e5dcd3] transition text-[11px] cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendCustomerMessage} className="p-3 border-t border-[#dfd5c7] bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatInputText}
              onChange={e => setChatInputText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-[#dfd5c7] bg-[#f8f4ec]/50 text-xs focus:outline-none focus:ring-1 focus:ring-[#711218]"
            />
            <button
              type="submit"
              disabled={!chatInputText.trim() || isSendingChatMessage}
              className="p-2 rounded-xl bg-[#711218] text-white hover:bg-[#4e0b0f] transition disabled:opacity-40 cursor-pointer"
            >
              {isSendingChatMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* Planora App Footer (Retained as requested) */}
      <DashboardFooter />
    </div>
  );
}
