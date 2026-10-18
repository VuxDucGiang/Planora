'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan, deleteActivePlan } from '@/services/weddingPlan';
import { getShortlist } from '@/services/vendor';
import type { ActivePlanResponse } from '@/types/weddingPlan';
import type { VendorResponse } from '@/types/vendor';
import {
  Calendar,
  DollarSign,
  Sparkles,
  Clock,
  Loader2,
  Plus,
  Heart,
  ListTodo,
  Edit3,
  Trash2,
  MessageCircle,
  Mail,
  AlertCircle,
  Send,
  CheckCircle2,
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import Link from 'next/link';
import SavedVendorsCarousel from '@/components/dashboard/SavedVendorsCarousel';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlan } from '@/contexts/PlanContext';

// ─── Circular Progress Ring Component ────────────────────────────
function CircularProgress({
  percent,
  size = 96,
  stroke = 6,
  color = 'var(--color-primary)',
  bgColor = 'var(--color-hairline)',
  children,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}


// ─── Main Dashboard Page ─────────────────────────────────────────
export default function Home() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, t, formatCurrency } = useLanguage();
  const router = useRouter();

  const { plan, daysLeft, isLoadingPlan, setPlan, deletePlan: contextDeletePlan } = usePlan();
  const [savedVendors, setSavedVendors] = useState<VendorResponse[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // Delete Plan Modal & Status States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Handle Delete Active Plan
  const handleDeletePlan = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await contextDeletePlan();
      setSavedVendors([]);
      setShowDeleteModal(false);
      setNotificationMessage(t.dashboard.deleteSuccessMsg);
      setTimeout(() => {
        setNotificationMessage(null);
      }, 6000);
    } catch (err) {
      console.error('Error deleting wedding plan:', err);
      setDeleteError(err instanceof Error ? err.message : t.dashboard.deleteErrorDefault);
    } finally {
      setIsDeleting(false);
    }
  };

  // Auth Redirection: unauthenticated visitors access landing page by default
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/landing');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load saved vendors when plan changes
  useEffect(() => {
    if (!isAuthenticated || !plan?.id) {
      setSavedVendors([]);
      return;
    }

    let isMounted = true;
    async function loadSavedVendors() {
      try {
        const vendors = await getShortlist(plan!.id);
        if (isMounted) {
          setSavedVendors(vendors || []);
        }
      } catch {
        if (isMounted) {
          setSavedVendors([]);
        }
      }
    }

    loadSavedVendors();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, plan?.id]);

  // Countdown timer logic
  useEffect(() => {
    if (!plan?.weddingDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(plan.weddingDate) - +new Date();
      let timeLeftTemp = { days: 0, hours: 0, minutes: 0 };

      if (difference > 0) {
        timeLeftTemp = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        };
      }
      setTimeLeft(timeLeftTemp);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [plan?.weddingDate]);

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 18) return t.dashboard.greetingAfternoon;
    return t.dashboard.greetingEvening;
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-text">{t.dashboard.loadingSession}</span>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const totalAllocated = plan?.budgetItems?.reduce((sum, item) => sum + (item.estimatedCost || 0), 0) || 0;
  const totalSpent = plan?.budgetItems?.reduce((sum, item) => sum + (item.actualCost || 0), 0) || 0;
  const totalTasks = plan?.checklistStats?.totalTasks || 0;
  const completedTasks = plan?.checklistStats?.completedTasks || 0;
  const checklistPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const budgetRemaining = (plan?.budget || 0) - totalSpent - (totalAllocated - totalSpent);
  const timelinePercent = totalTasks > 0 ? Math.min(Math.round((completedTasks / totalTasks) * 50) + 10, 100) : 0;

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col w-full">
      {/* Top Info Bar */}
      <div className="sticky top-0 z-50">
        <DashboardHeader logout={logout} plan={plan} daysLeft={timeLeft.days} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 w-full relative">
        {/* Sidebar */}
        <DashboardSidebar hasPlan={!!plan} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {isLoadingPlan ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-text font-display">{t.dashboard.loadingPlan}</span>
            </div>
          ) : (
            <>
              <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 lg:px-10 py-6 sm:py-8">
                {/* ── Greeting Section ───────────────────────── */}
                <div className={`mb-6 sm:mb-8 animate-fade-in ${!plan ? 'text-center' : ''}`}>
                  <h1
                    className="text-xl sm:text-2xl text-primary mb-1 font-serif font-normal"
                  >
                    {getGreeting()}, {displayName}!
                  </h1>
                  <p
                    className="text-sm sm:text-base text-primary font-serif font-normal"
                  >
                    {plan
                      ? t.dashboard.overviewSubtitle
                      : t.dashboard.welcomeSubtitle}
                  </p>
                </div>

                {/* Notification Banner */}
                {notificationMessage && (
                  <div className={`mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-xs shadow-xs animate-fade-in ${!plan ? 'max-w-2xl mx-auto' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium">{notificationMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationMessage(null)}
                      className="text-emerald-600 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {!plan ? (
                  /* ══════════════════════════════════════════════
                     EMPTY STATE — Account without wedding plan
                     ══════════════════════════════════════════════ */
                  <div className="space-y-8 animate-fade-in">
                    {/* Wedding Summary Card - Empty */}
                    <div className="bg-white border border-hairline rounded-xl p-8 shadow-sm vintage-card flex flex-col items-center justify-center text-center space-y-5">
                      <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20">
                        <Heart className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <h2 className="text-xl font-display font-medium text-ink text-center">
                        {t.dashboard.emptyCardTitle}
                      </h2>
                      <p className="text-sm text-muted-text max-w-md mx-auto text-center leading-relaxed">
                        {t.dashboard.emptyCardDesc}
                      </p>
                      <Link
                        href="/onboarding"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-cream rounded-lg text-sm font-semibold hover:bg-primary-active transition-all shadow-md uppercase tracking-wider"
                      >
                        <Plus className="w-4 h-4" />
                        {t.dashboard.emptyCardBtn}
                      </Link>
                    </div>

                    {/* Feature Showcase - Empty State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { icon: <DollarSign className="w-5 h-5" />, title: t.dashboard.featBudgetTitle, desc: t.dashboard.featBudgetDesc },
                        { icon: <ListTodo className="w-5 h-5" />, title: t.dashboard.featChecklistTitle, desc: t.dashboard.featChecklistDesc },
                        { icon: <Calendar className="w-5 h-5" />, title: t.dashboard.featTimelineTitle, desc: t.dashboard.featTimelineDesc },
                        { icon: <Sparkles className="w-5 h-5" />, title: t.dashboard.featConceptTitle, desc: t.dashboard.featConceptDesc },
                      ].map((feat) => (
                        <div key={feat.title} className="bg-white border border-hairline rounded-lg p-5 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">{feat.icon}</div>
                          <div>
                            <h4 className="text-sm font-bold text-ink">{feat.title}</h4>
                            <p className="text-xs text-muted-text mt-0.5">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ══════════════════════════════════════════════
                     FULL DASHBOARD — With active wedding plan
                     ══════════════════════════════════════════════ */
                  <div className="space-y-8">

                    {/* ── Wedding Summary Card ─────────────────── */}
                    <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm vintage-card animate-fade-in-delay-1">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h2
                          className="text-xl sm:text-2xl font-serif font-medium text-ink uppercase tracking-wider flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                          {t.dashboard.summaryCardTitle}
                        </h2>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/onboarding"
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-3.5 py-1.5 rounded-full transition-colors uppercase tracking-wider"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {t.dashboard.editPlanBtn}
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 px-3.5 py-1.5 rounded-full transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                            title={t.dashboard.deletePlanBtn}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            {t.dashboard.deletePlanBtn}
                          </button>
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="flex flex-wrap gap-x-8 gap-y-2.5 text-sm sm:text-base text-body-text mb-5 pb-4 border-b border-hairline">
                        <div>
                          <span className="text-muted-text">{t.dashboard.styleLabel}: </span>
                          <span className="font-semibold text-ink">
                            {plan.conceptSuggestions?.[0]?.conceptName || 'Modern Rustic'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-text">{t.dashboard.budgetLabel}: </span>
                          <span className="font-semibold text-ink font-mono">
                            {formatCurrency(plan.budget)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-text">{t.dashboard.guestsLabel}: </span>
                          <span className="font-semibold text-ink">{plan.guestCount}</span>
                        </div>
                      </div>

                      {/* Countdown Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm sm:text-base font-semibold text-ink flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-muted-text" />
                            {t.dashboard.countdownLabel}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-primary">
                            {t.dashboard.daysRemainingFormat.replace('{days}', String(timeLeft.days))}
                          </span>
                        </div>
                        <div className="w-full h-[18px] bg-lace rounded-full overflow-hidden border border-lace-dark/30">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-1000 ease-out animate-pulse-glow"
                            style={{
                              width: `${Math.max(5, Math.min(100, plan.weddingDate
                                ? 100 - (timeLeft.days / (Math.max(1, Math.ceil((+new Date(plan.weddingDate) - +new Date('2024-01-01')) / (1000 * 60 * 60 * 24))))) * 100
                                : 0
                              ))}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Progress & Budget Row ────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Progress Tracker */}
                      <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm vintage-card animate-fade-in-delay-2">
                        <h3
                          className="text-xl sm:text-2xl font-serif font-medium text-ink uppercase tracking-wider mb-5 flex items-center gap-2"
                        >
                          <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                          {t.dashboard.progressTrackerTitle}
                        </h3>

                        <div className="space-y-4">
                          {/* Checklist Tasks */}
                          <div>
                            <div className="flex justify-between text-sm sm:text-base mb-1.5">
                              <span className="font-semibold text-ink">
                                {t.dashboard.checklistProgressFormat.replace('{percent}', String(checklistPercent))}
                              </span>
                            </div>
                            <div className="w-full h-3 bg-lace rounded-full overflow-hidden border border-lace-dark/20">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-700"
                                style={{ width: `${checklistPercent}%` }}
                              />
                            </div>
                            <p className="text-sm text-muted-text mt-1.5 italic">
                              {t.dashboard.checklistCompletedFormat
                                .replace('{completed}', String(completedTasks))
                                .replace('{total}', String(totalTasks))}
                            </p>
                          </div>

                          {/* Timeline Milestones */}
                          <div>
                            <div className="flex justify-between text-sm sm:text-base mb-1.5">
                              <span className="font-semibold text-ink">
                                {t.dashboard.timelineProgressFormat.replace('{percent}', String(timelinePercent))}
                              </span>
                            </div>
                            <div className="w-full h-3 bg-lace rounded-full overflow-hidden border border-lace-dark/20">
                              <div
                                className="h-full bg-gold rounded-full transition-all duration-700"
                                style={{ width: `${timelinePercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Budget & Spending */}
                      <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm vintage-card animate-fade-in-delay-2">
                        <h3
                          className="text-xl sm:text-2xl font-serif font-medium text-ink uppercase tracking-wider mb-4 flex items-center gap-2"
                        >
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                          {t.dashboard.budgetOverviewTitle}
                        </h3>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 sm:gap-6">
                          {/* Circular Progress */}
                          <div className="shrink-0">
                            <CircularProgress
                              percent={plan.budget > 0 ? Math.round((totalSpent / plan.budget) * 100) : 0}
                              size={105}
                              stroke={7}
                              color="var(--color-primary)"
                            >
                              <div className="text-center px-1">
                                <span className="text-xs sm:text-sm font-bold text-ink block">
                                  {language === 'vi' ? 'Tổng' : 'Total'}
                                </span>
                                <span className="text-[11px] sm:text-xs font-bold text-primary font-mono truncate max-w-[80px] block">
                                  {formatCurrency(plan.budget)}
                                </span>
                              </div>
                            </CircularProgress>
                          </div>

                          {/* Legend */}
                          <div className="space-y-3 w-full sm:flex-1">
                            <div className="flex items-center justify-between text-sm sm:text-base">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-body-text">{t.dashboard.budgetSpent}</span>
                              </div>
                              <span className="font-bold text-ink font-mono">
                                {formatCurrency(totalSpent)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm sm:text-base">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gold" />
                                <span className="text-body-text">{t.dashboard.budgetAllocated}</span>
                              </div>
                              <span className="font-bold text-ink font-mono">
                                {formatCurrency(totalAllocated)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm sm:text-base">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-hairline" />
                                <span className="text-body-text">{t.dashboard.budgetRemaining}</span>
                              </div>
                              <span className="font-bold text-ink font-mono">
                                {formatCurrency(Math.max(0, budgetRemaining))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Decorative Lace Divider ──────────────── */}
                    <div className="ornament-divider text-lace-dark py-2">
                      <span className="text-lg">✦</span>
                    </div>

                    {/* ── Saved Vendors Section ────────────────── */}
                    <div className="animate-fade-in-delay-3">
                      <SavedVendorsCarousel vendors={savedVendors} />
                    </div>

                    {/* ── Inquiry Status Section ───────────────── */}
                    <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm vintage-card animate-fade-in-delay-4">
                      <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        {language === 'vi' ? 'TRẠNG THÁI YÊU CẦU' : 'INQUIRY STATUS'}
                      </h3>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                        {/* Open Message Center Button */}
                        <Link
                          href="#messages"
                          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-cream rounded-lg text-xs font-semibold hover:bg-primary-active transition-colors shadow-sm uppercase tracking-wider"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {language === 'vi' ? 'MỞ TRUNG TÂM TIN NHẮN' : 'OPEN MESSAGE CENTER'}
                        </Link>

                        {/* Stats */}
                        <div className="flex gap-6 text-xs">
                          <div className="flex items-center gap-2">
                            <Send className="w-3.5 h-3.5 text-muted-text" />
                            <span className="text-body-text">
                              {language === 'vi' ? 'Yêu cầu đã gửi' : 'Sent Requests'}
                            </span>
                            <span className="font-bold text-ink">{savedVendors.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span className="text-body-text">
                              {language === 'vi' ? 'Phản hồi từ đối tác' : 'Vendor Responses'}
                            </span>
                            <span className="font-bold text-primary">
                              {language === 'vi' ? '0 MỚI' : '0 NEW'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-gold" />
                            <span className="text-body-text">
                              {language === 'vi' ? 'Chưa phản hồi' : 'No Reply Yet'}
                            </span>
                            <span className="font-bold text-ink">0</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </main>

              {/* Delete Plan Confirmation Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                  <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-hairline p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-slide-up sm:animate-scale-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-ink">{t.dashboard.deleteModalTitle}</h3>
                        <p className="text-xs text-muted-text mt-0.5">{t.dashboard.deleteModalWarning}</p>
                      </div>
                    </div>

                    <p className="text-xs text-body-text leading-relaxed bg-rose-50/60 p-3.5 rounded-xl border border-rose-100">
                      {t.dashboard.deleteModalNotice}
                    </p>

                    {deleteError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{deleteError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-hairline">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-body-text hover:bg-canvas rounded-lg border border-hairline transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                      >
                        {t.dashboard.deleteModalCancel}
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDeletePlan}
                        className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {t.common.deleting}
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            {t.dashboard.deleteModalConfirm}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}
