/**
 * Utility functions for domain-based branding
 */

/**
 * Extract subdomain from current hostname
 * @returns {string} The subdomain (e.g., "demo" from "demo.eventservices.in")
 */
export const getSubdomain = () => {
  if (typeof window === 'undefined') return '';
  
  const host = window.location.hostname;
  const parts = host.split('.');
  
  // If localhost or IP address, no subdomain
  if (host === 'localhost' || host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return '';
  }
  
  // Return subdomain if exists
  return parts.length > 2 ? parts[0] : '';
};

/**
 * Generate branded title based on subdomain
 * @param {string} basePage - The base page name (optional)
 * @returns {string} The branded title
 */
export const getBrandedTitle = (basePage = '') => {
  const subdomain = getSubdomain();
  
  let brandName = '';
  if (subdomain) {
    // Capitalize first letter of subdomain
    brandName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
  }
  
  const serviceName = brandName ? `${brandName} Event Services` : 'Event Services';
  
  return basePage ? `${basePage} - ${serviceName}` : serviceName;
};

/**
 * Generate app name based on subdomain
 * @returns {string} The app name for manifest and meta tags
 */
export const getAppName = () => {
  const subdomain = getSubdomain();
  
  if (subdomain) {
    const brandName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
    return `${brandName} Event Services`;
  }
  
  return 'Event Services';
};

/**
 * Get domain configuration object
 * @returns {object} Configuration object with branding info
 */
export const getDomainConfig = () => {
  const subdomain = getSubdomain();
  
  return {
    subdomain,
    brandName: subdomain ? subdomain.charAt(0).toUpperCase() + subdomain.slice(1) : '',
    appName: getAppName(),
    title: getBrandedTitle(),
    hasCustomBranding: !!subdomain
  };
};