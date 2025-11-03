// Performance testing utilities
export const measurePerformance = {
  // Measure component render time
  measureRender: (componentName, renderFn) => {
    if (typeof window !== 'undefined' && window.performance) {
      const start = performance.now();
      const result = renderFn();
      const end = performance.now();
      return result;
    }
    return renderFn();
  },

  // Measure API call time
  measureAPI: async (apiName, apiFn) => {
    if (typeof window !== 'undefined' && window.performance) {
      const start = performance.now();
      const result = await apiFn();
      const end = performance.now();
      return result;
    }
    return await apiFn();
  },

  // Measure memory usage
  measureMemory: (label) => {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      const memory = window.performance.memory;      
    }
  },

  // Mark performance milestones
  mark: (name) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name);
    }
  },

  // Measure between marks
  measure: (name, startMark, endMark) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);      
    }
  }
};

// Cache performance monitoring
export const cacheMonitor = {
  hits: 0,
  misses: 0,
  
  recordHit() {
    this.hits++;
    this.logStats();
  },
  
  recordMiss() {
    this.misses++;
    this.logStats();
  },
  
  logStats() {
    const total = this.hits + this.misses;
    if (total > 0 && total % 10 === 0) {
      const hitRate = ((this.hits / total) * 100).toFixed(1);      
    }
  },
  
  reset() {
    this.hits = 0;
    this.misses = 0;
  }
};
