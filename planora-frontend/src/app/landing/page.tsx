'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Users, Palette, Compass } from 'lucide-react';
import LandingHeader from '@/components/layout/LandingHeader';
import LandingFooter from '@/components/layout/LandingFooter';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  tag: string;
}

const col1Testimonials: Testimonial[] = [
  {
    quote: 'Planora transformed the way we planned our wedding. Everything was organized and stress-free.',
    name: 'Sarah & Michael',
    location: 'New York',
    tag: 'Full Planning',
  },
  {
    quote: 'The visual coordination tool is a game changer. We visualized our venue layout perfectly.',
    name: 'Emily & David',
    location: 'Los Angeles',
    tag: 'Design & Decor',
  },
  {
    quote: 'We managed over 200 guests RSVPs without a single issue. The seating chart tool is magic.',
    name: 'Sophia & James',
    location: 'Chicago',
    tag: 'RSVP Tool',
  },
];

const col2Testimonials: Testimonial[] = [
  {
    quote: 'The team was supportive throughout our entire planning journey. Truly exceptional service.',
    name: 'Jessica & Tom',
    location: 'Seattle',
    tag: 'Coordination',
  },
  {
    quote: 'We saved hours of work using the auto-reminders for guest RSVPs. Highly recommended!',
    name: 'Emma & John',
    location: 'Boston',
    tag: 'Guest RSVP',
  },
  {
    quote: 'Finding trusted vendors in our area was so easy. The curated directory is outstanding.',
    name: 'Olivia & Ryan',
    location: 'Miami',
    tag: 'Vendor Directory',
  },
];

const col3Testimonials: Testimonial[] = [
  {
    quote: 'From venue selection to final details, Planora was our perfect planning partner.',
    name: 'Lisa & David',
    location: 'Austin',
    tag: 'Full Planning',
  },
  {
    quote: 'Our wedding day flowed flawlessly thanks to the timeline planning feature.',
    name: 'Chloe & Matthew',
    location: 'San Francisco',
    tag: 'Timeline Control',
  },
  {
    quote: 'Their customer support team went above and beyond to help us customize our invitation cards.',
    name: 'Grace & Andrew',
    location: 'Denver',
    tag: 'Guest RSVP',
  },
];

const col1TestimonialsVi: Testimonial[] = [
  {
    quote: 'Planora đã thay đổi hoàn toàn cách chúng mình chuẩn bị đám cưới. Mọi thứ ngăn nắp, rõ ràng và không hề áp lực.',
    name: 'Minh Quân & Thảo Linh',
    location: 'Hà Nội',
    tag: 'Trọn gói',
  },
  {
    quote: 'Tính năng định hình concept và dự toán ngân sách thật tuyệt vời. Hai vợ chồng kiểm soát chi phí rất nhẹ nhàng.',
    name: 'Đức Huy & Quỳnh Nga',
    location: 'TP. Hồ Chí Minh',
    tag: 'Thiết kế tiệc cưới',
  },
  {
    quote: 'Chúng mình quản lý hơn 300 khách mời mà không xảy ra sai sót nào. Danh sách khách mời và bàn tiệc rất trực quan.',
    name: 'Tuấn Anh & Mai Phương',
    location: 'Đà Nẵng',
    tag: 'Quản lý khách mời',
  },
];

const col2TestimonialsVi: Testimonial[] = [
  {
    quote: 'Đội ngũ đối tác trên Planora vô cùng uy tín và tận tâm trong suốt hành trình chuẩn bị ngày vui.',
    name: 'Hoàng Long & Bích Trâm',
    location: 'Hải Phòng',
    tag: 'Điều phối',
  },
  {
    quote: 'Tiết kiệm được vô số thời gian nhờ tính năng nhắc nhở và quản lý checklist theo từng giai đoạn chuẩn bị.',
    name: 'Hải Đăng & Thu Trang',
    location: 'Cần Thơ',
    tag: 'Checklist thông minh',
  },
  {
    quote: 'Dễ dàng tìm kiếm những studio chụp ảnh và nhà hàng tiệc cưới phù hợp nhất với phong cách và ngân sách.',
    name: 'Trọng Nghĩa & Ngọc Lan',
    location: 'Hà Nội',
    tag: 'Mạng lưới đối tác',
  },
];

