// Performance testing utilities
export const measurePerformance = {
  // Measure component render time
  measureRender: (componentName, renderFn) => {
    if (typeof window !== 'undefined' && window.performance) {
      const start = performance.now();
      const result = renderFn();
      const end = performance.now();
      console.log(`🚀 ${componentName} render: ${(end - start).toFixed(2)}ms`);
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
      console.log(`📡 ${apiName} API call: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return await apiFn();
  },

  // Measure memory usage
  measureMemory: (label) => {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      console.log(`💾 ${label} Memory:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
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
      if (entries.length > 0) {
        console.log(`⏱️ ${name}: ${entries[0].duration.toFixed(2)}ms`);
      }
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
      console.log(`📊 Cache hit rate: ${hitRate}% (${this.hits}/${total})`);
    }
  },
  
  reset() {
    this.hits = 0;
    this.misses = 0;
  }
};
