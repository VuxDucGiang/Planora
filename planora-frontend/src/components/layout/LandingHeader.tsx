import React from 'react';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full px-4 py-4 sm:px-6 md:px-8 bg-transparent pointer-events-none">
      <nav className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between pointer-events-auto bg-cream/50 backdrop-blur-md border border-white/40 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] relative">
        {/* Left: Navigation Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-sm text-black hover:text-sage-green transition-editorial font-medium">
            Services
          </a>
          <a href="#gallery" className="text-sm text-black hover:text-sage-green transition-editorial font-medium">
            Gallery
          </a>
          <a href="#testimonials" className="text-sm text-black hover:text-sage-green transition-editorial font-medium">
            Stories
          </a>
          <a href="#contact" className="text-sm text-black hover:text-sage-green transition-editorial font-medium">
            Contact
          </a>
        </div>

        {/* Center: Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <span className="text-xl font-bold font-display text-black">Planora</span>
        </div>

        {/* Right: CTA Button */}
        <div className="flex items-center">
          <button className="px-5 py-2 rounded-sm text-sm font-semibold text-cream bg-sage-green hover:bg-sage-active transition-editorial cursor-pointer">
            Book Now
          </button>
        </div>
      </nav>
    </header>
  );
}
