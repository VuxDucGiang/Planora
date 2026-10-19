'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlan } from '@/contexts/PlanContext';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import GeneralSettingsTab from '@/components/settings/GeneralSettingsTab';
import SecuritySettingsTab from '@/components/settings/SecuritySettingsTab';
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab';
import { 
  Globe, 
  KeyRound, 
  Bell, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

type TabType = 'general' | 'security' | 'notifications';

export default function SettingsPage() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { plan, daysLeft } = usePlan();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLanguageChange = (newLang: 'vi' | 'en') => {
    if (newLang === language) return;
    setLanguage(newLang);
    setToastMessage(newLang === 'vi' ? 'Đã chuyển sang Tiếng Việt!' : 'Switched to English!');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-text">{t.dashboard.loadingSession}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col w-full">
      {/* Top Header */}
      <div className="sticky top-0 z-50">
        <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 w-full relative">
        <DashboardSidebar hasPlan={!!plan} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBF5]">
          <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-8 lg:px-10 py-6 sm:py-10">
            {/* Page Header */}
            <div className="border-b border-hairline pb-5 sm:pb-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h1 className="text-xl sm:text-3xl font-serif font-normal text-primary tracking-wide uppercase">
                  {t.settings.title}
                </h1>
              </div>
              <p className="text-xs sm:text-base text-muted-text font-sans">
                {t.settings.subtitle}
              </p>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
              <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-xs sm:text-sm shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">{toastMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-sm font-bold px-2 py-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ─── TABS NAVIGATION BAR ─── */}
            <div className="flex items-center gap-2 sm:gap-3 border-b border-hairline pb-4 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'bg-primary text-cream shadow-sm ring-2 ring-primary/20'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:text-primary border border-hairline'
                }`}
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t.settings.tabGeneral}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-primary text-cream shadow-sm ring-2 ring-primary/20'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:text-primary border border-hairline'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t.settings.tabSecurity}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'bg-primary text-cream shadow-sm ring-2 ring-primary/20'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:text-primary border border-hairline'
                }`}
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t.settings.tabNotifications}</span>
              </button>
            </div>

            {/* ─── ACTIVE TAB CONTENT ─── */}
            <div>
              {activeTab === 'general' && (
                <GeneralSettingsTab plan={plan} onLanguageChange={handleLanguageChange} />
              )}
              {activeTab === 'security' && (
                <SecuritySettingsTab />
              )}
              {activeTab === 'notifications' && (
                <NotificationSettingsTab />
              )}
            </div>
          </main>

          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
