// Performance optimization utilities
"use client";

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
export const LazyFaceScanner = lazy(() => 
  import('@/components/page/scanner/mediabutton/faceScanner/FaceScanner')
);

export const LazyQRScanner = lazy(() => 
  import('@/components/page/scanner/mediabutton/Qrscanner/QrScanner')
);

export const LazyReactQuill = lazy(() => {
  // Import CSS only when component is loaded
  import('@/styles/quill.css');
  return import('react-quill-new');
});

// Loading component for heavy components
export const ComponentLoader = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin mr-2" />
    <span>{message}</span>
  </div>
);

// Wrapper for lazy components
export const LazyWrapper = ({ children, fallback = <ComponentLoader /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/fonts/inter.woff2';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Code splitting helper
export const withCodeSplitting = (importFn, options = {}) => {
  return lazy(() => {
    return new Promise((resolve) => {
      // Add artificial delay to prevent flash of loading
      setTimeout(() => {
        importFn().then(resolve);
      }, options.delay || 0);
    });
  });
};