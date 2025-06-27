/**
 * Cloud Persistence Service
 * Handles synchronization between localStorage and Vercel KV storage
 */

import { generateGardenId, isValidGardenId, createShareableUrl } from '../utils/gardenId.js';

/**
 * CloudPersistenceService - manages garden data persistence across devices
 */
export class CloudPersistenceService {
  constructor() {
    this.gardenId = null;
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.syncListeners = new Set();
  }

  /**
   * Initialize the service with a garden ID
   * @param {string} gardenId - Existing garden ID or null to create new
   * @returns {Promise<string>} The garden ID being used
   */
  async initialize(gardenId = null) {
    // Use provided ID or generate new one
    this.gardenId = gardenId || generateGardenId();
    
    if (!isValidGardenId(this.gardenId)) {
      this.gardenId = generateGardenId();
    }
    
    // Store current garden ID in localStorage for future sessions
    try {
      localStorage.setItem('currentGardenId', this.gardenId);
    } catch (error) {
      // localStorage might not be available
    }
    
    return this.gardenId;
  }

  /**
   * Get the current garden ID
   * @returns {string|null} Current garden ID
   */
  getGardenId() {
    return this.gardenId;
  }

  /**
   * Save garden data to cloud storage
   * @param {Object} gardenData - Garden configuration and state data
   * @returns {Promise<boolean>} Success status
   */
  async saveToCloud(gardenData) {
    if (!this.gardenId) {
      await this.initialize();
    }

    try {
      this.syncInProgress = true;
      this.notifySyncListeners({ type: 'sync_start', operation: 'save' });

      const response = await fetch(`/api/garden/${this.gardenId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gardenData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      await response.json(); // Result not used currently
      this.lastSyncTime = new Date().toISOString();
      
      this.notifySyncListeners({ 
        type: 'sync_success', 
        operation: 'save',
        timestamp: this.lastSyncTime
      });

      return true;

    } catch (error) {
      console.error('Failed to save to cloud:', error);
      this.notifySyncListeners({ 
        type: 'sync_error', 
        operation: 'save',
        error: error.message
      });
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Load garden data from cloud storage
   * @returns {Promise<Object|null>} Garden data or null if not found
   */
  async loadFromCloud() {
    if (!this.gardenId) {
      return null;
    }

    try {
      this.syncInProgress = true;
      this.notifySyncListeners({ type: 'sync_start', operation: 'load' });

      const response = await fetch(`/api/garden/${this.gardenId}`);

      if (response.status === 404) {
        // Garden not found - this is okay for new gardens
        this.notifySyncListeners({ type: 'sync_success', operation: 'load', found: false });
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const gardenData = await response.json();
      this.lastSyncTime = new Date().toISOString();
      
      this.notifySyncListeners({ 
        type: 'sync_success', 
        operation: 'load',
        timestamp: this.lastSyncTime,
        found: true
      });

      return gardenData;

    } catch (error) {
      console.error('Failed to load from cloud:', error);
      this.notifySyncListeners({ 
        type: 'sync_error', 
        operation: 'load',
        error: error.message
      });
      return null;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Delete garden data from cloud storage
   * @returns {Promise<boolean>} Success status
   */
  async deleteFromCloud() {
    if (!this.gardenId) {
      return false;
    }

    try {
      const response = await fetch(`/api/garden/${this.gardenId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return true;

    } catch (error) {
      console.error('Failed to delete from cloud:', error);
      return false;
    }
  }

  /**
   * Check if sync is currently in progress
   * @returns {boolean} Sync status
   */
  isSyncing() {
    return this.syncInProgress;
  }

  /**
   * Get last sync timestamp
   * @returns {string|null} ISO timestamp of last sync
   */
  getLastSyncTime() {
    return this.lastSyncTime;
  }

  /**
   * Add a listener for sync events
   * @param {Function} listener - Event listener function
   */
  addSyncListener(listener) {
    this.syncListeners.add(listener);
  }

  /**
   * Remove a sync event listener
   * @param {Function} listener - Event listener function
   */
  removeSyncListener(listener) {
    this.syncListeners.delete(listener);
  }

  /**
   * Notify all sync listeners of an event
   * @param {Object} event - Sync event data
   */
  notifySyncListeners(event) {
    this.syncListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }

  /**
   * Create a shareable URL for the current garden
   * @returns {string|null} Shareable URL
   */
  getShareableUrl() {
    if (!this.gardenId) {
      return null;
    }
    
    return createShareableUrl(this.gardenId);
  }
}

// Export singleton instance
export const cloudPersistence = new CloudPersistenceService();