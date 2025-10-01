import { useEffect, useRef, useCallback } from 'react';

export const useIntersectionObserver = (callback, options = {}) => {
  const targetRef = useRef(null);
  
  const callbackRef = useCallback(callback, [callback]);
  
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callbackRef();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });
    
    observer.observe(target);
    
    return () => observer.disconnect();
  }, [callbackRef, options]);
  
  return targetRef;
};

export const useInfiniteScroll = (hasNextPage, isLoading, loadMore) => {
  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (hasNextPage && !isLoading) {
        loadMore();
      }
    }, [hasNextPage, isLoading, loadMore])
  );
  
  return loadMoreRef;
};
