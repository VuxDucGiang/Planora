'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-hairline py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 md:mb-12">
          <div className="col-span-2 md:col-span-1 pb-3 md:pb-0 border-b md:border-b-0 border-hairline/60">
            <h3 className="font-serif font-bold text-ink text-base sm:text-lg mb-2 sm:mb-4">Planora</h3>
            <p className="text-xs sm:text-sm text-muted-text max-w-sm">{t.landing?.footerAboutText || 'Lập kế hoạch cho ngày cưới hoàn hảo của bạn một cách dễ dàng và an tâm tuyệt đối.'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-xs sm:text-sm uppercase tracking-wider mb-2.5 sm:mb-4">{t.landing?.navServices || 'Dịch vụ'}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-text">
              <li><a href="#services" className="hover:text-sage-green transition-editorial inline-block py-0.5">{t.landing?.planningService || 'Dịch Vụ Lập Kế Hoạch'}</a></li>
              <li><a href="#services" className="hover:text-sage-green transition-editorial inline-block py-0.5">{t.landing?.designService || 'Thiết Kế Không Gian'}</a></li>
              <li><a href="#services" className="hover:text-sage-green transition-editorial inline-block py-0.5">{t.landing?.coordinationService || 'Điều Phối Tiệc Cưới'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-xs sm:text-sm uppercase tracking-wider mb-2.5 sm:mb-4">{t.footer?.companyTitle || 'Công ty'}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-text">
              <li><a href="#about" className="hover:text-sage-green transition-editorial inline-block py-0.5">{t.footer?.about || 'Về chúng tôi'}</a></li>
              <li><a href="#stories" className="hover:text-sage-green transition-editorial inline-block py-0.5">{t.footer?.blog || 'Bài viết'}</a></li>
              <li><a href="#contact" className="hover:text-sage-green transition-editorial inline-block py-0.5">{t.footer?.contactUs || 'Liên hệ'}</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1 pt-2 md:pt-0 border-t md:border-t-0 border-hairline/60">
            <h4 className="font-semibold text-ink text-xs sm:text-sm uppercase tracking-wider mb-2.5 sm:mb-4">{t.footer?.legalTitle || t.footer?.supportTitle || 'Pháp lý'}</h4>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-2 md:space-y-2 text-xs sm:text-sm text-muted-text">
              <li><a href="#" className="hover:text-sage-green transition-editorial inline-block py-0.5">{t.footer?.privacy || 'Chính sách bảo mật'}</a></li>
              <li><a href="#" className="hover:text-sage-green transition-editorial inline-block py-0.5">{t.footer?.terms || 'Điều khoản dịch vụ'}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-hairline pt-6 text-center text-xs sm:text-sm text-muted-text">
          <p>{t.landing?.footerCopyright || t.footer?.copyright || '© 2026 Planora. Tất cả các quyền được bảo lưu.'}</p>
        </div>
      </div>
    </footer>
  );
}
