'use client';

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingHeader() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-4 sm:px-6 md:px-8 bg-transparent pointer-events-none">
      <nav className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between pointer-events-auto bg-cream/70 backdrop-blur-md border border-white/50 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] relative">
        {/* Left: Navigation Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-sm text-black hover:text-sage-green transition-editorial font-medium">
            {t.landing.navServices}
          </a>
          <a href="#gallery" className="text-sm text-black hover:text-sage-green transition-editorial font-medium">
            {t.landing.navGallery}
          </a>
          <a href="#testimonials" className="text-sm text-black hover:text-sage-green transition-editorial font-medium">
            {t.landing.navStories}
          </a>
          <a href="#contact" className="text-sm text-black hover:text-sage-green transition-editorial font-medium">
            {t.landing.navContact}
          </a>
        </div>

        {/* Center: Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <span className="text-xl font-bold font-display text-black">Planora</span>
        </div>

        {/* Right: Language Switcher & CTA Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-800 bg-white/80 border border-neutral-300 hover:bg-white transition-all cursor-pointer shadow-xs"
            title="Đổi ngôn ngữ / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase font-bold tracking-wider">{language === 'vi' ? 'VI' : 'EN'}</span>
          </button>

          <Link
            href="/login"
            className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider !text-cream bg-sage-green hover:bg-sage-active transition-editorial cursor-pointer inline-block text-center shadow-sm"
            style={{ color: '#FFFBF5' }}
          >
            {t.landing.bookNow}
          </Link>
        </div>
      </nav>
    </header>
  );
}
