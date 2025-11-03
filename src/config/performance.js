// Performance configuration
export const PERFORMANCE_CONFIG = {
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50,
  
  // Virtual scrolling thresholds
  VIRTUAL_SCROLL_THRESHOLD: 20,
  ITEM_HEIGHT: 250,
  ITEM_WIDTH: 350,
  
  // Debounce settings
  SEARCH_DEBOUNCE_MS: 500,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  
  // Image optimization
  IMAGE_QUALITY: 80,
  IMAGE_FORMATS: ['webp', 'jpg'],
  
  // Component lazy loading
  LAZY_LOADING_THRESHOLD: '200px',
  
  // Memory management
  COMPONENT_CACHE_SIZE: 100,
  STATUS_CACHE_CLEAR_INTERVAL: 60000, // 1 minute
};

// Performance monitoring
export const performanceMonitor = {
  measureRender: (componentName, renderFn) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = renderFn();
      const end = performance.now();      
      return result;
    }
    return renderFn();
  },
  
  measureAsync: async (operationName, asyncFn) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = await asyncFn();
      const end = performance.now();      
      return result;
    }
    return await asyncFn();
  }
};
