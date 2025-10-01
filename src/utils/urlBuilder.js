/**
 * Utility functions for building URLs consistently across the application
 */

/**
 * Get the base URL for the application
 * @returns {string} The base URL
 */
export const getBaseUrl = () => {
  // In browser, use environment variable or fallback to current location
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  }
  // On server, use environment variable or default
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

/**
 * Build a dynamic form participation URL
 * @param {string} eventHash - The encrypted event hash/token
 * @param {string} formId - The form ID to include in the URL
 * @returns {string} The complete form URL
 */
export const buildFormUrl = (eventHash, formId) => {
  if (!eventHash) {
    throw new Error('Event hash is required to build form URL');
  }
  if (!formId) {
    throw new Error('Form ID is required to build form URL');
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/event/${eventHash}?form_id=${formId}`;
};

/**
 * Build a device/check-in URL for scanners
 * @param {string} deviceKey - The encrypted device key
 * @param {string} eventSlug - The event slug for additional context
 * @returns {string} The complete device URL
 */
export const buildDeviceUrl = (deviceKey, eventSlug) => {
  if (!deviceKey) {
    throw new Error('Device key is required to build device URL');
  }
  
  const baseUrl = getBaseUrl();
  let url = `${baseUrl}/attendee?key=${deviceKey}`;
  
  if (eventSlug) {
    url += `&event_slug=${eventSlug}`;
  }
  
  return url;
};

/**
 * Build a clean device URL using short ID
 * @param {string} shortId - The short ID for the device URL mapping
 * @returns {string} The clean device URL
 */
export const buildCleanDeviceUrl = (shortId) => {
  if (!shortId) {
    throw new Error('Short ID is required to build clean device URL');
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/attendee/${shortId}`;
};

/**
 * Build a short form registration URL using short ID
 * @param {string} shortId - The short ID for the form URL mapping
 * @returns {string} The short form URL
 */
export const buildShortFormUrl = (shortId) => {
  if (!shortId) {
    throw new Error('Short ID is required to build short form URL');
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/registration/${shortId}`;
};

/**
 * Build a form registration URL using event slug
 * @param {string} eventSlug - The event slug for the form URL
 * @returns {string} The form URL with event slug
 */
export const buildSlugFormUrl = (eventSlug) => {
  if (!eventSlug) {
    throw new Error('Event slug is required to build form URL');
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${eventSlug}/registration`;
};

/**
 * Copy text to clipboard with fallbacks for different browsers
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  if (!text) {
    throw new Error('Text is required to copy to clipboard');
  }

  try {
    // Modern clipboard API (HTTPS required)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers or non-HTTPS contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return success;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
};

/**
 * Validate that required fields exist for URL building
 * @param {Object} event - The event object
 * @param {string} type - The type of URL being built ('form' | 'device')
 * @returns {Object} Validation result with isValid and missing fields
 */
export const validateEventForUrl = (event, type = 'form') => {
  const missing = [];
  
  if (!event) {
    return { isValid: false, missing: ['event object'] };
  }
  
  if (type === 'form') {
    if (!event.selected_form_id) missing.push('selected_form_id');
    if (!event.event_slug && !event._id) missing.push('event_slug or _id');
  } else if (type === 'device') {
    if (!event._id) missing.push('event _id');
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
};
