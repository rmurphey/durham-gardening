/**
 * Enhanced Weather Integration for Durham Garden Planner
 * Integrates with multiple weather APIs while providing fallback to historical data
 * Designed for static hosting with user-provided API keys
 */

/**
 * Weather service that integrates multiple APIs with smart fallbacks
 */
class EnhancedWeatherIntegration {
  constructor() {
    this.apiProviders = {
      openweathermap: {
        name: 'OpenWeatherMap',
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        freeCallsPerDay: 1000,
        maxForecastDays: 5,
        supportedEndpoints: ['current', 'forecast', 'onecall']
      },
      weatherapi: {
        name: 'WeatherAPI',
        baseUrl: 'https://api.weatherapi.com/v1',
        freeCallsPerDay: 1000,
        maxForecastDays: 10,
        supportedEndpoints: ['current', 'forecast', 'history']
      },
      nws: {
        name: 'National Weather Service',
        baseUrl: 'https://api.weather.gov',
        freeCallsPerDay: 'unlimited',
        maxForecastDays: 7,
        supportedEndpoints: ['forecast', 'forecast/hourly'],
        requiresLocation: true
      }
    };
    
    this.durhamCoordinates = {
      lat: 35.9940,
      lon: -78.8986,
      nwsGridX: 63,
      nwsGridY: 67,
      nwsOffice: 'RAH'
    };
    
    this.fallbackData = this.loadHistoricalAverages();
    this.cache = new Map();
    this.rateLimiter = new Map();
  }

  /**
   * Get comprehensive weather forecast with multiple API fallbacks
   * @param {Object} options - Forecast options
   * @returns {Promise<Object>} Weather forecast data
   */
  async getComprehensiveForecast(options = {}) {
    const {
      days = 14,
      // includeHistorical = false, // Available for future historical analysis
      // includeAlerts = true, // Available for weather alerts integration
      userApiKeys = {},
      preferredProvider = 'auto'
    } = options;

    try {
      // Try to get data from preferred provider first
      if (preferredProvider !== 'auto' && userApiKeys[preferredProvider]) {
        const forecast = await this.getForecastFromProvider(
          preferredProvider, 
          userApiKeys[preferredProvider], 
          days
        );
        if (forecast) {
          return this.enrichForecastData(forecast, options);
        }
      }

      // Auto-select best available provider
      const availableProviders = this.getAvailableProviders(userApiKeys);
      
      for (const provider of availableProviders) {
        try {
          const forecast = await this.getForecastFromProvider(
            provider.name, 
            provider.apiKey, 
            Math.min(days, provider.maxDays)
          );
          
          if (forecast) {
            return this.enrichForecastData(forecast, options);
          }
        } catch (error) {
          console.warn(`Failed to get forecast from ${provider.name}:`, error.message);
          continue;
        }
      }

      // If all APIs fail, use historical averages
      console.log('All weather APIs failed, using historical averages');
      return this.generateFallbackForecast(days, options);

    } catch (error) {
      console.error('Error getting comprehensive forecast:', error);
      return this.generateFallbackForecast(days, options);
    }
  }

