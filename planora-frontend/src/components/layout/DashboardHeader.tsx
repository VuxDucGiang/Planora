'use client';

import React from 'react';
import { Sparkles, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  logout: () => void;
}

export default function DashboardHeader({ logout }: DashboardHeaderProps) {
  return (
    <header className="h-[64px] border-b border-hairline bg-canvas/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-md font-medium tracking-widest text-ink font-display">
          PLANORA
        </span>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-medium text-ink bg-canvas border border-hairline hover:bg-surface-soft transition-editorial cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Đăng xuất</span>
      </button>
    </header>
  );
}
