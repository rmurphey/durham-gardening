/**
 * Garden ID Utilities
 * Handles generation and validation of unique garden identifiers
 */

/**
 * Generate a unique garden ID
 * Uses crypto.randomUUID() for true uniqueness
 * @returns {string} A unique garden identifier
 */
export const generateGardenId = () => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Validate garden ID format
 * @param {string} id - Garden ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidGardenId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // Check for UUID format (8-4-4-4-12 characters)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Create shareable garden URL
 * @param {string} gardenId - Garden ID
 * @param {string} baseUrl - Base URL (optional, defaults to current origin)
 * @returns {string} Shareable URL
 */
export const createShareableUrl = (gardenId, baseUrl = '') => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/garden/${gardenId}`;
};