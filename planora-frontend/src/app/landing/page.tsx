'use client';

import React, { useState } from 'react';
import { Heart, ChevronRight, Sparkles, Users, Palette, Compass } from 'lucide-react';
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

export default function WeddingLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* Top Section with Full-Bleed Background Image */}
      <div className="relative min-h-screen lg:min-h-[90vh] flex flex-col">
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
          <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
            {/* Left Content Overlay */}
            <div className="max-w-xl flex flex-col justify-center space-y-6">
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
                <p className="text-lg text-body-text leading-relaxed max-w-md">
                  Streamline every moment of your wedding planning. From venue selection to final coordination, we&apos;ve got you covered.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button className="px-7 py-3 rounded-sm text-cream bg-sage-green hover:bg-sage-active transition-editorial font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer">
                  Start Planning
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="px-7 py-3 rounded-sm text-sage-green border-2 border-sage-green bg-transparent hover:bg-sage-green/5 transition-editorial font-semibold text-sm cursor-pointer">
                  View Stories
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Section Divider */}
      <div
        className="w-full h-28 opacity-95 my-6"
        style={{
          backgroundImage: 'url(/landing/split.png)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          backgroundSize: 'auto 100%',
        }}
      />

      {/* Features Section */}
      <section className="py-20 bg-white/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Guest Management', value: '100%' },
              { label: 'Timeline Control', value: 'Full' },
              { label: 'Vendor Coordination', value: 'Seamless' },
              { label: 'Budget Tracking', value: 'Real-time' },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl font-bold font-display text-sage-green mb-1">{feature.value}</p>
                <p className="text-xs uppercase tracking-wider text-muted-text font-semibold">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div
        className="w-full h-28 opacity-95 my-6"
        style={{
          backgroundImage: 'url(/landing/split.png)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          backgroundSize: 'auto 100%',
        }}
      />

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-ink leading-tight mb-6">
                Complete wedding planning
              </h2>
              <p className="text-lg text-body-text leading-relaxed">
                We provide everything you need to plan and execute your dream wedding with confidence and ease.
              </p>
            </div>
            <div className="space-y-8">
              {services.map((service, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="text-sage-green flex-shrink-0">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-text">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div
        className="w-full h-28 opacity-95 my-6"
        style={{
          backgroundImage: 'url(/landing/split.png)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          backgroundSize: 'auto 100%',
        }}
      />

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-surface-soft">
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

      {/* Section Divider */}
      <div
        className="w-full h-28 opacity-95 my-6"
        style={{
          backgroundImage: 'url(/landing/split.png)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          backgroundSize: 'auto 100%',
        }}
      />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-20">
            <p className="text-xs font-bold text-sage-green tracking-widest uppercase mb-4">KIND WORDS</p>
            <h2 className="text-5xl lg:text-6xl font-serif text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
              Loved by thousands
            </h2>
          </div>

          {/* Marquee Columns Container */}
          <div className="relative h-[650px] overflow-hidden pause-hover">
            {/* Gradient Mask Overlays */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream via-cream/80 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream via-cream/80 to-transparent z-20" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Column 1: Moves Up */}
              <div className="flex flex-col gap-6 overflow-hidden relative h-full">
                <div className="flex flex-col gap-6 animate-marquee-up py-4">
                  {[...col1Testimonials, ...col1Testimonials].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-8 rounded-3xl bg-white border border-hairline/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-md transition-editorial flex flex-col justify-between min-h-[220px]"
                    >
                      <p className="text-body-text leading-relaxed mb-6 font-serif italic text-base md:text-lg">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="flex items-center justify-between border-t border-hairline pt-4 mt-auto">
                        <div>
                          <p className="font-semibold text-ink text-sm">{item.name}</p>
                          <p className="text-xs text-muted-text mt-0.5">{item.location}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-cream text-sage-green text-xs font-semibold border border-hairline/85">
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
                      className="p-8 rounded-3xl bg-white border border-hairline/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-md transition-editorial flex flex-col justify-between min-h-[220px]"
                    >
                      <p className="text-body-text leading-relaxed mb-6 font-serif italic text-base md:text-lg">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="flex items-center justify-between border-t border-hairline pt-4 mt-auto">
                        <div>
                          <p className="font-semibold text-ink text-sm">{item.name}</p>
                          <p className="text-xs text-muted-text mt-0.5">{item.location}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-cream text-sage-green text-xs font-semibold border border-hairline/85">
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
                      className="p-8 rounded-3xl bg-white border border-hairline/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-md transition-editorial flex flex-col justify-between min-h-[220px]"
                    >
                      <p className="text-body-text leading-relaxed mb-6 font-serif italic text-base md:text-lg">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="flex items-center justify-between border-t border-hairline pt-4 mt-auto">
                        <div>
                          <p className="font-semibold text-ink text-sm">{item.name}</p>
                          <p className="text-xs text-muted-text mt-0.5">{item.location}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-cream text-sage-green text-xs font-semibold border border-hairline/85">
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
      </section>

      {/* Section Divider */}
      <div
        className="w-full h-28 opacity-95 my-6"
        style={{
          backgroundImage: 'url(/landing/split.png)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          backgroundSize: 'auto 100%',
        }}
      />

      {/* CTA Section */}
      <section id="contact" className="py-28 bg-sage-green text-cream overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-normal leading-tight text-white" style={{ fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>
            Join the ritual
          </h2>
          <p className="text-base md:text-lg max-w-3xl mx-auto text-white/90 leading-relaxed" style={{ marginBottom: '48px' }}>
            Subscribe for exclusive wedding planning resources, inspiration, and early access to new tools.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg" style={{ marginBottom: '24px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 h-14 rounded-full bg-black/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-black/15 transition-editorial font-sans"
              required
            />
            <button
              type="submit"
              className="px-8 h-14 rounded-full bg-cream text-sage-green font-semibold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              Subscribe
              <span className="text-lg">→</span>
            </button>
          </form>

          <p className="text-xs text-white/60 tracking-wide">
            Unsubscribe anytime. We respect your inbox.
          </p>

          {submitted && (
            <p className="text-sm text-white font-medium mt-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              ✓ Check your email to begin your journey
            </p>
          )}
        </div>
      </section>

      {/* Section Divider */}
      <div
        className="w-full h-12 opacity-95 my-6"
        style={{
          backgroundImage: 'url(/landing/split.png)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center',
          backgroundSize: 'auto 100%',
        }}
      />

      <LandingFooter />
    </div>
  );
}
