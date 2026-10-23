'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a fast-changing value (e.g. search input, filter range).
 * Delays updating the debounced value until after the specified delay has passed
 * since the last time the source value changed.
 *
 * @param value The value to debounce.
 * @param delay Milliseconds to delay (default: 350ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

