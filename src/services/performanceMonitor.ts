/**
 * Performance Monitoring Service
 * - Tracks slow database queries
 * - Monitors component render times
 * - Reports metrics to help identify bottlenecks
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'query' | 'render' | 'navigation';
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private slowThreshold = 1000; // ms
  private enabled = false;

  constructor() {
    // Only enable in development
    this.enabled = !import.meta.env.PROD;
  }

  /**
   * Track database query duration
   */
  trackQuery(table: string, select: string, duration: number): void {
    if (!this.enabled || duration < this.slowThreshold) return;

    const metric: PerformanceMetric = {
      name: `db:${table}`,
      duration,
      timestamp: Date.now(),
      type: 'query',
      metadata: { select, slow: duration > this.slowThreshold },
    };

    this.metrics.push(metric);
    if (duration > this.slowThreshold * 2) {
      console.warn(`🐢 Slow query: ${table} took ${duration}ms`, { select });
    }
  }

  /**
   * Track component render time
   */
  trackRender(componentName: string, duration: number): void {
    if (!this.enabled || duration < 16) return; // 16ms = 60fps frame

    const metric: PerformanceMetric = {
      name: `render:${componentName}`,
      duration,
      timestamp: Date.now(),
      type: 'render',
    };

    this.metrics.push(metric);
    if (duration > 100) {
      console.warn(`⚠️ Slow render: ${componentName} took ${duration}ms`);
    }
  }

  /**
   * Track page navigation
   */
  trackNavigation(pageName: string, duration: number): void {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name: `nav:${pageName}`,
      duration,
      timestamp: Date.now(),
      type: 'navigation',
    };

    this.metrics.push(metric);
    if (duration > 2000) {
      console.warn(`📍 Slow navigation to ${pageName}: ${duration}ms`);
    }
  }

  /**
   * Get average query duration for a table
   */
  getAverageQueryTime(table: string): number {
    const queries = this.metrics.filter((m) => m.name === `db:${table}`);
    if (queries.length === 0) return 0;
    return queries.reduce((sum, m) => sum + m.duration, 0) / queries.length;
  }

  /**
   * Get slowest queries
   */
  getSlowestQueries(limit = 10): PerformanceMetric[] {
    return this.metrics
      .filter((m) => m.type === 'query')
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const queries = this.metrics.filter((m) => m.type === 'query');
    const renders = this.metrics.filter((m) => m.type === 'render');

    return {
      totalMetrics: this.metrics.length,
      queries: {
        count: queries.length,
        avgDuration: queries.length ? queries.reduce((sum, m) => sum + m.duration, 0) / queries.length : 0,
        slowest: queries.sort((a, b) => b.duration - a.duration)[0]?.duration || 0,
      },
      renders: {
        count: renders.length,
        avgDuration: renders.length ? renders.reduce((sum, m) => sum + m.duration, 0) / renders.length : 0,
      },
    };
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Print report to console
   */
  printReport(): void {
    const summary = this.getSummary();
    console.group('📊 Performance Report');
    console.log('Summary:', summary);
    console.log('Slowest Queries:', this.getSlowestQueries(5));
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure async function execution
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  type: 'query' | 'render' | 'navigation' = 'query'
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;

    if (type === 'query') {
      performanceMonitor.trackQuery(name, '', duration);
    } else if (type === 'navigation') {
      performanceMonitor.trackNavigation(name, duration);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`❌ ${type} failed: ${name} (${duration}ms)`, error);
    throw error;
  }
}

/**
 * React hook for tracking render performance
 */
export function useRenderTime(componentName: string) {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;
    performanceMonitor.trackRender(componentName, duration);
  };
}
