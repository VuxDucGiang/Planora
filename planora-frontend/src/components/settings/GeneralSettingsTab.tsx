'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Check, Sliders, Heart, Edit3, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ActivePlanResponse } from '@/types/weddingPlan';

interface GeneralSettingsTabProps {
  plan?: ActivePlanResponse | null;
  onLanguageChange: (lang: 'vi' | 'en') => void;
}

export default function GeneralSettingsTab({ plan, onLanguageChange }: GeneralSettingsTabProps) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* ─── LANGUAGE SELECTION CARD ─── */}
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 sm:p-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider text-[#5D0F12]">
            {t.settings.languageSectionTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-text mb-5 sm:mb-6">
          {t.settings.languageSectionDesc}
        </p>

        {/* Language Option Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Option: Vietnamese */}
          <div
            onClick={() => onLanguageChange('vi')}
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
            onClick={() => onLanguageChange('en')}
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

      {/* ─── DISPLAY PREFERENCES CARD ─── */}
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 sm:p-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Sliders className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider text-[#5D0F12]">
            {t.settings.preferencesSectionTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-text mb-5 sm:mb-6">
          {t.settings.preferencesSectionDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
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

      {/* ─── WEDDING PLAN OVERVIEW CARD ─── */}
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 sm:p-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Heart className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider text-[#5D0F12]">
            {t.settings.weddingSectionTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-text mb-5 sm:mb-6">
          {t.settings.weddingSectionDesc}
        </p>

        {plan ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-canvas border border-hairline space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-muted-text uppercase tracking-widest block">
                  {t.settings.activeWeddingPlan}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-primary font-display uppercase tracking-wide mt-0.5">
                  {plan.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 transition-all shadow-xs w-full sm:w-auto cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  {t.settings.editPlan}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 border-t border-hairline text-xs sm:text-sm">
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
            <p className="text-xs sm:text-sm text-muted-text">{t.settings.noActivePlan}</p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-primary text-cream hover:bg-primary-active transition-all shadow-sm w-full sm:w-auto"
            >
              {t.settings.createNewPlan}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
