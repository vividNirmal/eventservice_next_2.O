"use client";

import { Suspense } from 'react';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { EventListSkeleton } from '@/components/common/EventListSkeleton';
import EventHostPage from './eventHostPage';

const EventHostPageWrapper = () => {
  return (
    <ErrorBoundary>
      <Suspense 
        fallback={
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="w-2/4 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <EventListSkeleton />
          </div>
        }
      >
        <EventHostPage />
      </Suspense>
    </ErrorBoundary>
  );
};

export default EventHostPageWrapper;