const col3TestimonialsVi: Testimonial[] = [
  {
    quote: 'Từ chọn sảnh tiệc cho đến từng chi tiết nhỏ nhất, Planora là người đồng hành đáng tin cậy nhất của chúng mình.',
    name: 'Quang Dũng & Hương Giang',
    location: 'Nha Trang',
    tag: 'Lập kế hoạch',
  },
  {
    quote: 'Lễ cưới diễn ra trơn tru và hoàn hảo từ sáng đến tối nhờ timeline chuẩn xác từng phút của Planora.',
    name: 'Văn Hùng & Thanh Mai',
    location: 'TP. Hồ Chí Minh',
    tag: 'Dòng thời gian',
  },
  {
    quote: 'Giao diện sang trọng, dễ sử dụng, rất phù hợp cho các cặp đôi bận rộn như hai đứa mình.',
    name: 'Duy Khánh & Ánh Tuyết',
    location: 'Vũng Tàu',
    tag: 'Trải nghiệm số',
  },
];

const vendorsList = [
  {
    image: "/wedding-landing.jpg",
    name: "MIDORI WEDDING",
  },
  {
    image: "/wedding-our-collection.jpg",
    name: "SUSAN WEDDING",
  },
  {
    image: "/landing/landing-3.png",
    name: "PLANORA WEDDING",
  },
  {
    image: "/landing/landing-1.png",
    name: "ELEGANT NUPTIALS",
  },
  {
    image: "/landing/landing-4.png",
    name: "BLOSSOM BRIDES",
  },
  {
    image: "/landing/landing-2.png",
    name: "ROYAL RITUALS",
  },
  {
    image: "/wedding-landing.jpg",
    name: "FOREVER FLORA",
  },
  {
    image: "/wedding-our-collection.jpg",
    name: "GOLDEN MOMENTS",
  },
];

const extendedVendorsList = [
  ...vendorsList,
  ...vendorsList,
  ...vendorsList,
];

