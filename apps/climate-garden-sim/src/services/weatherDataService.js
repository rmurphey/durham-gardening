/**
 * WeatherDataService
 * Multi-source weather data integration for agricultural applications
 * Supports NOAA CDO API, OpenWeatherMap, and derived agricultural metrics
 */

import { WEATHER_CONFIG } from '../config/weatherConfig.js';

class WeatherDataService {
  constructor() {
    this.cache = new Map();
    this.requestQueue = new Map();
    this.rateLimits = {
      noaa: { requests: 0, resetTime: Date.now() + 24 * 60 * 60 * 1000 },
      openweather: { requests: 0, resetTime: Date.now() + 24 * 60 * 60 * 1000 }
    };
  }

  /**
   * NOAA Climate Data Online API Integration
   * Provides historical climate data for agricultural analysis
   */
  async getHistoricalClimate(lat, lon, years = 30) {
    const cacheKey = `historical_${lat}_${lon}_${years}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Check rate limits
      if (!this.checkRateLimit('noaa')) {
        throw new Error('NOAA API rate limit exceeded');
      }

      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear() - years, 0, 1);
      
      const stationId = await this.findNearestWeatherStation(lat, lon);
      const datasets = ['GHCND']; // Global Historical Climatology Network Daily
      
      const historicalData = await Promise.all([
        this.fetchNOAAData('data', {
          datasetid: 'GHCND',
          stationid: stationId,
          datatypeid: ['TMAX', 'TMIN', 'PRCP'], // Max temp, min temp, precipitation
          startdate: this.formatNOAADate(startDate),
          enddate: this.formatNOAADate(endDate),
          limit: 1000,
          units: 'standard'
        }),
        this.fetchNOAAData('normals', {
          stationid: stationId,
          datatypeid: ['MLY-TMAX-NORMAL', 'MLY-TMIN-NORMAL', 'MLY-PRCP-NORMAL'],
          limit: 1000
        })
      ]);

      const processedData = this.processHistoricalData(historicalData);
      this.cache.set(cacheKey, processedData);
      return processedData;

    } catch (error) {
      console.error('Failed to fetch historical climate data:', error);
      return this.getFallbackHistoricalData(lat, lon);
    }
  }

  async findNearestWeatherStation(lat, lon) {
    const stations = await this.fetchNOAAData('stations', {
      extent: `${lat-0.5},${lon-0.5},${lat+0.5},${lon+0.5}`,
      datacategoryid: 'TEMP',
      limit: 50,
      sortfield: 'mindate',
      sortorder: 'desc'
    });

    if (!stations.results || stations.results.length === 0) {
      throw new Error('No weather stations found in area');
    }

    // Find closest station with sufficient data
    const bestStation = stations.results
      .filter(station => {
        const stationLat = station.latitude;
        const stationLon = station.longitude;
        const distance = this.calculateDistance(lat, lon, stationLat, stationLon);
        return distance < 50 && new Date(station.maxdate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      })
      .sort((a, b) => {
        const distA = this.calculateDistance(lat, lon, a.latitude, a.longitude);
        const distB = this.calculateDistance(lat, lon, b.latitude, b.longitude);
        return distA - distB;
      })[0];

    return bestStation ? bestStation.id : stations.results[0].id;
  }

  /**
   * OpenWeatherMap API Integration  
   * Provides current conditions and forecasts
   */
  async getCurrentWeather(lat, lon) {
    const cacheKey = `current_${lat}_${lon}`;
    const cacheTime = 10 * 60 * 1000; // 10 minutes

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTime) {
        return cached.data;
      }
    }

    try {
      if (!this.checkRateLimit('openweather')) {
        throw new Error('OpenWeatherMap API rate limit exceeded');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_CONFIG.OPENWEATHER_API_KEY}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      const processedData = this.processCurrentWeather(data);
      
      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() });
      return processedData;

    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      return this.getFallbackCurrentWeather();
    }
  }

  async getWeatherForecast(lat, lon, days = 7) {
    const cacheKey = `forecast_${lat}_${lon}_${days}`;
    const cacheTime = 3 * 60 * 60 * 1000; // 3 hours

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTime) {
        return cached.data;
      }
    }

    try {
      if (!this.checkRateLimit('openweather')) {
        throw new Error('OpenWeatherMap API rate limit exceeded');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_CONFIG.OPENWEATHER_API_KEY}&units=imperial&cnt=${Math.min(days * 8, 40)}`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap forecast API error: ${response.status}`);
      }

      const data = await response.json();
      const processedData = this.processForecastData(data);
      
      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() });
      return processedData;

    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      return this.getFallbackForecast(days);
    }
  }

  /**
   * Growing Degree Days Calculations
   * Essential for crop maturity predictions
   */
  calculateGDD(dailyTemp, baseTemp = 50, maxTemp = 86) {
    const { min, max } = dailyTemp;
    const avgTemp = (min + max) / 2;
    
    // Standard single-sine method for GDD calculation
    if (max <= baseTemp) {
      return 0;
    }
    
    if (min >= baseTemp) {
      const effectiveMax = Math.min(max, maxTemp);
      const effectiveMin = Math.max(min, baseTemp);
      return (effectiveMax + effectiveMin) / 2 - baseTemp;
    }
    
    // Complex case: temperature crosses base threshold
    const effectiveMax = Math.min(max, maxTemp);
    const crossingPoint = baseTemp;
    const amplitude = (effectiveMax - min) / 2;
    const midpoint = (effectiveMax + min) / 2;
    
    if (midpoint > crossingPoint) {
      const theta = Math.asin((crossingPoint - midpoint) / amplitude);
      return ((midpoint - crossingPoint) * (Math.PI / 2 - theta) + amplitude * Math.cos(theta)) / Math.PI;
    }
    
    return 0;
  }

  async getGrowingDegreeDays(lat, lon, baseTemp = 50, startDate = null) {
    startDate = startDate || new Date(new Date().getFullYear(), 0, 1); // Jan 1
    
    try {
      // Try OpenWeather Agro API if available
      if (WEATHER_CONFIG.OPENWEATHER_AGRO_API_KEY) {
        return await this.fetchAgroGDD(lat, lon, baseTemp, startDate);
      }

      // Fallback: calculate from historical and current data
      const historicalData = await this.getHistoricalClimate(lat, lon, 5);
      const currentYear = await this.getCurrentYearTemperatures(lat, lon, startDate);
      
      return this.calculateSeasonalGDD(currentYear, historicalData, baseTemp);

    } catch (error) {
      console.error('Failed to calculate growing degree days:', error);
      return this.estimateGDDFromLocation(lat, lon, baseTemp);
    }
  }

  /**
   * Frost Date Predictions
   * Critical for planting and harvest timing
   */
  async calculateFrostDates(lat, lon, historicalYears = 30) {
    try {
      const historicalData = await this.getHistoricalClimate(lat, lon, historicalYears);
      
      const springFrostDates = [];
      const fallFrostDates = [];
      
      // Process historical data to find frost dates
      Object.entries(historicalData.yearlyData).forEach(([year, data]) => {
        const springFrost = this.findLastSpringFrost(data.daily);
        const fallFrost = this.findFirstFallFrost(data.daily);
        
        if (springFrost) springFrostDates.push(springFrost);
        if (fallFrost) fallFrostDates.push(fallFrost);
      });

      return {
        lastSpringFrost: this.calculateFrostStatistics(springFrostDates),
        firstFallFrost: this.calculateFrostStatistics(fallFrostDates),
        growingSeasonLength: this.calculateGrowingSeasonLength(springFrostDates, fallFrostDates),
        frostFreeDate: this.calculateFrostFreeDate(springFrostDates, 0.1), // 10% risk
        plantingSafeDate: this.calculateFrostFreeDate(springFrostDates, 0.05) // 5% risk
      };

    } catch (error) {
      console.error('Failed to calculate frost dates:', error);
      return this.getDefaultFrostDates(lat);
    }
  }

  /**
   * Utility Methods
   */
  checkRateLimit(api) {
    const limit = this.rateLimits[api];
    const now = Date.now();
    
    if (now > limit.resetTime) {
      limit.requests = 0;
      limit.resetTime = now + 24 * 60 * 60 * 1000;
    }
    
    const maxRequests = api === 'noaa' ? 10000 : 1000;
    if (limit.requests >= maxRequests) {
      return false;
    }
    
    limit.requests++;
    return true;
  }

  async fetchNOAAData(endpoint, params) {
    const baseUrl = 'https://www.ncei.noaa.gov/cdo-web/api/v2';
    const queryParams = new URLSearchParams(params).toString();
    
    const response = await fetch(`${baseUrl}/${endpoint}?${queryParams}`, {
      headers: {
        'Token': WEATHER_CONFIG.NOAA_CDO_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  formatNOAADate(date) {
    return date.toISOString().split('T')[0];
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  processCurrentWeather(data) {
    return {
      temperature: {
        current: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max)
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed),
      windDirection: data.wind.deg,
      cloudCover: data.clouds.all,
      visibility: data.visibility,
      uvIndex: data.uvi || null,
      condition: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      },
      timestamp: new Date(data.dt * 1000),
      location: {
        name: data.name,
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };
  }

  processForecastData(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000),
          temps: [],
          humidity: [],
          precipitation: 0,
          conditions: []
        };
      }
      
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].precipitation += (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0);
      dailyForecasts[date].conditions.push({
        main: item.weather[0].main,
        description: item.weather[0].description,
        time: new Date(item.dt * 1000)
      });
    });

    return Object.values(dailyForecasts).map(day => ({
      date: day.date,
      temperature: {
        min: Math.round(Math.min(...day.temps)),
        max: Math.round(Math.max(...day.temps)),
        avg: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length)
      },
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      precipitation: Math.round(day.precipitation * 100) / 100,
      conditions: day.conditions,
      gdd: this.calculateGDD({
        min: Math.min(...day.temps),
        max: Math.max(...day.temps)
      })
    }));
  }

  // Fallback methods for when APIs are unavailable
  getFallbackCurrentWeather() {
    return {
      temperature: { current: 70, feelsLike: 72, min: 60, max: 80 },
      humidity: 60,
      condition: { main: 'Clear', description: 'clear sky' },
      timestamp: new Date(),
      isEstimate: true
    };
  }

  getFallbackForecast(days) {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temperature: { min: 60 + i, max: 80 + i, avg: 70 + i },
      precipitation: 0,
      gdd: 20 + i,
      isEstimate: true
    }));
  }
}

// Export singleton instance
export const weatherDataService = new WeatherDataService();
export default weatherDataService;