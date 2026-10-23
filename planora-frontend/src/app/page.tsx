'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleRedirectPath } from '@/services/auth';
import { getShortlist } from '@/services/vendor';
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
  LayoutDashboard,
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
  color = '#5D0F12',
  bgColor = '#F3EFEA',
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

  const { plan, isLoadingPlan, deletePlan: contextDeletePlan } = usePlan();
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
    } else if (!authLoading && isAuthenticated && user) {
      const redirectPath = getRoleRedirectPath(user.role, user.email);
      if (redirectPath !== '/') {
        router.replace(redirectPath);
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

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
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm text-neutral-500 font-serif italic">{t.dashboard.loadingSession}</span>
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
    <div className="min-h-screen bg-[#FFFBF5] text-neutral-800 font-sans flex flex-col w-full selection:bg-[#5D0F12]/15 selection:text-[#5D0F12]">
      {/* Top Info Bar */}
      <div className="sticky top-0 z-50">
        <DashboardHeader logout={logout} plan={plan} daysLeft={timeLeft.days} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 w-full relative">
        {/* Sidebar */}
        <DashboardSidebar hasPlan={!!plan} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBF5]">
          {isLoadingPlan ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
              <span className="text-sm text-neutral-500 font-serif italic">{t.dashboard.loadingPlan}</span>
            </div>
          ) : (
            <>
              <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 lg:px-10 py-6 sm:py-8">
                {/* ─── Breadcrumbs Badge & Subtitle Row (Marketplace Style) ─── */}
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-6 sm:mb-8 animate-fade-in ${!plan ? 'text-center md:text-left' : ''}`}>
                  <div>
                    {/* Clean, Elegant Breadcrumb Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-xs">
                      <LayoutDashboard className="w-4 h-4 text-[#5D0F12]" />
                      <span className="font-serif tracking-widest text-xs font-bold uppercase text-[#5D0F12]">
                        {t.nav.dashboard || 'TỔNG QUAN KẾ HOẠCH CƯỚI'}
                      </span>
                    </div>

                    {/* Subtitle */}
                    <h2 className="text-xs sm:text-base font-serif italic text-neutral-800 mt-1.5 pl-1">
                      {getGreeting()}, {displayName}! {plan ? t.dashboard.overviewSubtitle : t.dashboard.welcomeSubtitle}
                    </h2>
                  </div>

                  {/* Explore Marketplace Pill Button */}
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 bg-white hover:bg-[#FAF8F5] text-neutral-800 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#5D0F12]" />
                    <span>{t.dashboard.exploreVendorsBtn || 'Khám phá đối tác cưới'}</span>
                  </Link>
                </div>

                {/* Notification Banner */}
                {notificationMessage && (
                  <div className={`mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-xs shadow-xs animate-fade-in ${!plan ? 'max-w-2xl mx-auto' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
                    <div className="bg-[#FAF8F5] border border-neutral-200/60 rounded-[1.75rem] sm:rounded-[2rem] p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center space-y-5">
                      <div className="inline-flex p-4 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20">
                        <Heart className="w-8 h-8 text-[#5D0F12] animate-pulse" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-wide text-[#5D0F12] text-center">
                        {t.dashboard.emptyCardTitle}
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto text-center leading-relaxed font-serif italic">
                        {t.dashboard.emptyCardDesc}
                      </p>
                      <Link
                        href="/onboarding"
                        className="inline-flex items-center gap-2 px-7 py-3 bg-[#5D0F12] hover:bg-[#4A0C0E] !text-[#FFFBF5] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
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
                        <div key={feat.title} className="bg-white border border-neutral-100 rounded-[1.5rem] p-5 flex items-start gap-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
                          <div className="w-10 h-10 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12] shrink-0">
                            {feat.icon}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 font-sans">{feat.title}</h4>
                            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{feat.desc}</p>
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

                    {/* ── Wedding Summary Card (Marketplace standard rounded-[1.75rem]) ─────────────────── */}
                    <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-7 animate-fade-in-delay-1">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12] shrink-0">
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#5D0F12]" />
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-serif font-bold uppercase tracking-wide text-[#5D0F12]">
                              {t.dashboard.summaryCardTitle}
                            </h2>
                            {plan.title && (
                              <p className="text-xs text-neutral-500 font-serif italic truncate max-w-xs sm:max-w-md">
                                {plan.title}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href="/onboarding"
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-full transition-all shadow-xs uppercase tracking-wider active:scale-95 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#5D0F12]" />
                            {t.dashboard.editPlanBtn}
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-700 border border-rose-200/80 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer uppercase tracking-wider active:scale-95"
                            title={t.dashboard.deletePlanBtn}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            {t.dashboard.deletePlanBtn}
                          </button>
                        </div>
                      </div>

                      {/* Info Badges Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-[#FAF8F5] border border-neutral-200/60">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                            {t.dashboard.styleLabel}
                          </span>
                          <span className="font-serif font-bold text-base text-[#5D0F12] mt-0.5 block">
                            {plan.conceptSuggestions?.[0]?.conceptName || 'Modern Rustic'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                            {t.dashboard.budgetLabel}
                          </span>
                          <span className="font-bold text-base text-neutral-900 mt-0.5 block">
                            {formatCurrency(plan.budget)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                            {t.dashboard.guestsLabel}
                          </span>
                          <span className="font-bold text-base text-neutral-900 mt-0.5 block">
                            {plan.guestCount} {language === 'vi' ? 'khách' : 'guests'}
                          </span>
                        </div>
                      </div>

                      {/* Countdown Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-semibold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wider">
                            <Clock className="w-4 h-4 text-[#5D0F12]" />
                            {t.dashboard.countdownLabel}
                          </span>
                          <span className="text-sm sm:text-base font-bold text-[#5D0F12]">
                            {t.dashboard.daysRemainingFormat.replace('{days}', String(timeLeft.days))}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/60">
                          <div
                            className="h-full bg-gradient-to-r from-[#5D0F12] to-[#8F3035] rounded-full transition-all duration-1000 ease-out"
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
                      <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-7 flex flex-col justify-between animate-fade-in-delay-2">
                        <div>
                          <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12] shrink-0">
                              <ListTodo className="w-4 h-4 text-[#5D0F12]" />
                            </div>
                            <h3 className="text-base sm:text-lg font-serif font-bold uppercase tracking-wide text-[#5D0F12]">
                              {t.dashboard.progressTrackerTitle}
                            </h3>
                          </div>

                          <div className="space-y-5">
                            {/* Checklist Tasks */}
                            <div>
                              <div className="flex justify-between items-center text-xs sm:text-sm mb-1.5">
                                <span className="font-semibold text-neutral-800">
                                  {t.dashboard.checklistProgressFormat.replace('{percent}', String(checklistPercent))}
                                </span>
                                <span className="text-xs text-neutral-500 font-serif italic">
                                  {t.dashboard.checklistCompletedFormat
                                    .replace('{completed}', String(completedTasks))
                                    .replace('{total}', String(totalTasks))}
                                </span>
                              </div>
                              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/60">
                                <div
                                  className="h-full bg-[#5D0F12] rounded-full transition-all duration-700"
                                  style={{ width: `${checklistPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Timeline Milestones */}
                            <div>
                              <div className="flex justify-between items-center text-xs sm:text-sm mb-1.5">
                                <span className="font-semibold text-neutral-800">
                                  {t.dashboard.timelineProgressFormat.replace('{percent}', String(timelinePercent))}
                                </span>
                                <span className="text-xs text-neutral-500 font-serif italic">
                                  {language === 'vi' ? 'Tiến độ thời gian' : 'Timeline Progress'}
                                </span>
                              </div>
                              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/60">
                                <div
                                  className="h-full bg-amber-600 rounded-full transition-all duration-700"
                                  style={{ width: `${timelinePercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-5 mt-5 border-t border-neutral-100 flex items-center justify-between">
                          <Link
                            href="/checklist"
                            className="text-xs font-bold uppercase tracking-wider text-[#5D0F12] hover:underline cursor-pointer"
                          >
                            {t.nav.checklist} &rarr;
                          </Link>
                          <Link
                            href="/timeline"
                            className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-[#5D0F12] hover:underline cursor-pointer"
                          >
                            {t.nav.timeline} &rarr;
                          </Link>
                        </div>
                      </div>

                      {/* Budget & Spending */}
                      <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-7 flex flex-col justify-between animate-fade-in-delay-2">
                        <div>
                          <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12] shrink-0">
                              <DollarSign className="w-4 h-4 text-[#5D0F12]" />
                            </div>
                            <h3 className="text-base sm:text-lg font-serif font-bold uppercase tracking-wide text-[#5D0F12]">
                              {t.dashboard.budgetOverviewTitle}
                            </h3>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 sm:gap-6">
                            {/* Circular Progress */}
                            <div className="shrink-0">
                              <CircularProgress
                                percent={plan.budget > 0 ? Math.round((totalSpent / plan.budget) * 100) : 0}
                                size={105}
                                stroke={7}
                                color="#5D0F12"
                                bgColor="#F3EFEA"
                              >
                                <div className="text-center px-1">
                                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                                    {language === 'vi' ? 'Tổng chi' : 'Spent'}
                                  </span>
                                  <span className="text-xs font-bold text-[#5D0F12] truncate max-w-[80px] block">
                                    {plan.budget > 0 ? `${Math.round((totalSpent / plan.budget) * 100)}%` : '0%'}
                                  </span>
                                </div>
                              </CircularProgress>
                            </div>

                            {/* Legend */}
                            <div className="space-y-2.5 w-full sm:flex-1">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#5D0F12]" />
                                  <span className="text-neutral-700 font-medium">{t.dashboard.budgetSpent}</span>
                                </div>
                                <span className="font-bold text-neutral-900">
                                  {formatCurrency(totalSpent)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                                  <span className="text-neutral-700 font-medium">{t.dashboard.budgetAllocated}</span>
                                </div>
                                <span className="font-bold text-neutral-900">
                                  {formatCurrency(totalAllocated)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                                  <span className="text-neutral-700 font-medium">{t.dashboard.budgetRemaining}</span>
                                </div>
                                <span className="font-bold text-[#5D0F12]">
                                  {formatCurrency(Math.max(0, budgetRemaining))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-5 mt-5 border-t border-neutral-100 flex items-center justify-end">
                          <Link
                            href="/budget"
                            className="text-xs font-bold uppercase tracking-wider text-[#5D0F12] hover:underline cursor-pointer"
                          >
                            {t.nav.budget} &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* ── Quiet Luxury Accent Divider ──────────────── */}
                    <div className="flex items-center justify-center gap-4 py-2 text-neutral-300 select-none">
                      <div className="h-px bg-neutral-200/80 flex-1 max-w-[120px]" />
                      <span className="text-amber-700 text-sm">✦</span>
                      <div className="h-px bg-neutral-200/80 flex-1 max-w-[120px]" />
                    </div>

                    {/* ── Saved Vendors Section ────────────────── */}
                    <div className="animate-fade-in-delay-3">
                      <SavedVendorsCarousel vendors={savedVendors} />
                    </div>

                    {/* ── Inquiry Status Section ───────────────── */}
                    <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-7 animate-fade-in-delay-4">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12] shrink-0">
                          <MessageCircle className="w-4 h-4 text-[#5D0F12]" />
                        </div>
                        <h3 className="text-base sm:text-lg font-serif font-bold uppercase tracking-wide text-[#5D0F12]">
                          {language === 'vi' ? 'TRẠNG THÁI TƯ VẤN & HỘP THƯ' : 'INQUIRY STATUS & MESSAGES'}
                        </h3>
                      </div>

                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        {/* Open Message Center Button */}
                        <Link
                          href="/messages"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5D0F12] hover:bg-[#4A0C0E] !text-[#FFFBF5] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{language === 'vi' ? 'MỞ TRUNG TÂM TIN NHẮN' : 'OPEN MESSAGE CENTER'}</span>
                        </Link>

                        {/* Stat Pills */}
                        <div className="flex flex-wrap items-center gap-2.5 text-xs">
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-neutral-200/60">
                            <Send className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="text-neutral-600 font-medium">
                              {language === 'vi' ? 'Yêu cầu đã lưu' : 'Saved Vendors'}:
                            </span>
                            <span className="font-bold text-neutral-900">{savedVendors.length}</span>
                          </div>
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-800 font-medium">
                              {language === 'vi' ? 'Tin nhắn' : 'Messages'}:
                            </span>
                            <span className="font-bold text-emerald-700">
                              {language === 'vi' ? 'SẴN SÀNG' : 'READY'}
                            </span>
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
                  <div className="bg-white rounded-t-3xl sm:rounded-[1.75rem] border border-neutral-200/80 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-slide-up sm:animate-scale-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">{t.dashboard.deleteModalTitle}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">{t.dashboard.deleteModalWarning}</p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100">
                      {t.dashboard.deleteModalNotice}
                    </p>

                    {deleteError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{deleteError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-full transition-all shadow-xs cursor-pointer min-h-[42px] flex items-center justify-center"
                      >
                        {t.dashboard.deleteModalCancel}
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDeletePlan}
                        className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-full transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 min-h-[42px]"
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
