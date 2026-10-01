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
  Users,
  DollarSign,
  Sparkles,
  Clock,
  ChevronRight,
  Loader2,
  Plus,
  Heart,
  ListTodo,
  Edit3,
  Trash2,
  Star,
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

// ─── Star Rating Component ───────────────────────────────────────
function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < Math.round(rating)
            ? 'text-gold fill-gold'
            : 'text-hairline'
            }`}
        />
      ))}
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────
export default function Home() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<ActivePlanResponse | null>(null);
  const [savedVendors, setSavedVendors] = useState<VendorResponse[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
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
      await deleteActivePlan();
      setPlan(null);
      setSavedVendors([]);
      setShowDeleteModal(false);
      setNotificationMessage('Kế hoạch cưới hiện tại đã được xóa thành công. Bạn có thể bắt đầu tạo kế hoạch mới!');
      setTimeout(() => {
        setNotificationMessage(null);
      }, 6000);
    } catch (err) {
      console.error('Lỗi khi xóa kế hoạch cưới:', err);
      setDeleteError(err instanceof Error ? err.message : 'Xóa kế hoạch cưới thất bại. Vui lòng thử lại!');
    } finally {
      setIsDeleting(false);
    }
  };

  // Auth Redirection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Active Plan
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadActivePlan() {
      try {
        setIsLoadingPlan(true);
        const activePlan = await getActivePlan();
        setPlan(activePlan);

        // Load saved vendors (shortlist) if plan exists
        if (activePlan?.id) {
          try {
            const vendors = await getShortlist(activePlan.id);
            setSavedVendors(vendors || []);
          } catch {
            setSavedVendors([]);
          }
        }
      } catch (err) {
        console.error('Không tìm thấy kế hoạch cưới hoạt động:', err);
        setPlan(null);
      } finally {
        setIsLoadingPlan(false);
      }
    }

    loadActivePlan();
  }, [isAuthenticated]);

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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-text">Đang tải dữ liệu phiên làm việc...</span>
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
              <span className="text-sm text-muted-text font-display">Đang tải kế hoạch đám cưới...</span>
            </div>
          ) : (
            <>
              <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 py-8">
                {/* ── Greeting Section ───────────────────────── */}
                <div className="mb-8 animate-fade-in">
                  <h1
                    className="text-xl sm:text-2xl text-primary mb-1 font-normal"
                    style={{ fontFamily: '"IM Fell French Canon", serif' }}
                  >
                    {getGreeting()}, {displayName}!
                  </h1>
                  <p
                    className="text-sm sm:text-base text-primary font-normal"
                    style={{ fontFamily: '"IM Fell French Canon", serif' }}
                  >
                    {plan
                      ? 'Here is your wedding checklist overview for today.'
                      : 'Chào mừng bạn đến với Planora. Hãy bắt đầu lập kế hoạch đám cưới!'}
                  </p>
                </div>

                {/* Notification Banner */}
                {notificationMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
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
                    <div className="bg-white border border-hairline rounded-xl p-8 shadow-sm vintage-card text-center space-y-5">
                      <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20">
                        <Heart className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <h2 className="text-xl font-display font-medium text-ink">
                        Thiết kế đám cưới của bạn cùng Planora
                      </h2>
                      <p className="text-sm text-muted-text max-w-md mx-auto leading-relaxed">
                        Bắt đầu hành trình chuẩn bị cho ngày trọng đại. AI của Planora sẽ phân bổ ngân sách,
                        lập danh sách công việc và dòng thời gian chỉ trong vài phút.
                      </p>
                      <Link
                        href="/onboarding"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-cream rounded-lg text-sm font-semibold hover:bg-primary-active transition-all shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Bắt đầu lập kế hoạch cưới
                      </Link>
                    </div>

                    {/* Feature Showcase - Empty State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { icon: <DollarSign className="w-5 h-5" />, title: 'Phân bổ ngân sách', desc: 'Tự động phân chia chi phí chi tiết' },
                        { icon: <ListTodo className="w-5 h-5" />, title: 'Checklist nhiệm vụ', desc: 'Danh sách công việc chuẩn bị cưới' },
                        { icon: <Calendar className="w-5 h-5" />, title: 'Dòng thời gian', desc: 'Mốc lịch trình trước ngày cưới' },
                        { icon: <Sparkles className="w-5 h-5" />, title: 'Gợi ý Concept', desc: 'Ý tưởng thiết kế phù hợp phong cách' },
                      ].map((feat) => (
                        <div key={feat.title} className="bg-white border border-hairline rounded-lg p-5 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">{feat.icon}</div>
                          <div>
                            <h4 className="text-xs font-bold text-ink">{feat.title}</h4>
                            <p className="text-[11px] text-muted-text mt-0.5">{feat.desc}</p>
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
                          className="text-xl sm:text-2xl font-medium text-ink uppercase tracking-wider flex items-center gap-2"
                          style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                        >
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                          WEDDING SUMMARY CARD
                        </h2>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/onboarding"
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-3.5 py-1.5 rounded-md transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            CHỈNH SỬA
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 px-3.5 py-1.5 rounded-md transition-all shadow-xs cursor-pointer"
                            title="Xóa kế hoạch cưới hiện tại"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            XÓA KẾ HOẠCH
                          </button>
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="flex flex-wrap gap-x-8 gap-y-2.5 text-sm text-body-text mb-5 pb-4 border-b border-hairline">
                        <div>
                          <span className="text-muted-text">Style: </span>
                          <span className="font-semibold text-ink">
                            {plan.conceptSuggestions?.[0]?.conceptName || 'Modern Rustic'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-text">Budget: </span>
                          <span className="font-semibold text-ink font-mono">
                            {plan.budget.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-text">Guests: </span>
                          <span className="font-semibold text-ink">{plan.guestCount}</span>
                        </div>
                      </div>

                      {/* Countdown Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-semibold text-ink flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-text" />
                            Countdown
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {timeLeft.days} Days Remaining
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
                          className="text-xl sm:text-2xl font-medium text-ink uppercase tracking-wider mb-5 flex items-center gap-2"
                          style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                        >
                          <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                          PROGRESS TRACKER
                        </h3>

                        <div className="space-y-4">
                          {/* Checklist Tasks */}
                          <div>
                            <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                              <span className="font-semibold text-ink">Checklist Tasks ({checklistPercent}% Completed)</span>
                            </div>
                            <div className="w-full h-3 bg-lace rounded-full overflow-hidden border border-lace-dark/20">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-700"
                                style={{ width: `${checklistPercent}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-text mt-1.5 italic">
                              ✓ {completedTasks} of {totalTasks} tasks completed
                            </p>
                          </div>

                          {/* Timeline Milestones */}
                          <div>
                            <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                              <span className="font-semibold text-ink">Timeline Milestones ({timelinePercent}% On Track)</span>
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
                          className="text-xl sm:text-2xl font-medium text-ink uppercase tracking-wider mb-4 flex items-center gap-2"
                          style={{ fontFamily: '"ITC Garamond Std", "EB Garamond", serif' }}
                        >
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                          BUDGET & SPENDING
                        </h3>

                        <div className="flex items-center gap-6">
                          {/* Circular Progress */}
                          <CircularProgress
                            percent={plan.budget > 0 ? Math.round((totalSpent / plan.budget) * 100) : 0}
                            size={105}
                            stroke={7}
                            color="var(--color-primary)"
                          >
                            <div className="text-center">
                              <span className="text-sm font-bold text-ink block">Total</span>
                              <span className="text-xs font-bold text-primary font-mono">
                                {plan.budget.toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                          </CircularProgress>

                          {/* Legend */}
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-body-text">Spent</span>
                              </div>
                              <span className="font-bold text-ink font-mono">
                                {totalSpent.toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gold" />
                                <span className="text-body-text">Booked</span>
                              </div>
                              <span className="font-bold text-ink font-mono">
                                {totalAllocated.toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-hairline" />
                                <span className="text-body-text">Remaining</span>
                              </div>
                              <span className="font-bold text-ink font-mono">
                                {Math.max(0, budgetRemaining).toLocaleString('vi-VN')} ₫
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
                        INQUIRY STATUS
                      </h3>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                        {/* Open Message Center Button */}
                        <Link
                          href="#messages"
                          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-cream rounded-lg text-xs font-semibold hover:bg-primary-active transition-colors shadow-sm"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          OPEN MESSAGE CENTER
                        </Link>

                        {/* Stats */}
                        <div className="flex gap-6 text-xs">
                          <div className="flex items-center gap-2">
                            <Send className="w-3.5 h-3.5 text-muted-text" />
                            <span className="text-body-text">Sent Requests</span>
                            <span className="font-bold text-ink">{savedVendors.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span className="text-body-text">Vendor Responses</span>
                            <span className="font-bold text-primary">0 NEW</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-gold" />
                            <span className="text-body-text">No Reply Yet</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                  <div className="bg-white rounded-2xl border border-hairline p-6 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-ink">Xác nhận xóa kế hoạch cưới?</h3>
                        <p className="text-xs text-muted-text mt-0.5">Thao tác này sẽ xóa vĩnh viễn dữ liệu hiện tại.</p>
                      </div>
                    </div>

                    <p className="text-xs text-body-text leading-relaxed bg-rose-50/60 p-3.5 rounded-xl border border-rose-100">
                      Toàn bộ dữ liệu kế hoạch cưới bao gồm <strong>dự toán 10 hạng mục ngân sách, lộ trình công việc checklist, kịch bản ngày cưới và danh sách vendor đã lưu</strong> sẽ bị xóa khỏi tài khoản của bạn.
                    </p>

                    {deleteError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>{deleteError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-hairline">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-body-text hover:bg-canvas rounded-lg border border-hairline transition-all cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDeletePlan}
                        className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Đang xóa...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            Xác nhận xóa
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
