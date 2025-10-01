'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to prevent hydration errors by ensuring client-side only rendering
 * and removing browser extension attributes
 */
export function useHydrationSafe() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Remove browser extension attributes that cause hydration errors
    const removeExtensionAttributes = () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        // Remove common extension attributes
        input.removeAttribute('fdprocessedid');
        input.removeAttribute('data-lastpass-icon-root');
        input.removeAttribute('data-dashlane-rid');
        input.removeAttribute('data-bitwarden-watching');
        
        // Set attributes to prevent extension interference
        if (!input.hasAttribute('autocomplete')) {
          input.setAttribute('autocomplete', 'off');
        }
        input.setAttribute('data-form-type', 'other');
      });
    };

    // Initial cleanup
    removeExtensionAttributes();

    // Set up observer to handle dynamically added elements
    const observer = new MutationObserver(() => {
      removeExtensionAttributes();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['fdprocessedid', 'data-lastpass-icon-root', 'data-dashlane-rid', 'data-bitwarden-watching']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return isClient;
}
