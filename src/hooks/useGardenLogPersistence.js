/**
 * Garden Log Persistence Hook
 * Manages garden log persistence to localStorage and garden API
 */

import { useState, useEffect } from 'react';
import { createEmptyGardenLog } from '../services/gardenLog.js';

const GARDEN_LOG_STORAGE_KEY = 'gardenSim_gardenLog';

/**
 * Hook for managing garden log with localStorage persistence
 */
export const useGardenLogPersistence = (gardenId = null) => {
  const [gardenLog, setGardenLog] = useState(() => {
    // Try to load from localStorage on init
    try {
      const saved = localStorage.getItem(GARDEN_LOG_STORAGE_KEY);
      return saved ? JSON.parse(saved) : createEmptyGardenLog();
    } catch (error) {
      console.warn('Failed to load garden log from localStorage:', error);
      return createEmptyGardenLog();
    }
  });

  // Save to localStorage whenever garden log changes
  useEffect(() => {
    try {
      localStorage.setItem(GARDEN_LOG_STORAGE_KEY, JSON.stringify(gardenLog));
    } catch (error) {
      console.warn('Failed to save garden log to localStorage:', error);
    }
  }, [gardenLog]);

  // If we have a garden ID, we should sync with the garden API
  // For now, just use localStorage persistence
  // TODO: Integrate with garden sharing API for shared gardens

  const updateGardenLog = (updater) => {
    if (typeof updater === 'function') {
      setGardenLog(updater);
    } else {
      setGardenLog(updater);
    }
  };

  const resetGardenLog = () => {
    setGardenLog(createEmptyGardenLog());
  };

  return {
    gardenLog,
    setGardenLog: updateGardenLog,
    resetGardenLog
  };
};