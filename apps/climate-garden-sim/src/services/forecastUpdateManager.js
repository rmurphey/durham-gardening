/**
 * Forecast Update Manager for Durham Garden Planner
 * Handles scheduled, triggered, and real-time forecast updates for static hosting environments
 */

import { forecastingEngine } from './forecastingEngine.js';
import { databaseService } from './databaseService.js';

/**
 * Manages forecast updates with smart caching and update strategies
 * Designed for static hosting (Vercel/Netlify) with external API dependencies
 */
class ForecastUpdateManager {
  constructor() {
    this.updateIntervals = {
      weather: 6 * 60 * 60 * 1000, // 6 hours
      growth: 24 * 60 * 60 * 1000, // 24 hours  
      economic: 7 * 24 * 60 * 60 * 1000, // 7 days
      risk: 12 * 60 * 60 * 1000 // 12 hours
    };
    
    this.isUpdating = {
      weather: false,
      growth: false,
      economic: false,
      risk: false
    };
    
    this.lastUpdateTimes = this.loadLastUpdateTimes();
    this.updateCallbacks = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    
    // Initialize update scheduling
    this.initializeUpdateScheduling();
  }

  /**
   * Initialize automatic update scheduling for different forecast types
   */
  initializeUpdateScheduling() {
    // Weather updates - most frequent due to changing conditions
    this.schedulePeriodicUpdate('weather', this.updateIntervals.weather);
    
    // Growth forecasts - daily updates to track plant development
    this.schedulePeriodicUpdate('growth', this.updateIntervals.growth);
    
    // Economic forecasts - weekly updates for market trends
    this.schedulePeriodicUpdate('economic', this.updateIntervals.economic);
    
    // Risk assessments - twice daily for changing conditions
    this.schedulePeriodicUpdate('risk', this.updateIntervals.risk);
    
    // Page visibility updates - refresh when user returns to tab
    this.setupVisibilityChangeUpdates();
    
    // Connection status updates - refresh when coming back online
    this.setupConnectionStatusUpdates();
    
    console.log('Forecast update scheduling initialized');
  }

  /**
   * Schedule periodic updates for a specific forecast type
   * @param {string} forecastType - Type of forecast to update
   * @param {number} interval - Update interval in milliseconds
   */
  schedulePeriodicUpdate(forecastType, interval) {
    // Check if update is needed immediately
    if (this.isUpdateNeeded(forecastType)) {
      this.triggerUpdate(forecastType, 'initialization');
    }
    
    // Schedule periodic updates
    setInterval(() => {
      if (this.isUpdateNeeded(forecastType) && !this.isUpdating[forecastType]) {
        this.triggerUpdate(forecastType, 'scheduled');
      }
    }, Math.min(interval, 30 * 60 * 1000)); // Check at least every 30 minutes
  }

