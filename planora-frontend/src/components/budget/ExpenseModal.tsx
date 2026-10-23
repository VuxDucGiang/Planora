'use client';

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExpenseModalProps {
  isOpen: boolean;
  editingExpenseId: string | null;
  expenseDescription: string;
  setExpenseDescription: (val: string) => void;
  expenseCost: string;
  setExpenseCost: (val: string) => void;
  expenseDate: string;
  setExpenseDate: (val: string) => void;
  expenseModalError: string | null;
  isSubmittingExpense: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ExpenseModal({
  isOpen,
  editingExpenseId,
  expenseDescription,
  setExpenseDescription,
  expenseCost,
  setExpenseCost,
  expenseDate,
  setExpenseDate,
  expenseModalError,
  isSubmittingExpense,
  onClose,
  onSubmit,
}: ExpenseModalProps) {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white border border-neutral-200/80 rounded-t-3xl sm:rounded-[1.75rem] w-full max-w-md p-6 sm:p-7 shadow-2xl animate-slide-up sm:animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
          <h3 className="text-base sm:text-lg font-serif font-bold uppercase tracking-wide text-[#5D0F12]">
            {editingExpenseId ? t.budget.editExpenseModalTitle : t.budget.addExpenseModalTitle}
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-base font-semibold w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-full cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Expense Modal Error alert */}
        {expenseModalError && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
            <span>{expenseModalError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="expense-desc" className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              {t.budget.expenseDesc} *
            </label>
            <input
              type="text"
              id="expense-desc"
              required
              placeholder={language === 'vi' ? 'Ví dụ: Đặt cọc địa điểm tiệc cưới đợt 1...' : 'e.g., Venue deposit installment 1...'}
              className="w-full bg-[#FAF8F5]/60 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5D0F12] text-neutral-900 font-medium"
              value={expenseDescription}
              onChange={e => setExpenseDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="expense-amount" className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
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
            <label htmlFor="expense-date" className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              {t.budget.expenseDate} *
            </label>
            <input
              type="date"
              id="expense-date"
              required
              className="w-full bg-[#FAF8F5]/60 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5D0F12] text-neutral-900 font-semibold cursor-pointer"
              value={expenseDate}
              onChange={e => setExpenseDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmittingExpense}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[42px] flex items-center justify-center"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmittingExpense}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5D0F12] hover:bg-[#4A0C0E] !text-[#FFFBF5] transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[42px]"
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
  );
}

