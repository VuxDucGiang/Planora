'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getActivePlan } from '@/services/weddingPlan';
import type { ActivePlanResponse } from '@/types/weddingPlan';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { 
  Globe, 
  Check, 
  Sliders, 
  Heart, 
  Edit3, 
  ArrowRight,
  CheckCircle2,
  Settings as SettingsIcon,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const [plan, setPlan] = useState<ActivePlanResponse | null>(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load active plan for header info
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadPlan() {
      try {
        const activePlan = await getActivePlan();
        if (activePlan) {
          setPlan(activePlan);
          if (activePlan.weddingDate) {
            const diffTime = new Date(activePlan.weddingDate).getTime() - new Date().getTime();
            setDaysLeft(Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
          }
        }
      } catch (err) {
        console.error('Error loading active plan in settings:', err);
      }
    }

    loadPlan();
  }, [isAuthenticated]);

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
          <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-10">
            {/* Page Header */}
            <div className="border-b border-hairline pb-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-normal text-primary tracking-wide uppercase"
                  style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                >
                  {t.settings.title}
                </h1>
              </div>
              <p className="text-sm sm:text-base text-muted-text font-sans">
                {t.settings.subtitle}
              </p>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-sm shadow-sm animate-fade-in">
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

            <div className="space-y-8">
              {/* ══════════════════════════════════════════════
                  LANGUAGE SELECTION CARD (Primary Feature)
                  ══════════════════════════════════════════════ */}
              <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-8">
                <div className="flex items-center gap-2.5 mb-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h2
                    className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#5D0F12]"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                  >
                    {t.settings.languageSectionTitle}
                  </h2>
                </div>
                <p className="text-sm text-muted-text mb-6">
                  {t.settings.languageSectionDesc}
                </p>

                {/* Language Option Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option: Vietnamese */}
                  <div
                    onClick={() => handleLanguageChange('vi')}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                      language === 'vi'
                        ? 'border-[#5D0F12] bg-[#FAF8F5] shadow-md ring-2 ring-[#5D0F12]/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl" role="img" aria-label="Vietnam Flag">🇻🇳</span>
                          <span className="text-base sm:text-lg font-bold text-ink">
                            {t.settings.vietnameseTitle}
                          </span>
                        </div>
                        {language === 'vi' && (
                          <div className="w-6 h-6 rounded-full bg-[#5D0F12] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-text leading-relaxed">
                        {t.settings.vietnameseDesc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      {language === 'vi' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5D0F12] text-[#FFFBF5]">
                          <Check className="w-3 h-3" />
                          {t.settings.currentLanguageBadge}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#5D0F12] hover:underline cursor-pointer"
                        >
                          {t.settings.selectLanguageBtn} →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Option: English */}
                  <div
                    onClick={() => handleLanguageChange('en')}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                      language === 'en'
                        ? 'border-[#5D0F12] bg-[#FAF8F5] shadow-md ring-2 ring-[#5D0F12]/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl" role="img" aria-label="UK / US Flag">🇬🇧</span>
                          <span className="text-base sm:text-lg font-bold text-ink">
                            {t.settings.englishTitle}
                          </span>
                        </div>
                        {language === 'en' && (
                          <div className="w-6 h-6 rounded-full bg-[#5D0F12] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-text leading-relaxed">
                        {t.settings.englishDesc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      {language === 'en' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5D0F12] text-[#FFFBF5]">
                          <Check className="w-3 h-3" />
                          {t.settings.currentLanguageBadge}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#5D0F12] hover:underline cursor-pointer"
                        >
                          {t.settings.selectLanguageBtn} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════
                  DISPLAY PREFERENCES CARD
                  ══════════════════════════════════════════════ */}
              <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-8">
                <div className="flex items-center gap-2.5 mb-2">
                  <Sliders className="w-5 h-5 text-primary" />
                  <h2
                    className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#5D0F12]"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                  >
                    {t.settings.preferencesSectionTitle}
                  </h2>
                </div>
                <p className="text-sm text-muted-text mb-6">
                  {t.settings.preferencesSectionDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Currency Format */}
                  <div className="p-4 rounded-xl bg-canvas border border-hairline">
                    <span className="text-xs sm:text-sm font-bold text-ink uppercase tracking-wider block mb-1">
                      {t.settings.currencyFormatLabel}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-neutral-800">
                      {language === 'vi' ? t.settings.currencyVND : t.settings.currencyUSD}
                    </span>
                    <p className="text-xs text-muted-text mt-1">
                      {language === 'vi' 
                        ? 'Tự động định dạng theo đơn vị Việt Nam Đồng (₫).' 
                        : 'Formatted automatically in USD / standard international format.'}
                    </p>
                  </div>

                  {/* Date Format */}
                  <div className="p-4 rounded-xl bg-canvas border border-hairline">
                    <span className="text-xs sm:text-sm font-bold text-ink uppercase tracking-wider block mb-1">
                      {t.settings.dateFormatLabel}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-neutral-800">
                      {language === 'vi' ? t.settings.dateFormatVN : t.settings.dateFormatEN}
                    </span>
                    <p className="text-xs text-muted-text mt-1">
                      {language === 'vi' 
                        ? 'Hiển thị chuẩn: Ngày / Tháng / Năm.' 
                        : 'Formatted: Month / Day / Year.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════
                  WEDDING PLAN OVERVIEW CARD
                  ══════════════════════════════════════════════ */}
              <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-8">
                <div className="flex items-center gap-2.5 mb-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <h2
                    className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#5D0F12]"
                    style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                  >
                    {t.settings.weddingSectionTitle}
                  </h2>
                </div>
                <p className="text-sm text-muted-text mb-6">
                  {t.settings.weddingSectionDesc}
                </p>

                {plan ? (
                  <div className="p-5 rounded-2xl bg-canvas border border-hairline space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-muted-text uppercase tracking-widest block">
                          {t.settings.activeWeddingPlan}
                        </span>
                        <h4 className="text-lg font-bold text-primary font-display uppercase tracking-wide mt-0.5">
                          {plan.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/onboarding"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 transition-all shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          {t.settings.editPlan}
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-hairline text-sm">
                      <div>
                        <span className="text-muted-text block text-xs">{t.dashboard.styleLabel}:</span>
                        <span className="font-semibold text-ink">{plan.conceptSuggestions?.[0]?.conceptName || 'Modern Rustic'}</span>
                      </div>
                      <div>
                        <span className="text-muted-text block text-xs">{t.dashboard.budgetLabel}:</span>
                        <span className="font-semibold text-ink font-mono">{plan.budget.toLocaleString()} ₫</span>
                      </div>
                      <div>
                        <span className="text-muted-text block text-xs">{t.dashboard.guestsLabel}:</span>
                        <span className="font-semibold text-ink">{plan.guestCount}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-canvas border border-dashed border-neutral-300 text-center space-y-3">
                    <p className="text-sm text-muted-text">{t.settings.noActivePlan}</p>
                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-primary text-cream hover:bg-primary-active transition-all shadow-sm"
                    >
                      {t.settings.createNewPlan}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </main>

          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
