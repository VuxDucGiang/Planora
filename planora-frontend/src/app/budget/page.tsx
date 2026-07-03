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
  Sparkles
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import Link from 'next/link';

export default function Budget() {
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
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

  // Load Active Plan and Budget Data
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        setIsLoading(true);
        const activePlan = await getActivePlan();
        if (activePlan) {
          const data = await getBudget(activePlan.id);
          setBudgetData(data);
        } else {
          router.replace('/');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu ngân sách:', err);
        setErrorMessage('Không thể tải thông tin ngân sách. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, router]);

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

  // Format currency to VND
  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Open Edit Modal
  const handleOpenEdit = (item: BudgetItemResponse) => {
    setEditingItem(item);
    setEstimatedCostInput(item.estimatedCost.toString());
    setActualCostInput(item.actualCost.toString());
    setItemNote(item.note || '');
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

    const estCost = parseFloat(estimatedCostInput);
    const actCost = parseFloat(actualCostInput);

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
      const updatedItem = await updateBudgetItem(editingItem.itemId, {
        estimatedCost: estCost,
        actualCost: actCost,
        note: itemNote.trim() || undefined
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
    } catch (e) {
      // Plain text fallback
      return { noteText: note, expenses: [] };
    }
    return { noteText: '', expenses: [] };
  };

  // Sync Category Detail state
  useEffect(() => {
    if (selectedCategoryItem) {
      const parsed = parseBudgetItemNote(selectedCategoryItem.note);
      setExpensesList(parsed.expenses);
      setNoteText(parsed.noteText);
      setAllocationInput(selectedCategoryItem.estimatedCost.toString());
    } else {
      setExpensesList([]);
      setNoteText('');
      setAllocationInput('');
    }
  }, [selectedCategoryItem]);

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
    const estCost = parseFloat(allocationInput);
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

    const costVal = parseFloat(expenseCost);
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
        estimatedCost: parseFloat(allocationInput),
        actualCost: newActualCost,
        note: serializedNote
      });

      updateLocalBudgetData(updated);
      setSelectedCategoryItem(updated);
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
        estimatedCost: parseFloat(allocationInput),
        actualCost: newActualCost,
        note: serializedNote
      });

      updateLocalBudgetData(updated);
      setSelectedCategoryItem(updated);
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

  return (
    <div className="min-h-screen bg-canvas text-body-text font-sans flex flex-col relative w-full overflow-hidden">
      <DashboardHeader logout={logout} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-10 py-12 flex flex-col justify-start">
        
        {/* Header Breadcrumbs */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
          </Link>
        </div>

        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-hairline pb-6 mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium tracking-tight text-ink font-display flex items-center gap-2">
              <Coins className="w-7 h-7 text-primary" />
              Quản lý Ngân Sách
            </h1>
            <p className="text-xs text-muted-text">
              Theo dõi phân bổ ngân sách dự kiến và ghi nhận các chi phí thực tế đã thanh toán.
            </p>
          </div>
        </div>

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-sm flex items-start gap-3 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-text font-display">Đang tải dữ liệu ngân sách...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {selectedCategoryItem === null ? (
            <div className="space-y-8 animate-fade-in">
            {/* Top Stat Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* Stat Card 1: Total Budget */}
              <div className="p-5 bg-white border border-hairline rounded-lg shadow-sm flex flex-col justify-between space-y-3">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest block flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-muted-text" />
                  Quỹ cưới ban đầu
                </span>
                <div className="space-y-1">
                  <span className="text-xl font-bold text-ink font-mono">{formatCurrency(totalBudget)}</span>
                  <span className="text-[10px] text-muted-text block leading-none">Cố định từ Onboarding</span>
                </div>
              </div>

              {/* Stat Card 2: Allocated Estimated */}
              <div className="p-5 bg-white border border-hairline rounded-lg shadow-sm flex flex-col justify-between space-y-3">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest block flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-text" />
                  Dự kiến phân bổ
                </span>
                <div className="space-y-1">
                  <span className="text-xl font-bold text-primary font-mono">{formatCurrency(totalEstimated)}</span>
                  <span className="text-[10px] text-muted-text block leading-none">Tổng dự chi các mục</span>
                </div>
              </div>

              {/* Stat Card 3: Total Spent */}
              <div className="p-5 bg-white border border-hairline rounded-lg shadow-sm flex flex-col justify-between space-y-3">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest block flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-muted-text" />
                  Thực tế đã chi
                </span>
                <div className="space-y-1">
                  <span className="text-xl font-bold text-ink font-mono">{formatCurrency(totalActualSpent)}</span>
                  <span className="text-[10px] text-muted-text block leading-none">Tổng khoản đã thanh toán</span>
                </div>
              </div>

              {/* Stat Card 4: Balance Remaining */}
              <div className={`p-5 border rounded-lg shadow-sm flex flex-col justify-between space-y-3 ${
                isOverBudget ? 'bg-red-50/50 border-red-200' : 'bg-white border-hairline'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-widest block flex items-center gap-1.5 text-muted-text">
                  <Coins className={`w-3.5 h-3.5 ${isOverBudget ? 'text-red-500' : 'text-muted-text'}`} />
                  Số dư còn lại
                </span>
                <div className="space-y-1">
                  <span className={`text-xl font-bold font-mono ${isOverBudget ? 'text-red-600' : 'text-success'}`}>
                    {formatCurrency(remainingBalance)}
                  </span>
                  <span className="text-[10px] text-muted-text block leading-none">
                    {isOverBudget ? 'Quỹ cưới đã bị vượt!' : 'Trong phạm vi cho phép'}
                  </span>
                </div>
              </div>

            </div>

            {/* Visual Spend Progress Indicator */}
            <div className="p-6 bg-white border border-hairline rounded-lg shadow-sm space-y-3.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-ink">Biểu đồ tiến độ chi tiêu quỹ cưới</span>
                <span className={`font-mono text-xs ${isOverBudget ? 'text-red-600 font-bold' : 'text-primary'}`}>
                  {spentPercent}% đã tiêu
                </span>
              </div>
              <div className="w-full h-3 bg-canvas border border-hairline rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-600' : 'bg-primary'}`} 
                  style={{ width: `${Math.min(spentPercent, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Chú ý: Chi phí thực tế đã vượt quỹ cưới ban đầu {formatCurrency(Math.abs(remainingBalance))}. Hãy xem xét giảm bớt chi phí ở các mục chưa thanh toán.</span>
                </div>
              )}
            </div>

            {/* Budget Items Table/Card List */}
            <div className="bg-white border border-hairline rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 border-b border-hairline bg-canvas/30 flex justify-between items-center">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Chi tiết phân bổ theo hạng mục
                </h3>
                <span className="text-[10px] text-muted-text">
                  Nhấp vào biểu tượng sửa để điều chỉnh chi tiết chi phí
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
                        onClick={() => setSelectedCategoryItem(item)}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas/10 cursor-pointer transition-colors"
                      >
                        
                        {/* Name and notes */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-ink">
                            {item.categoryName}
                          </h4>
                          {item.note ? (
                            <p className="text-xs text-muted-text flex items-start gap-1">
                              <FileText className="w-3.5 h-3.5 mt-0.5 text-muted-text flex-shrink-0" />
                              <span className="break-words leading-relaxed">{item.note}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-light-grey italic">Chưa có ghi chú nào.</p>
                          )}
                        </div>

                        {/* Cost allocations */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:text-right">
                          
                          {/* Estimated */}
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Dự kiến</span>
                            <span className="text-xs font-semibold font-mono text-ink">
                              {formatCurrency(item.estimatedCost)}
                            </span>
                          </div>

                          {/* Actual Spent */}
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Thực tế</span>
                            <span className="text-xs font-semibold font-mono text-ink">
                              {formatCurrency(item.actualCost)}
                            </span>
                          </div>

                          {/* Gap/Diff */}
                          <div className="space-y-0.5 min-w-[100px] sm:text-right">
                            <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Chênh lệch</span>
                            <span className={`text-xs font-semibold font-mono ${
                              isDiffNegative ? 'text-red-600' : diff > 0 ? 'text-success' : 'text-muted-text'
                            }`}>
                              {isDiffNegative 
                                ? `Vượt: ${formatCurrency(Math.abs(diff))}` 
                                : diff > 0 
                                ? `Dư: ${formatCurrency(diff)}` 
                                : 'Cân bằng'
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
                              title="Sửa nhanh chi phí"
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
                    <span className="text-xs font-semibold">Chưa có hạng mục phân bổ chi phí nào trong kế hoạch.</span>
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
                      <h2 className="text-xl font-bold text-ink font-display">
                        {selectedCategoryItem.categoryName}
                      </h2>
                      <span className="text-[10px] text-muted-text uppercase tracking-widest block">Chi tiết hạng mục ngân sách</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCategoryItem(null)}
                    className="px-4 py-2 border border-primary/30 text-primary hover:bg-primary/5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Quay lại
                  </button>
                </div>

                {/* Allocation / Target Limit Card */}
                <div className="bg-white border border-hairline rounded-lg p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-wider block">Hạn mức ngân sách</h3>
                      <p className="text-xs text-muted-text">Điều chỉnh số tiền dự kiến chi cho hạng mục này.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text font-mono text-xs">₫</span>
                        <input
                          type="number"
                          className="bg-canvas border border-hairline rounded-sm pl-7 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary text-ink w-36 font-semibold"
                          value={allocationInput}
                          onChange={e => setAllocationInput(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={handleSaveAllocation}
                        disabled={isSavingAllocation}
                        className="px-4 py-1.5 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-all disabled:opacity-50"
                      >
                        {isSavingAllocation ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </div>
                  </div>

                  {/* Allocation Chart/Bar */}
                  <div className="space-y-2.5 pt-4 border-t border-hairline">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-muted-text">
                        Đã thực chi: <strong className="text-ink">{formatCurrency(selectedCategoryItem.actualCost)}</strong> trên hạn mức <strong className="text-ink">{formatCurrency(parseFloat(allocationInput) || 0)}</strong>
                      </span>
                      <span className={`font-mono text-xs ${selectedCategoryItem.actualCost > (parseFloat(allocationInput) || 0) ? 'text-red-600 font-bold' : 'text-primary'}`}>
                        {parseFloat(allocationInput) > 0 ? Math.round((selectedCategoryItem.actualCost / parseFloat(allocationInput)) * 100) : 0}% đã dùng
                      </span>
                    </div>
                    <div className="w-full h-3 bg-canvas border border-hairline rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${selectedCategoryItem.actualCost > (parseFloat(allocationInput) || 0) ? 'bg-red-600' : 'bg-primary'}`}
                        style={{ width: `${Math.min(parseFloat(allocationInput) > 0 ? (selectedCategoryItem.actualCost / parseFloat(allocationInput)) * 100 : 0, 100)}%` }}
                      />
                    </div>
                    {selectedCategoryItem.actualCost > (parseFloat(allocationInput) || 0) && (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-sm">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>Cảnh báo: Khoản chi thực tế đã vượt hạn mức dự kiến {formatCurrency(selectedCategoryItem.actualCost - (parseFloat(allocationInput) || 0))}! Bạn hãy cân đối lại các hóa đơn.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expenses List & Actions */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider pl-1">
                      Danh sách hóa đơn & Khoản chi thực tế
                    </h3>
                    <button
                      onClick={() => handleOpenExpenseModal(null)}
                      className="px-4 py-2 bg-primary hover:bg-primary-active text-white rounded-full text-xs font-semibold transition-all flex items-center gap-1 shadow-sm uppercase tracking-wider font-display"
                    >
                      <Plus className="w-3.5 h-3.5 text-cream" />
                      Thêm khoản chi
                    </button>
                  </div>

                  <div className="bg-white border border-hairline rounded-lg shadow-sm overflow-hidden">
                    {expensesList.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-canvas/50 text-[10px] font-bold text-muted-text uppercase tracking-widest border-b border-hairline">
                              <th className="p-4">Ngày chi</th>
                              <th className="p-4">Mô tả chi tiết</th>
                              <th className="p-4 text-right">Số tiền</th>
                              <th className="p-4 text-center">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-hairline">
                            {expensesList.map((exp) => (
                              <tr key={exp.id} className="hover:bg-canvas/5 transition-colors">
                                <td className="p-4 text-xs text-muted-text font-mono">
                                  {new Date(exp.date).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4 text-xs font-semibold text-ink">
                                  {exp.description}
                                </td>
                                <td className="p-4 text-xs font-mono font-bold text-ink text-right">
                                  {formatCurrency(exp.cost)}
                                </td>
                                <td className="p-4 text-xs text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleOpenExpenseModal(exp)}
                                      className="p-1.5 text-muted-text hover:text-primary hover:bg-canvas rounded-sm transition-all"
                                      title="Sửa khoản chi"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExpense(exp.id)}
                                      className="p-1.5 text-muted-text hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                                      title="Xóa khoản chi"
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
                      <div className="py-16 text-center text-muted-text flex flex-col items-center gap-2">
                        <Coins className="w-10 h-10 text-hairline" />
                        <span className="text-xs font-semibold">Chưa có khoản chi tiêu thực tế nào.</span>
                        <span className="text-[10px] text-light-grey">Nhấp vào "Thêm khoản chi" để bắt đầu ghi nhận các hóa đơn thực tế.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* Edit Budget Item Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-lg w-full max-w-md p-6 shadow-xl animate-scale-up space-y-5">
            
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-md font-semibold text-ink font-display">
                Điều chỉnh chi phí: {editingItem.categoryName}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-muted-text hover:text-ink text-sm font-semibold p-1 hover:bg-canvas rounded-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Error alert */}
            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              
              {/* Estimated Cost */}
              <div className="space-y-1.5">
                <label htmlFor="modal-estimated" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Chi phí ước tính (Dự kiến)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xs text-muted-text">₫</span>
                  </div>
                  <input
                    type="number"
                    id="modal-estimated"
                    required
                    min="0"
                    step="1000"
                    placeholder="Nhập chi phí dự kiến..."
                    className="w-full bg-canvas border border-hairline rounded-sm pl-7 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink font-mono font-semibold"
                    value={estimatedCostInput}
                    onChange={e => setEstimatedCostInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Actual Cost */}
              <div className="space-y-1.5">
                <label htmlFor="modal-actual" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Chi phí thực tế (Thực chi)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xs text-muted-text">₫</span>
                  </div>
                  <input
                    type="number"
                    id="modal-actual"
                    required
                    min="0"
                    step="1000"
                    placeholder="Nhập chi phí thực tế đã chi..."
                    className="w-full bg-canvas border border-hairline rounded-sm pl-7 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink font-mono font-semibold"
                    value={actualCostInput}
                    onChange={e => setActualCostInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Item Note */}
              <div className="space-y-1.5">
                <label htmlFor="modal-note" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Ghi chú chi tiết
                </label>
                <textarea
                  id="modal-note"
                  rows={3}
                  placeholder="Ví dụ: Đã đặt cọc đợt 1 bằng tiền mặt..."
                  className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink resize-none text-body-text leading-relaxed"
                  value={itemNote}
                  onChange={e => setItemNote(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-border-strong rounded-sm text-xs font-semibold text-body-text hover:bg-canvas transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-lg w-full max-w-md p-6 shadow-xl animate-scale-up space-y-5">
            
            <div className="flex justify-between items-center border-b border-hairline pb-3">
              <h3 className="text-md font-semibold text-ink font-display">
                {editingExpenseId ? 'Sửa khoản chi' : 'Thêm khoản chi mới'}
              </h3>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-muted-text hover:text-ink text-sm font-semibold p-1 hover:bg-canvas rounded-sm"
              >
                ✕
              </button>
            </div>

            {/* Expense Modal Error alert */}
            {expenseModalError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-sm flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{expenseModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-4">
              
              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="expense-desc" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Mô tả khoản chi / Tên hóa đơn *
                </label>
                <input
                  type="text"
                  id="expense-desc"
                  required
                  placeholder="Ví dụ: Đặt cọc địa điểm tiệc cưới đợt 1..."
                  className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink font-semibold"
                  value={expenseDescription}
                  onChange={e => setExpenseDescription(e.target.value)}
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label htmlFor="expense-amount" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Số tiền đã chi *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xs text-muted-text">₫</span>
                  </div>
                  <input
                    type="number"
                    id="expense-amount"
                    required
                    min="0"
                    step="1000"
                    placeholder="Nhập số tiền..."
                    className="w-full bg-canvas border border-hairline rounded-sm pl-7 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink font-mono font-semibold"
                    value={expenseCost}
                    onChange={e => setExpenseCost(e.target.value)}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label htmlFor="expense-date" className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Ngày thanh toán *
                </label>
                <input
                  type="date"
                  id="expense-date"
                  required
                  className="w-full bg-canvas border border-hairline rounded-sm px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary text-ink font-mono font-semibold"
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  disabled={isSubmittingExpense}
                  className="px-4 py-2 border border-border-strong rounded-sm text-xs font-semibold text-body-text hover:bg-canvas transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="px-5 py-2 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary-active transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingExpense ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Lưu khoản chi'
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
