'use client';

import { useEffect } from 'react';
import { getBrandedTitle } from '@/utils/domainBranding';

/**
 * Client-side component to handle dynamic title updates based on domain
 * @param {string} pageTitle - Optional page-specific title
 */
export default function DynamicTitle({ pageTitle = '' }) {
  useEffect(() => {
    // Update document title on client side
    const title = getBrandedTitle(pageTitle);
    document.title = title;
    
    // Also update any meta tags if needed
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) {
      metaTitle.setAttribute('content', title);
    }
  }, [pageTitle]);

  return null; // This component doesn't render anything
}