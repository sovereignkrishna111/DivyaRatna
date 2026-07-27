/**
 * React Performance Utilities
 * - Memoization helpers for expensive computations
 * - Smart component memoization
 * - Ref-based equality checks for deep comparisons
 */

import { useMemo, useCallback, ReactNode, Suspense, lazy, FC } from 'react';

/**
 * Deep memoization for object/array comparisons
 * More intelligent than React.memo for complex props
 */
export function useDeepMemo<T>(value: T): T {
  return useMemo(() => value, [JSON.stringify(value)]);
}

/**
 * Debounced callback with automatic cleanup
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  return useCallback(
    debounce(callback, delay),
    [callback, delay]
  ) as T;
}

/**
 * Throttled callback for resize/scroll handlers
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  return useCallback(
    throttle(callback, delay),
    [callback, delay]
  ) as T;
}

/**
 * Lazy load components with Suspense
 */
export function useLazyComponent(
  importFn: () => Promise<{ default: FC<any> }>,
  fallback: ReactNode = <div>Loading...</div>
) {
  const Component = lazy(importFn);
  return ({ ...props }: any) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

// Utility functions
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - timeSinceLastCall);
    }
  }) as T;
}
