'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan } from '@/services/weddingPlan';
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
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col w-full overflow-hidden">
      {/* Top Info Bar */}
      <DashboardHeader logout={logout} plan={plan} daysLeft={timeLeft.days} />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <DashboardSidebar hasPlan={!!plan} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto dashboard-scroll">
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
                  <h1 className="text-2xl sm:text-3xl font-script text-primary mb-1" style={{ fontFamily: 'Great Vibes, cursive' }}>
                    {getGreeting()}, {displayName}!
                  </h1>
                  <p className="text-xs text-muted-text">
                    {plan
                      ? 'Here is your wedding checklist overview for today.'
                      : 'Chào mừng bạn đến với Planora. Hãy bắt đầu lập kế hoạch đám cưới!'}
                  </p>
                </div>

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
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          WEDDING SUMMARY CARD
                        </h2>
                        <Link
                          href="/onboarding"
                          className="flex items-center gap-1 text-[11px] font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          EDIT
                        </Link>
                      </div>

                      {/* Info Row */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-body-text mb-5 pb-4 border-b border-hairline">
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
                          <span className="text-[11px] font-semibold text-ink flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-text" />
                            Countdown
                          </span>
                          <span className="text-xs font-bold text-primary">
                            {timeLeft.days} Days Remaining
                          </span>
                        </div>
                        <div className="w-full h-3 bg-lace rounded-full overflow-hidden border border-lace-dark/30">
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
                        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-5 flex items-center gap-2">
                          <ListTodo className="w-4 h-4 text-primary" />
                          PROGRESS TRACKER
                        </h3>

                        <div className="space-y-4">
                          {/* Checklist Tasks */}
                          <div>
                            <div className="flex justify-between text-[11px] mb-1.5">
                              <span className="font-semibold text-ink">Checklist Tasks ({checklistPercent}% Completed)</span>
                            </div>
                            <div className="w-full h-2.5 bg-lace rounded-full overflow-hidden border border-lace-dark/20">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-700"
                                style={{ width: `${checklistPercent}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-text mt-1 italic">
                              ✓ {completedTasks} of {totalTasks} tasks completed
                            </p>
                          </div>

                          {/* Timeline Milestones */}
                          <div>
                            <div className="flex justify-between text-[11px] mb-1.5">
                              <span className="font-semibold text-ink">Timeline Milestones ({timelinePercent}% On Track)</span>
                            </div>
                            <div className="w-full h-2.5 bg-lace rounded-full overflow-hidden border border-lace-dark/20">
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
                        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          BUDGET & SPENDING
                        </h3>

                        <div className="flex items-center gap-6">
                          {/* Circular Progress */}
                          <CircularProgress
                            percent={plan.budget > 0 ? Math.round((totalSpent / plan.budget) * 100) : 0}
                            size={100}
                            stroke={7}
                            color="var(--color-primary)"
                          >
                            <div className="text-center">
                              <span className="text-xs font-bold text-ink block">Total</span>
                              <span className="text-[10px] font-bold text-primary font-mono">
                                {plan.budget.toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                          </CircularProgress>

                          {/* Legend */}
                          <div className="space-y-2.5 flex-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <span className="text-body-text">Spent</span>
                              </div>
                              <span className="font-bold text-ink font-mono">
                                {totalSpent.toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                                <span className="text-body-text">Booked</span>
                              </div>
                              <span className="font-bold text-ink font-mono">
                                {totalAllocated.toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-hairline" />
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
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          SAVED VENDORS
                        </h3>
                        <span className="text-[10px] text-muted-text">{savedVendors.length} vendor(s) saved</span>
                      </div>

                      {savedVendors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {savedVendors.slice(0, 3).map((vendor) => (
                            <div key={vendor.id} className="bg-lace/50 border border-lace-dark/30 rounded-xl p-5 text-center vendor-card-hover shadow-sm">
                              {/* Vendor Avatar */}
                              <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-3">
                                <span className="text-lg font-bold text-primary font-display">
                                  {vendor.businessName.charAt(0)}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-primary italic font-serif">
                                {vendor.businessName}
                              </h4>
                              <div className="flex justify-center mt-1.5">
                                <StarRating rating={vendor.ratingAverage} />
                              </div>
                              <p className="text-[10px] text-muted-text mt-1">
                                {vendor.city} • {vendor.totalReviews} reviews
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-lace/30 border border-lace-dark/20 rounded-xl p-8 text-center">
                          <AlertCircle className="w-6 h-6 text-muted-text mx-auto mb-2" />
                          <p className="text-xs text-muted-text">Chưa có vendor nào được lưu.</p>
                          <Link
                            href="/marketplace"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-2 hover:underline"
                          >
                            Khám phá Marketplace <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {savedVendors.length > 0 && (
                        <div className="text-center mt-4">
                          <Link
                            href="/marketplace"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            BROWSE MORE VENDORS
                          </Link>
                        </div>
                      )}
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

              {/* Footer */}
              <DashboardFooter />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
