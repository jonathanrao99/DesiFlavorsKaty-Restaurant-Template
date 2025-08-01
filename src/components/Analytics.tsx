'use client';

import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    // Performance monitoring
    if (typeof window !== 'undefined') {
      // Monitor Core Web Vitals
      if ('PerformanceObserver' in window) {
        try {
          // LCP (Largest Contentful Paint)
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              console.log('LCP:', lastEntry.startTime);
              if (typeof window.gtag !== 'undefined') {
                window.gtag('event', 'web_vitals', {
                  event_category: 'Web Vitals',
                  event_label: 'LCP',
                  value: Math.round(lastEntry.startTime),
                });
              }
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // FID (First Input Delay)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const fidEntry = entry as PerformanceEventTiming;
              const fid = fidEntry.processingStart - fidEntry.startTime;
              console.log('FID:', fid);
              if (typeof window.gtag !== 'undefined') {
                window.gtag('event', 'web_vitals', {
                  event_category: 'Web Vitals',
                  event_label: 'FID',
                  value: Math.round(fid),
                });
              }
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // CLS (Cumulative Layout Shift)
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                console.log('CLS:', clsValue);
                if (typeof window.gtag !== 'undefined') {
                  window.gtag('event', 'web_vitals', {
                    event_category: 'Web Vitals',
                    event_label: 'CLS',
                    value: Math.round(clsValue * 1000) / 1000,
                  });
                }
              }
            });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.warn('Performance monitoring failed:', error);
        }
      }

      // Monitor page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            
            console.log('Page Load Time:', loadTime);
            console.log('DOM Content Loaded:', domContentLoaded);
            
            if (typeof window.gtag !== 'undefined') {
              window.gtag('event', 'timing_complete', {
                name: 'load',
                value: Math.round(loadTime),
              });
            }
          }
        }, 0);
      });
    }
  }, []);

  return null;
} 