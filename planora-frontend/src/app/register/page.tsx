'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { register as registerService } from '@/services/auth';
import { Eye, EyeOff, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from '@react-oauth/google';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
    if (!fullName.trim()) {
      setErrorMessage(t.auth.fullNameRequired);
      return;
    }
    if (!username.trim()) {
      setErrorMessage(t.auth.usernameRequired);
      return;
    }
    if (username.trim().length < 3) {
      setErrorMessage(language === 'vi' ? 'Tên đăng nhập phải có ít nhất 3 ký tự!' : 'Username must be at least 3 characters!');
      return;
    }
    if (!email.trim()) {
      setErrorMessage(t.auth.emailRequired);
      return;
    }
    if (!password) {
      setErrorMessage(t.auth.passwordRequired);
      return;
    }
    if (password.length < 8) {
      setErrorMessage(t.auth.passwordMinLength);
      return;
    }
    if (!confirmPassword) {
      setErrorMessage(t.auth.confirmPasswordRequired);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t.auth.passwordMismatch);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await registerService({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role: 'USER',
      });
      setSuccessMessage(t.auth.registerSuccess);

      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : (language === 'vi' ? 'Đăng ký thất bại. Vui lòng thử lại!' : 'Registration failed. Please try again!');
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
        throw new Error(language === 'vi' ? 'Đăng nhập Google thất bại tại Backend!' : 'Google authentication failed at Backend!');
      }
      const data = await response.json();

      const jwtToken = data.accessToken || data.token;
      if (!jwtToken) {
        throw new Error(language === 'vi' ? 'Không nhận được token xác thực từ máy chủ!' : 'Could not receive authentication token from server!');
      }

      login(jwtToken);
      setSuccessMessage(t.auth.googleSuccess);

      setTimeout(() => {
        router.replace('/');
      }, 1200);
    } catch (error) {
      console.error('Google Sign In Error:', error);
      const errorMsg = error instanceof Error ? error.message : t.auth.googleError;
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign In Failed');
    setErrorMessage(t.auth.googleError);
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center text-[#5D0F12]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm font-serif italic text-[#5D0F12]/80">{t.auth.verifyingSession}</span>
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

        {/* Floating Quick Language Switcher */}
        <div className="absolute top-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm"
            title="Đổi ngôn ngữ / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#FFEEB5]" />
            <span className="uppercase font-bold tracking-wider">{language === 'vi' ? 'VI' : 'EN'}</span>
          </button>
        </div>

        {/* Text Header above Card */}
        <div className="relative z-10 text-center text-white/95 max-w-xl mb-4 select-none font-serif italic text-lg md:text-2xl leading-normal">
          {language === 'vi' ? (
            <span>
              Hãy để{' '}
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
              </span>{' '}
              đồng hành cùng bạn<br />đến ngày hạnh phúc nhất cuộc đời.
            </span>
          ) : (
            <span>
              Let{' '}
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
              </span>{' '}
              guide you to<br />the happiest day of your life.
            </span>
          )}
        </div>

        {/* Main Login Card Container */}
        <div className="relative z-10 w-full max-w-3xl bg-[#FAF5EE] rounded-2xl sm:rounded-[32px] shadow-2xl overflow-visible grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          
          {/* Floating Accent Badge */}
          <div
            className="absolute left-4 sm:-left-4 top-4 sm:top-6 bg-[#5D0F12] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-lg z-20 select-none text-xs sm:text-sm font-serif tracking-wider"
          >
            {t.auth.registerTag}
          </div>

          {/* Left Column: Form */}
          <div className="md:col-span-7 px-4 pb-6 pt-16 sm:px-8 sm:pb-8 sm:pt-20 flex flex-col justify-between overflow-visible">
            
            {/* Inner Content Wrapper */}
            <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
              
              {/* Header text */}
              <div className="mb-4 mt-6 md:mt-2 font-serif text-ink leading-normal">
                <p className="font-semibold text-base sm:text-lg text-ink">{t.auth.registerTitle}</p>
                <p className="text-muted-text text-sm">{t.auth.registerSubtitle}</p>
              </div>

              {/* Error & Success Messages */}
              {errorMessage && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <div>{errorMessage}</div>
                </div>
              )}
              {successMessage && (
                <div className="mb-3 p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <div>{successMessage}</div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* 1. Full name input */}
                <div className="relative">
                  <label
                    htmlFor="fullName"
                    className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-xs font-bold text-ink uppercase tracking-wider"
                  >
                    {t.auth.fullNameLabel} *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.auth.fullNamePlaceholder}
                    disabled={isSubmitting}
                    className="block w-full h-[44px] px-6 bg-transparent border border-gray-400/80 rounded-full text-base sm:text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50"
                  />
                </div>

                {/* 2. Username input */}
                <div className="relative">
                  <label
                    htmlFor="username"
                    className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-xs font-bold text-ink uppercase tracking-wider"
                  >
                    {t.auth.usernameLabel} *
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.auth.usernamePlaceholder}
                    disabled={isSubmitting}
                    className="block w-full h-[44px] px-6 bg-transparent border border-gray-400/80 rounded-full text-base sm:text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50"
                  />
                </div>
                
                {/* 3. Email input */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-xs font-bold text-ink uppercase tracking-wider"
                  >
                    {t.auth.emailLabel} *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    disabled={isSubmitting}
                    className="block w-full h-[44px] px-6 bg-transparent border border-gray-400/80 rounded-full text-base sm:text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50"
                  />
                </div>

                {/* 4. Password input (at least 8 char, no complex rules) */}
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-xs font-bold text-ink uppercase tracking-wider"
                  >
                    {t.auth.passwordLabel} (≥ 8) *
                  </label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'vi' ? 'Tối thiểu 8 ký tự...' : 'At least 8 characters...'}
                    disabled={isSubmitting}
                    className="block w-full h-[44px] pl-6 pr-12 bg-transparent border border-gray-400/80 rounded-full text-base sm:text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* 5. Confirm Password input */}
                <div className="relative">
                  <label
                    htmlFor="confirmPassword"
                    className="absolute top-0 left-6 -translate-y-1/2 bg-[#FAF5EE] px-2 text-xs font-bold text-ink uppercase tracking-wider"
                  >
                    {t.auth.confirmPasswordLabel} *
                  </label>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    disabled={isSubmitting}
                    className="block w-full h-[44px] pl-6 pr-12 bg-transparent border border-gray-400/80 rounded-full text-base sm:text-sm text-ink placeholder-gray-400 focus:outline-none focus:border-[#5D0F12] focus:ring-1 focus:ring-[#5D0F12] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink transition-colors cursor-pointer p-1"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-center text-ink/70 font-serif italic py-0.5">
                  {t.auth.registerHeroLine1} {t.auth.registerHeroLine2}
                </p>

                {/* SIGN UP button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:max-w-[200px] h-[44px] rounded-full bg-[#5D0F12] text-white text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-[#460b0d] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.auth.signingUp}</span>
                      </>
                    ) : (
                      <span>{t.auth.signUpBtn}</span>
                    )}
                  </button>
                </div>
              </form>

              {/* OR Divider */}
              <div className="relative flex py-2 items-center justify-center max-w-xs mx-auto my-1">
                <div className="flex-grow border-t border-gray-300/80"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-xs font-serif italic uppercase">{t.common.or}</span>
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
                <p className="text-xs text-gray-400 italic">{t.auth.googleSubtext}</p>
              </div>

              {/* Bottom footer links */}
              <div className="text-center text-sm text-ink/80 font-serif mt-1">
                <span>{t.auth.alreadyHaveAccount}{' '}</span>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/login');
                  }}
                  className="font-bold underline hover:text-[#5D0F12] transition-colors"
                >
                  {t.auth.signInLink}
                </a>
                <p className="text-[11px] text-gray-400/80 mt-1">
                  {t.auth.agreeTerms}
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
