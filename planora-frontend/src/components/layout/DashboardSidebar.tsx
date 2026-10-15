'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  DollarSign,
  ListTodo,
  Building,
  Users,
  Settings,
  Sliders,
  Calendar,
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
}

export default function DashboardSidebar({ hasPlan }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

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
        { icon: <Users className="w-5 h-5" />, label: t.nav.guests, href: '#', disabled: true },
      ],
    },
    {
      title: t.nav.sectionSettings,
      items: [
        { icon: <Sliders className="w-5 h-5" />, label: t.nav.settings, href: '/settings' },
        { icon: <Settings className="w-5 h-5" />, label: t.nav.setup, href: '/onboarding' },
      ],
    },
  ];

  return (
    <aside 
      className="w-[240px] bg-white border-r border-hairline flex flex-col py-5 px-3 gap-1 shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto dashboard-scroll z-20"
      style={{ fontFamily: "'IM Fell French Canon', serif" }}
    >
      {sections.map((section, sIdx) => (
        <div key={sIdx} className={sIdx > 0 ? 'mt-3.5' : ''}>
          {/* Section Title */}
          {section.title && (
            <p 
              className="text-xs sm:text-sm font-bold text-muted-text uppercase tracking-[0.15em] px-3 mb-1.5"
              style={{ fontFamily: "'IM Fell French Canon', serif" }}
            >
              {section.title}
            </p>
          )}

          {/* Nav Items */}
          {section.items.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.disabled;

            if (isDisabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-35 cursor-not-allowed select-none"
                  title={`${item.label} (${t.nav.unavailableTooltip})`}
                >
                  <span className="text-muted-text">{item.icon}</span>
                  <span 
                    className="text-base font-normal text-muted-text"
                    style={{ fontFamily: "'IM Fell French Canon', serif" }}
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
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
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
                  className={`text-base font-normal ${isActive ? 'text-primary font-bold' : ''}`}
                  style={{ fontFamily: "'IM Fell French Canon', serif" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
