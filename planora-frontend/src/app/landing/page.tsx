'use client';

import React, { useState, useRef } from 'react';
import { Heart, Sparkles, Users, Palette, Compass } from 'lucide-react';
import LandingHeader from '@/components/layout/LandingHeader';
import LandingFooter from '@/components/layout/LandingFooter';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  tag: string;
}

const services: Service[] = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Venue Curation',
    description: 'Discover the perfect venue that matches your vision and budget',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Guest Management',
    description: 'Seamless RSVP tracking and invitation management tools',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Design & Decoration',
    description: 'Professional design consultation for your special day',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Day Coordination',
    description: 'Expert coordination to ensure your day flows perfectly',
  },
];

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

export default function WeddingLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? 7 : prev - 1));
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => (prev === 7 ? 0 : prev + 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Section with Full-Bleed Background Image */}
      <div className="relative min-h-screen lg:min-h-[90vh] flex flex-col overflow-visible">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="/landing/landing-1.png"
            alt="Wedding Background"
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
                    className="text-8xl lg:text-9xl font-normal leading-none"
                    style={{ fontFamily: '"Burgues Script W00 Regular", cursive', color: '#FFEEB5' }}
                  >
                    Planora
                  </span>
                  <span
                    className="text-xl lg:text-2xl font-normal italic tracking-wide pl-12"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif', color: '#FFEEB5' }}
                  >
                    Crafting unforgettable wedding.
                  </span>
                </h1>
                <p className="text-lg text-cream/90 leading-relaxed max-w-md">
                  Looking to spice up your eggs beyond just a drizzle of TRUFF® Hot Sauce? Visit our recipe page to get crackin&apos;. Hot Sauce is the perfect way to elevate your morning.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button className="px-8 py-3.5 rounded-full text-cream bg-sage-green hover:bg-sage-active transition-editorial font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  START NOW!
                </button>
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
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-shrink-0 w-[280px] sm:w-[320px] aspect-video rounded-3xl overflow-hidden shadow-2xl snap-center border border-white/10">
                  <img
                    src="/landing/landing-3.png"
                    alt="Bridesmaids"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-shrink-0 w-[280px] sm:w-[320px] aspect-video rounded-3xl overflow-hidden shadow-2xl snap-center border border-white/10">
                  <img
                    src="/landing/landing-4.png"
                    alt="Wedding Bouquet"
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
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Bottom left image (landing-3) */}
                <div className="absolute top-[220px] left-0 w-[380px] aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-[1.03] transition-transform duration-500">
                  <img
                    src="/landing/landing-3.png"
                    alt="Bridesmaids"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Bottom right image (landing-4) - cut off at screen edge */}
                <div className="absolute top-[220px] left-[404px] w-[380px] aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 hover:scale-[1.03] transition-transform duration-500">
                  <img
                    src="/landing/landing-4.png"
                    alt="Wedding Bouquet"
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
                className="w-full h-full object-cover group-hover:scale-105 transition-editorial duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Right Column: Collection details & 2x2 grid */}
            <div className="order-first md:order-second flex flex-col justify-center">
              <p className="text-xs font-bold text-sage-green tracking-widest uppercase mb-4">OUR COLLECTION</p>
              <h2 className="text-5xl lg:text-6xl font-serif text-ink leading-tight" style={{ fontFamily: 'var(--font-serif)', marginBottom: '40px' }}>
                Moments that
                <br />
                linger.
              </h2>
              <p className="text-body-text leading-relaxed max-w-lg" style={{ marginBottom: '56px' }}>
                We believe every wedding should be a gentle ritual, a celebration of love tailored specifically to you. Every detail is crafted with intention, ensuring your special day feels effortless and deeply personal.
              </p>

              {/* 2x2 Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Sparkles className="w-5 h-5" />,
                    title: 'Tailored Planning',
                    desc: 'Personalized templates and custom checklist.',
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: 'Seamless RSVP',
                    desc: 'Real-time guest lists and interactive seating chart.',
                  },
                  {
                    icon: <Palette className="w-5 h-5" />,
                    title: 'Visual Curation',
                    desc: 'Curate color palettes and layout designs for your venue.',
                  },
                  {
                    icon: <Compass className="w-5 h-5" />,
                    title: 'Vendor Directory',
                    desc: 'Connect with handpicked florists and caterers.',
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
      <section id="how-it-works" className="relative pt-24 pb-32 bg-sage-green overflow-hidden text-center">
        {/* Header content constrained to central column */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-20">
          <div className="mb-20">
            {/* FIGMA SPEC: font-family: ITC Garamond Std; font-weight: 400; font-size: 40px; line-height: 100%; letter-spacing: 0%; */}
            <h2
              className="text-5xl lg:text-6xl font-normal leading-[100%] tracking-normal mb-6"
              style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif', color: '#FFEEB5' }}
            >
              How It Works
            </h2>

            {/* FIGMA SPEC: font-family: IM FELL French Canon; font-weight: 400; font-size: 24px; line-height: 38px; */}
            <p
              className="text-lg md:text-[24px] font-normal leading-[38px] tracking-normal"
              style={{ fontFamily: '"IM Fell French Canon", serif', color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Crafting Unforgettable Wedding Experiences.
            </p>
          </div>
        </div>

        {/* Timeline Grid (Spans full page width) */}
        <div className="relative w-full mt-16 pb-12 overflow-visible">
          {/* Connecting Horizontal Line (desktop only) - stretches across the entire page */}
          <div className="hidden md:block absolute top-[9px] left-0 right-0 h-[2px] bg-white/30 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 w-full relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center px-4">
              {/* Dot */}
              <div className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)] mb-6 relative z-10 border-[3px] border-sage-green" />
              <h4
                className="text-xl md:text-2xl leading-relaxed max-w-[280px]"
                style={{ fontFamily: '"IM Fell French Canon", serif', color: '#ffffff' }}
              >
                Enter Your<br />Wedding Details
              </h4>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center px-4">
              {/* Dot */}
              <div className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)] mb-6 relative z-10 border-[3px] border-sage-green" />
              <h4
                className="text-xl md:text-2xl leading-relaxed max-w-[280px]"
                style={{ fontFamily: '"IM Fell French Canon", serif', color: '#ffffff' }}
              >
                Receive AI-Curated<br />Plans & Vendors
              </h4>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center px-4">
              {/* Dot */}
              <div className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)] mb-6 relative z-10 border-[3px] border-sage-green" />
              <h4
                className="text-xl md:text-2xl leading-relaxed max-w-[280px]"
                style={{ fontFamily: '"IM Fell French Canon", serif', color: '#ffffff' }}
              >
                Manage & Update<br />Your Progress
              </h4>
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
      <section id="vendors" className="relative py-28 bg-cream overflow-visible w-full">
        {/* Constrained layout for the upper elements */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {/* Badge */}
          <div className="mb-12 flex justify-start">
            <span className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase bg-sage-green text-[#FFEEB5]" style={{ fontFamily: '"Istok Web", sans-serif' }}>
              FEATURED VENDORS
            </span>
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
            className="flex gap-8 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(calc(50vw - (var(--card-width) / 2) - ${currentIndex} * (var(--card-width) + 2rem)))`,
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {vendorsList.map((item, idx) => {
              // The centerpiece card is idx === currentIndex
              const isActive = idx === currentIndex;
              // The 3 middle visible cards (centerpiece + 1 left neighbor + 1 right neighbor)
              const isMiddleThree =
                idx === currentIndex ||
                idx === (currentIndex - 1 + 8) % 8 ||
                idx === (currentIndex + 1) % 8;

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
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <p className="absolute bottom-6 left-0 right-0 text-center text-white text-sm font-bold tracking-widest uppercase" style={{ fontFamily: '"Istok Web", sans-serif' }}>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
            <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8">
              <h3
                className="text-4xl md:text-5xl font-normal tracking-wide uppercase border-b-2 pb-2 inline-block text-left"
                style={{ fontFamily: '"IM Fell French Canon", serif', color: '#5D0F12', borderColor: '#5D0F12' }}
              >
                OUR VENDORS
              </h3>
              <p className="text-sm text-muted-text text-left font-normal" style={{ fontFamily: '"Istok Web", sans-serif', lineHeight: '1.4' }}>
                Access Hundreds of<br />Trusted Wedding Vendors
              </p>
            </div>
          </div>

          {/* Featured Highlight Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-hairline/50">
            {/* Left Image column (6 cols) */}
            <div className="md:col-span-6 relative aspect-[16/10] md:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-sm">
              <img
                src="/landing/landing-2.png"
                alt="Behind every perfect wedding"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Details column (6 cols) */}
            <div className="md:col-span-6 flex flex-col justify-center space-y-6 md:pl-6 text-left">
              <div>
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ fontFamily: '"Istok Web", sans-serif', color: 'rgba(26,26,26,0.5)' }}
                >
                  MIDORI WEDDING
                </p>
                <h4
                  className="text-3xl md:text-4xl font-normal leading-tight uppercase"
                  style={{ fontFamily: '"IM Fell French Canon", serif', color: '#5D0F12' }}
                >
                  BEHIND EVERY<br />PERFECT WEDDING
                </h4>
                <p
                  className="text-sm mt-4 text-muted-text font-normal"
                  style={{ fontFamily: '"Istok Web", sans-serif' }}
                >
                  Behind Every Perfect Wedding: Our Planning Process.
                </p>
              </div>

              <div>
                <button
                  className="px-8 py-3 rounded-full bg-sage-green text-cream font-bold text-sm tracking-wider uppercase hover:bg-sage-active transition-all duration-200 cursor-pointer shadow-md"
                  style={{ fontFamily: '"Istok Web", sans-serif' }}
                >
                  Detail &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative pt-20 pb-24 bg-sage-green overflow-visible">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-20">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(248,247,245,0.7)' }}>KIND WORDS</p>
            <h2 className="text-5xl lg:text-6xl font-serif" style={{ fontFamily: 'var(--font-serif)', color: '#FFEEB5' }}>
              Loved by thousands
            </h2>
          </div>

          {/* Marquee Columns Container */}
          <div className="relative h-[650px] overflow-hidden pause-hover">
            {/* Gradient Mask Overlays */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 z-20" style={{ background: 'linear-gradient(to bottom, #5D0F12, transparent)' }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-20" style={{ background: 'linear-gradient(to top, #5D0F12, transparent)' }} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Column 1: Moves Up */}
              <div className="flex flex-col gap-6 overflow-hidden relative h-full">
                <div className="flex flex-col gap-6 animate-marquee-up py-4">
                  {[...col1Testimonials, ...col1Testimonials].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-8 rounded-3xl bg-white/20 border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-editorial flex flex-col justify-between min-h-[220px]"
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
                  {[...col2Testimonials, ...col2Testimonials].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-8 rounded-3xl bg-white/20 border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-editorial flex flex-col justify-between min-h-[220px]"
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
                  {[...col3Testimonials, ...col3Testimonials].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-8 rounded-3xl bg-white/20 border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-editorial flex flex-col justify-between min-h-[220px]"
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
      <section id="contact" className="relative pt-44 pb-40 bg-cream overflow-visible">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 flex flex-col items-center text-center">
          {/* PLANORA label */}
          <p
            className="text-sm tracking-[0.86px] uppercase mb-10"
            style={{ fontFamily: '"Istok Web", sans-serif', fontWeight: 700, color: 'var(--color-sage-green)' }}
          >
            PLANORA
          </p>

          {/* Main heading */}
          <h2
            className="text-4xl sm:text-5xl md:text-6xl leading-[110%] uppercase mb-10"
            style={{ fontFamily: '"IM Fell French Canon", serif', fontWeight: 400, color: 'var(--color-ink)' }}
          >
            Plan Your Perfect Day
          </h2>

          {/* Sub-heading */}
          <p
            className="text-base leading-[140%] mb-20"
            style={{ fontFamily: '"Istok Web", sans-serif', fontWeight: 400, color: 'var(--color-body-text)' }}
          >
            Crafting Unforgettable Wedding Experiences.
          </p>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-0 shadow-sm">
            <div className="flex items-center flex-1 bg-white border border-hairline border-r-0 rounded-l-full px-5 gap-3">
              <svg className="w-4 h-4 text-muted-text flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 py-4 bg-transparent text-sm text-ink placeholder-muted-text focus:outline-none"
                style={{ fontFamily: '"Istok Web", sans-serif' }}
                required
              />
            </div>
            <button
              type="submit"
              className="px-7 py-4 rounded-r-full bg-sage-green text-cream font-bold text-sm tracking-widest uppercase hover:bg-sage-active transition-all duration-200 cursor-pointer whitespace-nowrap"
              style={{ fontFamily: '"Istok Web", sans-serif' }}
            >
              SIGN UP
            </button>
          </form>

          {submitted && (
            <p className="text-sm text-sage-green font-medium mt-4">
              ✓ Check your email to begin your journey
            </p>
          )}
        </div>


      </section>

      {/* Footer */}
      <footer className="relative pt-20 pb-0 bg-sage-green overflow-visible">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16">
            {/* Brand column */}
            <div className="md:col-span-1 flex flex-col gap-5">
              {/* Logo */}
              <div
                className="w-16 h-16 flex items-center justify-center border"
                style={{ backgroundColor: '#f0e6d3', borderColor: '#c9a97a' }}
              >
                <span
                  className="text-3xl"
                  style={{ fontFamily: '"Burgues Script W00 Regular", cursive', color: '#5D0F12' }}
                >
                  P
                </span>
              </div>
              <p
                className="text-xs uppercase leading-relaxed tracking-wide"
                style={{ fontFamily: '"Istok Web", sans-serif', fontWeight: 700, color: '#f8f7f5', opacity: 0.8 }}
              >
                Crafting Unforgettable<br />Wedding Experiences.
              </p>
              {/* Social icons */}
              <div className="flex gap-3 mt-1">
                {[
                  // Facebook
                  <svg key="fb" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>,
                  // Twitter
                  <svg key="tw" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>,
                  // Instagram
                  <svg key="ig" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" /></svg>,
                ].map((icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full flex items-center justify-center text-cream hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {[
              {
                heading: 'Product',
                links: ['Features', 'Pricing', 'Case studies', 'Reviews', 'Updates'],
              },
              {
                heading: 'Company',
                links: ['About', 'Contact us', 'Careers', 'Blog'],
              },
              {
                heading: 'Support',
                links: ['Getting started', 'Help center', 'Server status', 'Report a bug', 'Chat support'],
              },
              {
                heading: 'Downloads',
                links: ['iOS', 'Android', 'Mac', 'Windows', 'Chrome'],
              },
            ].map((col) => (
              <div key={col.heading}>
                <h4
                  className="text-sm font-bold mb-5 tracking-wide"
                  style={{ fontFamily: '"Istok Web", sans-serif', color: '#f8f7f5' }}
                >
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm hover:opacity-100 transition-opacity"
                        style={{ fontFamily: '"Istok Web", sans-serif', color: 'rgba(248,247,245,0.65)' }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t py-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs" style={{ borderColor: 'rgba(248,247,245,0.15)', color: 'rgba(248,247,245,0.5)', fontFamily: '"Istok Web", sans-serif' }}>
            <span>Copyright © 2023 BRIX Templates | All Rights Reserved |</span>
            <div className="flex gap-2">
              <a href="#" className="hover:opacity-100 underline" style={{ color: 'rgba(248,247,245,0.65)' }}>Terms and Conditions</a>
              <span>|</span>
              <a href="#" className="hover:opacity-100 underline" style={{ color: 'rgba(248,247,245,0.65)' }}>Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
