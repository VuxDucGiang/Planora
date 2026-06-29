'use client';

import React, { useState } from 'react';
import { Heart, ChevronRight, Sparkles, Users, Palette, Compass, Plus, Minus, Check } from 'lucide-react';
import LandingHeader from '@/components/layout/LandingHeader';
import LandingFooter from '@/components/layout/LandingFooter';

interface Benefit {
  title: string;
  description: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

const benefits: Benefit[] = [
  {
    title: 'Curated Timelines & Checklists',
    description: 'Stay on track with our comprehensive planning guides designed specifically for your wedding',
  },
  {
    title: 'Smart Vendor Management',
    description: 'Connect with vetted vendors and manage contracts, timelines, and communications effortlessly',
  },
  {
    title: 'Guest Management & RSVPs',
    description: 'Beautiful invitations and seamless RSVP tracking with interactive seating charts',
  },
  {
    title: 'Design & Budget Tools',
    description: 'Visualize your aesthetic and track every expense with ease',
  },
];

const testimonials: Testimonial[] = [
  {
    quote: 'Planora made planning our wedding feel like a joy instead of a stressful burden. Every detail was handled beautifully.',
    name: 'Sarah & Michael',
    role: 'Married June 2025',
  },
  {
    quote: 'The organizational tools are simply unmatched. We managed 150+ guests and everything was perfect.',
    name: 'Emily & David',
    role: 'Married May 2025',
  },
  {
    quote: 'From first search to walking down the aisle, Planora was our trusted partner every step of the way.',
    name: 'Jessica & Tom',
    role: 'Married April 2025',
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$49',
    description: 'Perfect for intimate gatherings',
    features: [
      'Up to 50 guests',
      'Basic timeline & checklist',
      'Email invitations',
      'Budget tracker',
      'Community support',
    ],
  },
  {
    name: 'Premium',
    price: '$149',
    description: 'Most popular choice',
    features: [
      'Up to 200 guests',
      'Advanced planning tools',
      'Custom invitations',
      'Vendor management',
      'Seating chart creator',
      'Priority support',
      'Timeline automation',
    ],
    popular: true,
  },
  {
    name: 'Elite',
    price: '$299',
    description: 'For grand celebrations',
    features: [
      'Unlimited guests',
      'Concierge planning assistant',
      'White-label invitations',
      'Vendor coordination',
      'Custom design tools',
      'Day-of coordination app',
      'VIP 24/7 support',
    ],
  },
];

const faqs: FAQ[] = [
  {
    question: 'How far in advance should we start planning?',
    answer: 'Ideally 12-18 months before your wedding date. However, our tools are flexible and work great for shorter timelines too. Many couples have planned beautiful weddings in 6-9 months with Planora\'s help.',
  },
  {
    question: 'Can I import my existing guest list?',
    answer: 'Yes! You can easily import guest lists from CSV files or spreadsheets. Our system will automatically help you organize and categorize them for easy management.',
  },
  {
    question: 'Is there a contract or commitment required?',
    answer: 'No contracts! You can upgrade, downgrade, or cancel your subscription anytime. We want to earn your continued trust through exceptional service.',
  },
  {
    question: 'What support is included with my plan?',
    answer: 'All plans include email support. Premium includes priority support with 24-hour response times. Elite includes dedicated concierge support available 7 days a week.',
  },
  {
    question: 'Can multiple people access our wedding planning account?',
    answer: 'Absolutely! You can invite family members, your partner, and your wedding party to collaborate in real-time on all planning details.',
  },
  {
    question: 'Do you offer a money-back guarantee?',
    answer: 'Yes, we offer a 30-day money-back guarantee if you\'re not completely satisfied. Your satisfaction is our priority.',
  },
];

export default function WeddingLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-burgundy-light/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-burgundy/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-burgundy tracking-widest uppercase mb-6">Welcome to Planora</p>
            <h1 className="text-6xl md:text-7xl font-serif text-ink leading-tight mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
              Craft Your<br />Unforgettable Day
            </h1>
            <p className="text-xl text-body-text leading-relaxed mb-12 max-w-2xl mx-auto">
              Wedding planning made effortless. From venue to vows, our comprehensive platform handles every detail so you can focus on the love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-burgundy text-cream font-semibold rounded hover:bg-burgundy-dark transition-editorial flex items-center justify-center gap-2">
                Start Planning Now
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 border-2 border-burgundy text-burgundy bg-transparent font-semibold rounded hover:bg-burgundy/5 transition-editorial">
                See Success Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-blush lace-top lace-bottom">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-burgundy tracking-widest uppercase mb-4">Why Choose Planora</p>
            <h2 className="text-5xl md:text-6xl font-serif text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
              Complete Planning Suite
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-6">
                <Heart className="w-8 h-8 text-burgundy flex-shrink-0 mt-2" />
                <div>
                  <h3 className="text-xl font-semibold text-ink mb-3">{benefit.title}</h3>
                  <p className="text-body-text leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-burgundy tracking-widest uppercase mb-4">Our Process</p>
            <h2 className="text-5xl md:text-6xl font-serif text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                number: '1',
                title: 'Enter Your Details',
                description: 'Tell us about your vision, budget, and date. Our smart system creates a personalized planning timeline just for you.',
              },
              {
                number: '2',
                title: 'Receive All Managed Costs & Vendors',
                description: 'Get access to our curated network of vetted vendors and real-time budget management to track every expense.',
              },
              {
                number: '3',
                title: 'Manage & Update Your Progress',
                description: 'Stay organized with interactive checklists, vendor coordination, and real-time collaboration with your whole team.',
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-burgundy text-cream flex items-center justify-center text-2xl font-serif font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
                    {step.number}
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-ink mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                  {step.title}
                </h3>
                <p className="text-body-text leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-blush">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-burgundy tracking-widest uppercase mb-4">Success Stories</p>
            <h2 className="text-5xl md:text-6xl font-serif text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
              Loved by Happy Couples
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-warm-white rounded-lg p-8 border border-hairline shadow-sm hover:shadow-md transition-editorial">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className="w-4 h-4 fill-burgundy text-burgundy" />
                  ))}
                </div>
                <p className="text-body-text leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-hairline pt-4">
                  <p className="font-semibold text-ink">{testimonial.name}</p>
                  <p className="text-sm text-burgundy">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-burgundy tracking-widest uppercase mb-4">Transparent Pricing</p>
            <h2 className="text-5xl md:text-6xl font-serif text-ink mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Plans for Every Celebration
            </h2>
            <p className="text-xl text-body-text max-w-2xl mx-auto">
              Choose the perfect plan for your wedding, with flexible options to grow with your needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-8 transition-editorial ${
                  plan.popular
                    ? 'bg-burgundy text-warm-white border-2 border-burgundy relative transform scale-105'
                    : 'bg-warm-white border border-hairline hover:border-burgundy'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-burgundy px-4 py-1 rounded-full">
                    <p className="text-xs font-semibold text-warm-white">MOST POPULAR</p>
                  </div>
                )}
                <h3 className={`text-2xl font-semibold mb-2 ${plan.popular ? 'text-warm-white' : 'text-ink'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-warm-white/80' : 'text-body-text'}`}>
                  {plan.description}
                </p>
                <div className="mb-8">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-warm-white' : 'text-burgundy'}`}>
                    {plan.price}
                  </span>
                  <span className={`ml-2 ${plan.popular ? 'text-warm-white/80' : 'text-muted-text'}`}>
                    /month
                  </span>
                </div>
                <button
                  className={`w-full py-3 px-4 rounded font-semibold mb-8 transition-editorial ${
                    plan.popular
                      ? 'bg-warm-white text-burgundy hover:bg-cream'
                      : 'bg-burgundy text-cream hover:bg-burgundy-dark'
                  }`}
                >
                  Get Started
                </button>
                <div className="space-y-4">
                  {plan.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-warm-white' : 'text-burgundy'}`} />
                      <span className={`text-sm ${plan.popular ? 'text-warm-white' : 'text-body-text'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-blush">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-burgundy tracking-widest uppercase mb-4">Questions?</p>
            <h2 className="text-5xl md:text-6xl font-serif text-ink" style={{ fontFamily: 'var(--font-serif)' }}>
              Frequently Asked
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-warm-white rounded-lg border border-hairline overflow-hidden hover:border-burgundy transition-editorial"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-cream/30 transition-editorial"
                >
                  <h3 className="font-semibold text-ink">{faq.question}</h3>
                  {expandedFAQ === idx ? (
                    <Minus className="w-5 h-5 text-burgundy flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-burgundy flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === idx && (
                  <div className="px-6 py-5 border-t border-hairline bg-cream/20">
                    <p className="text-body-text leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-burgundy text-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-5xl md:text-6xl font-serif mb-6 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Ready to Plan Your Perfect Day?
          </h2>
          <p className="text-lg leading-relaxed mb-12 max-w-2xl mx-auto text-cream/90">
            Join thousands of couples who have planned their dream wedding with Planora. Start your journey today.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded text-ink placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-cream"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-cream text-burgundy font-semibold rounded hover:bg-warm-white transition-editorial whitespace-nowrap"
            >
              Create Account
            </button>
          </form>
          {submitted && (
            <p className="text-sm text-cream/90">
              ✓ Welcome! Check your email to get started
            </p>
          )}
          <p className="text-xs text-cream/70 mt-6">
            No credit card required. Start planning for free.
          </p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