  /**
   * Setup updates when page becomes visible (user returns to tab)
   */
  setupVisibilityChangeUpdates() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // User returned to tab - check for stale forecasts
          this.checkForStaleForecasts('visibility_change');
        }
      });
    }
  }

  /**
   * Setup updates when connection is restored
   */
  setupConnectionStatusUpdates() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Connection restored - checking for pending updates');
        this.checkForStaleForecasts('connection_restored');
      });
    }
  }

  /**
   * Check if an update is needed for a specific forecast type
   * @param {string} forecastType - Type of forecast to check
   * @returns {boolean} Whether update is needed
   */
  isUpdateNeeded(forecastType) {
    const lastUpdate = this.lastUpdateTimes[forecastType];
    if (!lastUpdate) return true;
    
    const timeSinceUpdate = Date.now() - lastUpdate;
    const updateInterval = this.updateIntervals[forecastType];
    
    return timeSinceUpdate >= updateInterval;
  }

  /**
   * Check for stale forecasts and trigger updates as needed
   * @param {string} trigger - What triggered this check
   */
  async checkForStaleForecasts(trigger) {
    console.log(`Checking for stale forecasts (trigger: ${trigger})`);
    
    const forecastTypes = Object.keys(this.updateIntervals);
    const staleForecasts = forecastTypes.filter(type => 
      this.isUpdateNeeded(type) && !this.isUpdating[type]
    );
    
    if (staleForecasts.length === 0) {
      console.log('All forecasts are current');
      return;
    }
    
    console.log(`Found ${staleForecasts.length} stale forecasts:`, staleForecasts);
    
    // Update stale forecasts in priority order
    const priorityOrder = ['weather', 'risk', 'growth', 'economic'];
    const sortedStale = staleForecasts.sort((a, b) => 
      priorityOrder.indexOf(a) - priorityOrder.indexOf(b)
    );
    
    for (const forecastType of sortedStale) {
      await this.triggerUpdate(forecastType, trigger);
      // Small delay between updates to avoid API rate limits
      await this.delay(1000);
    }
  }

  /**
   * Trigger a forecast update
   * @param {string} forecastType - Type of forecast to update
   * @param {string} trigger - What triggered this update
   * @param {Object} options - Update options
   */
  async triggerUpdate(forecastType, trigger, options = {}) {
    if (this.isUpdating[forecastType]) {
      console.log(`${forecastType} forecast update already in progress`);
      return;
    }
    
    console.log(`Triggering ${forecastType} forecast update (${trigger})`);
    this.isUpdating[forecastType] = true;
    
    try {
      const updateResult = await this.performForecastUpdate(forecastType, options);
      
      if (updateResult.success) {
        this.lastUpdateTimes[forecastType] = Date.now();
        this.saveLastUpdateTimes();
        this.retryAttempts.delete(forecastType);
        
        // Notify subscribers of successful update
        this.notifyUpdateCallbacks(forecastType, {
          success: true,
          trigger,
          timestamp: Date.now(),
          data: updateResult.data
        });
        
        console.log(`${forecastType} forecast updated successfully`);
      } else {
        throw new Error(updateResult.error || 'Update failed');
      }
      
    } catch (error) {
      console.error(`Error updating ${forecastType} forecast:`, error);
      
      // Handle retry logic
      const retryCount = this.retryAttempts.get(forecastType) || 0;
      if (retryCount < this.maxRetries) {
        this.retryAttempts.set(forecastType, retryCount + 1);
        
        // Exponential backoff for retries
        const retryDelay = Math.pow(2, retryCount) * 5000; // 5s, 10s, 20s
        console.log(`Scheduling retry ${retryCount + 1}/${this.maxRetries} in ${retryDelay}ms`);
        
        setTimeout(() => {
          this.triggerUpdate(forecastType, `retry_${retryCount + 1}`, options);
        }, retryDelay);
      } else {
        console.error(`Max retries exceeded for ${forecastType} forecast`);
        this.retryAttempts.delete(forecastType);
        
        // Notify subscribers of failure
        this.notifyUpdateCallbacks(forecastType, {
          success: false,
          trigger,
          error: error.message,
          timestamp: Date.now()
        });
      }
    } finally {
      this.isUpdating[forecastType] = false;
    }
  }

  /**
   * Perform the actual forecast update
   * @param {string} forecastType - Type of forecast to update
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async performForecastUpdate(forecastType, options = {}) {
    const gardenConfig = this.getGardenConfig();
    const forecastDays = options.forecastDays || 90;
    
    try {
      switch (forecastType) {
        case 'weather':
          const weatherForecast = await forecastingEngine.generateWeatherForecast(
            gardenConfig.regionId || 1, 
            forecastDays
          );
          this.storeWeatherForecast(weatherForecast);
          return { success: true, data: weatherForecast };
          
        case 'growth':
          const growthForecasts = await forecastingEngine.generateGrowthForecasts(
            gardenConfig, 
            forecastDays
          );
          this.storeGrowthForecasts(growthForecasts);
          return { success: true, data: growthForecasts };
          
        case 'economic':
          const economicForecast = await forecastingEngine.generateEconomicForecast(
            gardenConfig.regionId || 1, 
            forecastDays
          );
          this.storeEconomicForecast(economicForecast);
          return { success: true, data: economicForecast };
          
        case 'risk':
          const riskAssessment = await forecastingEngine.generateRiskAssessment(
            gardenConfig.regionId || 1, 
            gardenConfig, 
            forecastDays
          );
          this.storeRiskAssessment(riskAssessment);
          return { success: true, data: riskAssessment };
          
        default:
          throw new Error(`Unknown forecast type: ${forecastType}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Register a callback for forecast updates
   * @param {string} forecastType - Type of forecast to listen for
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onForecastUpdate(forecastType, callback) {
    if (!this.updateCallbacks.has(forecastType)) {
      this.updateCallbacks.set(forecastType, new Set());
    }
    
    this.updateCallbacks.get(forecastType).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.updateCallbacks.get(forecastType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Notify all registered callbacks of an update
   * @param {string} forecastType - Type of forecast that was updated
   * @param {Object} updateInfo - Information about the update
   */
  notifyUpdateCallbacks(forecastType, updateInfo) {
    const callbacks = this.updateCallbacks.get(forecastType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(updateInfo);
        } catch (error) {
          console.error('Error in forecast update callback:', error);
        }
      });
    }
  }

  /**
   * Force immediate update of all forecast types
   * @param {string} trigger - What triggered this update
   */
  async forceUpdateAll(trigger = 'manual') {
    console.log(`Force updating all forecasts (${trigger})`);
    
    const forecastTypes = Object.keys(this.updateIntervals);
    const updatePromises = forecastTypes.map(type => 
      this.triggerUpdate(type, trigger, { force: true })
    );
    
    await Promise.allSettled(updatePromises);
    console.log('Force update completed');
  }

  /**
   * Get current garden configuration
   * @returns {Object} Garden configuration
   */
  getGardenConfig() {
    // In a real app, this would come from user settings/state
    return {
      regionId: 1, // Durham, NC
      gardenId: 1,
      beds: [
        { id: 1, name: '3×15 Bed', area: 45 },
        { id: 2, name: '4×8 Bed', area: 32 },
        { id: 3, name: '4×5 Bed', area: 20 }
      ],
      plantings: [], // Current plantings
      preferences: {
        riskTolerance: 'moderate',
        focusOnYield: true,
        organicOnly: true
      }
    };
  }

  /**
   * Store weather forecast in local storage with expiration
   * @param {Object} weatherForecast - Weather forecast data
   */
  storeWeatherForecast(weatherForecast) {
    const storageData = {
      data: weatherForecast,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.updateIntervals.weather
    };
    
    try {
      localStorage.setItem('garden_weather_forecast', JSON.stringify(storageData));
    } catch (error) {
      console.error('Error storing weather forecast:', error);
    }
  }

  /**
   * Store growth forecasts in local storage
   * @param {Object} growthForecasts - Growth forecast data
   */
  storeGrowthForecasts(growthForecasts) {
    const storageData = {
      data: growthForecasts,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.updateIntervals.growth
    };
    
    try {
      localStorage.setItem('garden_growth_forecasts', JSON.stringify(storageData));
    } catch (error) {
      console.error('Error storing growth forecasts:', error);
    }
  }

  /**
   * Store economic forecast in local storage
   * @param {Object} economicForecast - Economic forecast data
   */
  storeEconomicForecast(economicForecast) {
    const storageData = {
      data: economicForecast,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.updateIntervals.economic
    };
    
    try {
      localStorage.setItem('garden_economic_forecast', JSON.stringify(storageData));
    } catch (error) {
      console.error('Error storing economic forecast:', error);
    }
  }

  /**
   * Store risk assessment in local storage
   * @param {Object} riskAssessment - Risk assessment data
   */
  storeRiskAssessment(riskAssessment) {
    const storageData = {
      data: riskAssessment,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.updateIntervals.risk
    };
    
    try {
      localStorage.setItem('garden_risk_assessment', JSON.stringify(storageData));
    } catch (error) {
      console.error('Error storing risk assessment:', error);
    }
  }

  /**
   * Load cached forecast data
   * @param {string} forecastType - Type of forecast to load
   * @returns {Object|null} Cached forecast data or null if expired/missing
   */
  loadCachedForecast(forecastType) {
    const storageKey = `garden_${forecastType}_forecast`;
    
    try {
      const storedData = localStorage.getItem(storageKey);
      if (!storedData) return null;
      
      const parsed = JSON.parse(storedData);
      
      // Check if data has expired
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(storageKey);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error(`Error loading cached ${forecastType} forecast:`, error);
      return null;
    }
  }

  /**
   * Load last update times from localStorage
   * @returns {Object} Last update times for each forecast type
   */
  loadLastUpdateTimes() {
    try {
      const stored = localStorage.getItem('forecast_last_update_times');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading last update times:', error);
      return {};
    }
  }

  /**
   * Save last update times to localStorage
   */
  saveLastUpdateTimes() {
    try {
      localStorage.setItem('forecast_last_update_times', JSON.stringify(this.lastUpdateTimes));
    } catch (error) {
      console.error('Error saving last update times:', error);
    }
  }

  /**
   * Get status of all forecast types
   * @returns {Object} Status information for each forecast type
   */
  getForecastStatus() {
    const status = {};
    
    Object.keys(this.updateIntervals).forEach(type => {
      const lastUpdate = this.lastUpdateTimes[type];
      const isUpdating = this.isUpdating[type];
      const needsUpdate = this.isUpdateNeeded(type);
      const retryCount = this.retryAttempts.get(type) || 0;
      
      status[type] = {
        lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
        isUpdating,
        needsUpdate,
        retryCount,
        nextUpdateIn: lastUpdate ? 
          Math.max(0, (lastUpdate + this.updateIntervals[type]) - Date.now()) : 0
      };
    });
    
    return status;
  }

  /**
   * Utility function for delays
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources and stop all updates
   */
  destroy() {
    // Clear all intervals and event listeners
    // In a real implementation, you'd track interval IDs and remove event listeners
    console.log('Forecast update manager destroyed');
  }
}

// Export singleton instance
export const forecastUpdateManager = new ForecastUpdateManager();
export default forecastUpdateManager;