import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function DashboardFooter() {
  return (
    <footer className="bg-primary text-cream/80 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
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
            <p className="text-xs text-cream/50 leading-relaxed max-w-xs">
              Crafting unforgettable wedding experiences. Nền tảng quản lý sự kiện và lập kế hoạch tiệc cưới tinh giản, chuẩn mực.
            </p>
            <div className="flex gap-2 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-cream/10 border border-cream/20 flex items-center justify-center hover:bg-cream/20 transition-colors cursor-pointer">
                  <span className="text-[10px] text-cream/60">★</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-cream uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Case studies', 'Reviews', 'Updates'].map((item) => (
                <li key={item}>
                  <span className="text-[11px] text-cream/50 hover:text-cream/80 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-bold text-cream uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              {['About', 'Contact Us', 'Careers', 'Blog'].map((item) => (
                <li key={item}>
                  <span className="text-[11px] text-cream/50 hover:text-cream/80 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-bold text-cream uppercase tracking-wider mb-3">Support</h4>
            <ul className="space-y-2">
              {['Getting started', 'Help center', 'Server status', 'Report a bug', 'Chat support'].map((item) => (
                <li key={item}>
                  <span className="text-[11px] text-cream/50 hover:text-cream/80 transition-colors cursor-pointer">
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
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-cream/40">
          <span>Copyright © 2026 Planora Templates | All Rights Reserved</span>
          <div className="flex gap-4">
            <span className="hover:text-cream/60 cursor-pointer">Terms and Conditions</span>
            <span>|</span>
            <span className="hover:text-cream/60 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
