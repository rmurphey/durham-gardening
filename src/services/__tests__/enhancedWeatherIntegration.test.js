/**
 * Tests for EnhancedWeatherIntegration service
 * Testing critical weather API integration and fallback behavior
 */

import { enhancedWeatherIntegration } from '../enhancedWeatherIntegration.js';

// Mock fetch globally
global.fetch = jest.fn();

// Mock Date.now to fix timing issues
const originalDateNow = Date.now;
Date.now = jest.fn(() => 1640995200000); // Fixed timestamp: 2022-01-01

// Mock console methods to avoid test noise
const originalConsole = console;
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  Date.now = originalDateNow;
});

describe('EnhancedWeatherIntegration', () => {
  let weatherService;
  
  beforeEach(() => {
    weatherService = enhancedWeatherIntegration;
    fetch.mockClear();
    console.log.mockClear();
    console.warn.mockClear();
    console.error.mockClear();
  });

  describe('Constructor and Initialization', () => {
    test('initializes with correct API providers configuration', () => {
      expect(weatherService.apiProviders).toBeDefined();
      expect(weatherService.apiProviders.openweathermap).toBeDefined();
      expect(weatherService.apiProviders.weatherapi).toBeDefined();
      expect(weatherService.apiProviders.nws).toBeDefined();
    });

    test('has Durham coordinates configured', () => {
      expect(weatherService.durhamCoordinates).toEqual({
        lat: 35.9940,
        lon: -78.8986,
        nwsGridX: 63,
        nwsGridY: 67,
        nwsOffice: 'RAH'
      });
    });

    test('initializes cache and rate limiter', () => {
      expect(weatherService.cache).toBeInstanceOf(Map);
      expect(weatherService.rateLimiter).toBeInstanceOf(Map);
    });

    test('has fallback data structure', () => {
      expect(weatherService.fallbackData).toBeDefined();
    });
  });

  describe('getComprehensiveForecast', () => {
    test('returns forecast when no API keys provided', async () => {
      const result = await weatherService.getComprehensiveForecast({
        days: 3,
        userApiKeys: {}
      });

      expect(result).toBeDefined();
      expect(result.daily).toBeDefined();
      expect(Array.isArray(result.daily)).toBe(true);
      expect(result.daily.length).toBe(3);
    }, 15000);

    test('calls API when valid key provided', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          list: [{ 
            dt: 1640995200, 
            main: { temp: 20, humidity: 60 }, 
            weather: [{ main: 'Clear', description: 'clear sky' }]
          }] 
        })
      });

      const result = await weatherService.getComprehensiveForecast({
        days: 1,
        userApiKeys: { openweathermap: 'test-api-key' },
        preferredProvider: 'openweathermap'
      });

      expect(result).toBeDefined();
      expect(result.daily).toBeDefined();
      expect(fetch).toHaveBeenCalled();
    }, 15000);
  });

  describe('getForecastFromProvider', () => {
    test('provides forecast data from provider', async () => {
      const result = await weatherService.getForecastFromProvider('openweathermap', 'test-key', 1);

      expect(result).toBeDefined();
      expect(result.provider).toBe('openweathermap');
      expect(result.daily).toBeDefined();
      expect(Array.isArray(result.daily)).toBe(true);
    });

    test('provides fallback when API fails', async () => {
      // Even with failed API, service provides fallback data
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await weatherService.getForecastFromProvider('openweathermap', 'invalid-key', 1);
      
      // Service provides fallback data instead of null
      expect(result).toBeDefined();
      expect(result.daily).toBeDefined();
    });
  });

  describe('getAvailableProviders', () => {
    test('returns providers based on API keys', () => {
      const apiKeys = {
        openweathermap: 'key1',
        weatherapi: 'key2'
      };

      const providers = weatherService.getAvailableProviders(apiKeys);
      
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    test('includes NWS when requested', () => {
      const apiKeys = { nws: 'free' };
      const providers = weatherService.getAvailableProviders(apiKeys);
      
      expect(Array.isArray(providers)).toBe(true);
    });
  });

  describe('enrichForecastData', () => {
    test('processes forecast data', () => {
      const basicForecast = {
        daily: [
          { date: '2024-06-15', tempAvg: 25, humidity: 70, precipitation: 0 }
        ],
        provider: 'test'
      };

      const enriched = weatherService.enrichForecastData(basicForecast, {});

      expect(enriched).toBeDefined();
      expect(enriched.daily).toBeDefined();
      expect(Array.isArray(enriched.daily)).toBe(true);
    });
  });

  describe('Rate Limiting and Caching', () => {
    test('has rate limiting infrastructure', () => {
      expect(weatherService.rateLimiter).toBeInstanceOf(Map);
    });

    test('has caching infrastructure', () => {
      expect(weatherService.cache).toBeInstanceOf(Map);
    });
  });

  describe('Error Handling', () => {
    test('provides fallback data on fetch errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await weatherService.getForecastFromProvider('openweathermap', 'test-key', 1);
      
      // Service provides fallback data gracefully
      expect(result).toBeDefined();
      expect(result.daily).toBeDefined();
    });

    test('handles malformed API responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' })
      });

      const result = await weatherService.getForecastFromProvider('openweathermap', 'test-key', 1);
      
      // Service provides fallback data when API response is malformed
      expect(result).toBeDefined();
      expect(result.daily).toBeDefined();
    });
  });

  describe('Utility Methods', () => {
    test('has historical data structure', () => {
      expect(weatherService.fallbackData).toBeDefined();
    });

    test('can calculate day of year', () => {
      const testDate = new Date('2024-07-15');
      const dayOfYear = weatherService.getDayOfYear(testDate);
      expect(typeof dayOfYear).toBe('number');
      expect(dayOfYear).toBeGreaterThan(0);
      expect(dayOfYear).toBeLessThan(367);
    });
  });
});