'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { changePassword, getMyProfile, type UserProfile } from '@/services/userService';

export default function SecuritySettingsTab() {
  const { t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getMyProfile()
      .then((data) => {
        if (mounted) {
          setProfile(data);
          setIsLoadingProfile(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoadingProfile(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Calculate password strength
  const getPasswordStrength = (pass: string): { score: number; label: string; color: string; width: string } => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-200', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) {
      return { score: 1, label: t.settings.weak, color: 'bg-rose-500', width: 'w-1/3' };
    } else if (score <= 3) {
      return { score: 2, label: t.settings.medium, color: 'bg-amber-500', width: 'w-2/3' };
    } else {
      return { score: 3, label: t.settings.strong, color: 'bg-emerald-600', width: 'w-full' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage(t.settings.currentPasswordLabel + ': ' + t.settings.currentPasswordPlaceholder);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(t.settings.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t.settings.passwordMismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccessMessage(res.message || t.settings.passwordChangedSuccess);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Google OAuth linked account notice
  if (profile?.provider === 'GOOGLE') {
    return (
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-10 animate-fade-in space-y-6">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider text-[#5D0F12]">
            {t.settings.securityTitle}
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white border border-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 font-sans">
              {t.settings.googleUserNoticeTitle}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {t.settings.googleUserNoticeDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 sm:p-8 animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <KeyRound className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider text-[#5D0F12]">
            {t.settings.securityTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-text">
          {t.settings.securityDesc}
        </p>
      </div>

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Change Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        {/* Current Password */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider mb-2">
            {t.settings.currentPasswordLabel} <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t.settings.currentPasswordPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-canvas border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#5D0F12] focus:ring-2 focus:ring-[#5D0F12]/10 transition-all pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider mb-2">
            {t.settings.newPasswordLabel} <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.settings.newPasswordPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-canvas border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#5D0F12] focus:ring-2 focus:ring-[#5D0F12]/10 transition-all pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Bar */}
          {newPassword && (
            <div className="mt-2.5 space-y-1.5 animate-fade-in">
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-text">{t.settings.passwordStrength}:</span>
                <span className="font-semibold text-neutral-700">{strength.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider mb-2">
            {t.settings.confirmPasswordLabel} <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.settings.confirmPasswordPlaceholder}
              className={`w-full px-4 py-3 rounded-xl bg-canvas border text-sm text-neutral-900 focus:outline-none transition-all pr-11 ${
                confirmPassword && newPassword !== confirmPassword
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-neutral-300 focus:border-[#5D0F12] focus:ring-2 focus:ring-[#5D0F12]/10'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-rose-600 mt-1.5">{t.settings.passwordMismatch}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-primary text-cream hover:bg-primary-active transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.settings.changingPasswordBtn}
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-gold-light" />
                {t.settings.changePasswordBtn}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
