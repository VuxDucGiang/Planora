'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  ListTodo,
  Building,
  Users,
  Settings,
  Calendar,
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
}

export default function DashboardSidebar({ hasPlan }: DashboardSidebarProps) {
  const pathname = usePathname();

  const sections: SidebarSection[] = [
    {
      items: [
        { icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: 'Dashboard', href: '/' },
      ],
    },
    {
      title: 'PLANNING',
      items: [
        { icon: <DollarSign className="w-[18px] h-[18px]" />, label: 'Budget', href: '/budget', disabled: !hasPlan },
        { icon: <ListTodo className="w-[18px] h-[18px]" />, label: 'Checklist', href: '/checklist', disabled: !hasPlan },
        { icon: <Calendar className="w-[18px] h-[18px]" />, label: 'Timeline', href: '/timeline', disabled: !hasPlan },
      ],
    },
    {
      title: 'DISCOVER',
      items: [
        { icon: <Building className="w-[18px] h-[18px]" />, label: 'Vendors', href: '/marketplace' },
        { icon: <Users className="w-[18px] h-[18px]" />, label: 'Guests', href: '#', disabled: true },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { icon: <Settings className="w-[18px] h-[18px]" />, label: 'Setup', href: '/onboarding' },
      ],
    },
  ];

  return (
    <aside className="w-[230px] bg-white border-r border-hairline flex flex-col py-5 px-3 gap-1 shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto dashboard-scroll z-20">
      {sections.map((section, sIdx) => (
        <div key={sIdx} className={sIdx > 0 ? 'mt-3' : ''}>
          {/* Section Title */}
          {section.title && (
            <p className="text-[10px] font-bold text-muted-text uppercase tracking-[0.15em] px-3 mb-1.5">
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
                  title={`${item.label} (chưa khả dụng)`}
                >
                  <span className="text-muted-text">{item.icon}</span>
                  <span className="text-[13px] font-medium text-muted-text">{item.label}</span>
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
                    ? 'bg-primary/10 text-primary'
                    : 'text-body-text hover:bg-canvas hover:text-ink'
                  }
                `}
              >
                <span className={`transition-colors ${isActive ? 'text-primary' : 'text-muted-text group-hover:text-ink'}`}>
                  {item.icon}
                </span>
                <span className={`text-[13px] font-medium ${isActive ? 'text-primary font-semibold' : ''}`}>
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
