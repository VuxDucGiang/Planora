'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Sparkles, LogOut, Sliders, Globe, Menu, X } from 'lucide-react';
import type { ActivePlanResponse } from '@/types/weddingPlan';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigation } from '@/contexts/NavigationContext';

interface DashboardHeaderProps {
  logout: () => void;
  plan?: ActivePlanResponse | null;
  daysLeft?: number;
}

export default function DashboardHeader({ logout, plan, daysLeft = 0 }: DashboardHeaderProps) {
  const { language, setLanguage, t, formatDateDisplay } = useLanguage();
  const { isMobileNavOpen, toggleMobileNav } = useNavigation();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="h-[52px] bg-primary text-cream flex items-center justify-between px-3 sm:px-4 shrink-0 z-50 shadow-md relative">
      {/* Left: Mobile Hamburger Toggle + Logo */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={toggleMobileNav}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-cream/90 hover:text-cream hover:bg-cream/15 transition-all cursor-pointer focus:outline-none"
          title={isMobileNavOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
          aria-label={isMobileNavOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
        >
          {isMobileNavOpen ? <X className="w-5 h-5 text-cream" /> : <Menu className="w-5 h-5 text-cream" />}
        </button>

        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
          <div className="w-7 h-7 rounded-full bg-cream/15 border border-cream/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-gold-light" />
          </div>
          <span className="text-sm sm:text-base font-bold tracking-[0.15em] sm:tracking-[0.2em] text-cream font-display">
            PLANORA
          </span>
        </Link>
      </div>

      {/* Center: Wedding Info (chỉ hiện khi có plan) */}
      {plan ? (
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 text-cream/90">
          {/* Wedding Title */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase truncate max-w-[200px]">
              {plan.title}
            </span>
          </div>

          {/* Divider */}
          <span className="text-cream/30 hidden lg:inline">|</span>

          {/* Location */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-cream/80">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[140px]">{plan.location}</span>
          </div>

          {/* Divider */}
          <span className="text-cream/30 hidden md:inline">|</span>

          {/* Date */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-cream/80">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDateDisplay(plan.weddingDate)}</span>
          </div>

          {/* Divider */}
          <span className="text-cream/30 hidden sm:inline">|</span>

          {/* Countdown Badge */}
          <div className="flex items-center gap-1.5 bg-cream/10 border border-cream/20 rounded-full px-2.5 sm:px-3.5 py-1">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-light shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold tracking-wide text-cream whitespace-nowrap">
              {daysLeft} {t.header.daysLeftBadge}
            </span>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex items-center gap-2 text-cream/60">
          <span className="text-xs sm:text-sm italic">{t.header.noPlan}</span>
        </div>
      )}

      {/* Right: Quick Language Switch, Settings & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Language Quick Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={t.header.language}
          className="flex items-center gap-1 h-8 px-2 sm:px-3 rounded-md text-xs font-bold text-cream/90 bg-cream/10 border border-cream/20 hover:bg-cream/20 transition-all cursor-pointer uppercase tracking-wider"
        >
          <Globe className="w-3.5 h-3.5 text-gold-light" />
          <span>{language === 'vi' ? 'VI' : 'EN'}</span>
        </button>

        {/* Settings Shortcut Link */}
        <Link
          href="/settings"
          title={t.header.settingsTooltip}
          className="flex items-center justify-center w-8 h-8 rounded-md text-cream/80 bg-cream/10 border border-cream/15 hover:bg-cream/20 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          title={t.header.logout}
          className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-xs font-semibold text-cream/90 bg-cream/10 border border-cream/15 hover:bg-cream/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.header.logout}</span>
        </button>
      </div>
    </header>
  );
}