  /**
   * Get forecast from a specific weather provider
   * @param {string} provider - Provider name
   * @param {string} apiKey - API key (optional for Vercel Edge Function)
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Object|null>} Forecast data or null if failed
   */
  async getForecastFromProvider(provider, apiKey, days) {
    if (!this.checkRateLimit(provider)) {
      throw new Error(`Rate limit exceeded for ${provider}`);
    }

    const cacheKey = `${provider}_${days}_${new Date().toDateString()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let forecast = null;

    // Try Vercel Edge Function first (provides shared API keys and caching)
    if (this.isVercelDeployment()) {
      forecast = await this.getWeatherFromVercelAPI(provider, days);
      if (forecast) {
        this.cache.set(cacheKey, forecast);
        setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
        return forecast;
      }
    }

    // Fallback to direct API calls with user-provided keys
    switch (provider) {
      case 'openweathermap':
        if (apiKey) {
          forecast = await this.getOpenWeatherMapForecast(apiKey, days);
        }
        break;
      case 'weatherapi':
        if (apiKey) {
          forecast = await this.getWeatherAPIForecast(apiKey, days);
        }
        break;
      case 'nws':
        forecast = await this.getNWSForecast(days);
        break;
      default:
        throw new Error(`Unknown weather provider: ${provider}`);
    }

    if (forecast) {
      this.cache.set(cacheKey, forecast);
      // Cache for 1 hour
      setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
    }

    return forecast;
  }

  /**
   * Get weather data from Vercel Edge Function
   * @param {string} provider - Weather provider
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Object|null>} Weather data or null if failed
   */
  async getWeatherFromVercelAPI(provider, days) {
    try {
      const { lat, lon } = this.durhamCoordinates;
      const url = `/api/weather?provider=${provider}&lat=${lat}&lon=${lon}&days=${days}`;
      
      const response = await this.fetchWithRetry(url);
      
      if (response.error) {
        console.log('Vercel API returned error, falling back:', response.message);
        return null;
      }
      
      return this.normalizeVercelAPIResponse(response, provider);
    } catch (error) {
      console.log('Vercel Edge Function unavailable, using direct APIs:', error.message);
      return null;
    }
  }

  /**
   * Check if running on Vercel deployment
   * @returns {boolean} True if deployed on Vercel
   */
  isVercelDeployment() {
    return typeof window !== 'undefined' && 
           (window.location.hostname.includes('vercel.app') || 
            window.location.hostname.includes('.vercel.app') ||
            process.env.VERCEL === '1');
  }

  /**
   * Normalize Vercel Edge Function response
   * @param {Object} response - Vercel API response
   * @param {string} provider - Original provider name
   * @returns {Object} Normalized response
   */
  normalizeVercelAPIResponse(response, provider) {
    // The Vercel Edge Function returns pre-normalized data
    return {
      ...response,
      provider: `vercel_${provider}`,
      cached: response.cached || false,
      serverTimestamp: response.timestamp
    };
  }

  /**
   * Get forecast from OpenWeatherMap API
   * @param {string} apiKey - OpenWeatherMap API key
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Object>} Forecast data
   */
  async getOpenWeatherMapForecast(apiKey, days) {
    const { lat, lon } = this.durhamCoordinates;
    
    // For longer forecasts, use One Call API
    if (days > 5) {
      const url = `${this.apiProviders.openweathermap.baseUrl}/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&exclude=minutely`;
      const response = await this.fetchWithRetry(url);
      return this.normalizeOpenWeatherMapOneCall(response);
    } else {
      // Use 5-day forecast API
      const url = `${this.apiProviders.openweathermap.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
      const response = await this.fetchWithRetry(url);
      return this.normalizeOpenWeatherMapForecast(response);
    }
  }

  /**
   * Get forecast from WeatherAPI
   * @param {string} apiKey - WeatherAPI key
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Object>} Forecast data
   */
  async getWeatherAPIForecast(apiKey, days) {
    const { lat, lon } = this.durhamCoordinates;
    const location = `${lat},${lon}`;
    
    const url = `${this.apiProviders.weatherapi.baseUrl}/forecast.json?key=${apiKey}&q=${location}&days=${Math.min(days, 10)}&aqi=yes&alerts=yes`;
    const response = await this.fetchWithRetry(url);
    return this.normalizeWeatherAPIForecast(response);
  }

