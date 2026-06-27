'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan } from '@/services/weddingPlan';
import type { ActivePlanResponse } from '@/types/weddingPlan';
import { formatDate } from '@/utils/date';
import { 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Loader2, 
  Plus, 
  Heart, 
  ListTodo, 
  Compass, 
  Building,
  AlertCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import Link from 'next/link';

export default function Home() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<ActivePlanResponse | null>(null);
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
    const timer = setInterval(calculateTimeLeft, 60000); // 1 minute update

    return () => clearInterval(timer);
  }, [plan?.weddingDate]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-slate-400">Đang tải dữ liệu phiên làm việc...</span>
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
  const budgetPercent = plan?.budget && plan.budget > 0 ? Math.round((totalSpent / plan.budget) * 100) : 0;

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col relative w-full overflow-hidden">
      <DashboardHeader logout={logout} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 py-12 flex flex-col justify-start">
        {isLoadingPlan ? (
          /* Loading Plan Indicator */
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-text font-display">Đang tải kế hoạch đám cưới của bạn...</span>
          </div>
        ) : !plan ? (
          /* Welcome/Empty State Screen (Screens 6-9 entry point) */
          <div className="max-w-2xl mx-auto py-12 space-y-10 text-center flex-1 flex flex-col justify-center">
            
            {/* Header info */}
            <div className="space-y-4">
              <div className="inline-flex p-3.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2 shadow-sm animate-pulse">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-4xl font-medium tracking-tight text-ink font-display">
                Thiết kế đám cưới của bạn cùng Planora
              </h1>
              <p className="text-sm text-muted-text leading-relaxed max-w-lg mx-auto">
                Bắt đầu hành trình chuẩn bị cho ngày trọng đại bằng công cụ tạo kế hoạch tự động của chúng tôi. AI của Planora sẽ tự động phân bổ ngân sách, lập danh sách công việc và thiết lập dòng thời gian chỉ trong vài phút.
              </p>
            </div>

            {/* Core Features Showcase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
              <div className="p-5 bg-white border border-hairline rounded-sm flex items-start gap-4">
                <div className="p-2 rounded-sm bg-primary/10 text-primary">
                  <DollarSign className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Phân bổ ngân sách</h3>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed">Tự động phân chia chi phí chi tiết theo mức độ ưu tiên của bạn.</p>
                </div>
              </div>

              <div className="p-5 bg-white border border-hairline rounded-sm flex items-start gap-4">
                <div className="p-2 rounded-sm bg-primary/10 text-primary">
                  <ListTodo className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Checklist nhiệm vụ</h3>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed">Tạo sẵn danh sách các việc cần thực hiện theo chu kỳ chuẩn bị cưới.</p>
                </div>
              </div>

              <div className="p-5 bg-white border border-hairline rounded-sm flex items-start gap-4">
                <div className="p-2 rounded-sm bg-primary/10 text-primary">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Dòng thời gian cưới</h3>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed">Quản lý dòng thời gian chi tiết các mốc quan trọng trước ngày cưới.</p>
                </div>
              </div>

              <div className="p-5 bg-white border border-hairline rounded-sm flex items-start gap-4">
                <div className="p-2 rounded-sm bg-primary/10 text-primary">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Gợi ý Concept</h3>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed">Đề xuất các ý tưởng thiết kế độc quyền phù hợp với phong cách cưới.</p>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div>
              <Link 
                href="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-sm text-sm font-semibold hover:bg-primary-active transition-all shadow-sm tracking-wide uppercase font-display"
              >
                <Plus className="w-4.5 h-4.5 text-cream" />
                Bắt đầu lập kế hoạch cưới
              </Link>
            </div>

          </div>
        ) : (
          /* Active Wedding Plan Dashboard (Screens 11, 12, 13) */
          <div className="space-y-8 animate-fade-in">
            
            {/* Dashboard Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-hairline pb-6 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-sm">
                    {plan.status === 'PLANNING' ? 'Đang Lập Kế Hoạch' : plan.status}
                  </span>
                </div>
                <h1 className="text-3xl font-medium tracking-tight text-ink font-display">
                  {plan.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-text">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {plan.location}
                  </span>
                  <span className="text-border-strong">•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {plan.guestCount} khách mời
                  </span>
                  <span className="text-border-strong">•</span>
                  <span className="flex items-center gap-1 font-mono font-semibold text-primary">
                    Ngân sách: {plan.budget.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Dynamic Re-Onboard/Update trigger */}
              <div>
                <Link 
                  href="/onboarding"
                  className="text-xs font-semibold text-primary hover:text-primary-active border border-hairline bg-white hover:bg-canvas px-4 py-2 rounded-sm transition-colors shadow-sm inline-flex items-center gap-1"
                >
                  Tạo kế hoạch mới
                </Link>
              </div>
            </div>

            {/* Top Grid: Countdown & Progress indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Widget 1: Countdown Clock */}
              <div className="p-6 bg-white border border-hairline rounded-lg flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-text" />
                    Đếm ngược ngày cưới
                  </span>
                  <span className="text-xs font-semibold text-muted-text">
                    {formatDate(plan.weddingDate)}
                  </span>
                </div>

                <div className="py-6 flex justify-around items-center text-center">
                  <div>
                    <span className="block text-3xl font-bold font-display text-ink">{timeLeft.days}</span>
                    <span className="text-[10px] font-medium text-muted-text uppercase tracking-wider">Ngày</span>
                  </div>
                  <span className="text-border-strong text-xl">:</span>
                  <div>
                    <span className="block text-3xl font-bold font-display text-ink">{timeLeft.hours}</span>
                    <span className="text-[10px] font-medium text-muted-text uppercase tracking-wider">Giờ</span>
                  </div>
                  <span className="text-border-strong text-xl">:</span>
                  <div>
                    <span className="block text-3xl font-bold font-display text-ink">{timeLeft.minutes}</span>
                    <span className="text-[10px] font-medium text-muted-text uppercase tracking-wider">Phút</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-text text-center italic mt-1 border-t border-hairline pt-3">
                  Chúc bạn có một ngày trọng đại thật trọn vẹn!
                </p>
              </div>

              {/* Widget 2: Checklist Progress */}
              <div className="p-6 bg-white border border-hairline rounded-lg flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                    <ListTodo className="w-3.5 h-3.5 text-muted-text" />
                    Tiến độ chuẩn bị
                  </span>
                  <span className="text-xs font-semibold text-primary font-mono">{checklistPercent}%</span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="w-full h-2.5 bg-canvas rounded-full overflow-hidden border border-hairline">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${checklistPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-body-text font-medium text-center">
                    Đã hoàn thành <span className="text-ink font-bold">{completedTasks}</span> / <span className="text-ink font-bold">{totalTasks}</span> công việc
                  </p>
                </div>

                <div className="border-t border-hairline pt-3 text-right">
                  <Link 
                    href="/checklist"
                    className="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-0.5"
                  >
                    Quản lý công việc <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Widget 3: Budget Breakdown */}
              <div className="p-6 bg-white border border-hairline rounded-lg flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-muted-text" />
                    Ngân sách đã chi
                  </span>
                  <span className="text-xs font-semibold text-primary font-mono">{budgetPercent}%</span>
                </div>

                <div className="py-4 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-text">Thực tế đã chi:</span>
                    <span className="text-ink font-mono">{totalSpent.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-hairline">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-text">
                    <span>Tổng quỹ cưới:</span>
                    <span>{plan.budget.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                <div className="border-t border-hairline pt-3 text-right">
                  <Link 
                    href="/budget"
                    className="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-0.5"
                  >
                    Quản lý ngân sách <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

            {/* Bottom Grid: Budget Allocation & Concept Suggestion */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Column 1: Budget allocation summary table */}
              <div className="md:col-span-7 bg-white border border-hairline rounded-lg p-6 flex flex-col justify-between shadow-sm space-y-4">
                <div className="border-b border-hairline pb-3 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Bản phân bổ chi phí tự động
                  </h3>
                  <span className="text-[10px] text-muted-text italic">
                    Phân bổ dự kiến: {totalAllocated.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                {/* Budget items list */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {plan.budgetItems && plan.budgetItems.length > 0 ? (
                    plan.budgetItems.map((item, idx) => {
                      const itemPercent = plan.budget > 0 ? Math.round((item.estimatedCost / plan.budget) * 100) : 0;
                      return (
                        <div key={idx} className="p-3 bg-canvas rounded-sm border border-hairline flex flex-col gap-1 text-xs">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-ink">{item.categoryName}</span>
                            <span className="font-mono text-primary font-bold">
                              {item.estimatedCost.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-muted-text">
                            <span>Tỷ lệ phân bổ: {itemPercent}%</span>
                            {item.note && <span className="italic truncate max-w-xs">{item.note}</span>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-text italic text-center py-6">Không có hạng mục phân bổ ngân sách nào.</p>
                  )}
                </div>
              </div>

              {/* Column 2: Concept suggestions matching Style */}
              <div className="md:col-span-5 bg-white border border-hairline rounded-lg p-6 flex flex-col justify-between shadow-sm space-y-4">
                <div className="border-b border-hairline pb-3">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Đề xuất Concept cưới phù hợp
                  </h3>
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-start">
                  {plan.conceptSuggestions && plan.conceptSuggestions.length > 0 ? (
                    plan.conceptSuggestions.map((concept, idx) => (
                      <div key={idx} className="p-4 bg-primary/5 border border-primary/10 rounded-sm space-y-1.5">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Ý tưởng đề xuất</span>
                        <h4 className="text-sm font-semibold text-ink">{concept.conceptName}</h4>
                        <p className="text-xs text-muted-text leading-relaxed">
                          {concept.description || 'Concept thiết kế mang đậm tính cá nhân và sang trọng.'}
                        </p>
                        <div className="pt-1.5 border-t border-primary/10 flex justify-between text-[10px] font-medium text-primary">
                          <span>Ngân sách ước tính cho Decor:</span>
                          <span className="font-mono font-bold">{concept.estimatedBudget.toLocaleString('vi-VN')} ₫</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-canvas border border-hairline rounded-sm flex items-center gap-3 text-xs text-muted-text leading-relaxed h-full">
                      <AlertCircle className="w-4.5 h-4.5 text-muted-text flex-shrink-0" />
                      <span>Không có đề xuất concept nào phù hợp với phong cách được chọn. Bạn có thể thay đổi phong cách cưới bằng cách nhấn nút "Tạo kế hoạch mới".</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Modules Navigation Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider block border-b border-hairline pb-2">
                Các phân hệ quản lý
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <Link 
                  href="/checklist" 
                  className="p-4 bg-white border border-hairline rounded-sm flex flex-col justify-between hover:bg-canvas transition-colors shadow-sm relative group"
                >
                  <div className="p-2 rounded-sm bg-primary/10 text-primary w-fit mb-3">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Checklist nhiệm vụ</h4>
                    <p className="text-[10px] text-muted-text mt-0.5">Quản lý các đầu việc chuẩn bị cưới.</p>
                  </div>
                  <span className="absolute top-4 right-4 text-muted-text group-hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>

                <Link 
                  href="/timeline" 
                  className="p-4 bg-white border border-hairline rounded-sm flex flex-col justify-between hover:bg-canvas transition-colors shadow-sm relative group"
                >
                  <div className="p-2 rounded-sm bg-primary/10 text-primary w-fit mb-3">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Dòng thời gian (Timeline)</h4>
                    <p className="text-[10px] text-muted-text mt-0.5">Mốc lịch trình diễn ra đám cưới.</p>
                  </div>
                  <span className="absolute top-4 right-4 text-muted-text group-hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>

                <Link 
                  href="/budget" 
                  className="p-4 bg-white border border-hairline rounded-sm flex flex-col justify-between hover:bg-canvas transition-colors shadow-sm relative group"
                >
                  <div className="p-2 rounded-sm bg-primary/10 text-primary w-fit mb-3">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Ngân sách chi tiết</h4>
                    <p className="text-[10px] text-muted-text mt-0.5">Theo dõi và chỉnh sửa khoản chi thực tế.</p>
                  </div>
                  <span className="absolute top-4 right-4 text-muted-text group-hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>

                <Link 
                  href="/marketplace" 
                  className="p-4 bg-white border border-hairline rounded-sm flex flex-col justify-between hover:bg-canvas transition-colors shadow-sm relative group"
                >
                  <div className="p-2 rounded-sm bg-primary/10 text-primary w-fit mb-3">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Chợ Dịch vụ (Marketplace)</h4>
                    <p className="text-[10px] text-muted-text mt-0.5">Tìm kiếm, so sánh &amp; liên hệ nhà cung cấp.</p>
                  </div>
                  <span className="absolute top-4 right-4 text-muted-text group-hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>

              </div>
            </div>

          </div>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
}
