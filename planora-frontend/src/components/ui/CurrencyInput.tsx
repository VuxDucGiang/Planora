'use client';

import React from 'react';
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
}: CurrencyInputProps) {
  const displayValue = formatWithCommas(value);
  const numericValue = typeof value === 'number'
    ? value
    : parseInt(parseRawDigits(String(value || '')), 10) || 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseRawDigits(e.target.value);
    const num = raw ? parseInt(raw, 10) : 0;
    // Pass raw normalized digits string (e.g. "2000000") and number (2000000)
    onChange(raw ? String(num) : '', num);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-sm font-semibold text-muted-text">{currencySymbol}</span>
        </div>
        <input
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
