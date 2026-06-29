import React from 'react';

export default function LandingFooter() {
  return (
    <footer className="bg-dark-grey text-cream border-t border-burgundy/20 py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-serif font-semibold text-cream mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Planora
            </h3>
            <p className="text-sm text-cream/70">Plan your perfect wedding with ease and confidence.</p>
          </div>
          <div>
            <h4 className="font-semibold text-cream text-sm mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-burgundy transition-editorial">Planning</a></li>
              <li><a href="#" className="hover:text-burgundy transition-editorial">Design</a></li>
              <li><a href="#" className="hover:text-burgundy transition-editorial">Coordination</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cream text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-burgundy transition-editorial">About</a></li>
              <li><a href="#" className="hover:text-burgundy transition-editorial">Blog</a></li>
              <li><a href="#" className="hover:text-burgundy transition-editorial">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cream text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-burgundy transition-editorial">Privacy</a></li>
              <li><a href="#" className="hover:text-burgundy transition-editorial">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-burgundy/20 pt-8 text-center text-sm text-cream/60">
          <p>© 2026 Planora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