  /**
   * Get forecast from National Weather Service (free, no API key required)
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Object>} Forecast data
   */
  async getNWSForecast(days) {
    const { nwsOffice, nwsGridX, nwsGridY } = this.durhamCoordinates;
    
    // Get forecast
    const forecastUrl = `${this.apiProviders.nws.baseUrl}/gridpoints/${nwsOffice}/${nwsGridX},${nwsGridY}/forecast`;
    const forecast = await this.fetchWithRetry(forecastUrl);
    
    // Get hourly forecast for more detailed data
    const hourlyUrl = `${this.apiProviders.nws.baseUrl}/gridpoints/${nwsOffice}/${nwsGridX},${nwsGridY}/forecast/hourly`;
    const hourlyForecast = await this.fetchWithRetry(hourlyUrl);
    
    return this.normalizeNWSForecast(forecast, hourlyForecast, days);
  }

  /**
   * Normalize OpenWeatherMap One Call API response
   * @param {Object} data - API response
   * @returns {Object} Normalized forecast data
   */
  normalizeOpenWeatherMapOneCall(data) {
    const forecast = {
      provider: 'openweathermap',
      current: {
        temperature: data.current.temp,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_speed,
        description: data.current.weather[0].description,
        timestamp: new Date(data.current.dt * 1000).toISOString()
      },
      daily: data.daily.map(day => ({
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        tempHigh: day.temp.max,
        tempLow: day.temp.min,
        tempAvg: (day.temp.max + day.temp.min) / 2,
        humidity: day.humidity,
        precipitation: (day.rain?.['1h'] || 0) + (day.snow?.['1h'] || 0),
        precipitationProbability: Math.round(day.pop * 100),
        windSpeed: day.wind_speed,
        description: day.weather[0].description,
        sunrise: new Date(day.sunrise * 1000).toISOString(),
        sunset: new Date(day.sunset * 1000).toISOString()
      })),
      alerts: data.alerts || []
    };

    return forecast;
  }

