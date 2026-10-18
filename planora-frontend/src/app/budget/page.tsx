'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivePlan } from '@/services/weddingPlan';
import { getBudget, updateBudgetItem } from '@/services/budget';
import type { BudgetResponse, BudgetItemResponse } from '@/types/budget';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Coins,
  FileText,
  Plus,
  Trash2,
  Home,
  Camera,
  Heart,
  Utensils,
  Music,
  Layers,
  Sparkles,
  Receipt
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { numberToVietnameseWords } from '@/utils/numberToWords';
import type { ActivePlanResponse } from '@/types/weddingPlan';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlan } from '@/contexts/PlanContext';

export default function Budget() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, t, formatCurrency } = useLanguage();
  const { plan, daysLeft, isLoadingPlan } = usePlan();
  const router = useRouter();

  // Data Loading States
  const [budgetData, setBudgetData] = useState<BudgetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form States (for Edit Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItemResponse | null>(null);
  const [estimatedCostInput, setEstimatedCostInput] = useState('');
  const [actualCostInput, setActualCostInput] = useState('');
  const [itemNote, setItemNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Budget Category Detail & Expenses States
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<BudgetItemResponse | null>(null);
  const [expensesList, setExpensesList] = useState<{ id: string; description: string; cost: number; date: string; }[]>([]);
  const [noteText, setNoteText] = useState('');
  const [allocationInput, setAllocationInput] = useState('');
  const [isSavingAllocation, setIsSavingAllocation] = useState(false);

  // Add/Edit Expense Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCost, setExpenseCost] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [expenseModalError, setExpenseModalError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Budget Data directly using cached plan
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!plan?.id) {
      if (!isLoadingPlan && !plan) {
        router.replace('/');
      }
      return;
    }

    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getBudget(plan!.id);
        if (isMounted) {
          setBudgetData(data);
        }
      } catch (err) {
        console.error('Error loading budget data:', err);
        if (isMounted) {
          setErrorMessage(t.budget.errorLoading);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, plan, isLoadingPlan, router, t.budget.errorLoading]);

  // Open Edit Modal
  const handleOpenEdit = (item: BudgetItemResponse) => {
    setEditingItem(item);
    setEstimatedCostInput(item.estimatedCost.toString());
    setActualCostInput(item.actualCost.toString());
    const parsed = parseBudgetItemNote(item.note);
    setItemNote(parsed.noteText);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Close Edit Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setEstimatedCostInput('');
    setActualCostInput('');
    setItemNote('');
    setModalError(null);
  };

  // Submit edit form
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const estCost = parseFloat(String(estimatedCostInput).replace(/,/g, ''));
    const actCost = parseFloat(String(actualCostInput).replace(/,/g, ''));

    if (isNaN(estCost) || estCost < 0) {
      setModalError('Chi phí dự kiến phải là số dương hợp lệ!');
      return;
    }
    if (isNaN(actCost) || actCost < 0) {
      setModalError('Chi phí thực tế phải là số dương hợp lệ!');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      // Preserve existing expenses when editing category from modal
      const existingParsed = parseBudgetItemNote(editingItem.note);
      let noteToSave: string | undefined;
      if (existingParsed.expenses && existingParsed.expenses.length > 0) {
        noteToSave = JSON.stringify({
          noteText: itemNote.trim(),
          expenses: existingParsed.expenses
        });
      } else {
        noteToSave = itemNote.trim() || undefined;
      }

      const updatedItem = await updateBudgetItem(editingItem.itemId, {
        estimatedCost: estCost,
        actualCost: actCost,
        note: noteToSave
      });

      // Update state data locally
      if (budgetData) {
        const updatedCategories = budgetData.categories.map(c => 
          c.itemId === editingItem.itemId ? updatedItem : c
        );

        // Recompute totals
        const totalEstimated = updatedCategories.reduce((sum, c) => sum + c.estimatedCost, 0);
        const totalActualSpent = updatedCategories.reduce((sum, c) => sum + c.actualCost, 0);

        setBudgetData({
          ...budgetData,
          totalEstimated,
          totalActualSpent,
          categories: updatedCategories
        });
      }

      setSuccessMessage('Cập nhật hạng mục chi tiêu thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseModal();
    } catch (err) {
      console.error('Lỗi khi cập nhật ngân sách:', err);
      setModalError(err instanceof Error ? err.message : 'Không thể lưu thay đổi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Expense Parsing Helpers
  interface ParsedNote {
    noteText: string;
    expenses: { id: string; description: string; cost: number; date: string; }[];
  }

  const parseBudgetItemNote = (note: string | null | undefined): ParsedNote => {
    if (!note) {
      return { noteText: '', expenses: [] };
    }
    try {
      const parsed = JSON.parse(note);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.expenses)) {
        return {
          noteText: typeof parsed.noteText === 'string' ? parsed.noteText : '',
          expenses: parsed.expenses
        };
      }
    } catch {
      // Plain text fallback
      return { noteText: note, expenses: [] };
    }
    return { noteText: '', expenses: [] };
  };

  // Handle Category Selection without cascading effect
  const handleSelectCategory = (item: BudgetItemResponse | null) => {
    setSelectedCategoryItem(item);
    if (item) {
      const parsed = parseBudgetItemNote(item.note);
      setExpensesList(parsed.expenses);
      setNoteText(parsed.noteText);
      setAllocationInput(item.estimatedCost.toString());
    } else {
      setExpensesList([]);
      setNoteText('');
      setAllocationInput('');
    }
  };

  const updateLocalBudgetData = (updatedItem: BudgetItemResponse) => {
    if (budgetData) {
      const updatedCategories = budgetData.categories.map(c => 
        c.itemId === updatedItem.itemId ? updatedItem : c
      );
      const totalEstimated = updatedCategories.reduce((sum, c) => sum + c.estimatedCost, 0);
      const totalActualSpent = updatedCategories.reduce((sum, c) => sum + c.actualCost, 0);
      setBudgetData({
        ...budgetData,
        totalEstimated,
        totalActualSpent,
        categories: updatedCategories
      });
    }
  };

  // Save Category budget allocation limits
  const handleSaveAllocation = async () => {
    if (!selectedCategoryItem) return;
    const estCost = parseFloat(String(allocationInput).replace(/,/g, ''));
    if (isNaN(estCost) || estCost < 0) {
      alert('Hạn mức ngân sách dự kiến phải là số dương hợp lệ!');
      return;
    }
    setIsSavingAllocation(true);
    try {
      const serializedNote = JSON.stringify({
        noteText,
        expenses: expensesList
      });
      const updated = await updateBudgetItem(selectedCategoryItem.itemId, {
        estimatedCost: estCost,
        actualCost: selectedCategoryItem.actualCost,
        note: serializedNote
      });
      updateLocalBudgetData(updated);
      setSelectedCategoryItem(updated);
      setSuccessMessage('Cập nhật hạn mức ngân sách thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Không thể lưu thay đổi hạn mức.');
    } finally {
      setIsSavingAllocation(false);
    }
  };

  // Open Expense Modal
  const handleOpenExpenseModal = (expense: { id: string; description: string; cost: number; date: string; } | null) => {
    if (expense) {
      setEditingExpenseId(expense.id);
      setExpenseDescription(expense.description);
      setExpenseCost(expense.cost.toString());
      setExpenseDate(expense.date);
    } else {
      setEditingExpenseId(null);
      setExpenseDescription('');
      setExpenseCost('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
    }
    setExpenseModalError(null);
    setIsExpenseModalOpen(true);
  };

  // Submit Add/Edit Expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryItem) return;

    const costVal = parseFloat(String(expenseCost).replace(/,/g, ''));
    if (isNaN(costVal) || costVal < 0) {
      setExpenseModalError('Số tiền chi tiêu phải là số dương hợp lệ!');
      return;
    }
    if (!expenseDescription.trim()) {
      setExpenseModalError('Vui lòng điền mô tả khoản chi tiêu!');
      return;
    }
    if (!expenseDate) {
      setExpenseModalError('Vui lòng chọn ngày thanh toán!');
      return;
    }

    setIsSubmittingExpense(true);
    try {
      let updatedExpenses = [...expensesList];
      if (editingExpenseId) {
        updatedExpenses = updatedExpenses.map(exp => 
          exp.id === editingExpenseId 
            ? { ...exp, description: expenseDescription.trim(), cost: costVal, date: expenseDate }
            : exp
        );
      } else {
        updatedExpenses.push({
          id: Date.now().toString(),
          description: expenseDescription.trim(),
          cost: costVal,
          date: expenseDate
        });
      }

      const newActualCost = updatedExpenses.reduce((sum, exp) => sum + exp.cost, 0);
      const serializedNote = JSON.stringify({
        noteText,
        expenses: updatedExpenses
      });

      const updated = await updateBudgetItem(selectedCategoryItem.itemId, {
        estimatedCost: parseFloat(String(allocationInput).replace(/,/g, '')) || selectedCategoryItem.estimatedCost,
        actualCost: newActualCost,
        note: serializedNote
      });

      updateLocalBudgetData(updated);
      setSelectedCategoryItem(updated);
      setExpensesList(updatedExpenses);
      setIsExpenseModalOpen(false);
      setSuccessMessage(editingExpenseId ? 'Cập nhật khoản chi thành công!' : 'Thêm khoản chi mới thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setExpenseModalError('Lỗi khi lưu khoản chi. Vui lòng thử lại!');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!selectedCategoryItem) return;
    if (!confirm('Bạn có chắc chắn muốn xóa khoản chi này?')) return;

    try {
      const updatedExpenses = expensesList.filter(exp => exp.id !== id);
      const newActualCost = updatedExpenses.reduce((sum, exp) => sum + exp.cost, 0);
      const serializedNote = JSON.stringify({
        noteText,
        expenses: updatedExpenses
      });

      const updated = await updateBudgetItem(selectedCategoryItem.itemId, {
        estimatedCost: parseFloat(String(allocationInput).replace(/,/g, '')) || selectedCategoryItem.estimatedCost,
        actualCost: newActualCost,
        note: serializedNote
      });

      updateLocalBudgetData(updated);
      setSelectedCategoryItem(updated);
      setExpensesList(updatedExpenses);
      setSuccessMessage('Xóa khoản chi tiêu thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Không thể xóa khoản chi.');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('venue') || name.includes('địa điểm') || name.includes('nhà hàng')) {
      return <Home className="w-5 h-5 text-primary" />;
    }
    if (name.includes('decor') || name.includes('trang trí')) {
      return <Sparkles className="w-5 h-5 text-primary" />;
    }
    if (name.includes('photo') || name.includes('quay phim') || name.includes('chụp ảnh')) {
      return <Camera className="w-5 h-5 text-primary" />;
    }
    if (name.includes('makeup') || name.includes('trang điểm')) {
      return <Sparkles className="w-5 h-5 text-primary" />;
    }
    if (name.includes('dress') || name.includes('váy') || name.includes('trang phục')) {
      return <Heart className="w-5 h-5 text-primary" />;
    }
    if (name.includes('food') || name.includes('ẩm thực') || name.includes('tiệc')) {
      return <Utensils className="w-5 h-5 text-primary" />;
    }
    if (name.includes('entertainment') || name.includes('âm nhạc') || name.includes('giải trí')) {
      return <Music className="w-5 h-5 text-primary" />;
    }
    return <Layers className="w-5 h-5 text-primary" />;
  };

  // Computations
  const totalBudget = budgetData?.totalBudget || 0;
  const totalEstimated = budgetData?.totalEstimated || 0;
  const totalActualSpent = budgetData?.totalActualSpent || 0;
  const remainingBalance = totalBudget - totalActualSpent;
  const spentPercent = totalBudget > 0 ? Math.round((totalActualSpent / totalBudget) * 100) : 0;
  const isOverBudget = remainingBalance < 0;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-body-text">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-text">{t.dashboard.loadingSession}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col w-full">
      {/* Top Info Bar */}
      <div className="sticky top-0 z-50">
        <DashboardHeader logout={logout} plan={plan} daysLeft={daysLeft} />
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 w-full relative">
        {/* Left Sidebar */}
        <DashboardSidebar hasPlan={!!plan} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBF5]">
          <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col justify-start">
        

        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-hairline pb-4 sm:pb-6 mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
              <Coins className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              {t.budget.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-text">
              {t.budget.subtitle}
            </p>
          </div>
        </div>

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="p-3.5 sm:p-4 mb-5 sm:mb-6 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3 text-xs sm:text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 sm:p-4 mb-5 sm:mb-6 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-start gap-3 text-xs sm:text-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-500 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-text font-display">
              {language === 'vi' ? 'Đang tải dữ liệu ngân sách...' : 'Loading budget data...'}
            </span>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {selectedCategoryItem === null ? (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Top Stat Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              
              {/* Stat Card 1: Total Budget */}
              <div className="p-4 sm:p-5 bg-white border border-hairline rounded-xl shadow-xs flex flex-col justify-between space-y-2.5">
                <span className="text-xs font-bold text-muted-text uppercase tracking-wider block flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-muted-text" />
                  {t.budget.totalBudget}
                </span>
                <div className="space-y-0.5">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink font-mono block truncate">{formatCurrency(totalBudget)}</span>
                  <span className="text-[11px] sm:text-xs text-muted-text block leading-none">
                    {language === 'vi' ? 'Cố định từ Onboarding' : 'From Onboarding'}
                  </span>
                </div>
              </div>

              {/* Stat Card 2: Allocated Estimated */}
              <div className="p-4 sm:p-5 bg-white border border-hairline rounded-xl shadow-xs flex flex-col justify-between space-y-2.5">
                <span className="text-xs font-bold text-muted-text uppercase tracking-wider block flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-muted-text" />
                  {t.budget.totalAllocated}
                </span>
                <div className="space-y-0.5">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-mono block truncate">{formatCurrency(totalEstimated)}</span>
                  <span className="text-[11px] sm:text-xs text-muted-text block leading-none">
                    {language === 'vi' ? 'Tổng dự chi các mục' : 'Estimated for categories'}
                  </span>
                </div>
              </div>

              {/* Stat Card 3: Total Spent */}
              <div className="p-4 sm:p-5 bg-white border border-hairline rounded-xl shadow-xs flex flex-col justify-between space-y-2.5">
                <span className="text-xs font-bold text-muted-text uppercase tracking-wider block flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-muted-text" />
                  {t.budget.totalSpent}
                </span>
                <div className="space-y-0.5">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink font-mono block truncate">{formatCurrency(totalActualSpent)}</span>
                  <span className="text-[11px] sm:text-xs text-muted-text block leading-none">
                    {language === 'vi' ? 'Tổng khoản đã thanh toán' : 'Total payments recorded'}
                  </span>
                </div>
              </div>

              {/* Stat Card 4: Balance Remaining */}
              <div className={`p-4 sm:p-5 border rounded-xl shadow-xs flex flex-col justify-between space-y-2.5 ${
                isOverBudget ? 'bg-red-50/50 border-red-200' : 'bg-white border-hairline'
              }`}>
                <span className="text-xs font-bold uppercase tracking-wider block flex items-center gap-1.5 text-muted-text">
                  <Coins className={`w-4 h-4 ${isOverBudget ? 'text-red-500' : 'text-muted-text'}`} />
                  {t.budget.remainingBudget}
                </span>
                <div className="space-y-0.5">
                  <span className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono block truncate ${isOverBudget ? 'text-red-600' : 'text-success'}`}>
                    {formatCurrency(remainingBalance)}
                  </span>
                  <span className="text-[11px] sm:text-xs text-muted-text block leading-none">
                    {isOverBudget 
                      ? (language === 'vi' ? 'Quỹ cưới đã bị vượt!' : 'Over budget!') 
                      : (language === 'vi' ? 'Trong phạm vi cho phép' : 'Within budget')}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Spend Progress Indicator */}
            <div className="p-6 bg-white border border-hairline rounded-lg shadow-sm space-y-3.5">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-ink">
                  {language === 'vi' ? 'Biểu đồ tiến độ chi tiêu quỹ cưới' : 'Budget Spending Progress'}
                </span>
                <span className={`font-mono text-sm ${isOverBudget ? 'text-red-600 font-bold' : 'text-primary'}`}>
                  {spentPercent}% {language === 'vi' ? 'đã chi' : 'spent'}
                </span>
              </div>
              <div className="w-full h-3 bg-canvas border border-hairline rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-600' : 'bg-primary'}`} 
                  style={{ width: `${Math.min(spentPercent, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 border border-red-100 p-3 rounded-sm">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>
                    {language === 'vi'
                      ? `Chú ý: Chi phí thực tế đã vượt quỹ cưới ban đầu ${formatCurrency(Math.abs(remainingBalance))}. Hãy xem xét giảm bớt chi phí ở các mục chưa thanh toán.`
                      : `Warning: Actual expenses have exceeded your initial budget by ${formatCurrency(Math.abs(remainingBalance))}. Consider reducing costs in pending categories.`}
                  </span>
                </div>
              )}
            </div>

            {/* Budget Items Table/Card List */}
            <div className="bg-white border border-hairline rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 border-b border-hairline bg-canvas/30 flex justify-between items-center">
                <h3 className="text-sm sm:text-base font-bold text-ink uppercase tracking-wider">
                  {t.budget.categoryAllocationTitle}
                </h3>
                <span className="text-xs text-muted-text">
                  {language === 'vi' 
                    ? 'Nhấp vào từng hạng mục để xem chi tiết chi phí và điều chỉnh' 
                    : 'Click any category to inspect expenses and adjust'}
                </span>
              </div>

              <div className="divide-y divide-hairline">
                {budgetData?.categories && budgetData.categories.length > 0 ? (
                  budgetData.categories.map((item) => {
                    const diff = item.estimatedCost - item.actualCost;
                    const isDiffNegative = diff < 0;

                    return (
                      <div 
                        key={item.itemId} 
                        onClick={() => handleSelectCategory(item)}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas/10 cursor-pointer transition-colors"
                      >
                        
                        {/* Name and notes */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-ink">
                            {item.categoryName}
                          </h4>
                          {(() => {
                            const parsed = parseBudgetItemNote(item.note);
                            const hasNote = Boolean(parsed.noteText?.trim());
                            const hasExpenses = parsed.expenses && parsed.expenses.length > 0;

                            if (!hasNote && !hasExpenses) {
                              return (
                                <p className="text-xs sm:text-sm text-light-grey italic">
                                  {language === 'vi' ? 'Chưa có ghi chú nào.' : 'No notes added yet.'}
                                </p>
                              );
                            }

                            return (
                              <div className="space-y-1">
                                {hasNote && (
                                  <p className="text-xs sm:text-sm text-muted-text flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-muted-text flex-shrink-0" />
                                    <span className="break-words line-clamp-1">{parsed.noteText}</span>
                                  </p>
                                )}
                                {hasExpenses && (
                                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                                      <Receipt className="w-3 h-3" />
                                      {parsed.expenses.length} {language === 'vi' ? 'khoản chi' : 'expenses'}
                                    </span>
                                    <span className="text-xs text-muted-text hidden sm:inline">
                                      • {language === 'vi' ? 'Gần nhất: ' : 'Latest: '}
                                      <span className="font-medium text-ink">
                                        {parsed.expenses[parsed.expenses.length - 1].description}
                                      </span>{' '}
                                      ({formatCurrency(parsed.expenses[parsed.expenses.length - 1].cost)})
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Cost allocations */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:text-right">
                          
                          {/* Estimated */}
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                              {t.budget.allocated}
                            </span>
                            <span className="text-sm sm:text-base font-semibold font-mono text-ink">
                              {formatCurrency(item.estimatedCost)}
                            </span>
                          </div>

                          {/* Actual Spent */}
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                              {t.budget.spent}
                            </span>
                            <span className="text-sm sm:text-base font-semibold font-mono text-ink">
                              {formatCurrency(item.actualCost)}
                            </span>
                          </div>

                          {/* Gap/Diff */}
                          <div className="space-y-0.5 min-w-[110px] sm:text-right">
                            <span className="text-xs font-bold text-muted-text uppercase tracking-wider block">
                              {t.budget.remaining}
                            </span>
                            <span className={`text-sm sm:text-base font-semibold font-mono ${
                              isDiffNegative ? 'text-red-600' : diff > 0 ? 'text-success' : 'text-muted-text'
                            }`}>
                              {isDiffNegative 
                                ? `${language === 'vi' ? 'Vượt: ' : 'Over: '}${formatCurrency(Math.abs(diff))}` 
                                : diff > 0 
                                ? `${language === 'vi' ? 'Dư: ' : 'Saved: '}${formatCurrency(diff)}` 
                                : (language === 'vi' ? 'Cân bằng' : 'Balanced')
                              }
                            </span>
                          </div>

                          {/* Edit Action Button */}
                          <div className="flex-shrink-0 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(item);
                              }}
                              className="p-2 text-muted-text hover:text-primary hover:bg-canvas rounded-sm transition-all"
                              title={t.common.edit}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-muted-text flex flex-col items-center gap-2">
                    <Coins className="w-10 h-10 text-hairline" />
                    <span className="text-sm font-semibold">
                      {language === 'vi' ? 'Chưa có hạng mục phân bổ chi phí nào trong kế hoạch.' : 'No budget categories created yet.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            </div>
            ) : (
              /* Selected Category Detail Page View */
              <div className="space-y-8 animate-fade-in">
                {/* Detail View Header */}
                <div className="flex justify-between items-center border-b border-hairline pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      {getCategoryIcon(selectedCategoryItem.categoryName)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-ink font-display">
                        {selectedCategoryItem.categoryName}
                      </h2>
                      <span className="text-xs text-muted-text uppercase tracking-wider block">
                        {language === 'vi' ? 'Chi tiết hạng mục ngân sách' : 'Category Budget Details'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectCategory(null)}
                    className="px-4 py-2 border border-primary/30 text-primary hover:bg-primary/5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t.common.back}
                  </button>
                </div>

                {/* Allocation / Target Limit Card */}
                <div className="bg-white border border-hairline rounded-lg p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider block">
                        {language === 'vi' ? 'Hạn mức ngân sách' : 'Category Allocation Limit'}
                      </h3>
                      <p className="text-sm text-muted-text">
                        {language === 'vi' 
                          ? 'Điều chỉnh số tiền dự kiến chi cho hạng mục này.' 
                          : 'Adjust the estimated allocation for this category.'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <CurrencyInput
                          value={allocationInput}
                          onChange={(raw) => setAllocationInput(raw)}
                          showInWords={false}
                          className="w-full sm:w-48"
                          inputClassName="py-2 text-sm rounded-sm"
                        />
                        <button
                          onClick={handleSaveAllocation}
                          disabled={isSavingAllocation}
                          className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-semibold hover:bg-primary-active transition-all disabled:opacity-50 cursor-pointer shrink-0 min-h-[38px]"
                        >
                          {isSavingAllocation ? t.common.saving : t.common.save}
                        </button>
                      </div>
                      {parseFloat(String(allocationInput).replace(/,/g, '')) > 0 && (
                        <div className="text-[11px] text-primary bg-primary/5 px-2.5 py-1 rounded-sm border border-primary/15 self-start sm:self-end">
                          <span className="font-bold text-ink mr-1">Bằng chữ:</span>
                          <span className="font-semibold">{numberToVietnameseWords(parseFloat(String(allocationInput).replace(/,/g, '')))}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Allocation Chart/Bar */}
                  <div className="space-y-2.5 pt-4 border-t border-hairline">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-muted-text">
                        {language === 'vi' ? 'Đã thực chi: ' : 'Actually spent: '}
                        <strong className="text-ink">{formatCurrency(selectedCategoryItem.actualCost)}</strong> {language === 'vi' ? 'trên hạn mức ' : 'of limit '}
                        <strong className="text-ink">{formatCurrency(parseFloat(String(allocationInput).replace(/,/g, '')) || 0)}</strong>
                      </span>
                      <span className={`font-mono text-sm ${selectedCategoryItem.actualCost > (parseFloat(String(allocationInput).replace(/,/g, '')) || 0) ? 'text-red-600 font-bold' : 'text-primary'}`}>
                        {(parseFloat(String(allocationInput).replace(/,/g, '')) || 0) > 0 ? Math.round((selectedCategoryItem.actualCost / (parseFloat(String(allocationInput).replace(/,/g, '')) || 1)) * 100) : 0}% {language === 'vi' ? 'đã dùng' : 'used'}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-canvas border border-hairline rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${selectedCategoryItem.actualCost > (parseFloat(String(allocationInput).replace(/,/g, '')) || 0) ? 'bg-red-600' : 'bg-primary'}`}
                        style={{ width: `${Math.min((parseFloat(String(allocationInput).replace(/,/g, '')) || 0) > 0 ? (selectedCategoryItem.actualCost / (parseFloat(String(allocationInput).replace(/,/g, '')) || 1)) * 100 : 0, 100)}%` }}
                      />
                    </div>
                    {selectedCategoryItem.actualCost > (parseFloat(String(allocationInput).replace(/,/g, '')) || 0) && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 border border-red-100 p-3 rounded-sm">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>
                          {language === 'vi'
                            ? `Cảnh báo: Khoản chi thực tế đã vượt hạn mức dự kiến ${formatCurrency(selectedCategoryItem.actualCost - (parseFloat(String(allocationInput).replace(/,/g, '')) || 0))}! Bạn hãy cân đối lại các hóa đơn.`
                            : `Warning: Actual expenses have exceeded estimated limit by ${formatCurrency(selectedCategoryItem.actualCost - (parseFloat(String(allocationInput).replace(/,/g, '')) || 0))}!`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expenses List & Actions */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm sm:text-base font-bold text-ink uppercase tracking-wider pl-1">
                      {t.budget.expensesTitle}
                    </h3>
                    <button
                      onClick={() => handleOpenExpenseModal(null)}
                      className="px-4 py-2 bg-primary hover:bg-primary-active text-white rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm uppercase tracking-wider font-display cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-cream" />
                      {t.budget.addExpenseBtn}
                    </button>
                  </div>

                  <div className="bg-white border border-hairline rounded-lg shadow-sm overflow-hidden">
                    {expensesList.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-canvas/50 text-xs font-bold text-muted-text uppercase tracking-wider border-b border-hairline">
                              <th className="p-4">{t.budget.expenseDate}</th>
                              <th className="p-4">{t.budget.expenseDesc}</th>
                              <th className="p-4 text-right">{t.budget.expenseCost}</th>
                              <th className="p-4 text-center">{t.common.actions}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-hairline">
                            {expensesList.map((exp) => (
                              <tr key={exp.id} className="hover:bg-canvas/5 transition-colors">
                                <td className="p-4 text-sm text-muted-text font-mono">
                                  {language === 'vi' 
                                    ? new Date(exp.date).toLocaleDateString('vi-VN')
                                    : new Date(exp.date).toLocaleDateString('en-US')}
                                </td>
                                <td className="p-4 text-sm sm:text-base font-semibold text-ink">
                                  {exp.description}
                                </td>
                                <td className="p-4 text-sm sm:text-base font-mono font-bold text-ink text-right">
                                  {formatCurrency(exp.cost)}
                                </td>
                                <td className="p-4 text-sm text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleOpenExpenseModal(exp)}
                                      className="p-1.5 text-muted-text hover:text-primary hover:bg-canvas rounded-sm transition-all cursor-pointer"
                                      title={t.common.edit}
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExpense(exp.id)}
                                      className="p-1.5 text-muted-text hover:text-red-600 hover:bg-red-50 rounded-sm transition-all cursor-pointer"
                                      title={t.common.delete}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-muted-text flex flex-col items-center gap-2">
                        <Coins className="w-10 h-10 text-hairline" />
                        <span className="text-sm font-semibold">{t.budget.noExpenses}</span>
                        <span className="text-xs text-light-grey">
                          {language === 'vi' 
                            ? 'Nhấp vào "Thêm khoản chi" để bắt đầu ghi nhận các hóa đơn thực tế.' 
                            : 'Click "Add Expense" to start recording payments.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

          </main>
        </div>
      </div>

      {/* Edit Budget Item Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white border border-hairline rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-slide-up sm:animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-base sm:text-lg font-bold text-ink font-display">
                {language === 'vi' ? 'Điều chỉnh chi phí: ' : 'Edit Allocation: '}
                {editingItem.categoryName}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-muted-text hover:text-ink text-base font-semibold w-8 h-8 flex items-center justify-center hover:bg-canvas rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Error alert */}
            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              
              {/* Estimated Cost */}
              <div className="space-y-1.5">
                <label htmlFor="modal-estimated" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.budget.estimatedCost}
                </label>
                <CurrencyInput
                  id="modal-estimated"
                  required
                  value={estimatedCostInput}
                  onChange={(raw) => setEstimatedCostInput(raw)}
                  placeholder="0"
                  showInWords={true}
                />
              </div>

              {/* Actual Cost */}
              <div className="space-y-1.5">
                <label htmlFor="modal-actual" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.budget.actualCost}
                </label>
                <CurrencyInput
                  id="modal-actual"
                  required
                  value={actualCostInput}
                  onChange={(raw) => setActualCostInput(raw)}
                  placeholder="0"
                  showInWords={true}
                />
              </div>

              {/* Item Note */}
              <div className="space-y-1.5">
                <label htmlFor="modal-note" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.budget.notesLabel}
                </label>
                <textarea
                  id="modal-note"
                  rows={3}
                  placeholder={t.budget.notesPlaceholder}
                  className="w-full bg-canvas border border-hairline rounded-lg px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-primary text-ink resize-none text-body-text leading-relaxed"
                  value={itemNote}
                  onChange={e => setItemNote(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border border-border-strong rounded-lg text-xs font-semibold text-body-text hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-active transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t.common.save
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white border border-hairline rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-slide-up sm:animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-base sm:text-lg font-bold text-ink font-display">
                {editingExpenseId ? t.budget.editExpenseModalTitle : t.budget.addExpenseModalTitle}
              </h3>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-muted-text hover:text-ink text-base font-semibold w-8 h-8 flex items-center justify-center hover:bg-canvas rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Expense Modal Error alert */}
            {expenseModalError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{expenseModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-4">
              
              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="expense-desc" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.budget.expenseDesc} *
                </label>
                <input
                  type="text"
                  id="expense-desc"
                  required
                  placeholder={language === 'vi' ? 'Ví dụ: Đặt cọc địa điểm tiệc cưới đợt 1...' : 'e.g., Venue deposit installment 1...'}
                  className="w-full bg-canvas border border-hairline rounded-lg px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-primary text-ink font-medium"
                  value={expenseDescription}
                  onChange={e => setExpenseDescription(e.target.value)}
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label htmlFor="expense-amount" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.budget.expenseCost} *
                </label>
                <CurrencyInput
                  id="expense-amount"
                  required
                  value={expenseCost}
                  onChange={(raw) => setExpenseCost(raw)}
                  placeholder="0"
                  showInWords={true}
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label htmlFor="expense-date" className="text-xs font-bold text-ink uppercase tracking-wider block">
                  {t.budget.expenseDate} *
                </label>
                <input
                  type="date"
                  id="expense-date"
                  required
                  className="w-full bg-canvas border border-hairline rounded-lg px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-primary text-ink font-mono font-semibold cursor-pointer"
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  disabled={isSubmittingExpense}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border border-border-strong rounded-lg text-xs font-semibold text-body-text hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-active transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {isSubmittingExpense ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t.common.save
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}
