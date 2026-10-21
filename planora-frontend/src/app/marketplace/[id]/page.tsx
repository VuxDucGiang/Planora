'use client';

import React, { useState, useEffect, use, type FormEvent, type ReactNode } from 'react';
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
import { Loader2, X, Send, ExternalLink } from 'lucide-react';

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
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
  const handleSubmitInquiry = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!weddingDate || !vendor) return;
    setIsSubmittingInquiry(true);
    try {
      const inq = await createOrGetInquiry({
        vendorId: vendor.id,
        weddingPlanId: plan?.id,
        title: `Tư vấn tiệc cưới ngày ${weddingDate}`,
        message: `Xin chào ${vendor.businessName}! Tôi dự định tổ chức vào ngày ${weddingDate} với quy mô khoảng ${guestCount || '150 khách'}. Số điện thoại liên hệ: ${phoneNumber || 'Chưa cung cấp'}. Rất mong nhận được tư vấn chi tiết từ bạn.`,
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

  // Consistent photography & fallback data
  const photos = vendor.portfolios && vendor.portfolios.length > 0
    ? vendor.portfolios.map((p, idx) => ({
        src: p.imageUrl,
        alt: p.title || vendor.businessName,
        caption: p.title || 'Không gian tác nghiệp',
        year: '2026',
      }))
    : TEMPLATE_PHOTOS;

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
          <img
            alt={vendor.businessName}
            className="hero-image"
            src={photos[0].src}
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
                  <Icon name="sparkle" size={11} /> Planora's choice
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
                    <option value="Dưới 100 khách">Dưới 100 khách</option>
                    <option value="100–200 khách">100–200 khách</option>
                    <option value="200–400 khách">200–400 khách</option>
                    <option value="Trên 400 khách">Trên 400 khách</option>
                  </select>
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

              <button 
                className="primary-button" 
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
              className="secondary-button" 
              type="button"
              onClick={handleOpenDirectChat}
            >
              <Icon name="chat" size={17} /> Trò chuyện trực tiếp
            </button>

            <button
              className={isSaved ? 'save-button saved' : 'save-button'}
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
                  Chọn gói trải nghiệm phù hợp cho ngày trọng đại của hai bạn
                </p>
              </div>
              <div className="service-grid">
                {vendor.packages && vendor.packages.length > 0 ? (
                  vendor.packages.map((pkg, idx) => {
                    const isFeatured = idx === 0;
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
                          <p>{pkg.description || 'Gói dịch vụ cao cấp được thiết kế chuẩn mực theo yêu cầu của hai bạn.'}</p>
                          <ul>
                            <li>Tư vấn concept & bảng màu chủ đạo</li>
                            <li>Tác nghiệp trọn gói cùng ekip chuyên nghiệp</li>
                            <li>Hậu kỳ & bàn giao toàn bộ sản phẩm chất lượng cao</li>
                          </ul>
                        </div>
                        <button 
                          className="service-link"
                          type="button"
                          onClick={() => {
                            setWeddingDate(new Date().toISOString().split('T')[0]);
                            setGuestCount('100–200 khách');
                            document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Nhận tư vấn <Icon name="arrow" />
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
                        className="service-link"
                        type="button"
                        onClick={() => {
                          setWeddingDate(new Date().toISOString().split('T')[0]);
                          setGuestCount('100–200 khách');
                          document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Nhận tư vấn <Icon name="arrow" />
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
                        className="service-link"
                        type="button"
                        onClick={() => {
                          setWeddingDate(new Date().toISOString().split('T')[0]);
                          setGuestCount('200–400 khách');
                          document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Nhận tư vấn <Icon name="arrow" />
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
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-[#dfd5c7] flex flex-col overflow-hidden animate-slide-up">
          {/* Drawer Header */}
          <div className="p-3.5 bg-[#711218] text-white flex items-center justify-between">
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

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8f4ec]/60 text-xs">
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
                      isMe ? 'bg-[#711218] text-white rounded-br-none shadow-sm' : 'bg-white border border-[#dfd5c7] text-stone-800 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
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
