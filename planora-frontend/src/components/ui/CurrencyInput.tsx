'use client';

import React, { useRef } from 'react';
import { numberToVietnameseWords, formatWithCommas, parseRawDigits } from '@/utils/numberToWords';

export interface CurrencyInputProps {
  id?: string;
  value: string | number;
  onChange: (rawValue: string, numericValue: number) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
  showInWords?: boolean;
  currencySymbol?: string;
  max?: number;
  min?: number;
  helperText?: string;
}

export default function CurrencyInput({
  id,
  value,
  onChange,
  placeholder = '0',
  className = '',
  inputClassName = '',
  required = false,
  disabled = false,
  showInWords = true,
  currencySymbol = '₫',
  max,
  min,
  helperText,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue = formatWithCommas(value);
  const numericValue = typeof value === 'number'
    ? value
    : parseInt(parseRawDigits(String(value ?? '')), 10) || 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const rawBeforeCursor = input.value.slice(0, cursorPosition).replace(/\D/g, '');
    const rawAll = parseRawDigits(input.value);

    let num = rawAll ? parseInt(rawAll, 10) : 0;
    if (max !== undefined && num > max) {
      num = max;
    }

    const rawStr = rawAll ? (num === 0 ? '0' : String(num)) : '';
    onChange(rawStr, num);

    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      const formatted = formatWithCommas(rawStr);
      let targetDigits = rawBeforeCursor.length;
      let newCursor = 0;
      while (newCursor < formatted.length && targetDigits > 0) {
        if (/\d/.test(formatted[newCursor])) {
          targetDigits--;
        }
        newCursor++;
      }
      inputRef.current.setSelectionRange(newCursor, newCursor);
    });
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-sm font-semibold text-muted-text">{currencySymbol}</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          id={id}
          inputMode="numeric"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          className={`w-full bg-canvas border border-hairline rounded-lg pl-8 pr-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-primary text-ink font-mono font-semibold transition-colors ${inputClassName}`}
        />
      </div>

      {helperText && (
        <p className="text-[11px] text-stone-500 font-serif italic">
          {helperText}
        </p>
      )}

      {showInWords && numericValue > 0 && (
        <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-md bg-primary/5 border border-primary/15 text-xs animate-fade-in">
          <span className="font-bold text-ink shrink-0 font-sans">Bằng chữ:</span>
          <span className="font-medium text-primary font-sans break-words">
            {numberToVietnameseWords(numericValue)}
          </span>
        </div>
      )}
    </div>
  );
}
