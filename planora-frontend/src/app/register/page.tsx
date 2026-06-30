'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { register as registerService } from '@/services/auth';
import { Mail, Lock, Eye, EyeOff, Loader2, User, CheckCircle2 } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from '@react-oauth/google';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // Redirection check if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all fields!');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await registerService({ fullName, email, password });
      setSuccessMessage('Registration successful! Redirecting to login page...');

      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed. Please try again!';
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      // Call Spring Boot backend to authenticate Google Token
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        throw new Error('Google authentication failed at Backend!');
      }
      const data = await response.json();

      const jwtToken = data.accessToken || data.token;
      if (!jwtToken) {
        throw new Error('Could not receive authentication token from server!');
      }

      login(jwtToken);
      setSuccessMessage('Logged in with Google successfully! Redirecting...');

      setTimeout(() => {
        router.replace('/');
      }, 1200);
    } catch (error) {
      console.error('Google Sign In Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Google authentication failed. Please try again!';
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign In Failed');
    setErrorMessage('Google authentication failed. Please try again!');
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center text-[#5D0F12]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm font-serif italic text-[#5D0F12]/80">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 md:py-6 bg-cover bg-center relative font-sans text-ink select-none"
        style={{
          backgroundImage: "url('/login/curtain-bg.png')",
        }}
      >
        {/* Dark Red gradient/overlay to blend curtain background */}
        <div className="absolute inset-0 bg-black/35 z-0" />

        {/* Text Header above Card */}
        <div className="relative z-10 text-center text-white/95 max-w-xl mb-4 select-none font-serif italic text-lg md:text-2xl leading-normal">
          <span>Let </span>
          <span
            style={{
              fontFamily: '"Burgues Script W00 Regular", BurguesScriptW00-Regular, cursive',
              color: '#FFEEB5',
              fontSize: '1.4em',
              fontStyle: 'normal',
              verticalAlign: 'middle',
              margin: '0 4px',
            }}
          >
            Planora
          </span>
          <span> guide you to<br />the happiest day of your life.</span>
        </div>

        {/* Main Login Card Container */}
        <div className="relative z-10 w-full max-w-3xl bg-[#FAF5EE] rounded-[32px] shadow-2xl overflow-visible grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          
          {/* Floating Accent Badge: CREATE AN ACCOUNT */}
          <div
            className="absolute -left-4 top-6 bg-[#5D0F12] text-white px-6 py-2 rounded-full shadow-lg z-20 select-none"
            style={{ fontFamily: '"IM Fell French Canon", serif', fontSize: '0.95rem', letterSpacing: '0.05em' }}
          >
            CREATE AN ACCOUNT
          </div>

          {/* Left Column: Form */}
          <div className="md:col-span-7 px-6 pb-6 pt-16 sm:px-8 sm:pb-8 sm:pt-20 flex flex-col justify-between overflow-visible">
            
            {/* Inner Content Wrapper */}
            <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
              
              {/* Header text */}
              <div className="mb-4 mt-6 md:mt-2 font-serif text-ink leading-normal">
                <p className="font-semibold text-md text-ink">Start your planning journey.</p>
              </div>

              {/* Error & Success Messages */}
              {errorMessage && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[11px] font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <div>{errorMessage}</div>
                </div>
              )}
              {successMessage && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-[11px] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <div>{successMessage}</div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full name input with floating-style label */}
                <div className="relative">
                  <label
                    htmlFor="fullName"
                    className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-[10px] font-bold text-ink uppercase tracking-wider"
                    style={{ fontFamily: '"Istok Web", sans-serif' }}
                  >
                    Full name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isSubmitting}
                    className="block w-full h-[40px] px-6 bg-transparent border border-gray-400/80 rounded-full text-xs text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50"
                  />
                </div>
                
                {/* Email input with floating-style label */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-[10px] font-bold text-ink uppercase tracking-wider"
                    style={{ fontFamily: '"Istok Web", sans-serif' }}
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                    className="block w-full h-[40px] px-6 bg-transparent border border-gray-400/80 rounded-full text-xs text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Password input with floating-style label */}
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-[10px] font-bold text-ink uppercase tracking-wider"
                    style={{ fontFamily: '"Istok Web", sans-serif' }}
                  >
                    Password *
                  </label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    className="block w-full h-[40px] pl-6 pr-12 bg-transparent border border-gray-400/80 rounded-full text-xs text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[10px] text-center text-ink/70 font-serif italic py-1">
                  Create Your Account and Start Planning Your Perfect Day
                </p>

                {/* SIGN UP button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full max-w-[160px] h-[38px] rounded-full bg-[#5D0F12] text-white text-[11px] font-bold tracking-widest uppercase hover:bg-[#460b0d] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Signing up...</span>
                      </>
                    ) : (
                      <span>SIGN UP</span>
                    )}
                  </button>
                </div>
              </form>

              {/* OR Divider */}
              <div className="relative flex py-2 items-center justify-center max-w-xs mx-auto my-1">
                <div className="flex-grow border-t border-gray-300/80"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-[11px] font-serif italic">OR</span>
                <div className="flex-grow border-t border-gray-300/80"></div>
              </div>

              {/* Google signup container */}
              <div className="flex flex-col items-center justify-center gap-1.5 mb-2">
                <div className="hover:scale-[1.01] transition-transform duration-200">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    shape="pill"
                    text="signup_with"
                    width="240"
                  />
                </div>
                <p className="text-[9px] text-gray-400 italic">We won&apos;t publish posts on your behalf.</p>
              </div>

              {/* Bottom footer links */}
              <div className="text-center text-xs text-ink/80 font-serif mt-1">
                <span>Already have an account? </span>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/login');
                  }}
                  className="font-bold underline hover:text-[#5D0F12] transition-colors"
                >
                  Login
                </a>
                <p className="text-[8px] text-gray-400/80 mt-1">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>

            </div>

          </div>

          {/* Right Column: Visual Showcase Image */}
          <div className="md:col-span-5 p-3 hidden md:flex items-stretch">
            <div className="w-full relative rounded-[28px] overflow-hidden">
              <img
                src="/login/register-showcase.png"
                alt="Wedding Couple from behind"
                className="w-full h-full object-cover"
              />
              {/* Optional soft inner shadow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
