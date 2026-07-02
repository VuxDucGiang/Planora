'use client';

import React from 'react';
import { MapPin, Calendar, Clock, Sparkles, LogOut } from 'lucide-react';
import type { ActivePlanResponse } from '@/types/weddingPlan';

interface DashboardHeaderProps {
  logout: () => void;
  plan?: ActivePlanResponse | null;
  daysLeft?: number;
}

export default function DashboardHeader({ logout, plan, daysLeft = 0 }: DashboardHeaderProps) {
  const formatDateDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="h-[52px] bg-primary text-cream flex items-center justify-between px-4 shrink-0 z-50 shadow-md">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-cream/15 border border-cream/30 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-gold-light" />
        </div>
        <span className="text-sm font-semibold tracking-[0.2em] text-cream font-display hidden sm:block">
          PLANORA
        </span>
      </div>

      {/* Center: Wedding Info (chỉ hiện khi có plan) */}
      {plan ? (
        <div className="flex items-center gap-3 sm:gap-5 text-cream/90">
          {/* Wedding Title */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-wide uppercase hidden md:inline">
              {plan.title}
            </span>
          </div>

          {/* Divider */}
          <span className="text-cream/30 hidden sm:inline">|</span>

          {/* Location */}
          <div className="flex items-center gap-1 text-[11px] text-cream/70 hidden sm:flex">
            <MapPin className="w-3 h-3" />
            <span>{plan.location}</span>
          </div>

          {/* Divider */}
          <span className="text-cream/30 hidden sm:inline">|</span>

          {/* Date */}
          <div className="flex items-center gap-1 text-[11px] text-cream/70 hidden sm:flex">
            <Calendar className="w-3 h-3" />
            <span>{formatDateDisplay(plan.weddingDate)}</span>
          </div>

          {/* Divider */}
          <span className="text-cream/30 hidden md:inline">|</span>

          {/* Countdown Badge */}
          <div className="flex items-center gap-1.5 bg-cream/10 border border-cream/20 rounded-full px-3 py-1">
            <Clock className="w-3 h-3 text-gold-light" />
            <span className="text-[11px] font-bold tracking-wide text-cream">
              {daysLeft} Ngày Còn Lại
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-cream/60">
          <span className="text-xs italic">Chưa có kế hoạch cưới</span>
        </div>
      )}

      {/* Right: Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-medium text-cream/80 bg-cream/10 border border-cream/15 hover:bg-cream/20 transition-all cursor-pointer"
      >
        <LogOut className="w-3 h-3" />
        <span className="hidden sm:inline">Đăng xuất</span>
      </button>
    </header>
  );
}
