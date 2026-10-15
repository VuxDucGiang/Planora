'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-hairline py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-display font-semibold text-ink mb-4">Planora</h3>
            <p className="text-sm text-muted-text">{t.landing?.footerAboutText || 'Lập kế hoạch cho ngày cưới hoàn hảo của bạn một cách dễ dàng và an tâm tuyệt đối.'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-4">{t.landing?.navServices || 'Dịch vụ'}</h4>
            <ul className="space-y-2 text-sm text-muted-text">
              <li><a href="#services" className="hover:text-sage-green transition-editorial">{t.landing?.planningService || 'Dịch Vụ Lập Kế Hoạch'}</a></li>
              <li><a href="#services" className="hover:text-sage-green transition-editorial">{t.landing?.designService || 'Thiết Kế Không Gian'}</a></li>
              <li><a href="#services" className="hover:text-sage-green transition-editorial">{t.landing?.coordinationService || 'Điều Phối Tiệc Cưới'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-4">{t.footer?.companyTitle || 'Công ty'}</h4>
            <ul className="space-y-2 text-sm text-muted-text">
              <li><a href="#about" className="hover:text-sage-green transition-editorial">{t.footer?.about || 'Về chúng tôi'}</a></li>
              <li><a href="#stories" className="hover:text-sage-green transition-editorial">{t.footer?.blog || 'Bài viết'}</a></li>
              <li><a href="#contact" className="hover:text-sage-green transition-editorial">{t.footer?.contactUs || 'Liên hệ'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-4">{t.footer?.legalTitle || t.footer?.supportTitle || 'Pháp lý'}</h4>
            <ul className="space-y-2 text-sm text-muted-text">
              <li><a href="#" className="hover:text-sage-green transition-editorial">{t.footer?.privacy || 'Chính sách bảo mật'}</a></li>
              <li><a href="#" className="hover:text-sage-green transition-editorial">{t.footer?.terms || 'Điều khoản dịch vụ'}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-hairline pt-8 text-center text-sm text-muted-text">
          <p>{t.landing?.footerCopyright || t.footer?.copyright || '© 2026 Planora. Tất cả các quyền được bảo lưu.'}</p>
        </div>
      </div>
    </footer>
  );
}
