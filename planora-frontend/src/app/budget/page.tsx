'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
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
import dynamic from 'next/dynamic';

const EditBudgetItemModal = dynamic(() => import('@/components/budget/EditBudgetItemModal'), {
  ssr: false,
});
const ExpenseModal = dynamic(() => import('@/components/budget/ExpenseModal'), {
  ssr: false,
});
import { numberToVietnameseWords } from '@/utils/numberToWords';
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

  // Save Category Allocation
  const handleSaveAllocation = async () => {
    if (!selectedCategoryItem) return;
    const est = parseFloat(String(allocationInput).replace(/,/g, ''));
    if (isNaN(est) || est < 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    setIsSavingAllocation(true);
    try {
      const updated = await updateBudgetItem(selectedCategoryItem.itemId, {
        estimatedCost: est,
        actualCost: selectedCategoryItem.actualCost,
        note: selectedCategoryItem.note || undefined
      });

      updateLocalBudgetData(updated);
      setSelectedCategoryItem(updated);
      setSuccessMessage('Lưu hạn mức chi phí thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Không thể lưu hạn mức. Vui lòng thử lại!');
    } finally {
      setIsSavingAllocation(false);
    }
  };

  // Open Expense Modal (for create or edit)
  const handleOpenExpenseModal = (expenseToEdit?: { id: string; description: string; cost: number; date: string; } | null) => {
    if (expenseToEdit) {
      setEditingExpenseId(expenseToEdit.id);
      setExpenseDescription(expenseToEdit.description);
      setExpenseCost(expenseToEdit.cost.toString());
      setExpenseDate(expenseToEdit.date);
    } else {
      setEditingExpenseId(null);
      setExpenseDescription('');
      setExpenseCost('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
    }
    setExpenseModalError(null);
    setIsExpenseModalOpen(true);
  };

  // Save Expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryItem) return;

    const costNum = parseFloat(String(expenseCost).replace(/,/g, ''));
    if (!expenseDescription.trim()) {
      setExpenseModalError('Vui lòng nhập mô tả khoản chi!');
      return;
    }
    if (isNaN(costNum) || costNum <= 0) {
      setExpenseModalError('Số tiền chi phải lớn hơn 0!');
      return;
    }
    if (!expenseDate) {
      setExpenseModalError('Vui lòng chọn ngày chi!');
      return;
    }

    setIsSubmittingExpense(true);
    setExpenseModalError(null);

    try {
      let updatedExpenses = [...expensesList];
      if (editingExpenseId) {
        updatedExpenses = updatedExpenses.map(exp => 
          exp.id === editingExpenseId 
            ? { ...exp, description: expenseDescription.trim(), cost: costNum, date: expenseDate }
            : exp
        );
      } else {
        const newExpense = {
          id: Date.now().toString(),
          description: expenseDescription.trim(),
          cost: costNum,
          date: expenseDate
        };
        updatedExpenses.push(newExpense);
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
      return <Home className="w-5 h-5 text-[#5D0F12]" />;
    }
    if (name.includes('decor') || name.includes('trang trí')) {
      return <Sparkles className="w-5 h-5 text-[#5D0F12]" />;
    }
    if (name.includes('photo') || name.includes('quay phim') || name.includes('chụp ảnh')) {
      return <Camera className="w-5 h-5 text-[#5D0F12]" />;
    }
    if (name.includes('makeup') || name.includes('trang điểm')) {
      return <Sparkles className="w-5 h-5 text-[#5D0F12]" />;
    }
    if (name.includes('dress') || name.includes('váy') || name.includes('trang phục')) {
      return <Heart className="w-5 h-5 text-[#5D0F12]" />;
    }
    if (name.includes('food') || name.includes('ẩm thực') || name.includes('tiệc')) {
      return <Utensils className="w-5 h-5 text-[#5D0F12]" />;
    }
    if (name.includes('entertainment') || name.includes('âm nhạc') || name.includes('giải trí')) {
      return <Music className="w-5 h-5 text-[#5D0F12]" />;
    }
    return <Layers className="w-5 h-5 text-[#5D0F12]" />;
  };

  // Memoized Computations
  const { totalBudget, totalEstimated, totalActualSpent, remainingBalance, spentPercent, isOverBudget } = useMemo(() => {
    const b = budgetData?.totalBudget || 0;
    const est = budgetData?.totalEstimated || 0;
    const actual = budgetData?.totalActualSpent || 0;
    const rem = b - actual;
    const pct = b > 0 ? Math.round((actual / b) * 100) : 0;
    return {
      totalBudget: b,
      totalEstimated: est,
      totalActualSpent: actual,
      remainingBalance: rem,
      spentPercent: pct,
      isOverBudget: rem < 0,
    };
  }, [budgetData]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center text-neutral-800">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
          <span className="text-sm text-neutral-500 font-serif italic">{t.dashboard.loadingSession}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-neutral-800 font-sans flex flex-col w-full selection:bg-[#5D0F12]/15 selection:text-[#5D0F12]">
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
        
            {/* ─── Breadcrumbs Badge & Subtitle Row (Marketplace Style) ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-6 sm:mb-8 animate-fade-in">
              <div>
                {/* Clean, Elegant Breadcrumb Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-xs">
                  <Coins className="w-4 h-4 text-[#5D0F12]" />
                  <span className="font-serif tracking-widest text-xs font-bold uppercase text-[#5D0F12]">
                    {t.budget.title || 'QUẢN LÝ NGÂN SÁCH CƯỚI'}
                  </span>
                </div>

                {/* Subtitle */}
                <h2 className="text-xs sm:text-base font-serif italic text-neutral-800 mt-1.5 pl-1">
                  {t.budget.subtitle}
                </h2>
              </div>

              {/* Quick Action Button to Marketplace */}
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 bg-white hover:bg-[#FAF8F5] text-neutral-800 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5D0F12]" />
                <span>{language === 'vi' ? 'Khám phá đối tác phù hợp' : 'Explore Matching Vendors'}</span>
              </Link>
            </div>

            {/* Alert Notifications */}
            {errorMessage && (
              <div className="p-3.5 sm:p-4 mb-5 sm:mb-6 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 sm:p-4 mb-5 sm:mb-6 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#5D0F12]" />
                <span className="text-sm text-neutral-500 font-serif italic">
                  {language === 'vi' ? 'Đang tải dữ liệu ngân sách...' : 'Loading budget data...'}
                </span>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {selectedCategoryItem === null ? (
                <div className="space-y-6 sm:space-y-8 animate-fade-in">
                
                {/* ─── Top Stat Dashboard Grid (Standard rounded-[1.75rem]) ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  
                  {/* Stat Card 1: Total Budget */}
                  <div className="p-5 sm:p-6 bg-white border border-neutral-100 rounded-[1.75rem] shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                        {t.budget.totalBudget}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12]">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 block truncate font-sans">
                        {formatCurrency(totalBudget)}
                      </span>
                      <span className="text-xs text-neutral-500 font-serif italic block">
                        {language === 'vi' ? 'Hạn mức đã định từ kế hoạch' : 'Set from onboarding plan'}
                      </span>
                    </div>
                  </div>

                  {/* Stat Card 2: Allocated Estimated */}
                  <div className="p-5 sm:p-6 bg-white border border-neutral-100 rounded-[1.75rem] shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                        {t.budget.totalAllocated}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#5D0F12] block truncate font-sans">
                        {formatCurrency(totalEstimated)}
                      </span>
                      <span className="text-xs text-neutral-500 font-serif italic block">
                        {language === 'vi' ? 'Tổng dự toán các hạng mục' : 'Estimated for categories'}
                      </span>
                    </div>
                  </div>

                  {/* Stat Card 3: Total Spent */}
                  <div className="p-5 sm:p-6 bg-white border border-neutral-100 rounded-[1.75rem] shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                        {t.budget.totalSpent}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 block truncate font-sans">
                        {formatCurrency(totalActualSpent)}
                      </span>
                      <span className="text-xs text-neutral-500 font-serif italic block">
                        {language === 'vi' ? 'Tổng khoản chi thực tế' : 'Total payments recorded'}
                      </span>
                    </div>
                  </div>

                  {/* Stat Card 4: Balance Remaining */}
                  <div className={`p-5 sm:p-6 border rounded-[1.75rem] shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                    isOverBudget ? 'bg-rose-50/50 border-rose-200/80' : 'bg-white border-neutral-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider block text-neutral-500">
                        {t.budget.remainingBudget}
                      </span>
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                        isOverBudget ? 'bg-rose-100/80 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        <Coins className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className={`text-xl sm:text-2xl lg:text-3xl font-bold block truncate font-sans ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatCurrency(remainingBalance)}
                      </span>
                      <span className="text-xs text-neutral-500 font-serif italic block">
                        {isOverBudget 
                          ? (language === 'vi' ? 'Cảnh báo: Đã vượt ngân sách!' : 'Over budget!') 
                          : (language === 'vi' ? 'Quỹ cưới trong vùng an toàn' : 'Within budget')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ─── Visual Spend Progress Indicator ─── */}
                <div className="p-6 sm:p-7 bg-white border border-neutral-100 rounded-[1.75rem] shadow-[0_10px_30px_rgba(0,0,0,0.06)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-serif font-bold uppercase tracking-wide text-[#5D0F12]">
                      {language === 'vi' ? 'Tiến độ chi tiêu quỹ cưới' : 'Budget Spending Progress'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isOverBudget 
                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : 'bg-[#5D0F12]/10 text-[#5D0F12] border border-[#5D0F12]/20'
                    }`}>
                      {spentPercent}% {language === 'vi' ? 'đã giải ngân' : 'spent'}
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-neutral-100 border border-neutral-200/60 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${isOverBudget ? 'bg-rose-600' : 'bg-[#5D0F12]'}`} 
                      style={{ width: `${Math.min(spentPercent, 100)}%` }}
                    />
                  </div>

                  {isOverBudget && (
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200/80 p-4 rounded-2xl">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        {language === 'vi'
                          ? `Chú ý: Chi phí thực tế đã vượt quỹ cưới ban đầu ${formatCurrency(Math.abs(remainingBalance))}. Hãy xem xét giảm bớt chi phí ở các mục chưa thanh toán.`
                          : `Warning: Actual expenses have exceeded your initial budget by ${formatCurrency(Math.abs(remainingBalance))}. Consider reducing costs in pending categories.`}
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── Budget Items Showcase Container ─── */}
                <div className="bg-[#FAF8F5] border border-neutral-200/60 rounded-[1.75rem] sm:rounded-[2rem] p-4 sm:p-7 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200/80">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#5D0F12] uppercase tracking-wide">
                      {t.budget.categoryAllocationTitle}
                    </h3>
                    <span className="text-xs text-neutral-500 font-serif italic">
                      {language === 'vi' 
                        ? 'Nhấp vào từng hạng mục để xem chi tiết chi phí và điều chỉnh' 
                        : 'Click any category to inspect expenses and adjust'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {budgetData?.categories && budgetData.categories.length > 0 ? (
                      budgetData.categories.map((item) => {
                        const diff = item.estimatedCost - item.actualCost;
                        const isDiffNegative = diff < 0;

                        return (
                          <div 
                            key={item.itemId} 
                            onClick={() => handleSelectCategory(item)}
                            className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 hover:border-[#5D0F12]/40 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group select-none"
                          >
                            {/* Left: Icon & Info */}
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              <div className="w-11 h-11 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12] shrink-0">
                                {getCategoryIcon(item.categoryName)}
                              </div>

                              <div className="space-y-1 min-w-0 flex-1">
                                <h4 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-[#5D0F12] transition-colors truncate">
                                  {item.categoryName}
                                </h4>

                                {(() => {
                                  const parsed = parseBudgetItemNote(item.note);
                                  const hasNote = Boolean(parsed.noteText?.trim());
                                  const hasExpenses = parsed.expenses && parsed.expenses.length > 0;

                                  if (!hasNote && !hasExpenses) {
                                    return (
                                      <p className="text-xs text-neutral-400 font-serif italic">
                                        {language === 'vi' ? 'Chưa có ghi chú nào.' : 'No notes added yet.'}
                                      </p>
                                    );
                                  }

                                  return (
                                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                      {hasExpenses && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#5D0F12]/10 text-[#5D0F12] border border-[#5D0F12]/20">
                                          <Receipt className="w-3 h-3" />
                                          {parsed.expenses.length} {language === 'vi' ? 'khoản chi' : 'expenses'}
                                        </span>
                                      )}
                                      {hasNote && (
                                        <span className="text-xs text-neutral-500 font-serif italic truncate max-w-xs">
                                          {parsed.noteText}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Right: Cost Allocations & Pill Status */}
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 sm:text-right">
                              {/* Allocated */}
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                                  {t.budget.allocated}
                                </span>
                                <span className="text-sm sm:text-base font-bold text-neutral-900 font-sans">
                                  {formatCurrency(item.estimatedCost)}
                                </span>
                              </div>

                              {/* Actual Spent */}
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                                  {t.budget.spent}
                                </span>
                                <span className="text-sm sm:text-base font-bold text-neutral-900 font-sans">
                                  {formatCurrency(item.actualCost)}
                                </span>
                              </div>

                              {/* Diff / Status Badge */}
                              <div className="min-w-[110px]">
                                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  {t.budget.remaining}
                                </span>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-sans ${
                                  isDiffNegative 
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                    : diff > 0 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                }`}>
                                  {isDiffNegative 
                                    ? `${language === 'vi' ? 'Vượt ' : 'Over '}${formatCurrency(Math.abs(diff))}` 
                                    : diff > 0 
                                    ? `${language === 'vi' ? 'Dư ' : 'Saved '}${formatCurrency(diff)}` 
                                    : (language === 'vi' ? 'Cân bằng' : 'Balanced')
                                  }
                                </span>
                              </div>

                              {/* Edit Action Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(item);
                                }}
                                className="w-9 h-9 rounded-full bg-white border border-neutral-200/90 text-neutral-600 hover:text-[#5D0F12] hover:border-[#5D0F12]/30 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                                title={t.common.edit}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-2">
                        <Coins className="w-10 h-10 text-neutral-300" />
                        <span className="text-sm font-semibold font-serif italic">
                          {language === 'vi' ? 'Chưa có hạng mục phân bổ chi phí nào trong kế hoạch.' : 'No budget categories created yet.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                </div>
                ) : (
                  /* ─── Selected Category Detail View ─── */
                  <div className="space-y-6 sm:space-y-8 animate-fade-in">
                    {/* Detail View Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-[#5D0F12]/10 border border-[#5D0F12]/20 flex items-center justify-center text-[#5D0F12]">
                          {getCategoryIcon(selectedCategoryItem.categoryName)}
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-wide text-[#5D0F12]">
                            {selectedCategoryItem.categoryName}
                          </h2>
                          <span className="text-xs text-neutral-500 font-serif italic block">
                            {language === 'vi' ? 'Chi tiết hạng mục phân bổ & sổ chi tiêu' : 'Category Budget Details & Invoices'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectCategory(null)}
                        className="px-4 py-2 border border-neutral-300 bg-white hover:bg-[#FAF8F5] text-neutral-800 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 self-start sm:self-auto"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t.common.back}
                      </button>
                    </div>

                    {/* Allocation / Target Limit Card */}
                    <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-7 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-base font-serif font-bold text-[#5D0F12] uppercase tracking-wide block">
                            {language === 'vi' ? 'Hạn mức ngân sách hạng mục' : 'Category Allocation Limit'}
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-500 font-serif italic">
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
                              inputClassName="py-2 px-3 text-sm rounded-full border-neutral-300 focus:border-[#5D0F12]"
                            />
                            <button
                              onClick={handleSaveAllocation}
                              disabled={isSavingAllocation}
                              className="px-5 py-2.5 rounded-full bg-[#5D0F12] hover:bg-[#4A0C0E] !text-[#FFFBF5] text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
                            >
                              {isSavingAllocation ? t.common.saving : t.common.save}
                            </button>
                          </div>
                          {parseFloat(String(allocationInput).replace(/,/g, '')) > 0 && (
                            <div className="text-[11px] text-[#5D0F12] bg-[#5D0F12]/5 px-3 py-1 rounded-full border border-[#5D0F12]/15 self-start sm:self-end">
                              <span className="font-bold text-neutral-900 mr-1">Bằng chữ:</span>
                              <span className="font-semibold">{numberToVietnameseWords(parseFloat(String(allocationInput).replace(/,/g, '')))}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Allocation Chart/Bar */}
                      <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                          <span className="text-neutral-600">
                            {language === 'vi' ? 'Đã thực chi: ' : 'Actually spent: '}
                            <strong className="text-neutral-900 font-bold">{formatCurrency(selectedCategoryItem.actualCost)}</strong> {language === 'vi' ? 'trên hạn mức ' : 'of limit '}
                            <strong className="text-neutral-900 font-bold">{formatCurrency(parseFloat(String(allocationInput).replace(/,/g, '')) || 0)}</strong>
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            selectedCategoryItem.actualCost > (parseFloat(String(allocationInput).replace(/,/g, '')) || 0) 
                              ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                              : 'bg-[#5D0F12]/10 text-[#5D0F12] border border-[#5D0F12]/20'
                          }`}>
                            {(parseFloat(String(allocationInput).replace(/,/g, '')) || 0) > 0 ? Math.round((selectedCategoryItem.actualCost / (parseFloat(String(allocationInput).replace(/,/g, '')) || 1)) * 100) : 0}% {language === 'vi' ? 'đã dùng' : 'used'}
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-neutral-100 border border-neutral-200/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${selectedCategoryItem.actualCost > (parseFloat(String(allocationInput).replace(/,/g, '')) || 0) ? 'bg-rose-600' : 'bg-[#5D0F12]'}`}
                            style={{ width: `${Math.min((parseFloat(String(allocationInput).replace(/,/g, '')) || 0) > 0 ? (selectedCategoryItem.actualCost / (parseFloat(String(allocationInput).replace(/,/g, '')) || 1)) * 100 : 0, 100)}%` }}
                          />
                        </div>
                        {selectedCategoryItem.actualCost > (parseFloat(String(allocationInput).replace(/,/g, '')) || 0) && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200/80 p-3.5 rounded-2xl">
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
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
                        <h3 className="text-base sm:text-lg font-serif font-bold text-[#5D0F12] uppercase tracking-wide">
                          {t.budget.expensesTitle}
                        </h3>
                        <button
                          onClick={() => handleOpenExpenseModal(null)}
                          className="px-5 py-2.5 bg-[#5D0F12] hover:bg-[#4A0C0E] !text-[#FFFBF5] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4 text-[#FFFBF5]" />
                          {t.budget.addExpenseBtn}
                        </button>
                      </div>

                      <div className="bg-white rounded-[1.75rem] border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden">
                        {expensesList.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#FAF8F5] text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-200/80">
                                  <th className="p-4 pl-6">{t.budget.expenseDate}</th>
                                  <th className="p-4">{t.budget.expenseDesc}</th>
                                  <th className="p-4 text-right">{t.budget.expenseCost}</th>
                                  <th className="p-4 pr-6 text-center">{t.common.actions}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100">
                                {expensesList.map((exp) => (
                                  <tr key={exp.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                                    <td className="p-4 pl-6 text-xs text-neutral-500 font-sans">
                                      {language === 'vi' 
                                        ? new Date(exp.date).toLocaleDateString('vi-VN')
                                        : new Date(exp.date).toLocaleDateString('en-US')}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-neutral-900">
                                      {exp.description}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-neutral-900 text-right font-sans">
                                      {formatCurrency(exp.cost)}
                                    </td>
                                    <td className="p-4 pr-6 text-sm text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          onClick={() => handleOpenExpenseModal(exp)}
                                          className="w-8 h-8 rounded-full border border-neutral-200 hover:border-[#5D0F12]/30 text-neutral-600 hover:text-[#5D0F12] flex items-center justify-center transition-all cursor-pointer"
                                          title={t.common.edit}
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteExpense(exp.id)}
                                          className="w-8 h-8 rounded-full border border-neutral-200 hover:border-rose-300 text-neutral-600 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer"
                                          title={t.common.delete}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-2">
                            <Coins className="w-10 h-10 text-neutral-300" />
                            <span className="text-sm font-semibold font-serif italic">{t.budget.noExpenses}</span>
                            <span className="text-xs text-neutral-400">
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

      {/* Edit Budget Item Modal (Code Split via next/dynamic) */}
      <EditBudgetItemModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        estimatedCostInput={estimatedCostInput}
        setEstimatedCostInput={setEstimatedCostInput}
        actualCostInput={actualCostInput}
        setActualCostInput={setActualCostInput}
        itemNote={itemNote}
        setItemNote={setItemNote}
        modalError={modalError}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEdit}
      />

      {/* Add/Edit Expense Modal (Code Split via next/dynamic) */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        editingExpenseId={editingExpenseId}
        expenseDescription={expenseDescription}
        setExpenseDescription={setExpenseDescription}
        expenseCost={expenseCost}
        setExpenseCost={setExpenseCost}
        expenseDate={expenseDate}
        setExpenseDate={setExpenseDate}
        expenseModalError={expenseModalError}
        isSubmittingExpense={isSubmittingExpense}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleSaveExpense}
      />

      <DashboardFooter />
    </div>
  );
}
