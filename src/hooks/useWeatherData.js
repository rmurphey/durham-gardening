/**
 * useWeatherData Hook
 * Custom React hook for managing weather data state and API interactions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { weatherDataService } from '../services/weatherDataService.js';
import { validateWeatherConfig } from '../config/weatherConfig.js';

export const useWeatherData = (locationConfig, options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 10 * 60 * 1000, // 10 minutes
    enableForecast = true,
    enableHistorical = true,
    enableGDD = true,
    enableFrostDates = true
  } = options;

  const [weatherState, setWeatherState] = useState({
    current: null,
    forecast: [],
    historical: null,
    frostDates: null,
    gddData: null,
    loading: false,
    errors: [],
    lastUpdated: null,
    dataQuality: null
  });

  const [config, setConfig] = useState(null);
  const refreshTimer = useRef(null);
  const abortController = useRef(null);

  // Initialize weather configuration
  useEffect(() => {
    const weatherConfig = validateWeatherConfig();
    setConfig(weatherConfig);
  }, []);

  // Abort ongoing requests when component unmounts or location changes
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [locationConfig]);

  const fetchWeatherData = useCallback(async (forceFresh = false) => {
    if (!locationConfig?.lat || !locationConfig?.lon || !config) {
      return;
    }

    // Abort any ongoing requests
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setWeatherState(prev => ({ 
      ...prev, 
      loading: true, 
      errors: forceFresh ? [] : prev.errors 
    }));

    try {
      const promises = [];
      const dataTypes = [];
      
      // Current weather
      if (config.hasBasicWeather) {
        promises.push(weatherDataService.getCurrentWeather(locationConfig.lat, locationConfig.lon));
        dataTypes.push('current');
      }
      
      // Forecast
      if (enableForecast && config.hasBasicWeather) {
        promises.push(weatherDataService.getWeatherForecast(locationConfig.lat, locationConfig.lon, 7));
        dataTypes.push('forecast');
      }
      
      // Historical data
      if (enableHistorical && config.hasHistoricalData) {
        promises.push(weatherDataService.getHistoricalClimate(locationConfig.lat, locationConfig.lon, 30));
        dataTypes.push('historical');
      }
      
      // Frost dates
      if (enableFrostDates) {
        promises.push(weatherDataService.calculateFrostDates(locationConfig.lat, locationConfig.lon));
        dataTypes.push('frostDates');
      }
      
      // Growing degree days
      if (enableGDD) {
        promises.push(weatherDataService.getGrowingDegreeDays(locationConfig.lat, locationConfig.lon));
        dataTypes.push('gddData');
      }

      const results = await Promise.allSettled(promises);
      
      const newState = {
        loading: false,
        lastUpdated: new Date(),
        errors: []
      };

      // Process results
      results.forEach((result, index) => {
        const dataType = dataTypes[index];
        
        if (result.status === 'fulfilled') {
          newState[dataType] = result.value;
        } else {
          newState.errors.push(`${dataType}: ${result.reason.message}`);
          // Keep previous data if available
          newState[dataType] = weatherState[dataType];
        }
      });

      // Assess data quality
      newState.dataQuality = assessDataQuality(newState, config);

      setWeatherState(prev => ({ ...prev, ...newState }));

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Weather data fetch failed:', error);
        setWeatherState(prev => ({
          ...prev,
          loading: false,
          errors: [...prev.errors, `Fetch error: ${error.message}`]
        }));
      }
    }
  }, [locationConfig, config, enableForecast, enableHistorical, enableGDD, enableFrostDates, weatherState]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && config?.hasBasicWeather && locationConfig?.lat && locationConfig?.lon) {
      // Initial fetch
      fetchWeatherData(true);
      
      // Set up refresh timer
      refreshTimer.current = setInterval(() => {
        fetchWeatherData(false);
      }, refreshInterval);
      
      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchWeatherData, config, locationConfig]);

  // Manual refresh function
  const refreshWeatherData = useCallback(() => {
    return fetchWeatherData(true);
  }, [fetchWeatherData]);

  // Get specific weather metrics
  const getWeatherMetrics = useCallback(() => {
    const { current, forecast, gddData, frostDates } = weatherState;
    
    const metrics = {
      currentTemp: current?.temperature?.current || null,
      todayGDD: forecast[0]?.gdd || 0,
      weeklyGDDTotal: forecast.slice(0, 7).reduce((sum, day) => sum + (day.gdd || 0), 0),
      frostRisk: calculateFrostRisk(current, forecast),
      heatStress: calculateHeatStress(current, forecast),
      growingSeasonProgress: calculateSeasonProgress(gddData, frostDates),
      precipitationForecast: forecast.slice(0, 3).reduce((sum, day) => sum + (day.precipitation || 0), 0)
    };
    
    return metrics;
  }, [weatherState]);

  // Get planting recommendations based on weather
  const getPlantingRecommendations = useCallback((cropType = 'warm_season') => {
    getWeatherMetrics(); // Metrics available but not used in current implementation
    const { current, forecast, frostDates } = weatherState;
    
    const recommendations = {
      canPlant: false,
      warnings: [],
      suggestions: [],
      optimalWindow: null
    };

    // Frost safety check
    if (frostDates?.plantingSafeDate) {
      const safeDate = new Date(frostDates.plantingSafeDate);
      const now = new Date();
      
      if (now < safeDate) {
        recommendations.warnings.push(`Wait until ${safeDate.toLocaleDateString()} for frost safety`);
      } else {
        recommendations.canPlant = true;
      }
    }

    // Current temperature check
    if (current?.temperature?.current) {
      const temp = current.temperature.current;
      const cropTempRanges = {
        cool_season: { min: 35, max: 75 },
        warm_season: { min: 50, max: 85 },
        hot_season: { min: 60, max: 100 }
      };
      
      const range = cropTempRanges[cropType];
      if (temp < range.min) {
        recommendations.warnings.push('Too cold for optimal germination');
      } else if (temp > range.max) {
        recommendations.warnings.push('Too hot - consider waiting for cooler weather');
      }
    }

    // Forecast analysis
    if (forecast.length > 0) {
      const upcomingTemps = forecast.slice(0, 7).map(day => day.temperature.avg);
      const avgTemp = upcomingTemps.reduce((sum, temp) => sum + temp, 0) / upcomingTemps.length;
      
      if (avgTemp > 50 && avgTemp < 80) {
        recommendations.suggestions.push('Favorable temperature conditions for planting');
      }
      
      const upcomingRain = forecast.slice(0, 3).reduce((sum, day) => sum + (day.precipitation || 0), 0);
      if (upcomingRain > 1) {
        recommendations.suggestions.push('Good natural watering expected');
      } else if (upcomingRain < 0.1) {
        recommendations.suggestions.push('Plan for additional irrigation');
      }
    }

    return recommendations;
  }, [weatherState, getWeatherMetrics]);

  return {
    // Weather data
    ...weatherState,
    
    // Configuration
    config,
    
    // Actions
    refreshWeatherData,
    
    // Computed values
    getWeatherMetrics,
    getPlantingRecommendations,
    
    // Status indicators
    hasWeatherData: !!(weatherState.current || weatherState.forecast.length > 0),
    isStale: weatherState.lastUpdated && 
             (Date.now() - weatherState.lastUpdated.getTime()) > refreshInterval * 2
  };
};

// Helper functions
const assessDataQuality = (weatherState, config) => {
  let score = 0;
  let maxScore = 0;
  
  // Current weather quality
  maxScore += 25;
  if (weatherState.current && !weatherState.current.isEstimate) {
    score += 25;
  } else if (weatherState.current) {
    score += 10;
  }
  
  // Forecast quality
  maxScore += 25;
  if (weatherState.forecast.length >= 7) {
    score += 25;
  } else if (weatherState.forecast.length > 0) {
    score += 10;
  }
  
  // Historical data quality
  maxScore += 25;
  if (weatherState.historical && config.hasHistoricalData) {
    score += 25;
  }
  
  // GDD and frost data quality
  maxScore += 25;
  if (weatherState.gddData && weatherState.frostDates) {
    score += 25;
  } else if (weatherState.gddData || weatherState.frostDates) {
    score += 10;
  }
  
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 80) return 'high';
  if (percentage >= 60) return 'medium';
  if (percentage >= 40) return 'low';
  return 'poor';
};

const calculateFrostRisk = (current, forecast) => {
  if (!current && !forecast.length) return 'unknown';
  
  const today = current?.temperature?.min || forecast[0]?.temperature?.min;
  const upcoming = forecast.slice(0, 3).map(day => day.temperature.min);
  
  const minTemp = Math.min(today || 100, ...upcoming);
  
  if (minTemp <= 28) return 'high';
  if (minTemp <= 32) return 'moderate';
  if (minTemp <= 40) return 'low';
  return 'none';
};

const calculateHeatStress = (current, forecast) => {
  if (!current && !forecast.length) return 'unknown';
  
  const today = current?.temperature?.max || forecast[0]?.temperature?.max;
  const upcoming = forecast.slice(0, 3).map(day => day.temperature.max);
  
  const maxTemp = Math.max(today || 0, ...upcoming);
  
  if (maxTemp >= 100) return 'extreme';
  if (maxTemp >= 90) return 'high';
  if (maxTemp >= 80) return 'moderate';
  return 'low';
};

const calculateSeasonProgress = (gddData, frostDates) => {
  if (!gddData || !frostDates) return null;
  
  const yearToDate = gddData.yearToDate || 0;
  const expectedTotal = gddData.historical || 3000;
  
  return {
    percentage: Math.min((yearToDate / expectedTotal) * 100, 100),
    daysIntoSeason: frostDates.daysSinceLastFrost || 0,
    totalSeasonLength: frostDates.growingSeasonLength || 200
  };
};

export default useWeatherData;