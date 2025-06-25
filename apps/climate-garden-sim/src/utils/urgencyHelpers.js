/**
 * Urgency System Utilities
 * Provides consistent urgency calculation and styling across components
 */

/**
 * Calculate urgency level based on days until deadline
 * @param {number} daysUntil - Days until the deadline
 * @returns {string} urgency level: 'urgent', 'high', 'medium', 'low'
 */
export const getUrgencyLevel = (daysUntil) => {
  if (daysUntil < 0) return 'urgent'; // Overdue
  if (daysUntil <= 7) return 'urgent'; // Within a week
  if (daysUntil <= 14) return 'high'; // Within two weeks
  if (daysUntil <= 30) return 'medium'; // Within a month
  return 'low'; // More than a month
};

/**
 * Get urgency classes for components
 * @param {number} daysUntil - Days until deadline
 * @returns {object} CSS classes and styling info
 */
export const getUrgencyClasses = (daysUntil) => {
  const level = getUrgencyLevel(daysUntil);
  return {
    level,
    cardClass: `urgency-${level}`,
    badgeClass: `urgency-badge ${level}`,
    indicatorClass: `timing-indicator ${level}`,
    daysClass: `days-remaining ${level}`,
    alertClass: `alert-${level}`
  };
};

/**
 * Get urgency text and icon
 * @param {number} daysUntil - Days until deadline
 * @returns {object} Display text and icon
 */
export const getUrgencyDisplay = (daysUntil) => {
  const level = getUrgencyLevel(daysUntil);
  
  const displays = {
    urgent: {
      icon: '🔴',
      text: daysUntil < 0 ? 'OVERDUE' : 'URGENT',
      shortText: daysUntil < 0 ? 'LATE' : `${daysUntil}d`,
      description: daysUntil < 0 ? 'Action overdue' : 'Act within 7 days'
    },
    high: {
      icon: '🟠',
      text: 'HIGH',
      shortText: `${daysUntil}d`,
      description: 'Act within 2 weeks'
    },
    medium: {
      icon: '🟡',
      text: 'MEDIUM',
      shortText: `${daysUntil}d`,
      description: 'Act within 30 days'
    },
    low: {
      icon: '🟢',
      text: 'LOW',
      shortText: `${daysUntil}d`,
      description: 'Plan ahead'
    }
  };
  
  return displays[level];
};

/**
 * Sort items by urgency level (most urgent first)
 * @param {Array} items - Array of items with daysUntilPlanting or similar property
 * @param {string} daysProperty - Property name containing days until deadline
 * @returns {Array} Sorted items
 */
export const sortByUrgency = (items, daysProperty = 'daysUntilPlanting') => {
  return items.sort((a, b) => {
    const daysA = a[daysProperty] || 999;
    const daysB = b[daysProperty] || 999;
    return daysA - daysB; // Ascending order (fewer days = more urgent)
  });
};

/**
 * Filter items by urgency level
 * @param {Array} items - Array of items
 * @param {string} urgencyLevel - Target urgency level
 * @param {string} daysProperty - Property containing days until deadline
 * @returns {Array} Filtered items
 */
export const filterByUrgency = (items, urgencyLevel, daysProperty = 'daysUntilPlanting') => {
  return items.filter(item => {
    const days = item[daysProperty] || 999;
    return getUrgencyLevel(days) === urgencyLevel;
  });
};

/**
 * Get the most urgent items (urgent and high priority only)
 * @param {Array} items - Array of items
 * @param {number} limit - Maximum number of items to return
 * @param {string} daysProperty - Property containing days until deadline
 * @returns {Array} Most urgent items
 */
export const getMostUrgent = (items, limit = 5, daysProperty = 'daysUntilPlanting') => {
  const urgent = filterByUrgency(items, 'urgent', daysProperty);
  const high = filterByUrgency(items, 'high', daysProperty);
  
  return sortByUrgency([...urgent, ...high], daysProperty).slice(0, limit);
};

/**
 * Add urgency styling to an item object
 * @param {object} item - Item to enhance
 * @param {string} daysProperty - Property containing days until deadline
 * @returns {object} Item with urgency properties added
 */
export const addUrgencyInfo = (item, daysProperty = 'daysUntilPlanting') => {
  const days = item[daysProperty] || 999;
  const urgency = getUrgencyClasses(days);
  const display = getUrgencyDisplay(days);
  
  return {
    ...item,
    urgency: urgency.level,
    urgencyClasses: urgency,
    urgencyDisplay: display,
    daysUntil: days
  };
};