'use client';
import { useEffect } from 'react';

/**
 * Custom hook to prevent hydration errors caused by browser extensions
 * that add attributes like fdprocessedid to form elements
 */
export const usePreventHydrationMismatch = () => {
  useEffect(() => {
    // Remove browser extension attributes after hydration
    const removeExtensionAttributes = () => {
      const formElements = document.querySelectorAll('input, textarea, select, button');
      
      formElements.forEach(element => {
        // List of known browser extension attributes
        const extensionAttributes = [
          'fdprocessedid',
          'data-lastpass-icon-root',
          'data-onepassword-icon',
          'data-dashlane-rid',
          'data-bitwarden-watching'
        ];
        
        extensionAttributes.forEach(attr => {
          if (element.hasAttribute(attr)) {
            element.removeAttribute(attr);
          }
        });
      });
    };

    // Run after initial render
    removeExtensionAttributes();

    // Set up mutation observer to catch dynamically added attributes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const element = mutation.target;
          const attributeName = mutation.attributeName;
          
          // Remove unwanted extension attributes
          if (attributeName && (
            attributeName.includes('fdprocessedid') ||
            attributeName.includes('lastpass') ||
            attributeName.includes('onepassword') ||
            attributeName.includes('dashlane') ||
            attributeName.includes('bitwarden')
          )) {
            element.removeAttribute(attributeName);
          }
        }
      });
    });

    // Observe all form elements
    const formElements = document.querySelectorAll('input, textarea, select, button');
    formElements.forEach(element => {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['fdprocessedid', 'data-lastpass-icon-root', 'data-onepassword-icon', 'data-dashlane-rid', 'data-bitwarden-watching']
      });
    });

    return () => {
      observer.disconnect();
    };
  }, []);
};
