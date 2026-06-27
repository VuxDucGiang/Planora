/**
 * Utility functions for date and time formatting
 */

/**
 * Formats a date string from YYYY-MM-DD to DD/MM/YYYY
 * @param dateStr Date string (YYYY-MM-DD)
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    // Fallback if structure is different
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Formats a date-time string from YYYY-MM-DDTHH:mm:ss to DD/MM/YYYY HH:mm
 * @param dateTimeStr Date-time string (YYYY-MM-DDTHH:mm:ss)
 */
export function formatDateTime(dateTimeStr: string | null | undefined): string {
  if (!dateTimeStr) return '';
  try {
    // Check if it contains 'T' (ISO format)
    const parts = dateTimeStr.split('T');
    const datePart = parts[0];
    const timePart = parts[1] ? parts[1].substring(0, 5) : ''; // HH:MM
    
    const dateFormatted = formatDate(datePart);
    return timePart ? `${dateFormatted} ${timePart}` : dateFormatted;
  } catch (e) {
    return dateTimeStr;
  }
}

/**
 * Converts standard date (DD/MM/YYYY) or Date object to YYYY-MM-DD for input value
 * @param value Date input value
 */
export function toInputDateFormat(value: string | Date | null | undefined): string {
  if (!value) return '';
  try {
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    
    // If it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    
    // If it's DD/MM/YYYY
    const parts = value.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch (e) {
    return '';
  }
}

/**
 * Converts a date-time input value (YYYY-MM-DDTHH:mm) to backend-compatible ISO LocalDateTime
 * @param value input datetime-local value
 */
export function toLocalDateTimeFormat(value: string | null | undefined): string {
  if (!value) return '';
  // Ensure it has seconds if needed, e.g., YYYY-MM-DDTHH:mm:00
  if (value.includes('T') && value.split('T')[1].split(':').length === 2) {
    return `${value}:00`;
  }
  return value;
}
