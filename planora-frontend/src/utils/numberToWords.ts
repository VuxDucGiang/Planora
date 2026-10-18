/**
 * Utility functions for reading numbers in Vietnamese words (doc so tien bang chu)
 * and formatting currency values with thousand separators.
 */

const DIGITS_VI = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readGroup3(group: number, showZeroHundred: boolean): string {
  const h = Math.floor(group / 100);
  const t = Math.floor((group % 100) / 10);
  const u = group % 10;

  if (group === 0) return '';

  let res = '';

  // Hundreds
  if (h > 0 || showZeroHundred) {
    res += `${DIGITS_VI[h]} trăm `;
  }

  // Tens
  if (t === 0 && u > 0) {
    if (h > 0 || showZeroHundred) {
      res += 'lẻ ';
    }
  } else if (t === 1) {
    res += 'mười ';
  } else if (t > 1) {
    res += `${DIGITS_VI[t]} mươi `;
  }

  // Units
  if (t > 0 && u === 1) {
    res += t > 1 ? 'mốt ' : 'một ';
  } else if (t > 0 && u === 5) {
    res += 'lăm ';
  } else if (u > 0) {
    res += `${DIGITS_VI[u]} `;
  }

  return res.trim();
}

/**
 * Converts a numeric amount to formal Vietnamese words (Doc tien bang chu)
 * e.g. 2000000 -> "Hai triệu đồng"
 * e.g. 100000000 -> "Một trăm triệu đồng"
 * e.g. 2500000 -> "Hai triệu năm trăm nghìn đồng"
 */
export function numberToVietnameseWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Không đồng';
  if (amount < 0) return 'Âm ' + numberToVietnameseWords(Math.abs(amount)).toLowerCase();

  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const groups: number[] = [];
  let temp = Math.floor(amount);

  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let words = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group > 0) {
      const isHighest = i === groups.length - 1;
      const groupWords = readGroup3(group, !isHighest);
      words += `${groupWords} ${scales[i]} `;
    }
  }

  words = words.trim().replace(/\s+/g, ' ');
  if (!words) return 'Không đồng';

  // Capitalize first letter and append "đồng"
  return words.charAt(0).toUpperCase() + words.slice(1) + ' đồng';
}

/**
 * Format raw number string or number with comma thousand separators
 * e.g. "2000000" -> "2,000,000"
 */
export function formatWithCommas(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const cleanStr = String(value).replace(/\D/g, '');
  if (!cleanStr) return '';
  const num = parseInt(cleanStr, 10);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
}

/**
 * Parses a formatted string back to raw digits string
 * e.g. "2,000,000" -> "2000000"
 */
export function parseRawDigits(formatted: string): string {
  return formatted.replace(/\D/g, '');
}
