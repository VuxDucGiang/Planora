'use client';

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import CurrencyInput from '@/components/ui/CurrencyInput';
import type { BudgetItemResponse } from '@/types/budget';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditBudgetItemModalProps {
  isOpen: boolean;
  editingItem: BudgetItemResponse | null;
  estimatedCostInput: string;
  setEstimatedCostInput: (val: string) => void;
  actualCostInput: string;
  setActualCostInput: (val: string) => void;
  itemNote: string;
  setItemNote: (val: string) => void;
  modalError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditBudgetItemModal({
  isOpen,
  editingItem,
  estimatedCostInput,
  setEstimatedCostInput,
  actualCostInput,
  setActualCostInput,
  itemNote,
  setItemNote,
  modalError,
  isSubmitting,
  onClose,
  onSubmit,
}: EditBudgetItemModalProps) {
  const { language, t } = useLanguage();

  if (!isOpen || !editingItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white border border-neutral-200/80 rounded-t-3xl sm:rounded-[1.75rem] w-full max-w-md p-6 sm:p-7 shadow-2xl animate-slide-up sm:animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
          <h3 className="text-base sm:text-lg font-serif font-bold uppercase tracking-wide text-[#5D0F12]">
            {language === 'vi' ? 'Điều chỉnh chi phí: ' : 'Edit Allocation: '}
            <span className="text-neutral-900">{editingItem.categoryName}</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-base font-semibold w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-full cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Error alert */}
        {modalError && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Estimated Cost */}
          <div className="space-y-1.5">
            <label htmlFor="modal-estimated" className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
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
            <label htmlFor="modal-actual" className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
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
            <label htmlFor="modal-note" className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              {t.budget.notesLabel}
            </label>
            <textarea
              id="modal-note"
              rows={3}
              placeholder={t.budget.notesPlaceholder}
              className="w-full bg-[#FAF8F5]/60 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5D0F12] text-neutral-900 resize-none leading-relaxed"
              value={itemNote}
              onChange={e => setItemNote(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[42px] flex items-center justify-center"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5D0F12] hover:bg-[#4A0C0E] !text-[#FFFBF5] transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[42px]"
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
  );
}

