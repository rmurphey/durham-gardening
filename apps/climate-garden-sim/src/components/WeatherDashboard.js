/**
 * WeatherDashboard Component
 * Displays comprehensive weather information for garden management
 */

import React, { useState, useEffect } from 'react';
import { weatherDataService } from '../services/weatherDataService.js';
import { validateWeatherConfig } from '../config/weatherConfig.js';

const WeatherDashboard = ({ locationConfig, onWeatherUpdate }) => {
  const [weatherData, setWeatherData] = useState({
    current: null,
    forecast: [],
    historical: null,
    frostDates: null,
    gddData: null,
    loading: true,
    errors: []
  });

  const [selectedView, setSelectedView] = useState('current'); // current, forecast, historical, frost, gdd
  const [weatherConfig, setWeatherConfig] = useState(null);

  useEffect(() => {
    const config = validateWeatherConfig();
    setWeatherConfig(config);
    
    if (locationConfig?.lat && locationConfig?.lon) {
      loadWeatherData();
    }
  }, [locationConfig]);

  const loadWeatherData = async () => {
    if (!locationConfig?.lat || !locationConfig?.lon) return;

    setWeatherData(prev => ({ ...prev, loading: true, errors: [] }));

    try {
      const promises = [];
      const errors = [];

      // Load current weather
      if (weatherConfig?.hasBasicWeather) {
        promises.push(
          weatherDataService.getCurrentWeather(locationConfig.lat, locationConfig.lon)
            .catch(err => {
              errors.push(`Current weather: ${err.message}`);
              return null;
            })
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Load forecast
      if (weatherConfig?.hasBasicWeather) {
        promises.push(
          weatherDataService.getWeatherForecast(locationConfig.lat, locationConfig.lon, 7)
            .catch(err => {
              errors.push(`Forecast: ${err.message}`);
              return [];
            })
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      // Load historical data
      if (weatherConfig?.hasHistoricalData) {
        promises.push(
          weatherDataService.getHistoricalClimate(locationConfig.lat, locationConfig.lon, 30)
            .catch(err => {
              errors.push(`Historical data: ${err.message}`);
              return null;
            })
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Load frost dates
      promises.push(
        weatherDataService.calculateFrostDates(locationConfig.lat, locationConfig.lon)
          .catch(err => {
            errors.push(`Frost dates: ${err.message}`);
            return null;
          })
      );

      // Load growing degree days
      promises.push(
        weatherDataService.getGrowingDegreeDays(locationConfig.lat, locationConfig.lon)
          .catch(err => {
            errors.push(`Growing degree days: ${err.message}`);
            return null;
          })
      );

      const [current, forecast, historical, frostDates, gddData] = await Promise.all(promises);

      setWeatherData({
        current,
        forecast,
        historical,
        frostDates,
        gddData,
        loading: false,
        errors
      });

      // Notify parent component of weather data update
      if (onWeatherUpdate) {
        onWeatherUpdate({
          current,
          forecast,
          historical,
          frostDates,
          gddData,
          hasErrors: errors.length > 0
        });
      }

    } catch (error) {
      console.error('Failed to load weather data:', error);
      setWeatherData(prev => ({
        ...prev,
        loading: false,
        errors: [...prev.errors, `General error: ${error.message}`]
      }));
    }
  };

  const renderCurrentWeather = () => {
    if (!weatherData.current) {
      return (
        <div className="weather-card no-data">
          <h3>🌤️ Current Weather</h3>
          <p>Weather data unavailable. Configure API keys in environment variables.</p>
        </div>
      );
    }

    const { current } = weatherData;
    const isEstimate = current.isEstimate;

    return (
      <div className={`weather-card current-weather ${isEstimate ? 'estimate' : ''}`}>
        <div className="weather-header">
          <h3>🌤️ Current Weather</h3>
          {isEstimate && <span className="estimate-badge">Estimated</span>}
        </div>
        
        <div className="weather-main">
          <div className="temperature-display">
            <span className="temp-current">{current.temperature.current}°F</span>
            <span className="temp-feels-like">Feels like {current.temperature.feelsLike}°F</span>
          </div>
          
          <div className="condition-display">
            <span className="condition-main">{current.condition.main}</span>
            <span className="condition-desc">{current.condition.description}</span>
          </div>
        </div>

        <div className="weather-details">
          <div className="detail-row">
            <span className="detail-label">High/Low:</span>
            <span className="detail-value">{current.temperature.max}°F / {current.temperature.min}°F</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Humidity:</span>
            <span className="detail-value">{current.humidity}%</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Wind:</span>
            <span className="detail-value">{current.windSpeed} mph</span>
          </div>
        </div>

        <div className="gardening-alerts">
          {current.temperature.current < 35 && (
            <div className="alert frost-warning">
              ❄️ Frost Warning: Protect sensitive plants
            </div>
          )}
          {current.temperature.current > 95 && (
            <div className="alert heat-warning">
              🔥 Heat Stress: Ensure adequate watering
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderForecast = () => {
    if (!weatherData.forecast.length) {
      return (
        <div className="weather-card no-data">
          <h3>📅 7-Day Forecast</h3>
          <p>Forecast data unavailable.</p>
        </div>
      );
    }

    return (
      <div className="weather-card forecast-card">
        <h3>📅 7-Day Forecast</h3>
        <div className="forecast-grid">
          {weatherData.forecast.slice(0, 7).map((day, index) => (
            <div key={index} className="forecast-day">
              <div className="forecast-date">
                {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="forecast-temps">
                <span className="temp-high">{day.temperature.max}°</span>
                <span className="temp-low">{day.temperature.min}°</span>
              </div>
              <div className="forecast-condition">
                {day.conditions[0]?.main || 'Clear'}
              </div>
              <div className="forecast-gdd">
                GDD: {Math.round(day.gdd)}
              </div>
              {day.precipitation > 0 && (
                <div className="forecast-precip">
                  💧 {day.precipitation}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFrostInfo = () => {
    if (!weatherData.frostDates) {
      return (
        <div className="weather-card no-data">
          <h3>❄️ Frost Dates</h3>
          <p>Frost date data unavailable.</p>
        </div>
      );
    }

    const { frostDates } = weatherData;

    return (
      <div className="weather-card frost-card">
        <h3>❄️ Frost Date Information</h3>
        
        <div className="frost-section">
          <h4>Spring Frost Dates</h4>
          <div className="frost-stats">
            <div className="frost-stat">
              <span className="frost-label">90% Safe Date:</span>
              <span className="frost-value">
                {frostDates.plantingSafeDate ? 
                  new Date(frostDates.plantingSafeDate).toLocaleDateString() : 
                  'Data unavailable'
                }
              </span>
            </div>
            <div className="frost-stat">
              <span className="frost-label">Average Last Frost:</span>
              <span className="frost-value">
                {frostDates.lastSpringFrost?.average ? 
                  new Date(frostDates.lastSpringFrost.average).toLocaleDateString() : 
                  'Data unavailable'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="frost-section">
          <h4>Fall Frost Dates</h4>
          <div className="frost-stats">
            <div className="frost-stat">
              <span className="frost-label">Average First Frost:</span>
              <span className="frost-value">
                {frostDates.firstFallFrost?.average ? 
                  new Date(frostDates.firstFallFrost.average).toLocaleDateString() : 
                  'Data unavailable'
                }
              </span>
            </div>
            <div className="frost-stat">
              <span className="frost-label">Growing Season Length:</span>
              <span className="frost-value">
                {frostDates.growingSeasonLength || 'Unknown'} days
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGDDInfo = () => {
    if (!weatherData.gddData) {
      return (
        <div className="weather-card no-data">
          <h3>🌱 Growing Degree Days</h3>
          <p>Growing degree day data unavailable.</p>
        </div>
      );
    }

    return (
      <div className="weather-card gdd-card">
        <h3>🌱 Growing Degree Days</h3>
        <div className="gdd-summary">
          <div className="gdd-stat">
            <span className="gdd-label">Year to Date (Base 50°F):</span>
            <span className="gdd-value">{weatherData.gddData.yearToDate || 0} GDD</span>
          </div>
          <div className="gdd-stat">
            <span className="gdd-label">30-Year Average:</span>
            <span className="gdd-value">{weatherData.gddData.historical || 'Unknown'} GDD</span>
          </div>
        </div>
        
        <div className="gdd-crops">
          <h4>Crop Readiness Indicators</h4>
          <div className="crop-gdd-list">
            <div className="crop-gdd-item">
              <span className="crop-name">Cool Season Crops:</span>
              <span className="crop-status">
                {(weatherData.gddData.yearToDate || 0) > 100 ? '✅ Ready' : '⏳ Wait'}
              </span>
            </div>
            <div className="crop-gdd-item">
              <span className="crop-name">Warm Season Crops:</span>
              <span className="crop-status">
                {(weatherData.gddData.yearToDate || 0) > 300 ? '✅ Ready' : '⏳ Wait'}
              </span>
            </div>
            <div className="crop-gdd-item">
              <span className="crop-name">Hot Season Crops:</span>
              <span className="crop-status">
                {(weatherData.gddData.yearToDate || 0) > 500 ? '✅ Ready' : '⏳ Wait'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeatherAlerts = () => {
    const alerts = [];
    
    if (weatherData.current) {
      const temp = weatherData.current.temperature.current;
      if (temp < 35) {
        alerts.push({
          type: 'frost',
          icon: '❄️',
          message: 'Frost risk tonight - protect sensitive plants',
          severity: 'high'
        });
      }
      if (temp > 95) {
        alerts.push({
          type: 'heat',
          icon: '🔥',
          message: 'Extreme heat - increase watering frequency',
          severity: 'high'
        });
      }
    }

    if (weatherData.forecast.length > 0) {
      const tomorrow = weatherData.forecast[0];
      if (tomorrow.precipitation > 0.5) {
        alerts.push({
          type: 'rain',
          icon: '🌧️',
          message: `Heavy rain expected tomorrow (${tomorrow.precipitation}")`,
          severity: 'medium'
        });
      }
    }

    if (alerts.length === 0) return null;

    return (
      <div className="weather-alerts">
        <h4>🚨 Garden Alerts</h4>
        {alerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.severity}`}>
            <span className="alert-icon">{alert.icon}</span>
            <span className="alert-message">{alert.message}</span>
          </div>
        ))}
      </div>
    );
  };

  if (weatherData.loading) {
    return (
      <div className="weather-dashboard loading">
        <div className="loading-spinner">🌦️</div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  return (
    <div className="weather-dashboard">
      <div className="weather-nav">
        <button 
          className={`nav-btn ${selectedView === 'current' ? 'active' : ''}`}
          onClick={() => setSelectedView('current')}
        >
          Current
        </button>
        <button 
          className={`nav-btn ${selectedView === 'forecast' ? 'active' : ''}`}
          onClick={() => setSelectedView('forecast')}
        >
          Forecast
        </button>
        <button 
          className={`nav-btn ${selectedView === 'frost' ? 'active' : ''}`}
          onClick={() => setSelectedView('frost')}
        >
          Frost Dates
        </button>
        <button 
          className={`nav-btn ${selectedView === 'gdd' ? 'active' : ''}`}
          onClick={() => setSelectedView('gdd')}
        >
          GDD
        </button>
      </div>

      <div className="weather-content">
        {selectedView === 'current' && renderCurrentWeather()}
        {selectedView === 'forecast' && renderForecast()}
        {selectedView === 'frost' && renderFrostInfo()}
        {selectedView === 'gdd' && renderGDDInfo()}
      </div>

      {renderWeatherAlerts()}

      {weatherData.errors.length > 0 && (
        <div className="weather-errors">
          <h4>⚠️ Data Issues</h4>
          {weatherData.errors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}

      {!weatherConfig?.hasBasicWeather && (
        <div className="config-notice">
          <h4>🔧 Setup Required</h4>
          <p>
            Configure weather API keys in your environment variables to enable real-time weather data.
            See the README for setup instructions.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;