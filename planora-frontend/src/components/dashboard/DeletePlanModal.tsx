'use client';

import React from 'react';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeletePlanModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  deleteError: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePlanModal({
  isOpen,
  isDeleting,
  deleteError,
  onClose,
  onConfirm,
}: DeletePlanModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-full transition-all shadow-xs cursor-pointer min-h-[42px] flex items-center justify-center"
          >
            {t.dashboard.deleteModalCancel}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
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
  );
}

