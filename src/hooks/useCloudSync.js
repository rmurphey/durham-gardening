/**
 * useCloudSync Hook
 * React hook for managing cloud persistence with React Router integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cloudPersistence } from '../services/cloudPersistenceService.js';
import { isValidGardenId } from '../utils/gardenId.js';

/**
 * Hook for managing cloud-synchronized garden data with React Router
 * @returns {Object} Cloud sync state and functions
 */
const useCloudSync = () => {
  const { id: urlGardenId } = useParams();
  const navigate = useNavigate();
  
  const [gardenId, setGardenId] = useState(null);
  const [gardenData, setGardenData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Handle sync events from cloud persistence service
  const handleSyncEvent = useCallback((event) => {
    switch (event.type) {
      case 'sync_start':
        setIsSyncing(true);
        break;
      case 'sync_success':
        setIsSyncing(false);
        setLastSyncTime(event.timestamp || new Date().toISOString());
        setError(null);
        break;
      case 'sync_error':
        setIsSyncing(false);
        // Don't set error for load failures, only for save failures
        if (event.operation === 'save') {
          setError(`Failed to save: ${event.error}`);
        }
        break;
      default:
        break;
    }
  }, []);

  // Initialize cloud persistence and load garden data
  useEffect(() => {
    let isMounted = true;

    const initializeGarden = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Skip cloud sync in development to prevent hanging
        if (process.env.NODE_ENV === 'development') {
          setIsLoading(false);
          setGardenId(urlGardenId || 'dev-garden');
          return;
        }

        // Validate garden ID from URL if provided
        if (urlGardenId && !isValidGardenId(urlGardenId)) {
          setError('Invalid garden ID format');
          setIsLoading(false);
          return;
        }

        // Initialize cloud persistence
        const initializedId = await cloudPersistence.initialize(urlGardenId);
        
        if (!isMounted) return;

        setGardenId(initializedId);

        // If we generated a new ID (no URL ID provided), navigate to the new URL
        if (!urlGardenId && initializedId) {
          navigate(`/garden/${initializedId}`, { replace: true });
        }

        // Add sync listener
        cloudPersistence.addSyncListener(handleSyncEvent);

        // Try to load existing garden data from cloud
        try {
          const cloudData = await cloudPersistence.loadFromCloud();
          if (isMounted && cloudData) {
            setGardenData(cloudData);
          }
        } catch (loadError) {
          // Load errors are not critical - garden might be new
          console.log('No existing garden data found (this is okay for new gardens)');
        }

      } catch (initError) {
        if (isMounted) {
          setError(`Failed to initialize garden: ${initError.message}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeGarden();

    // Cleanup function
    return () => {
      isMounted = false;
      cloudPersistence.removeSyncListener(handleSyncEvent);
    };
  }, [urlGardenId, navigate, handleSyncEvent]);

  // Update sync status from cloud persistence service
  useEffect(() => {
    // Skip polling in development
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const updateSyncStatus = () => {
      setIsSyncing(cloudPersistence.isSyncing());
      setLastSyncTime(cloudPersistence.getLastSyncTime());
    };

    // Update immediately
    updateSyncStatus();

    // Set up periodic updates - reduced frequency
    const interval = setInterval(updateSyncStatus, 10000); // 10 seconds instead of 1

    return () => clearInterval(interval);
  }, []);

  // Save garden data to cloud
  const saveGardenData = useCallback(async (data) => {
    try {
      const success = await cloudPersistence.saveToCloud(data);
      if (success) {
        setGardenData(data);
      }
      return success;
    } catch (error) {
      setError(`Failed to save garden data: ${error.message}`);
      return false;
    }
  }, []);

  // Get shareable URL
  const shareableUrl = cloudPersistence.getShareableUrl();

  return {
    // State
    gardenId,
    gardenData,
    isLoading,
    error,
    isSyncing,
    lastSyncTime,
    shareableUrl,
    
    // Functions
    saveGardenData,
    
    // Utility functions
    clearError: useCallback(() => setError(null), [])
  };
};

export default useCloudSync;