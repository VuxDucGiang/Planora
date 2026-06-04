'use client';

import React, { useState } from 'react';
import { Heart, ChevronRight, Star } from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Testimonial {
  quote: string;
  name: string;
  date: string;
}

const services: Service[] = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Venue Curation',
    description: 'Discover the perfect venue that matches your vision and budget',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Guest Management',
    description: 'Seamless RSVP tracking and invitation management tools',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Design & Decoration',
    description: 'Professional design consultation for your special day',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Day Coordination',
    description: 'Expert coordination to ensure your day flows perfectly',
  },
];

const testimonials: Testimonial[] = [
  {
    quote: 'Planora transformed the way we planned our wedding. Everything was organized and stress-free.',
    name: 'Sarah & Michael',
    date: 'June 2024',
  },
  {
    quote: 'The platform is intuitive and made guest management incredibly easy. Highly recommended!',
    name: 'Emma & James',
    date: 'May 2024',
  },
  {
    quote: 'From venue selection to final details, Planora was our perfect planning partner.',
    name: 'Lisa & David',
    date: 'April 2024',
  },
  {
    quote: 'The team was supportive throughout our entire planning journey. Truly exceptional service.',
    name: 'Jessica & Tom',
    date: 'March 2024',
  },
];

export function WeddingLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-hairline">
        <nav className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-sage-green flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-cream" />
            </div>
            <span className="text-xl font-bold font-display text-ink hidden sm:inline">Planora</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#services" className="text-sm text-body-text hover:text-sage-green transition-editorial font-medium">
              Services
            </a>
            <a href="#gallery" className="text-sm text-body-text hover:text-sage-green transition-editorial font-medium">
              Gallery
            </a>
            <a href="#testimonials" className="text-sm text-body-text hover:text-sage-green transition-editorial font-medium">
              Stories
            </a>
            <a href="#contact" className="text-sm text-body-text hover:text-sage-green transition-editorial font-medium">
              Contact
            </a>
          </div>
          <button className="px-5 py-2 rounded-sm text-sm font-semibold text-cream bg-sage-green hover:bg-sage-active transition-editorial">
            Book Now
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-sage-green tracking-widest">CELEBRATE TOGETHER</p>
                <h1 className="text-6xl lg:text-7xl font-display font-bold text-ink leading-tight">
                  Your perfect
                  <br />
                  day awaits
                </h1>
                <p className="text-lg text-body-text leading-relaxed max-w-md">
                  Streamline every moment of your wedding planning. From venue selection to final coordination, we&apos;ve got you covered.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button className="px-7 py-3 rounded-sm text-cream bg-sage-green hover:bg-sage-active transition-editorial font-semibold text-sm flex items-center justify-center gap-2">
                  Start Planning
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="px-7 py-3 rounded-sm text-sage-green border-2 border-sage-green bg-transparent hover:bg-sage-green/5 transition-editorial font-semibold text-sm">
                  View Stories
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <img 
                src="/wedding-hero.png" 
                alt="Bride and groom celebrating" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-grey/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Guest Management', value: '100%' },
              { label: 'Timeline Control', value: 'Full' },
              { label: 'Vendor Coordination', value: 'Seamless' },
              { label: 'Budget Tracking', value: 'Real-time' },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl font-bold font-display text-sage-green mb-1">{feature.value}</p>
                <p className="text-xs uppercase tracking-wider text-muted-text font-semibold">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-ink leading-tight mb-6">
                Complete wedding planning
              </h2>
              <p className="text-lg text-body-text leading-relaxed">
                We provide everything you need to plan and execute your dream wedding with confidence and ease.
              </p>
            </div>
            <div className="space-y-8">
              {services.map((service, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="text-sage-green flex-shrink-0">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-text">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-surface-soft">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-sage-green tracking-widest mb-4">OUR COLLECTION</p>
            <h2 className="text-5xl font-display font-bold text-ink mb-4">
              Beautiful moments
            </h2>
            <p className="text-lg text-muted-text max-w-2xl mx-auto">
              Inspiration from real weddings we&apos;ve helped bring to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative h-96 md:h-[450px] rounded-lg overflow-hidden cursor-pointer">
              <img 
                src="/wedding-planning.png" 
                alt="Wedding planning details" 
                className="w-full h-full object-cover group-hover:scale-105 transition-editorial duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-grey/60 to-transparent flex items-end p-8">
                <h3 className="text-cream font-display font-semibold text-2xl">Planning Details</h3>
              </div>
            </div>
            <div className="group relative h-96 md:h-[450px] rounded-lg overflow-hidden cursor-pointer">
              <img 
                src="/wedding-venue.png" 
                alt="Decorated wedding venue" 
                className="w-full h-full object-cover group-hover:scale-105 transition-editorial duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-grey/60 to-transparent flex items-end p-8">
                <h3 className="text-cream font-display font-semibold text-2xl">Venue Decoration</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-sage-green tracking-widest mb-4">TESTIMONIALS</p>
            <h2 className="text-5xl font-display font-bold text-ink">
              Stories from our couples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx} 
                className="p-8 rounded-lg bg-white border border-hairline hover:border-sage-green transition-editorial"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-sage-green text-sage-green" />
                  ))}
                </div>
                <p className="text-body-text mb-6 leading-relaxed text-sm italic font-serif">"{testimonial.quote}"</p>
                <div className="border-t border-hairline pt-4">
                  <p className="font-semibold text-ink text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-text">{testimonial.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 bg-sage-green text-cream">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Join the ritual
          </h2>
          <p className="text-lg mb-10 opacity-90">
            Start planning your perfect wedding with Planora today
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-sm bg-cream/20 border border-cream/40 text-cream placeholder-cream/60 focus:outline-none focus:border-cream/80 transition-editorial font-sans"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-sm bg-cream text-sage-green font-semibold hover:bg-cream/90 transition-editorial whitespace-nowrap"
            >
              Get Started
            </button>
          </form>

          {submitted && (
            <p className="text-sm opacity-90">✓ Check your email to begin your journey</p>
          )}
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
}