export default function WeddingLanding() {
  const { language, t } = useLanguage();
  const activeCol1 = language === 'vi' ? col1TestimonialsVi : col1Testimonials;
  const activeCol2 = language === 'vi' ? col2TestimonialsVi : col2Testimonials;
  const activeCol3 = language === 'vi' ? col3TestimonialsVi : col3Testimonials;
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(8); // Start in the middle copy
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  const scrollPrev = () => {
    if (!isTransitionEnabled) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const scrollNext = () => {
    if (!isTransitionEnabled) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    if (currentIndex >= 16) {
      setIsTransitionEnabled(false);
      setCurrentIndex(currentIndex - 8);
    } else if (currentIndex < 8) {
      setIsTransitionEnabled(false);
      setCurrentIndex(currentIndex + 8);
    }
  };

  React.useEffect(() => {
    if (!isTransitionEnabled) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitionEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream landing-zoom-container">
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (min-width: 1024px) {
            .landing-zoom-container {
              zoom: 0.85;
            }
          }
        `
      }} />
      {/* Top Section with Full-Bleed Background Image */}
      <div className="relative min-h-screen lg:min-h-[90vh] flex flex-col overflow-visible">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="/landing/landing-1.png"
            alt="Wedding Background"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          {/* Gradients to guarantee text contrast and smooth page transition */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream/45 via-cream/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
        </div>

        <LandingHeader />

        {/* Hero Section */}
        <section className="relative z-10 flex-1 flex items-center pt-12 pb-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Overlay */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="flex flex-col space-y-1">
                  <span
                    className="text-6xl sm:text-8xl lg:text-9xl font-normal leading-none text-[#5D0F12] select-none"
                    style={{
                      fontFamily: '"Burgues Script W00 Regular", cursive',
                      color: '#4b0c0eff',

                    }}
                  >
                    Planora
                  </span>
                  <span
                    className="text-lg sm:text-xl lg:text-2xl font-serif font-semibold italic tracking-wide pl-4 sm:pl-12 text-black"
                    style={{
                      color: '#000000',
                      fontWeight: 600,
                    }}
                  >
                    {t.landing.heroSubtitle}
                  </span>
                </h1>
                <p
                  className="text-lg text-black font-semibold leading-relaxed max-w-md"
                  style={{ color: '#000000', fontWeight: 600 }}
                >
                  {t.landing.heroDescription}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-full !text-cream bg-sage-green hover:bg-sage-active transition-editorial font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  style={{ color: '#FFFBF5' }}
                >
                  {t.landing.heroStartNow}
                </Link>
              </div>
            </div>

            {/* Right Images Showcase (3 horizontal 16:9 images) */}
            <div className="lg:col-span-7 relative w-full h-[320px] sm:h-[400px] lg:h-[460px] flex items-center justify-center lg:block mt-8 lg:mt-0">
              {/* Mobile/Tablet Horizontal Scroll layout */}
              <div className="lg:hidden w-full overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory flex gap-4 px-4 scroll-smooth">
                <div className="flex-shrink-0 w-[280px] sm:w-[320px] aspect-video rounded-3xl overflow-hidden shadow-2xl snap-center border border-white/10">
                  <img
                    src="/landing/landing-2.png"
                    alt="Wedding Couple"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-shrink-0 w-[280px] sm:w-[320px] aspect-video rounded-3xl overflow-hidden shadow-2xl snap-center border border-white/10">
                  <img
                    src="/landing/landing-3.png"
                    alt="Bridesmaids"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-shrink-0 w-[280px] sm:w-[320px] aspect-video rounded-3xl overflow-hidden shadow-2xl snap-center border border-white/10">
                  <img
                    src="/landing/landing-4.png"
                    alt="Wedding Bouquet"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Desktop Staggered Overlay layout */}
              <div className="hidden lg:block relative w-full h-full overflow-visible">
                {/* Top right image (landing-2) */}
                <div className="absolute top-0 left-[228px] w-[380px] aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-[1.03] transition-transform duration-500">
                  <img
                    src="/landing/landing-2.png"
                    alt="Wedding Couple"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Bottom left image (landing-3) */}
                <div className="absolute top-[220px] left-0 w-[380px] aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-[1.03] transition-transform duration-500">
                  <img
                    src="/landing/landing-3.png"
                    alt="Bridesmaids"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Bottom right image (landing-4) - cut off at screen edge */}
                <div className="absolute top-[220px] left-[404px] w-[380px] aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-[1.03] transition-transform duration-500">
                  <img
                    src="/landing/landing-4.png"
                    alt="Wedding Bouquet"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Ribbon Divider – sits exactly on the boundary */}
        <div
          className="absolute bottom-0 left-0 w-full h-28 opacity-100 z-10"
          style={{
            transform: 'translateY(50%)',
            backgroundImage: 'url(/landing/split.png)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center',
            backgroundSize: 'auto 100%',
          }}
        />
      </div>

      {/* Gallery Section */}
      <section id="gallery" className="relative pt-20 pb-24 bg-surface-soft overflow-visible">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            {/* Left Column: Collection Showcase Image */}
            <div className="order-last md:order-first relative w-full min-h-[350px] md:min-h-full rounded-3xl overflow-hidden shadow-lg group">
              <img
                src="/wedding-our-collection.jpg"
                alt="Wedding Collection Showcase"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-editorial duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Right Column: Collection details & 2x2 grid */}
            <div className="order-first md:order-second flex flex-col justify-center">
              <p className="text-xs font-bold text-sage-green tracking-widest uppercase mb-4">{t.landing.collectionTag}</p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-ink leading-tight mb-8 sm:mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
                {t.landing.collectionTitleLine1}
                <br />
                {t.landing.collectionTitleLine2}
              </h2>
              <p className="text-body-text leading-relaxed max-w-lg mb-8 sm:mb-14">
                {t.landing.collectionDesc}
              </p>

              {/* 2x2 Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Sparkles className="w-5 h-5" />,
                    title: t.landing.featTailoredPlanning,
                    desc: t.landing.featTailoredPlanningDesc,
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: t.landing.featSeamlessRsvp,
                    desc: t.landing.featSeamlessRsvpDesc,
                  },
                  {
                    icon: <Palette className="w-5 h-5" />,
                    title: t.landing.featVisualCuration,
                    desc: t.landing.featVisualCurationDesc,
                  },
                  {
                    icon: <Compass className="w-5 h-5" />,
                    title: t.landing.featVendorDirectory,
                    desc: t.landing.featVendorDirectoryDesc,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white border border-hairline/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-editorial flex flex-col gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-sage-green/10 flex items-center justify-center text-sage-green flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-text leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative pt-20 pb-24 bg-sage-green overflow-hidden text-center">
        {/* Header content constrained to central column */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-12 sm:mb-16">
          <div className="mb-8 sm:mb-16">
            <h2
              className="text-3xl sm:text-[41px] lg:text-[51px] font-serif font-normal leading-[110%] tracking-normal mb-4 sm:mb-6"
              style={{ color: '#FFEEB5' }}
            >
              {t.landing.howItWorksTitle}
            </h2>

            <p
              className="text-[15px] md:text-[20px] font-serif font-normal leading-relaxed md:leading-[32px] tracking-normal"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              {t.landing.howItWorksSubtitle}
            </p>
          </div>
        </div>

        {/* Timeline Grid (Spans full page width) */}
        <div className="relative w-full mt-12 pb-10 overflow-visible">
          {/* Connecting Horizontal Line (desktop only) - stretches across the entire page */}
          <div className="hidden md:block absolute top-[9px] left-0 right-0 h-[2px] bg-white/30 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 w-full relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center px-4">
              {/* Dot */}
              <div className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)] mb-6 relative z-10 border-[3px] border-sage-green" />
              <h4
                className="text-[17px] md:text-[20px] font-serif leading-relaxed max-w-[280px] text-white"
                dangerouslySetInnerHTML={{ __html: t.landing.step1Title }}
              />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center px-4">
              {/* Dot */}
              <div className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)] mb-6 relative z-10 border-[3px] border-sage-green" />
              <h4
                className="text-[17px] md:text-[20px] font-serif leading-relaxed max-w-[280px] text-white"
                dangerouslySetInnerHTML={{ __html: t.landing.step2Title }}
              />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center px-4">
              {/* Dot */}
              <div className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)] mb-6 relative z-10 border-[3px] border-sage-green" />
              <h4
                className="text-[17px] md:text-[20px] font-serif leading-relaxed max-w-[280px] text-white"
                dangerouslySetInnerHTML={{ __html: t.landing.step3Title }}
              />
            </div>
          </div>
        </div>

        {/* Ribbon Divider */}
        <div
          className="absolute bottom-0 left-0 w-full h-28 opacity-100 z-10"
          style={{
            transform: 'translateY(0%)',
            backgroundImage: 'url(/landing/split-2.png)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center',
            backgroundSize: 'auto 170%',
          }}
        />
      </section>

      {/* Featured Vendors Section */}
      <section id="vendors" className="relative pt-14 pb-28 bg-cream overflow-visible w-full">
        {/* Constrained layout for the upper elements */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {/* Badge */}
          <div className="mb-8 sm:mb-12 flex justify-center text-center">
            <h2
              className="text-3xl sm:text-[41px] lg:text-[51px] font-serif font-normal leading-[110%] tracking-normal text-[#5D0F12]"
            >
              {t.landing.featuredVendorsTitle}
            </h2>
          </div>
        </div>

        {/* Carousel Slider (spans 100% full screen width, center active centerpiece) */}
        <div className="relative overflow-hidden w-full py-8 overflow-x-hidden">
          {/* Inject style block to declare responsive card width and hide scrollbar */}
          <style dangerouslySetInnerHTML={{
            __html: `
            :root {
              --card-width: 280px;
            }
            @media (min-width: 640px) {
              :root {
                --card-width: 320px;
              }
            }
            @media (min-width: 1024px) {
              :root {
                --card-width: 350px;
              }
            }
          `}} />

          <div
            className="flex gap-8"
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translateX(calc(50vw - (var(--card-width) / 2) - ${currentIndex} * (var(--card-width) + 2rem)))`,
              transition: isTransitionEnabled ? 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }}
          >
            {extendedVendorsList.map((item, idx) => {
              // The centerpiece card is idx === currentIndex
              const isActive = idx === currentIndex;
              // The 3 middle visible cards (centerpiece + 1 left neighbor + 1 right neighbor)
              const isMiddleThree =
                idx === currentIndex ||
                idx === (currentIndex - 1 + 24) % 24 ||
                idx === (currentIndex + 1) % 24;

              return (
                <div
                  key={idx}
                  className={`vendor-card relative w-[var(--card-width)] aspect-[3/4] rounded-[2rem] overflow-hidden group transition-all duration-500 flex-shrink-0
                    ${isActive
                      ? 'opacity-100 scale-100 md:scale-105 shadow-xl hover:scale-[1.08] hover:shadow-2xl z-20'
                      : isMiddleThree
                        ? 'opacity-100 scale-100 blur-none shadow-md z-15 hover:scale-[1.03]'
                        : 'opacity-30 scale-90 md:scale-95 blur-[0.5px] shadow-sm z-10'
                    }
                  `}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <p className="absolute bottom-6 left-0 right-0 text-center text-white text-sm font-bold tracking-widest uppercase font-sans">
                    {item.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons positioned directly under the images */}
        <div className="flex justify-center gap-6 mt-6 mb-16 relative z-10">
          <button
            onClick={scrollPrev}
            className="w-12 h-12 rounded-full border border-hairline/80 flex items-center justify-center bg-white text-ink hover:bg-cream hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <span className="text-lg">←</span>
          </button>
          <button
            onClick={scrollNext}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-sage-green text-cream hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <span className="text-lg">→</span>
          </button>
        </div>

        {/* Heading and Highlight Card restricted layout */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {/* Heading */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 sm:mb-16">
            <div className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-8">
              <h3
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-wide uppercase border-b-2 pb-2 inline-block text-left text-[#5D0F12] border-[#5D0F12]"
              >
                {t.landing.ourVendorsTitle}
              </h3>
              <p className="text-sm text-muted-text text-left font-normal font-sans" style={{ lineHeight: '1.4' }}>
                {t.landing.ourVendorsSubtitle}
              </p>
            </div>
          </div>

          {/* Featured Highlight Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-hairline/50">
            {/* Left Image column (6 cols) */}
            <div className="md:col-span-6 relative aspect-[16/10] md:aspect-[4/3] rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm">
              <img
                src="/landing/landing-2.png"
                alt="Behind every perfect wedding"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Details column (6 cols) */}
            <div className="md:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-6 md:pl-6 text-left">
              <div>
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-2 sm:mb-3 font-sans text-neutral-500"
                >
                  MIDORI WEDDING
                </p>
                <h4
                  className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-tight uppercase text-[#5D0F12]"
                  dangerouslySetInnerHTML={{ __html: t.landing.behindEveryTitle }}
                />
                <p
                  className="text-sm mt-3 sm:mt-4 text-muted-text font-normal font-sans"
                >
                  {t.landing.behindEveryDesc}
                </p>
              </div>

              <div>
                <button
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-sage-green text-cream font-bold text-sm tracking-wider uppercase hover:bg-sage-active transition-all duration-200 cursor-pointer shadow-md font-sans"
                >
                  {t.landing.detailBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="testimonials" className="relative pt-20 pb-24 bg-sage-green overflow-visible">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-10 sm:mb-20">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(248,247,245,0.7)' }}>{t.landing.testimonialsTag}</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif" style={{ fontFamily: 'var(--font-serif)', color: '#FFEEB5' }}>
              {t.landing.testimonialsTitle}
            </h2>
          </div>

          {/* Marquee Columns Container */}
          <div className="relative h-[480px] sm:h-[650px] overflow-hidden pause-hover">
            {/* Gradient Mask Overlays */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 z-20" style={{ background: 'linear-gradient(to bottom, #5D0F12, transparent)' }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-20" style={{ background: 'linear-gradient(to top, #5D0F12, transparent)' }} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Column 1: Moves Up */}
              <div className="flex flex-col gap-6 overflow-hidden relative h-full">
                <div className="flex flex-col gap-6 animate-marquee-up py-4">
                  {[...activeCol1, ...activeCol1].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/20 border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-editorial flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                    >
                      <p className="leading-relaxed mb-6 font-serif italic text-base md:text-lg" style={{ color: '#ffffff' }}>
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#f8f7f5' }}>{item.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(248,247,245,0.85)' }}>{item.location}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFEEB5', borderColor: 'rgba(255,255,255,0.25)' }}>
                          {item.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Moves Down */}
              <div className="hidden md:flex flex-col gap-6 overflow-hidden relative h-full">
                <div className="flex flex-col gap-6 animate-marquee-down py-4">
                  {[...activeCol2, ...activeCol2].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/20 border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-editorial flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                    >
                      <p className="leading-relaxed mb-6 font-serif italic text-base md:text-lg" style={{ color: '#ffffff' }}>
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#f8f7f5' }}>{item.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(248,247,245,0.85)' }}>{item.location}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFEEB5', borderColor: 'rgba(255,255,255,0.25)' }}>
                          {item.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Moves Up */}
              <div className="hidden md:flex flex-col gap-6 overflow-hidden relative h-full">
                <div className="flex flex-col gap-6 animate-marquee-up py-4">
                  {[...activeCol3, ...activeCol3].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/20 border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-editorial flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                    >
                      <p className="leading-relaxed mb-6 font-serif italic text-base md:text-lg" style={{ color: '#ffffff' }}>
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#f8f7f5' }}>{item.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(248,247,245,0.85)' }}>{item.location}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFEEB5', borderColor: 'rgba(255,255,255,0.25)' }}>
                          {item.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Ribbon Divider */}
        <div
          className="absolute bottom-0 left-0 w-full h-28 opacity-100 z-10"
          style={{
            transform: 'translateY(0%)',
            backgroundImage: 'url(/landing/split-2.png)',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center',
            backgroundSize: 'auto 170%',
          }}
        />
      </section>

      {/* CTA / Newsletter Section */}
      <section id="contact" className="relative pt-28 pb-24 sm:pt-44 sm:pb-40 bg-cream overflow-visible">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 flex flex-col items-center text-center">
          {/* PLANORA label */}
          <p
            className="mb-4 sm:mb-7 select-none"
            style={{
              fontFamily: '"Burgues Script W00 Regular", BurguesScriptW00-Regular, cursive',
              letterSpacing: '7%',
              color: '#5D0F12',
              WebkitTextStroke: '0.8px #5D0F12',
              paintOrder: 'stroke fill',
              fontWeight: 400,
              fontSize: 'clamp(48px, 12vw, 75px)',
              lineHeight: 0.9,
            }}
          >
            Planora
          </p>

          {/* Main heading */}
          <h2
            className="text-2xl sm:text-4xl md:text-6xl font-serif leading-[115%] uppercase mb-8 sm:mb-16 font-normal text-ink"
          >
            {t.landing.ctaTitle}
          </h2>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full max-w-md gap-3 sm:gap-0 shadow-sm mt-3 sm:mt-5">
            <div className="flex items-center flex-1 bg-white border border-hairline rounded-full sm:rounded-r-none sm:border-r-0 px-5 py-1 sm:py-0 gap-3">
              <svg className="w-4 h-4 text-muted-text flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.landing.emailPlaceholder}
                className="flex-1 py-3.5 sm:py-4 bg-transparent text-base sm:text-sm text-ink placeholder-muted-text focus:outline-none font-sans"
                required
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3.5 sm:py-4 rounded-full sm:rounded-l-none bg-sage-green text-cream font-bold text-sm tracking-widest uppercase hover:bg-sage-active transition-all duration-200 cursor-pointer whitespace-nowrap shadow-sm font-sans"
            >
              {t.landing.signUpBtn}
            </button>
          </form>

          {submitted && (
            <p className="text-sm text-sage-green font-medium mt-4">
              {t.landing.emailSuccessMsg}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
