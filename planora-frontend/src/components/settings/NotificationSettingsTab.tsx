'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Globe, 
  CheckSquare, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlan } from '@/contexts/PlanContext';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  type NotificationPreference 
} from '@/services/notificationService';
import { getChecklist } from '@/services/checklist';
import type { ChecklistTask } from '@/types/checklist';

export default function NotificationSettingsTab() {
  const { t, formatDateDisplay } = useLanguage();
  const { plan } = usePlan();

  const [preferences, setPreferences] = useState<NotificationPreference>({
    emailEnabled: true,
    inAppEnabled: true,
    browserPushEnabled: false,
    taskDueReminderEnabled: true,
    paymentDueReminderEnabled: true,
    weddingMilestoneReminderEnabled: true,
    remindDaysBefore: 3,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upcoming tasks preview
  const [upcomingTasks, setUpcomingTasks] = useState<ChecklistTask[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const isLoadingTasks = Boolean(plan?.id) && !tasksLoaded;

  useEffect(() => {
    let mounted = true;
    getNotificationPreferences()
      .then((data) => {
        if (mounted) {
          setPreferences(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    // Load upcoming tasks if plan exists
    if (plan?.id) {
      getChecklist(plan.id)
        .then((tasks) => {
          if (!mounted) return;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const filtered = tasks
            .filter((task) => task.dueDate && task.status !== 'DONE')
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 4);

          setUpcomingTasks(filtered);
          setTasksLoaded(true);
        })
        .catch(() => {
          if (mounted) setTasksLoaded(true);
        });
    }

    return () => {
      mounted = false;
    };
  }, [plan?.id]);

  const handleToggle = (key: keyof NotificationPreference) => {
    if (key === 'browserPushEnabled' && !preferences.browserPushEnabled) {
      // Request browser notification permission if available
      if (typeof window !== 'undefined' && 'Notification' in window) {
        window.Notification.requestPermission().then((permission) => {
          setPreferences((prev) => ({
            ...prev,
            browserPushEnabled: permission === 'granted',
          }));
        });
        return;
      }
    }

    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTimingChange = (days: number) => {
    setPreferences((prev) => ({
      ...prev,
      remindDaysBefore: days,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToastMessage(null);
    setErrorMessage(null);

    try {
      const updated = await updateNotificationPreferences(preferences);
      setPreferences(updated);
      setToastMessage(t.settings.preferencesSavedSuccess);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu cài đặt';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDaysDiff = (dateStr?: string): number => {
    if (!dateStr) return 999;
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Toast Messages */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="font-bold text-emerald-600">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="font-bold text-rose-600">✕</button>
        </div>
      )}

      {/* ─── CARD 1: NOTIFICATION CHANNELS ─── */}
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 sm:p-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider text-[#5D0F12]">
            {t.settings.channelsTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-text mb-6">
          {t.settings.notificationsDesc}
        </p>

        <div className="space-y-4">
          {/* Channel: In-App */}
          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{t.settings.inAppChannel}</h3>
                <p className="text-xs text-muted-text mt-0.5">{t.settings.inAppChannelDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('inAppEnabled')}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
                preferences.inAppEnabled ? 'bg-[#5D0F12]' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  preferences.inAppEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Channel: Email */}
          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{t.settings.emailChannel}</h3>
                <p className="text-xs text-muted-text mt-0.5">{t.settings.emailChannelDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('emailEnabled')}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
                preferences.emailEnabled ? 'bg-[#5D0F12]' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  preferences.emailEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Channel: Browser Push */}
          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{t.settings.browserPushChannel}</h3>
                <p className="text-xs text-muted-text mt-0.5">{t.settings.browserPushChannelDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('browserPushEnabled')}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
                preferences.browserPushEnabled ? 'bg-[#5D0F12]' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  preferences.browserPushEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ─── CARD 2: DUE REMINDER TYPES ─── */}
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 sm:p-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider text-[#5D0F12]">
            {t.settings.remindersTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-text mb-6">
          Bật các danh mục cảnh báo đến hạn bạn muốn nhận để không bỏ sót các đầu việc quan trọng.
        </p>

        <div className="space-y-4">
          {/* Checklist Task Due */}
          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{t.settings.taskDueReminder}</h3>
                <p className="text-xs text-muted-text mt-0.5">{t.settings.taskDueReminderDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('taskDueReminderEnabled')}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
                preferences.taskDueReminderEnabled ? 'bg-[#5D0F12]' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  preferences.taskDueReminderEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Payment Due */}
          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{t.settings.paymentDueReminder}</h3>
                <p className="text-xs text-muted-text mt-0.5">{t.settings.paymentDueReminderDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('paymentDueReminderEnabled')}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
                preferences.paymentDueReminderEnabled ? 'bg-[#5D0F12]' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  preferences.paymentDueReminderEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Wedding Milestones Countdown */}
          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{t.settings.milestoneReminder}</h3>
                <p className="text-xs text-muted-text mt-0.5">{t.settings.milestoneReminderDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('weddingMilestoneReminderEnabled')}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out shrink-0 ${
                preferences.weddingMilestoneReminderEnabled ? 'bg-[#5D0F12]' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  preferences.weddingMilestoneReminderEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ─── TIMING SECTION ─── */}
        <div className="mt-8 pt-6 border-t border-hairline">
          <h3 className="text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider mb-2">
            {t.settings.timingTitle}
          </h3>
          <p className="text-xs text-muted-text mb-4">
            {t.settings.timingDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { days: 1, label: t.settings.remind1Day },
              { days: 3, label: t.settings.remind3Days },
              { days: 7, label: t.settings.remind7Days },
            ].map((option) => (
              <div
                key={option.days}
                onClick={() => handleTimingChange(option.days)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between select-none ${
                  preferences.remindDaysBefore === option.days
                    ? 'border-[#5D0F12] bg-[#FAF8F5] shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold text-neutral-900">{option.label}</span>
                {preferences.remindDaysBefore === option.days && (
                  <div className="w-5 h-5 rounded-full bg-[#5D0F12] text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-primary text-cream hover:bg-primary-active transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.settings.savingPreferencesBtn}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.settings.savePreferencesBtn}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── CARD 3: UPCOMING DUE TASKS PREVIEW ─── */}
      <div className="bg-white rounded-2xl sm:rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider text-[#5D0F12]">
              {t.settings.upcomingDueTitle}
            </h2>
          </div>
          <Link
            href="/checklist"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Checklist →
          </Link>
        </div>

        {isLoadingTasks ? (
          <div className="py-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : upcomingTasks.length > 0 ? (
          <div className="divide-y divide-hairline">
            {upcomingTasks.map((task) => {
              const diff = calculateDaysDiff(task.dueDate);
              let badgeColor = 'bg-neutral-100 text-neutral-700';
              let badgeText = `${diff} ngày nữa`;

              if (diff < 0) {
                badgeColor = 'bg-rose-100 text-rose-800 font-bold';
                badgeText = t.settings.overdueText.replace('{days}', String(Math.abs(diff)));
              } else if (diff === 0) {
                badgeColor = 'bg-rose-600 text-white font-bold animate-pulse';
                badgeText = t.settings.dueTodayText;
              } else if (diff <= 3) {
                badgeColor = 'bg-amber-100 text-amber-900 font-bold';
                badgeText = t.settings.daysLeftText.replace('{days}', String(diff));
              } else {
                badgeText = t.settings.daysLeftText.replace('{days}', String(diff));
              }

              return (
                <div key={task.id} className="py-3 sm:py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-neutral-900 truncate">
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] sm:text-xs text-muted-text hidden sm:inline">
                      {formatDateDisplay(task.dueDate)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-canvas border border-dashed border-neutral-300 text-center">
            <p className="text-xs sm:text-sm text-muted-text">
              {t.settings.noUpcomingTasks}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
