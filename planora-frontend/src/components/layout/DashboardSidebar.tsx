'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  LayoutDashboard,
  DollarSign,
  ListTodo,
  Building,
  MessageSquare,
  Users,
  Sliders,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  disabled?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface DashboardSidebarProps {
  hasPlan: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ hasPlan, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isMobileNavOpen, closeMobileNav } = useNavigation();

  const showMobile = isOpen !== undefined ? isOpen : isMobileNavOpen;
  const handleClose = onClose || closeMobileNav;

  const sections: SidebarSection[] = [
    {
      items: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: t.nav.dashboard, href: '/' },
      ],
    },
    {
      title: t.nav.sectionPlanning,
      items: [
        { icon: <DollarSign className="w-5 h-5" />, label: t.nav.budget, href: '/budget', disabled: !hasPlan },
        { icon: <ListTodo className="w-5 h-5" />, label: t.nav.checklist, href: '/checklist', disabled: !hasPlan },
        { icon: <Calendar className="w-5 h-5" />, label: t.nav.timeline, href: '/timeline', disabled: !hasPlan },
      ],
    },
    {
      title: t.nav.sectionDiscover,
      items: [
        { icon: <Building className="w-5 h-5" />, label: t.nav.vendors, href: '/marketplace' },
        { icon: <MessageSquare className="w-5 h-5" />, label: t.nav.messages || 'Tin nhắn', href: '/messages' },
        { icon: <Users className="w-5 h-5" />, label: t.nav.guests, href: '#', disabled: true },
      ],
    },
    {
      title: t.nav.sectionSettings,
      items: [
        { icon: <Sliders className="w-5 h-5" />, label: t.nav.settings, href: '/settings' },
      ],
    },
  ];

  // Helper renderer for navigation items
  const renderNavSections = (isMobileView: boolean) => (
    <div className="flex flex-col gap-1">
      {sections.map((section, sIdx) => (
        <div key={sIdx} className={sIdx > 0 ? (isMobileView ? 'mt-4' : 'mt-3.5') : ''}>
          {/* Section Title */}
          {section.title && (
            <p 
              className="text-xs sm:text-sm font-bold text-muted-text uppercase tracking-[0.15em] px-3 mb-1.5 font-serif"
            >
              {section.title}
            </p>
          )}

          {/* Nav Items */}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const isDisabled = item.disabled;

              if (isDisabled) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-35 cursor-not-allowed select-none min-h-[44px]"
                    title={`${item.label} (${t.nav.unavailableTooltip})`}
                  >
                    <span className="text-muted-text">{item.icon}</span>
                    <span 
                      className="text-base font-normal text-muted-text font-serif"
                    >
                      {item.label}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    if (isMobileView) {
                      handleClose();
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg min-h-[44px]
                    transition-all duration-150 group relative
                    ${isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-body-text hover:bg-canvas hover:text-ink'
                    }
                  `}
                >
                  <span className={`transition-colors ${isActive ? 'text-primary' : 'text-muted-text group-hover:text-ink'}`}>
                    {item.icon}
                  </span>
                  <span 
                    className={`text-base font-normal font-serif ${isActive ? 'text-primary font-bold' : ''}`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ─── 1. DESKTOP PERMANENT SIDEBAR (Hidden on < lg) ─── */}
      <aside 
        className="hidden lg:flex w-[240px] bg-white border-r border-hairline flex-col py-5 px-3 gap-1 shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto dashboard-scroll z-20 font-serif"
      >
        {renderNavSections(false)}
      </aside>

      {/* ─── 2. MOBILE OFF-CANVAS SLIDE DRAWER (Visible when showMobile is true) ─── */}
      {showMobile && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          {/* Backdrop overlay with blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={handleClose}
            aria-label="Đóng menu điều hướng"
          />

          {/* Drawer content sliding from left */}
          <div 
            className="fixed inset-y-0 left-0 w-[280px] sm:w-[320px] max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col justify-between py-5 px-4 animate-slide-right overflow-y-auto dashboard-scroll font-serif"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline">
                <Link 
                  href="/" 
                  onClick={handleClose}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-base font-bold tracking-[0.15em] text-primary font-display">
                    PLANORA
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full bg-canvas hover:bg-neutral-200/70 border border-hairline flex items-center justify-center text-ink transition-colors cursor-pointer"
                  title="Đóng menu"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5 text-ink" />
                </button>
              </div>

              {/* Navigation sections */}
              {renderNavSections(true)}
            </div>

            {/* Drawer Footer info */}
            <div className="pt-6 mt-4 border-t border-hairline text-center text-xs text-muted-text font-sans">
              <p className="font-serif italic text-primary/80 font-medium">Quiet Luxury & Editorial Romance</p>
              <p className="text-[11px] mt-1 text-muted-text/70">Planora Wedding Platform © 2026</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
