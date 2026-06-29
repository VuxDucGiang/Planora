import React from 'react';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full px-4 py-4 sm:px-6 md:px-8 bg-transparent pointer-events-none">
      <nav className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between pointer-events-auto bg-cream/80 backdrop-blur-md border border-burgundy/20 rounded-lg shadow-[0_8px_32px_0_rgba(139,71,85,0.08)] relative">
        {/* Left: Navigation Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-ink hover:text-burgundy transition-editorial font-medium">
            How It Works
          </a>
          <a href="#testimonials" className="text-sm text-ink hover:text-burgundy transition-editorial font-medium">
            Stories
          </a>
          <a href="#pricing" className="text-sm text-ink hover:text-burgundy transition-editorial font-medium">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-ink hover:text-burgundy transition-editorial font-medium">
            FAQ
          </a>
        </div>

        {/* Center: Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <span className="text-xl font-bold font-serif text-burgundy">Planora</span>
        </div>

        {/* Right: CTA Button */}
        <div className="flex items-center">
          <button className="px-6 py-2 rounded text-sm font-semibold text-cream bg-burgundy hover:bg-burgundy-dark transition-editorial cursor-pointer">
            Start Free
          </button>
        </div>
      </nav>
    </header>
  );
}
