/**
 * ForecastWidget Component
 * Displays 10-day weather forecast optimized for garden planning
 */

import React, { useState, useEffect } from 'react';
import { formatProbability, formatTemperature, formatPrecipitation } from '../config.js';

const ForecastWidget = ({ onSimulationImpact }) => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedView, setExpandedView] = useState(false);

  const getWeatherEmoji = (forecast, precipChance) => {
    const f = forecast.toLowerCase();
    
    // Thunderstorms
    if (f.includes('thunderstorm') || f.includes('storm')) return '⛈️';
    
    // Rain conditions
    if (f.includes('rain') || f.includes('shower')) {
      if (f.includes('heavy')) return '🌧️';
      if (f.includes('light') || f.includes('slight')) return '🌦️';
      return '🌧️';
    }
    
    // Snow conditions
    if (f.includes('snow') || f.includes('flurr')) return '🌨️';
    if (f.includes('sleet') || f.includes('freezing')) return '🌨️';
    
    // Cloud conditions
    if (f.includes('overcast') || f.includes('cloudy')) return '☁️';
    if (f.includes('partly') && (f.includes('cloud') || f.includes('sun'))) return '⛅';
    
    // Clear conditions
    if (f.includes('sunny') || f.includes('clear')) return '☀️';
    if (f.includes('fair')) return '🌤️';
    
    // Fog/haze
    if (f.includes('fog') || f.includes('haze') || f.includes('mist')) return '🌫️';
    
    // Wind
    if (f.includes('wind')) return '💨';
    
    // Fallback based on precipitation chance
    if (precipChance > 60) return '🌧️';
    if (precipChance > 30) return '🌦️';
    if (precipChance > 10) return '⛅';
    
    return '☀️'; // Default sunny
  };

  useEffect(() => {
    fetchForecastData();
  }, []);

  const fetchForecastData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = forceRefresh ? '/api/forecast?zipCode=27707&refresh=true' : '/api/forecast?zipCode=27707';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setForecastData(result.data);
        
        // Pass simulation factors to parent if callback provided
        if (onSimulationImpact && result.data.simulationFactors) {
          onSimulationImpact(result.data.simulationFactors);
        }
      } else {
        setError(result.error || 'Failed to load forecast data');
        // Still set fallback data if available
        if (result.data) {
          setForecastData(result.data);
        }
      }
    } catch (err) {
      console.error('Forecast fetch error:', err);
      setError('Unable to load weather forecast');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="forecast-widget card">
        <div className="forecast-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h3>Loading 10-Day Forecast...</h3>
          <p>Fetching garden-specific weather data</p>
        </div>
      </div>
    );
  }

  if (error && !forecastData) {
    return (
      <div className="forecast-widget card">
        <div className="forecast-error">
          <h3>🌤️ Weather Forecast</h3>
          <p className="error-message">{error}</p>
          <button 
            className="forecast-retry-btn"
            onClick={fetchForecastData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { dailyForecasts, summary, gardenAlerts, simulationFactors } = forecastData;
  const displayedForecasts = expandedView ? dailyForecasts : dailyForecasts.slice(0, 5);

  return (
    <div className="forecast-widget card">
      <div className="forecast-header">
        <h3>🌤️ 10-Day Garden Forecast</h3>
        <p className="forecast-location">Durham, NC (27707)</p>
        {error && (
          <div className="forecast-warning">
            ⚠️ Using fallback data - {error}
          </div>
        )}
        {forecastData.fallback && (
          <div className="forecast-warning">
            ⚠️ Using historical weather averages - real forecast data unavailable
          </div>
        )}
      </div>

      {/* Garden Alerts */}
      {gardenAlerts && gardenAlerts.length > 0 && (
        <div className="forecast-alerts">
          {gardenAlerts.map((alert, index) => (
            <div key={index} className={`forecast-alert alert-${alert.severity}`}>
              <span className="alert-icon">
                {alert.type === 'frost' && '❄️'}
                {alert.type === 'heat' && '🔥'}
                {alert.type === 'rain' && '🌧️'}
              </span>
              <div className="alert-content">
                <strong>{alert.message}</strong>
                {alert.days && <span className="alert-days"> - {alert.days}</span>}
                {alert.recommendation && <div className="alert-recommendation">{alert.recommendation}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="forecast-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Average Temperature</span>
            <span className="stat-value">
              <span className="metric-primary">{formatTemperature(summary.avgTemp)}</span>
              <span className="imperial-secondary">({formatTemperature(summary.avgTemp, { unit: 'imperial' })})</span>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Precipitation</span>
            <span className="stat-value">
              <span className="metric-primary">{formatPrecipitation(summary.totalPrecip)}</span>
              <span className="imperial-secondary">({formatPrecipitation(summary.totalPrecip, { unit: 'imperial' })})</span>
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Growing Days</span>
            <span className="stat-value">{summary.totalGrowingDegreeDays} GDD</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Growth Potential</span>
            <span className={`stat-value potential-${getGrowthPotentialClass(simulationFactors.growthPotential)}`}>
              {formatProbability(simulationFactors.growthPotential)}%
            </span>
          </div>
        </div>
      </div>

      {/* Daily Forecasts */}
      <div className="forecast-days">
        {displayedForecasts.map((day, index) => (
          <div key={day.date} className={`forecast-day compact ${index === 0 ? 'today' : ''} ${day.projected ? 'projected' : ''}`}>
            <div className="day-header">
              <span className="day-name">
                {index === 0 ? 'Today' : index === 1 ? 'Tmrw' : day.dayOfWeek.slice(0, 3)}
              </span>
              <span className="day-date">{formatDate(day.date)}</span>
            </div>
            
            <div className="day-weather-icon">
              {getWeatherEmoji(day.shortForecast, day.precipChance)}
            </div>
            
            <div className="day-temps">
              <span className="high-temp">{Math.round(day.highTemp)}°</span>
              <span className="low-temp">{Math.round(day.lowTemp)}°</span>
              {day.apparentTemp && Math.abs(day.apparentTemp - day.highTemp) > 3 && (
                <span className="feels-like" title={`Feels like ${Math.round(day.apparentTemp)}°`}>
                  🌡️{Math.round(day.apparentTemp)}°
                </span>
              )}
            </div>
            
            {/* Compact conditions row */}
            <div className="day-conditions-compact">
              {day.precipChance > 20 && (
                <span className="precip-compact">💧{formatProbability(day.precipChance)}%</span>
              )}
              {day.frostRisk && <span className="risk-indicator">❄️</span>}
              {day.heatStress && <span className="risk-indicator">🔥</span>}
              {day.growingDegreeDays > 5 && (
                <span className="gdd-compact">🌱{Math.round(day.growingDegreeDays)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expand/Collapse Toggle */}
      <div className="forecast-actions">
        <button 
          className="forecast-toggle-btn"
          onClick={() => setExpandedView(!expandedView)}
        >
          {expandedView ? 'Show Less' : `Show All ${dailyForecasts.length} Days`}
        </button>
        
        <button 
          className="forecast-refresh-btn"
          onClick={() => fetchForecastData(false)}
          disabled={loading}
        >
          🔄 Refresh
        </button>
        
        {process.env.NODE_ENV !== 'production' && (
          <button 
            className="forecast-refresh-btn"
            onClick={() => fetchForecastData(true)}
            disabled={loading}
            title="Force refresh from NWS (dev only)"
          >
            ⚡ Fresh Data
          </button>
        )}
      </div>

      {/* Simulation Impact Summary */}
      {simulationFactors && (
        <div className="simulation-impact">
          <h4>🌱 Garden Planning Impact</h4>
          <div className="impact-grid">
            <div className="impact-stat">
              <div className="impact-value">{formatProbability(simulationFactors.temperatureStability)}%</div>
              <div className="impact-label">Temperature Stability</div>
            </div>
            <div className="impact-stat">
              <div className="impact-value">{formatProbability(simulationFactors.moistureIndex)}%</div>
              <div className="impact-label">Moisture Index</div>
            </div>
            <div className="impact-stat">
              <div className="impact-value">{formatProbability(simulationFactors.growthPotential)}%</div>
              <div className="impact-label">Growth Potential</div>
            </div>
          </div>
          
          {Object.entries(simulationFactors.riskFactors).some(([_, risk]) => risk) && (
            <div className="risk-factors">
              <div className="risk-header">⚠️ Active Risks</div>
              <div className="risk-tags">
                {simulationFactors.riskFactors.frost && <span className="risk-tag frost">❄️ Frost</span>}
                {simulationFactors.riskFactors.heat && <span className="risk-tag heat">🔥 Heat Stress</span>}
                {simulationFactors.riskFactors.drought && <span className="risk-tag drought">🌵 Drought</span>}
                {simulationFactors.riskFactors.excess_moisture && <span className="risk-tag moisture">💧 Excess Moisture</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGrowthPotentialClass(potential) {
  if (potential >= 80) return 'excellent';
  if (potential >= 60) return 'good';
  if (potential >= 40) return 'fair';
  return 'poor';
}


export default ForecastWidget;