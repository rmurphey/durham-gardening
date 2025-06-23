/**
 * localStorage abstraction service with error handling and data validation
 * Provides consistent interface for persisting application state
 */

// Storage keys used by the application
export const STORAGE_KEYS = {
  CLIMATE_SELECTION: 'gardenSim_climateSelection',
  CUSTOM_PORTFOLIO: 'gardenSim_customPortfolio',
  UI_PREFERENCES: 'gardenSim_uiPreferences',
  LOCATION_CONFIG: 'gardenSim_locationConfig',
  INVESTMENT_CONFIG: 'gardenSim_investmentConfig'
};

/**
 * Safely get data from localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key not found or invalid
 * @returns {*} Parsed data or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored);
  } catch (error) {
    console.warn(`Failed to get storage item "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set data in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} True if successful, false otherwise
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set storage item "${key}":`, error);
    return false;
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key to remove
 * @returns {boolean} True if successful, false otherwise
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove storage item "${key}":`, error);
    return false;
  }
};

/**
 * Clear all application storage
 * @returns {boolean} True if successful, false otherwise
 */
export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.warn('Failed to clear all storage:', error);
    return false;
  }
};

/**
 * Get climate selection state from storage
 * @returns {Object} Climate selection state or defaults
 */
export const getClimateSelection = () => {
  return getStorageItem(STORAGE_KEYS.CLIMATE_SELECTION, {
    selectedSummer: 'extreme',
    selectedWinter: 'warm',
    selectedPortfolio: 'hedge'
  });
};

/**
 * Save climate selection state to storage
 * @param {Object} selection - Climate selection state
 * @returns {boolean} Success status
 */
export const setClimateSelection = (selection) => {
  return setStorageItem(STORAGE_KEYS.CLIMATE_SELECTION, selection);
};

/**
 * Get custom portfolio configuration from storage
 * @returns {Object|null} Custom portfolio or null
 */
export const getCustomPortfolio = () => {
  return getStorageItem(STORAGE_KEYS.CUSTOM_PORTFOLIO, null);
};

/**
 * Save custom portfolio configuration to storage
 * @param {Object} portfolio - Custom portfolio configuration
 * @returns {boolean} Success status
 */
export const setCustomPortfolio = (portfolio) => {
  return setStorageItem(STORAGE_KEYS.CUSTOM_PORTFOLIO, portfolio);
};

/**
 * Get UI preferences from storage
 * @returns {Object} UI preferences or defaults
 */
export const getUIPreferences = () => {
  return getStorageItem(STORAGE_KEYS.UI_PREFERENCES, {
    showSetup: true,
    recommendationDismissed: false
  });
};

/**
 * Save UI preferences to storage
 * @param {Object} preferences - UI preferences
 * @returns {boolean} Success status
 */
export const setUIPreferences = (preferences) => {
  return setStorageItem(STORAGE_KEYS.UI_PREFERENCES, preferences);
};

/**
 * Get location configuration from storage
 * @returns {Object} Location configuration or defaults
 */
export const getLocationConfig = () => {
  // Import default config to avoid circular dependency
  const defaultConfig = {
    name: 'Durham, NC',
    hardiness: '7b',
    lat: 35.994,
    lon: -78.8986,
    avgRainfall: 46,
    heatDays: 95,
    heatIntensity: 3,
    winterSeverity: 3,
    gardenSize: 2,
    investmentLevel: 3,
    marketMultiplier: 1.0,
    gardenSizeActual: 100,
    budget: 400,
    microclimate: {
      slope: 'flat',
      aspect: 'south',
      windExposure: 'moderate',
      soilDrainage: 'moderate',
      buildingHeat: 'minimal',
      canopyShade: 'partial',
      elevation: 'average',
      waterAccess: 'municipal',
      frostPocket: false,
      reflectiveHeat: 'minimal'
    }
  };

  const stored = getStorageItem(STORAGE_KEYS.LOCATION_CONFIG, {});
  return { ...defaultConfig, ...stored };
};

/**
 * Save location configuration to storage
 * @param {Object} config - Location configuration
 * @returns {boolean} Success status
 */
export const setLocationConfig = (config) => {
  return setStorageItem(STORAGE_KEYS.LOCATION_CONFIG, config);
};

/**
 * Get investment configuration from storage
 * @returns {Object} Investment configuration or defaults
 */
export const getInvestmentConfig = () => {
  return getStorageItem(STORAGE_KEYS.INVESTMENT_CONFIG, {
    seeds: 75,
    infrastructure: 110,
    tools: 45,
    soil: 35,
    containers: 60,
    irrigation: 85,
    protection: 25,
    fertilizer: 30
  });
};

/**
 * Save investment configuration to storage
 * @param {Object} config - Investment configuration
 * @returns {boolean} Success status
 */
export const setInvestmentConfig = (config) => {
  return setStorageItem(STORAGE_KEYS.INVESTMENT_CONFIG, config);
};

/**
 * Check if localStorage is available and working
 * @returns {boolean} True if localStorage is available
 */
export const isStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get storage usage information
 * @returns {Object} Storage usage statistics
 */
export const getStorageInfo = () => {
  const info = {
    available: isStorageAvailable(),
    keys: [],
    totalSize: 0
  };

  if (info.available) {
    Object.values(STORAGE_KEYS).forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        info.keys.push(key);
        info.totalSize += value.length;
      }
    });
  }

  return info;
};