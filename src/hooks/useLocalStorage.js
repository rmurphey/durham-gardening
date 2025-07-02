/**
 * Generic localStorage hook with error handling and validation
 * Provides reactive localStorage state management
 */

import { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../services/storageService.js';

/**
 * Hook for managing localStorage state with React
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found in storage
 * @param {Function} validator - Optional validation function
 * @returns {[value, setValue, clearValue]} - State management tuple
 */
export const useLocalStorage = (key, defaultValue, validator = null) => {
  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState(() => {
    const stored = getStorageItem(key, defaultValue);
    
    // Apply validation if provided
    if (validator && !validator(stored)) {
      console.warn(`Invalid stored value for key "${key}", using default`);
      return defaultValue;
    }
    
    return stored;
  });

  // Setter that updates both state and localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function for functional updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Apply validation if provided
      if (validator && !validator(valueToStore)) {
        console.warn(`Invalid value for key "${key}", not storing`);
        return false;
      }
      
      setStoredValue(valueToStore);
      return setStorageItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  };

  // Clear function
  const clearValue = () => {
    setStoredValue(defaultValue);
    return setStorageItem(key, defaultValue);
  };

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          if (!validator || validator(newValue)) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, validator]);

  return [storedValue, setValue, clearValue];
};

/**
 * Specialized hook for climate selection state
 * @returns {Object} Climate selection state and setters
 */
export const useClimateSelection = () => {
  const [selection, setSelection] = useLocalStorage('gardenSim_climateSelection', {
    selectedSummer: 'extreme',
    selectedWinter: 'warm',
    selectedPortfolio: 'hedge'
  });

  const setSelectedSummer = (summer) => {
    setSelection(prev => ({ ...prev, selectedSummer: summer }));
  };

  const setSelectedWinter = (winter) => {
    setSelection(prev => ({ ...prev, selectedWinter: winter }));
  };

  const setSelectedPortfolio = (portfolio) => {
    setSelection(prev => ({ ...prev, selectedPortfolio: portfolio }));
  };

  return {
    selectedSummer: selection.selectedSummer,
    selectedWinter: selection.selectedWinter,
    selectedPortfolio: selection.selectedPortfolio,
    setSelectedSummer,
    setSelectedWinter,
    setSelectedPortfolio
  };
};

/**
 * Specialized hook for location configuration
 * @returns {[locationConfig, setLocationConfig]} Location state management
 */
export const useLocationConfig = () => {
  const defaultConfig = {
    name: null, // Force users to configure their garden location
    hardiness: null,
    lat: null,
    lon: null,
    avgRainfall: 40,
    heatDays: 90,
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

  return useLocalStorage('gardenSim_locationConfig', defaultConfig);
};

/**
 * Specialized hook for investment configuration
 * @returns {[investmentConfig, setInvestmentConfig]} Investment state management
 */
export const useInvestmentConfig = () => {
  const defaultConfig = {
    seeds: 75,
    infrastructure: 110,
    tools: 45,
    soil: 35,
    containers: 60,
    irrigation: 85,
    protection: 25,
    fertilizer: 30
  };

  return useLocalStorage('gardenSim_investmentConfig', defaultConfig);
};

/**
 * Specialized hook for UI preferences
 * @returns {[uiPrefs, setUIPrefs]} UI preferences state management
 */
export const useUIPreferences = () => {
  const defaultPrefs = {
    showSetup: true,
    recommendationDismissed: false
  };

  const [prefs, setPrefs] = useLocalStorage('gardenSim_uiPreferences', defaultPrefs);

  const setShowSetup = (show) => {
    setPrefs(prev => ({ ...prev, showSetup: show }));
  };

  const setRecommendationDismissed = (dismissed) => {
    setPrefs(prev => ({ ...prev, recommendationDismissed: dismissed }));
  };

  return {
    showSetup: prefs.showSetup,
    recommendationDismissed: prefs.recommendationDismissed,
    setShowSetup,
    setRecommendationDismissed
  };
};