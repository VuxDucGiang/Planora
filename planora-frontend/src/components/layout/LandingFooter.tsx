import React from 'react';

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-hairline py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-display font-semibold text-ink mb-4">Planora</h3>
            <p className="text-sm text-muted-text">Plan your perfect wedding with ease and confidence.</p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-text">
              <li><a href="#" className="hover:text-sage-green transition-editorial">Planning</a></li>
              <li><a href="#" className="hover:text-sage-green transition-editorial">Design</a></li>
              <li><a href="#" className="hover:text-sage-green transition-editorial">Coordination</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-text">
              <li><a href="#" className="hover:text-sage-green transition-editorial">About</a></li>
              <li><a href="#" className="hover:text-sage-green transition-editorial">Blog</a></li>
              <li><a href="#" className="hover:text-sage-green transition-editorial">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-text">
              <li><a href="#" className="hover:text-sage-green transition-editorial">Privacy</a></li>
              <li><a href="#" className="hover:text-sage-green transition-editorial">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-hairline pt-8 text-center text-sm text-muted-text">
          <p>© 2026 Planora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
