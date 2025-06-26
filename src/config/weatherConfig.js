/**
 * Weather API Configuration
 * Centralized configuration for weather data services
 */

export const WEATHER_CONFIG = {
  // NOAA Climate Data Online API
  // Free tier: 10,000 requests/day
  // Register at: https://www.ncdc.noaa.gov/cdo-web/token
  NOAA_CDO_TOKEN: process.env.REACT_APP_NOAA_CDO_TOKEN || '',
  NOAA_BASE_URL: 'https://www.ncei.noaa.gov/cdo-web/api/v2',
  
  // Weather.gov API (FREE, no signup required, US only)
  // No API key needed, just enable with flag
  USE_WEATHER_GOV: process.env.REACT_APP_USE_WEATHER_GOV === 'true',
  WEATHER_GOV_BASE_URL: 'https://api.weather.gov',
  
  // WeatherAPI (Free tier: 1M calls/month, no billing info required)
  // Register at: https://www.weatherapi.com/signup.aspx
  WEATHER_API_KEY: process.env.REACT_APP_WEATHER_API_KEY || '',
  WEATHER_API_BASE_URL: 'https://api.weatherapi.com/v1',
  
  // OpenWeatherMap API  
  // Free tier: 1,000 calls/day, 60 calls/minute (requires billing info)
  // Register at: https://openweathermap.org/api
  OPENWEATHER_API_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY || '',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // OpenWeather Agro API (Optional)
  // Agricultural weather data including soil temperature, GDD
  // Paid service: ~$50/month
  OPENWEATHER_AGRO_API_KEY: process.env.REACT_APP_OPENWEATHER_AGRO_API_KEY || '',
  OPENWEATHER_AGRO_BASE_URL: 'https://api.openweathermap.org/agro/1.0',
  
  // Rate limiting and caching settings
  RATE_LIMITS: {
    NOAA: { dailyLimit: 10000, requestsPerSecond: 5 },
    WEATHER_GOV: { requestsPerSecond: 10 }, // No hard limit, but be reasonable
    WEATHER_API: { monthlyLimit: 1000000, requestsPerSecond: 10 },
    OPENWEATHER: { dailyLimit: 1000, requestsPerMinute: 60 },
    AGRO: { dailyLimit: 1000, requestsPerMinute: 60 }
  },
  
  CACHE_DURATIONS: {
    HISTORICAL_DATA: 7 * 24 * 60 * 60 * 1000, // 7 days
    CURRENT_WEATHER: 10 * 60 * 1000, // 10 minutes
    FORECAST_DATA: 3 * 60 * 60 * 1000, // 3 hours
    CLIMATE_NORMALS: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  
  // Default parameters for agricultural calculations
  AGRICULTURAL_PARAMS: {
    // Growing degree day base temperatures for common crops
    GDD_BASE_TEMPS: {
      cool_season: 40, // lettuce, peas, spinach
      warm_season: 50, // tomatoes, peppers, corn
      hot_season: 60   // melons, okra, sweet potato
    },
    
    // Frost temperature thresholds
    FROST_THRESHOLDS: {
      killing_frost: 28, // Hard freeze
      light_frost: 32,   // Light freeze
      growing_threshold: 50 // Minimum for active growth
    },
    
    // Soil temperature depths for monitoring
    SOIL_DEPTHS: ['10cm', '20cm', '50cm', '100cm'],
    
    // Climate data quality thresholds
    MIN_YEARS_HISTORICAL: 10,
    MAX_STATION_DISTANCE: 50, // miles
    MIN_DATA_COMPLETENESS: 0.8 // 80% data availability required
  },
  
  // Fallback data for when APIs are unavailable
  FALLBACK_ENABLED: true,
  
  // Development/testing settings
  MOCK_RESPONSES: process.env.NODE_ENV === 'test',
  DEBUG_WEATHER: process.env.NODE_ENV === 'development'
};

// API Key validation
export const validateWeatherConfig = () => {
  const warnings = [];
  
  if (!WEATHER_CONFIG.NOAA_CDO_TOKEN) {
    warnings.push('NOAA CDO API token not configured - historical climate data will be limited');
  }
  
  // Check for any current weather API
  const hasCurrentWeather = !!(
    WEATHER_CONFIG.USE_WEATHER_GOV ||
    WEATHER_CONFIG.WEATHER_API_KEY ||
    WEATHER_CONFIG.OPENWEATHER_API_KEY
  );
  
  if (!hasCurrentWeather) {
    warnings.push('No current weather API configured - real-time conditions unavailable');
  }
  
  if (!WEATHER_CONFIG.OPENWEATHER_AGRO_API_KEY) {
    warnings.push('OpenWeather Agro API key not configured - advanced agricultural metrics unavailable');
  }
  
  if (warnings.length > 0 && WEATHER_CONFIG.DEBUG_WEATHER) {
    console.warn('Weather API Configuration Issues:', warnings);
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    hasBasicWeather: hasCurrentWeather,
    hasHistoricalData: !!WEATHER_CONFIG.NOAA_CDO_TOKEN,
    hasAgriculturalData: !!WEATHER_CONFIG.OPENWEATHER_AGRO_API_KEY,
    hasWeatherGov: !!WEATHER_CONFIG.USE_WEATHER_GOV,
    hasWeatherAPI: !!WEATHER_CONFIG.WEATHER_API_KEY,
    hasOpenWeather: !!WEATHER_CONFIG.OPENWEATHER_API_KEY
  };
};

// Climate zone mappings for weather data interpretation
export const CLIMATE_ZONES = {
  '3a': { minTemp: -40, growingDays: 100 },
  '3b': { minTemp: -35, growingDays: 120 },
  '4a': { minTemp: -30, growingDays: 140 },
  '4b': { minTemp: -25, growingDays: 160 },
  '5a': { minTemp: -20, growingDays: 180 },
  '5b': { minTemp: -15, growingDays: 200 },
  '6a': { minTemp: -10, growingDays: 220 },
  '6b': { minTemp: -5, growingDays: 240 },
  '7a': { minTemp: 0, growingDays: 260 },
  '7b': { minTemp: 5, growingDays: 280 },
  '8a': { minTemp: 10, growingDays: 300 },
  '8b': { minTemp: 15, growingDays: 320 },
  '9a': { minTemp: 20, growingDays: 340 },
  '9b': { minTemp: 25, growingDays: 360 },
  '10a': { minTemp: 30, growingDays: 365 },
  '10b': { minTemp: 35, growingDays: 365 },
  '11': { minTemp: 40, growingDays: 365 }
};

// Weather data quality indicators
export const DATA_QUALITY_LEVELS = {
  HIGH: 'high',      // Current/recent data from nearby stations
  MEDIUM: 'medium',  // Historical averages or distant stations  
  LOW: 'low',        // Estimated/interpolated data
  FALLBACK: 'fallback' // Default values when no data available
};

export default WEATHER_CONFIG;