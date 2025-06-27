/**
 * Crop Data Service - Provides unified access to crop data from database or static fallback
 * Replaces direct usage of GLOBAL_CROP_DATABASE throughout the application
 */

import { databaseService } from './databaseService.js';

class CropDataService {
  constructor() {
    this.cropData = null;
    this.isLoading = false;
    this.loadPromise = null;
  }

  /**
   * Get all crop data, loading from database on first call
   * @returns {Promise<Object>} Crop database organized by category
   */
  async getCropDatabase() {
    if (this.cropData) {
      return this.cropData;
    }

    if (this.isLoading) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadCropData();
    
    try {
      this.cropData = await this.loadPromise;
      return this.cropData;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load crop data from database with static fallback
   * @returns {Promise<Object>} Crop database
   */
  async loadCropData() {
    try {
      console.log('Loading crop data from database...');
      const cropData = await databaseService.getAllCropsFromDatabase();
      console.log('Successfully loaded crop data from database');
      return cropData;
    } catch (error) {
      console.error('Failed to load crop data from database, using static fallback:', error);
      // Fallback to static data
      const { GLOBAL_CROP_DATABASE } = await import('../config.js');
      return GLOBAL_CROP_DATABASE;
    }
  }

  /**
   * Get crops by category
   * @param {string} category - Category: heatTolerant, coolSeason, perennials
   * @returns {Promise<Object>} Crops in the specified category
   */
  async getCropsByCategory(category) {
    const cropDb = await this.getCropDatabase();
    return cropDb[category] || {};
  }

  /**
   * Get a specific crop by key
   * @param {string} cropKey - Crop identifier
   * @returns {Promise<Object|null>} Crop data or null if not found
   */
  async getCrop(cropKey) {
    const cropDb = await this.getCropDatabase();
    
    // Search across all categories
    for (const category of ['heatTolerant', 'coolSeason', 'perennials']) {
      if (cropDb[category] && cropDb[category][cropKey]) {
        return {
          ...cropDb[category][cropKey],
          category,
          plantKey: cropKey
        };
      }
    }
    
    return null;
  }

  /**
   * Get all crop keys
   * @returns {Promise<Array<string>>} Array of all crop keys
   */
  async getAllCropKeys() {
    const cropDb = await this.getCropDatabase();
    const keys = [];
    
    for (const category of ['heatTolerant', 'coolSeason', 'perennials']) {
      if (cropDb[category]) {
        keys.push(...Object.keys(cropDb[category]));
      }
    }
    
    return keys;
  }

  /**
   * Filter crops by hardiness zone
   * @param {string} hardinessZone - USDA hardiness zone (e.g., '7b')
   * @returns {Promise<Object>} Filtered crop database
   */
  async getCropsByZone(hardinessZone) {
    const cropDb = await this.getCropDatabase();
    const zoneNumber = parseFloat(hardinessZone.replace(/[ab]/, ''));
    const filtered = {
      heatTolerant: {},
      coolSeason: {},
      perennials: {}
    };

    for (const [category, crops] of Object.entries(cropDb)) {
      for (const [cropKey, crop] of Object.entries(crops)) {
        if (this.isCropSuitableForZone(crop, zoneNumber)) {
          filtered[category][cropKey] = crop;
        }
      }
    }

    return filtered;
  }

  /**
   * Check if crop is suitable for hardiness zone
   * @param {Object} crop - Crop data
   * @param {number} zoneNumber - Numeric zone value
   * @returns {boolean} True if suitable
   */
  isCropSuitableForZone(crop, zoneNumber) {
    if (!crop.zones) return true;
    
    const [minZone, maxZone] = crop.zones.split('-').map(z => parseFloat(z));
    return zoneNumber >= minZone && zoneNumber <= maxZone;
  }

  /**
   * Check if crop planting season is valid for current month
   * @param {Object} crop - Crop data
   * @param {number} month - Month number (1-12)
   * @param {string} region - Region type (temperate, tropical, subtropical)
   * @returns {boolean} True if valid planting season
   */
  isPlantingSeasonValid(crop, month, region = 'temperate') {
    if (!crop.plantingMonths) return false;
    
    let plantingMonths = crop.plantingMonths[region];
    
    // Handle JSON string format from database
    if (typeof plantingMonths === 'string') {
      try {
        plantingMonths = JSON.parse(plantingMonths);
      } catch (e) {
        console.warn(`Failed to parse planting months for crop:`, crop, e);
        return false;
      }
    }
    
    return Array.isArray(plantingMonths) && plantingMonths.includes(month);
  }

  /**
   * Reset cached data (useful for testing or data refresh)
   */
  reset() {
    this.cropData = null;
    this.isLoading = false;
    this.loadPromise = null;
  }
}

// Export singleton instance
export const cropDataService = new CropDataService();
export default cropDataService;