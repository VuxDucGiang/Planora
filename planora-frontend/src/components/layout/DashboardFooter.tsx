'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardFooter() {
  const { t } = useLanguage();

  const productLinks = [
    t.footer?.features || 'Tính năng',
    t.footer?.pricing || 'Bảng giá',
    t.footer?.caseStudies || 'Câu chuyện thành công',
    t.footer?.reviews || 'Đánh giá',
    t.footer?.updates || 'Cập nhật',
  ];

  const companyLinks = [
    t.footer?.about || 'Về chúng tôi',
    t.footer?.contactUs || 'Liên hệ',
    t.footer?.careers || 'Tuyển dụng',
    t.footer?.blog || 'Bài viết',
  ];

  const supportLinks = [
    t.footer?.gettingStarted || 'Bắt đầu sử dụng',
    t.footer?.helpCenter || 'Trung tâm trợ giúp',
    t.footer?.serverStatus || 'Trạng thái hệ thống',
    t.footer?.reportBug || 'Báo lỗi',
    t.footer?.chatSupport || 'Trò chuyện hỗ trợ',
  ];

  return (
    <footer className="bg-primary text-cream/80 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Brand Column: Top on mobile, Left on Desktop */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4 pb-6 lg:pb-0 border-b border-cream/10 lg:border-b-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cream/15 border border-cream/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold-light" />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-[0.15em] sm:tracking-[0.2em] text-cream font-serif">
                PLANORA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cream/70 leading-relaxed max-w-sm font-sans">
              {t.footer?.tagline || 'Quiet luxury wedding planning & bespoke creation platform.'}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-cream/10 border border-cream/20 flex items-center justify-center hover:bg-cream/20 transition-colors cursor-pointer">
                  <span className="text-xs text-cream/70">★</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links Grid: 2 columns on mobile, 3 columns on tablet/desktop */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Product Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-cream uppercase tracking-wider mb-2.5 sm:mb-3 font-serif">
                {t.footer?.productTitle || 'PRODUCT'}
              </h4>
              <ul className="space-y-2 sm:space-y-2.5">
                {productLinks.map((item, idx) => (
                  <li key={idx}>
                    <span className="text-xs text-cream/60 hover:text-cream/90 transition-colors cursor-pointer inline-block py-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-cream uppercase tracking-wider mb-2.5 sm:mb-3 font-serif">
                {t.footer?.companyTitle || 'COMPANY'}
              </h4>
              <ul className="space-y-2 sm:space-y-2.5">
                {companyLinks.map((item, idx) => (
                  <li key={idx}>
                    <span className="text-xs text-cream/60 hover:text-cream/90 transition-colors cursor-pointer inline-block py-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links: Spans 2 cols on mobile with a neat 2-col list, 1 col on sm+ */}
            <div className="col-span-2 sm:col-span-1 pt-4 sm:pt-0 border-t border-cream/10 sm:border-t-0">
              <h4 className="text-xs sm:text-sm font-bold text-cream uppercase tracking-wider mb-2.5 sm:mb-3 font-serif">
                {t.footer?.supportTitle || 'SUPPORT'}
              </h4>
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2 sm:space-y-2.5 sm:gap-0">
                {supportLinks.map((item, idx) => (
                  <li key={idx}>
                    <span className="text-xs text-cream/60 hover:text-cream/90 transition-colors cursor-pointer inline-block py-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10 px-4 py-3.5 sm:px-8 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-3 text-center sm:text-left text-[11px] sm:text-xs text-cream/50">
          <span>{t.footer?.copyright || 'Copyright © 2026 Planora | All Rights Reserved'}</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hover:text-cream/70 cursor-pointer">{t.footer?.terms || 'Terms of Service'}</span>
            <span className="text-cream/20">•</span>
            <span className="hover:text-cream/70 cursor-pointer">{t.footer?.privacy || 'Privacy Policy'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