  /**
   * Normalize OpenWeatherMap 5-day forecast response
   * @param {Object} data - API response
   * @returns {Object} Normalized forecast data
   */
  normalizeOpenWeatherMapForecast(data) {
    // Group 3-hour forecasts by day
    const dailyData = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          temperatures: [],
          humidity: [],
          precipitation: 0,
          descriptions: []
        };
      }
      
      dailyData[date].temperatures.push(item.main.temp);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].precipitation += (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0);
      dailyData[date].descriptions.push(item.weather[0].description);
    });

    const daily = Object.keys(dailyData).map(date => {
      const dayData = dailyData[date];
      return {
        date,
        tempHigh: Math.max(...dayData.temperatures),
        tempLow: Math.min(...dayData.temperatures),
        tempAvg: dayData.temperatures.reduce((a, b) => a + b, 0) / dayData.temperatures.length,
        humidity: Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length),
        precipitation: dayData.precipitation,
        description: dayData.descriptions[0] // Use first description of the day
      };
    });

    return {
      provider: 'openweathermap',
      daily,
      alerts: []
    };
  }

  /**
   * Normalize WeatherAPI response
   * @param {Object} data - API response
   * @returns {Object} Normalized forecast data
   */
  normalizeWeatherAPIForecast(data) {
    const forecast = {
      provider: 'weatherapi',
      current: {
        temperature: data.current.temp_f,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_mph,
        description: data.current.condition.text,
        timestamp: new Date().toISOString()
      },
      daily: data.forecast.forecastday.map(day => ({
        date: day.date,
        tempHigh: day.day.maxtemp_f,
        tempLow: day.day.mintemp_f,
        tempAvg: day.day.avgtemp_f,
        humidity: day.day.avghumidity,
        precipitation: day.day.totalprecip_in,
        precipitationProbability: day.day.daily_chance_of_rain,
        windSpeed: day.day.maxwind_mph,
        description: day.day.condition.text,
        sunrise: day.astro.sunrise,
        sunset: day.astro.sunset
      })),
      alerts: data.alerts?.alert || []
    };

    return forecast;
  }

  /**
   * Normalize National Weather Service response
   * @param {Object} forecast - Forecast data
   * @param {Object} hourlyForecast - Hourly forecast data
   * @param {number} days - Number of days requested
   * @returns {Object} Normalized forecast data
   */
  normalizeNWSForecast(forecast, hourlyForecast, days) {
    // NWS provides text-based forecasts, extract temperature info
    const daily = forecast.properties.periods.slice(0, days * 2).reduce((acc, period, index) => {
      const date = new Date(period.startTime).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          temps: [],
          descriptions: []
        };
      }
      
      acc[date].temps.push(period.temperature);
      acc[date].descriptions.push(period.shortForecast);
      
      return acc;
    }, {});

    // Convert to array and calculate averages
    const dailyArray = Object.values(daily).map(day => {
      const temps = day.temps;
      return {
        date: day.date,
        tempHigh: Math.max(...temps),
        tempLow: Math.min(...temps),
        tempAvg: temps.reduce((a, b) => a + b, 0) / temps.length,
        description: day.descriptions[0],
        humidity: 60, // NWS doesn't always provide humidity
        precipitation: 0 // Would need to parse from text description
      };
    });

    return {
      provider: 'nws',
      daily: dailyArray,
      alerts: []
    };
  }

  /**
   * Enrich forecast data with garden-specific calculations
   * @param {Object} forecast - Base forecast data
   * @param {Object} options - Options for enrichment
   * @returns {Object} Enriched forecast data
   */
  enrichForecastData(forecast, options) {
    const enriched = { ...forecast };
    
    // Add garden-specific calculations to each day
    enriched.daily = forecast.daily.map(day => {
      const enrichedDay = { ...day };
      
      // Calculate growing degree days (base 50°F for most vegetables)
      enrichedDay.gdd50 = Math.max(0, day.tempAvg - 50);
      enrichedDay.gdd32 = Math.max(0, day.tempAvg - 32);
      
      // Calculate soil temperature estimate (lags air temperature)
      enrichedDay.soilTempEstimate = day.tempAvg - 3;
      
      // Frost risk assessment
      enrichedDay.frostRisk = this.calculateFrostRisk(day.tempLow);
      
      // Heat stress risk
      enrichedDay.heatStressRisk = this.calculateHeatStressRisk(day.tempHigh, day.humidity);
      
      // Drought stress indicator
      enrichedDay.droughtStress = this.calculateDroughtStress(day.precipitation, day.tempHigh);
      
      // Optimal planting conditions
      enrichedDay.plantingConditions = this.assessPlantingConditions(enrichedDay);
      
      return enrichedDay;
    });
    
    // Add weekly and monthly summaries
    enriched.weeklySummary = this.generateWeeklySummary(enriched.daily);
    enriched.monthlySummary = this.generateMonthlySummary(enriched.daily);
    
    return enriched;
  }

  /**
   * Generate fallback forecast using historical averages
   * @param {number} days - Number of days to forecast
   * @param {Object} options - Forecast options
   * @returns {Object} Fallback forecast data
   */
  generateFallbackForecast(days, options) {
    console.log('Generating fallback forecast from historical data');
    
    const daily = [];
    const currentDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setDate(currentDate.getDate() + i);
      
      const dayOfYear = this.getDayOfYear(forecastDate);
      const monthIndex = forecastDate.getMonth();
      
      const historicalData = this.getHistoricalAverageForDay(dayOfYear, monthIndex);
      
      daily.push({
        date: forecastDate.toISOString().split('T')[0],
        tempHigh: historicalData.tempHigh,
        tempLow: historicalData.tempLow,
        tempAvg: historicalData.tempAvg,
        humidity: historicalData.humidity,
        precipitation: historicalData.precipitation,
        description: historicalData.description,
        confidence: 0.6, // Lower confidence for historical data
        source: 'historical_average'
      });
    }
    
    return {
      provider: 'historical',
      daily,
      alerts: [],
      note: 'Using historical averages due to API unavailability'
    };
  }

  /**
   * Calculate frost risk based on temperature
   * @param {number} tempLow - Low temperature in Fahrenheit
   * @returns {string} Risk level
   */
  calculateFrostRisk(tempLow) {
    if (tempLow <= 28) return 'severe';
    if (tempLow <= 32) return 'moderate';
    if (tempLow <= 36) return 'light';
    return 'none';
  }

  /**
   * Calculate heat stress risk
   * @param {number} tempHigh - High temperature in Fahrenheit
   * @param {number} humidity - Humidity percentage
   * @returns {string} Risk level
   */
  calculateHeatStressRisk(tempHigh, humidity) {
    const heatIndex = this.calculateHeatIndex(tempHigh, humidity);
    
    if (heatIndex >= 105) return 'extreme';
    if (heatIndex >= 95) return 'high';
    if (heatIndex >= 85) return 'moderate';
    return 'low';
  }

  /**
   * Calculate heat index
   * @param {number} temp - Temperature in Fahrenheit
   * @param {number} humidity - Humidity percentage
   * @returns {number} Heat index
   */
  calculateHeatIndex(temp, humidity) {
    if (temp < 80) return temp;
    
    const T = temp;
    const RH = humidity;
    
    let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
    
    if (HI >= 80) {
      HI = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH - 
           0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH + 
           0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    }
    
    return Math.round(HI);
  }

  /**
   * Calculate drought stress indicator
   * @param {number} precipitation - Precipitation in inches
   * @param {number} tempHigh - High temperature
   * @returns {string} Drought stress level
   */
  calculateDroughtStress(precipitation, tempHigh) {
    const evapotranspiration = this.estimateEvapotranspiration(tempHigh);
    const waterBalance = precipitation - evapotranspiration;
    
    if (waterBalance < -0.3) return 'high';
    if (waterBalance < -0.1) return 'moderate';
    if (waterBalance < 0) return 'low';
    return 'none';
  }

  /**
   * Estimate daily evapotranspiration
   * @param {number} tempHigh - High temperature
   * @returns {number} ET in inches
   */
  estimateEvapotranspiration(tempHigh) {
    // Simplified Penman equation estimate
    return Math.max(0, (tempHigh - 32) * 0.008);
  }

  /**
   * Assess planting conditions for the day
   * @param {Object} dayData - Weather data for the day
   * @returns {Object} Planting condition assessment
   */
  assessPlantingConditions(dayData) {
    const conditions = {
      soilWorkable: dayData.precipitation < 0.5 && dayData.tempHigh > 40,
      seedGermination: dayData.soilTempEstimate > 45 && dayData.soilTempEstimate < 85,
      transplantSafe: dayData.frostRisk === 'none' && dayData.tempLow > 40,
      overallSuitability: 'poor'
    };
    
    // Calculate overall suitability
    const suitabilityScore = 
      (conditions.soilWorkable ? 1 : 0) +
      (conditions.seedGermination ? 1 : 0) +
      (conditions.transplantSafe ? 1 : 0);
    
    if (suitabilityScore === 3) conditions.overallSuitability = 'excellent';
    else if (suitabilityScore === 2) conditions.overallSuitability = 'good';
    else if (suitabilityScore === 1) conditions.overallSuitability = 'fair';
    
    return conditions;
  }

  /**
   * Get available weather providers based on API keys
   * @param {Object} userApiKeys - User-provided API keys
   * @returns {Array} Available providers sorted by preference
   */
  getAvailableProviders(userApiKeys) {
    const providers = [];
    
    // Add providers based on available API keys
    if (userApiKeys.weatherapi) {
      providers.push({
        name: 'weatherapi',
        apiKey: userApiKeys.weatherapi,
        maxDays: 10,
        priority: 1
      });
    }
    
    if (userApiKeys.openweathermap) {
      providers.push({
        name: 'openweathermap',
        apiKey: userApiKeys.openweathermap,
        maxDays: 8,
        priority: 2
      });
    }
    
    // NWS is always available (no API key required)
    providers.push({
      name: 'nws',
      apiKey: null,
      maxDays: 7,
      priority: 3
    });
    
    return providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check rate limiting for API provider
   * @param {string} provider - Provider name
   * @returns {boolean} Whether request is allowed
   */
  checkRateLimit(provider) {
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    
    if (!this.rateLimiter.has(provider)) {
      this.rateLimiter.set(provider, { requests: 0, resetTime: now + hourMs });
      return true;
    }
    
    const limits = this.rateLimiter.get(provider);
    
    // Reset if hour has passed
    if (now > limits.resetTime) {
      limits.requests = 0;
      limits.resetTime = now + hourMs;
    }
    
    // Check provider-specific limits
    const maxRequests = this.getMaxRequestsPerHour(provider);
    if (limits.requests >= maxRequests) {
      return false;
    }
    
    limits.requests++;
    return true;
  }

  /**
   * Get maximum requests per hour for provider
   * @param {string} provider - Provider name
   * @returns {number} Max requests per hour
   */
  getMaxRequestsPerHour(provider) {
    const limits = {
      openweathermap: 60, // Conservative limit for free tier
      weatherapi: 100,
      nws: 1000 // Very generous, NWS doesn't publish specific limits
    };
    
    return limits[provider] || 10;
  }

  /**
   * Fetch with retry logic
   * @param {string} url - URL to fetch
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<Object>} Response data
   */
  async fetchWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Load historical weather averages for Durham, NC
   * @returns {Object} Historical weather data
   */
  loadHistoricalAverages() {
    // Durham, NC historical climate data
    return {
      monthlyAverages: [
        { month: 0, tempHigh: 51, tempLow: 31, precipitation: 3.5, humidity: 65 },
        { month: 1, tempHigh: 55, tempLow: 34, precipitation: 3.2, humidity: 63 },
        { month: 2, tempHigh: 63, tempLow: 41, precipitation: 3.8, humidity: 62 },
        { month: 3, tempHigh: 72, tempLow: 49, precipitation: 3.1, humidity: 61 },
        { month: 4, tempHigh: 80, tempLow: 58, precipitation: 3.9, humidity: 65 },
        { month: 5, tempHigh: 87, tempLow: 66, precipitation: 4.2, humidity: 68 },
        { month: 6, tempHigh: 90, tempLow: 70, precipitation: 4.6, humidity: 71 },
        { month: 7, tempHigh: 88, tempLow: 69, precipitation: 4.2, humidity: 73 },
        { month: 8, tempHigh: 82, tempLow: 62, precipitation: 3.4, humidity: 70 },
        { month: 9, tempHigh: 73, tempLow: 50, precipitation: 3.1, humidity: 67 },
        { month: 10, tempHigh: 64, tempLow: 40, precipitation: 2.9, humidity: 64 },
        { month: 11, tempHigh: 54, tempLow: 32, precipitation: 3.2, humidity: 65 }
      ]
    };
  }

  /**
   * Get historical average for specific day
   * @param {number} dayOfYear - Day of year (1-365)
   * @param {number} monthIndex - Month index (0-11)
   * @returns {Object} Historical weather data
   */
  getHistoricalAverageForDay(dayOfYear, monthIndex) {
    const monthData = this.fallbackData.monthlyAverages[monthIndex];
    
    // Add some daily variation to monthly averages
    const dailyVariation = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 3;
    
    return {
      tempHigh: Math.round(monthData.tempHigh + dailyVariation),
      tempLow: Math.round(monthData.tempLow + dailyVariation),
      tempAvg: Math.round((monthData.tempHigh + monthData.tempLow) / 2 + dailyVariation),
      humidity: monthData.humidity,
      precipitation: monthData.precipitation / 30, // Daily average
      description: this.getSeasonalDescription(monthIndex)
    };
  }

  /**
   * Get seasonal weather description
   * @param {number} monthIndex - Month index (0-11)
   * @returns {string} Weather description
   */
  getSeasonalDescription(monthIndex) {
    const descriptions = [
      'Cool and mild', 'Cool with occasional warmth', 'Mild and pleasant',
      'Warm and comfortable', 'Warm and humid', 'Hot and humid',
      'Hot and humid', 'Hot and humid', 'Warm and pleasant',
      'Cool and comfortable', 'Cool and crisp', 'Cool and mild'
    ];
    
    return descriptions[monthIndex];
  }

  /**
   * Generate weekly summary from daily data
   * @param {Array} dailyData - Array of daily forecast data
   * @returns {Array} Weekly summary data
   */
  generateWeeklySummary(dailyData) {
    const weeks = [];
    
    for (let i = 0; i < dailyData.length; i += 7) {
      const weekData = dailyData.slice(i, i + 7);
      if (weekData.length === 0) continue;
      
      weeks.push({
        startDate: weekData[0].date,
        endDate: weekData[weekData.length - 1].date,
        avgTempHigh: Math.round(weekData.reduce((sum, d) => sum + d.tempHigh, 0) / weekData.length),
        avgTempLow: Math.round(weekData.reduce((sum, d) => sum + d.tempLow, 0) / weekData.length),
        totalPrecipitation: weekData.reduce((sum, d) => sum + (d.precipitation || 0), 0),
        avgHumidity: Math.round(weekData.reduce((sum, d) => sum + (d.humidity || 0), 0) / weekData.length),
        totalGDD50: weekData.reduce((sum, d) => sum + (d.gdd50 || 0), 0),
        riskFactors: this.summarizeWeeklyRisks(weekData)
      });
    }
    
    return weeks;
  }

  /**
   * Generate monthly summary from daily data
   * @param {Array} dailyData - Array of daily forecast data
   * @returns {Object} Monthly summary data
   */
  generateMonthlySummary(dailyData) {
    if (dailyData.length === 0) return {};
    
    return {
      avgTempHigh: Math.round(dailyData.reduce((sum, d) => sum + d.tempHigh, 0) / dailyData.length),
      avgTempLow: Math.round(dailyData.reduce((sum, d) => sum + d.tempLow, 0) / dailyData.length),
      totalPrecipitation: dailyData.reduce((sum, d) => sum + (d.precipitation || 0), 0),
      totalGDD50: dailyData.reduce((sum, d) => sum + (d.gdd50 || 0), 0),
      frostDays: dailyData.filter(d => d.frostRisk !== 'none').length,
      heatStressDays: dailyData.filter(d => d.heatStressRisk === 'high' || d.heatStressRisk === 'extreme').length,
      idealPlantingDays: dailyData.filter(d => d.plantingConditions?.overallSuitability === 'excellent').length
    };
  }

  /**
   * Summarize weekly risk factors
   * @param {Array} weekData - Week of daily data
   * @returns {Array} Risk factor summary
   */
  summarizeWeeklyRisks(weekData) {
    const risks = [];
    
    const frostDays = weekData.filter(d => d.frostRisk !== 'none').length;
    if (frostDays > 0) risks.push(`${frostDays} frost risk days`);
    
    const heatDays = weekData.filter(d => d.heatStressRisk === 'high' || d.heatStressRisk === 'extreme').length;
    if (heatDays > 0) risks.push(`${heatDays} heat stress days`);
    
    const droughtDays = weekData.filter(d => d.droughtStress === 'high').length;
    if (droughtDays > 0) risks.push(`${droughtDays} drought stress days`);
    
    return risks;
  }

  /**
   * Get day of year (1-365)
   * @param {Date} date - Date object
   * @returns {number} Day of year
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

// Export singleton instance
export const enhancedWeatherIntegration = new EnhancedWeatherIntegration();
export default enhancedWeatherIntegration;