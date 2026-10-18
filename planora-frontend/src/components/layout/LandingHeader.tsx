'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingHeader() {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const navLinks = [
    { href: '#services', label: t.landing.navServices },
    { href: '#gallery', label: t.landing.navGallery },
    { href: '#testimonials', label: t.landing.navStories },
    { href: '#contact', label: t.landing.navContact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-3 py-3 sm:px-6 md:px-8 bg-transparent pointer-events-none">
      <nav className="max-w-7xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between pointer-events-auto bg-cream/80 backdrop-blur-md border border-white/60 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] relative">
        
        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 rounded-full bg-white/80 border border-neutral-200/80 flex items-center justify-center text-neutral-800 hover:bg-white transition-all cursor-pointer shadow-2xs"
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Menu className="w-4 h-4 text-primary" />}
          </button>
        </div>

        {/* Left (Desktop): Navigation Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href} 
              className="text-sm text-neutral-800 hover:text-primary transition-editorial font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Center: Brand Logo */}
        <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-1.5">
          <span className="text-lg sm:text-xl font-bold font-display text-primary tracking-wider">Planora</span>
        </div>

        {/* Right: Language Switcher & CTA Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-800 bg-white/80 border border-neutral-300 hover:bg-white transition-all cursor-pointer shadow-xs"
            title="Đổi ngôn ngữ / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase font-bold tracking-wider">{language === 'vi' ? 'VI' : 'EN'}</span>
          </button>

          <Link
            href="/login"
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFFBF5] bg-primary hover:bg-[#4A0C0E] transition-editorial cursor-pointer inline-block text-center shadow-sm whitespace-nowrap"
            style={{ color: '#FFFBF5' }}
          >
            {t.landing.bookNow}
          </Link>
        </div>
      </nav>

      {/* Mobile Slide-Down / Dropdown Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden pointer-events-auto fixed inset-x-3 top-20 z-50 bg-[#FFFBF5] border border-neutral-200/80 rounded-3xl p-6 shadow-2xl animate-slide-down">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <span className="text-xs font-bold text-muted-text uppercase tracking-widest font-sans">
                {language === 'vi' ? 'Danh mục' : 'Navigation'}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-white border border-hairline flex items-center justify-center text-muted-text hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-serif font-medium text-neutral-800 hover:text-primary py-2.5 px-3 rounded-xl hover:bg-white/80 transition-all"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 border-t border-hairline flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider text-center text-[#FFFBF5] bg-primary hover:bg-[#4A0C0E] shadow-sm transition-all"
                style={{ color: '#FFFBF5' }}
              >
                {t.landing.bookNow}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
