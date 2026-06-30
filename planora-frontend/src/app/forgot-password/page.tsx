'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to send reset password link
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccessMessage('An email has been sent! Please check your inbox.');
      setEmail('');
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:py-6 bg-cover bg-center relative font-sans text-ink select-none"
      style={{
        backgroundImage: "url('/login/curtain-bg.png')",
      }}
    >
      {/* Dark Red gradient/overlay to blend curtain background */}
      <div className="absolute inset-0 bg-black/35 z-0" />

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-3xl bg-[#FAF5EE] rounded-[32px] shadow-2xl overflow-visible grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
        
        {/* Left Column: Form */}
        <div className="md:col-span-7 px-6 pb-6 pt-16 sm:px-8 sm:pb-8 sm:pt-20 flex flex-col justify-between overflow-visible">
          
          {/* Inner Content Wrapper */}
          <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
            
            {/* Header text */}
            <div className="mb-6 font-serif text-ink leading-normal">
              <h1 
                className="text-2xl md:text-3xl italic font-normal mb-2"
                style={{ fontFamily: '"IM Fell French Canon", serif' }}
              >
                Forgot Password?
              </h1>
              <p className="text-muted-text text-xs">
                Enter your email below to receive a password reset link.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email input with floating-style label */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-[10px] font-bold text-ink uppercase tracking-wider"
                  style={{ fontFamily: '"Istok Web", sans-serif' }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                    if (successMessage) setSuccessMessage(null);
                  }}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  className={`block w-full h-[40px] pl-6 ${errorMessage ? 'pr-12 border-red-500' : 'pr-6 border-gray-400/80'} bg-transparent border rounded-full text-xs text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50`}
                />
                
                {errorMessage && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Validation Feedback Messages */}
              <div className="space-y-2">
                {successMessage && (
                  <div className="text-xs text-green-700 font-medium flex items-center gap-1.5 select-none font-serif">
                    <span>✓</span>
                    <span>{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="inline-flex items-center gap-1.5 bg-[#5D0F12] text-white px-4 py-1 rounded-full text-[10px] font-medium shadow-sm select-none">
                    <span>✕</span>
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-[200px] h-[38px] rounded-full bg-[#5D0F12] text-white text-[11px] font-bold tracking-widest uppercase hover:bg-[#460b0d] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>SEND RESET LINK</span>
                  )}
                </button>
              </div>
            </form>

            {/* Back to Login link */}
            <div className="text-left mt-8">
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/login');
                }}
                className="inline-flex items-center gap-1 text-xs text-ink/80 hover:text-[#5D0F12] font-semibold underline transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </a>
            </div>

          </div>

        </div>

        {/* Right Column: Visual Showcase Image */}
        <div className="md:col-span-5 p-3 hidden md:flex items-stretch">
          <div className="w-full relative rounded-[28px] overflow-hidden">
            <img
              src="/login/forgot-showcase.png"
              alt="Wedding Couple kissing"
              className="w-full h-full object-cover"
            />
            {/* Optional soft inner shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}
