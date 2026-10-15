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
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cream/15 border border-cream/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold-light" />
              </div>
              <span className="text-lg font-semibold tracking-[0.15em] text-cream font-display">
                PLANORA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cream/70 leading-relaxed max-w-xs font-sans">
              {t.footer?.tagline}
            </p>
            <div className="flex gap-2 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-cream/10 border border-cream/20 flex items-center justify-center hover:bg-cream/20 transition-colors cursor-pointer">
                  <span className="text-xs text-cream/70">★</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-cream uppercase tracking-wider mb-3">
              {t.footer?.productTitle}
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((item, idx) => (
                <li key={idx}>
                  <span className="text-xs text-cream/60 hover:text-cream/90 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-cream uppercase tracking-wider mb-3">
              {t.footer?.companyTitle}
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((item, idx) => (
                <li key={idx}>
                  <span className="text-xs text-cream/60 hover:text-cream/90 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-cream uppercase tracking-wider mb-3">
              {t.footer?.supportTitle}
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((item, idx) => (
                <li key={idx}>
                  <span className="text-xs text-cream/60 hover:text-cream/90 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10 px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-cream/50">
          <span>{t.footer?.copyright}</span>
          <div className="flex gap-4">
            <span className="hover:text-cream/70 cursor-pointer">{t.footer?.terms}</span>
            <span>|</span>
            <span className="hover:text-cream/70 cursor-pointer">{t.footer?.privacy}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
