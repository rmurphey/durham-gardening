/**
 * ForecastWidget Component
 * Displays 10-day weather forecast optimized for garden planning
 */

import React, { useState, useEffect } from 'react';

const ForecastWidget = ({ onSimulationImpact }) => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedView, setExpandedView] = useState(false);

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
            <span className="stat-label">Avg Temp</span>
            <span className="stat-value">{summary.avgTemp}°F</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Rain</span>
            <span className="stat-value">{summary.totalPrecip}"</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Growing Days</span>
            <span className="stat-value">{summary.totalGrowingDegreeDays} GDD</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Growth Potential</span>
            <span className={`stat-value potential-${getGrowthPotentialClass(simulationFactors.growthPotential)}`}>
              {simulationFactors.growthPotential}%
            </span>
          </div>
        </div>
      </div>

      {/* Daily Forecasts */}
      <div className="forecast-days">
        {displayedForecasts.map((day, index) => (
          <div key={day.date} className={`forecast-day ${index === 0 ? 'today' : ''} ${day.projected ? 'projected' : ''}`}>
            <div className="day-header">
              <span className="day-name">
                {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.dayOfWeek.slice(0, 3)}
              </span>
              <span className="day-date">{formatDate(day.date)}</span>
            </div>
            
            <div className="day-temps">
              <span className="high-temp">{day.highTemp}°</span>
              <span className="temp-separator">/</span>
              <span className="low-temp">{day.lowTemp}°</span>
            </div>
            
            <div className="day-conditions">
              <div className="day-weather">{day.shortForecast}</div>
              {day.precipChance > 20 && (
                <div className="day-precip">
                  💧 {day.precipChance}%
                  {day.precipAmount > 0 && ` (${day.precipAmount}")`}
                </div>
              )}
            </div>
            
            {/* Garden-specific indicators */}
            <div className="day-garden-info">
              {day.frostRisk && <span className="garden-indicator frost">❄️ Frost Risk</span>}
              {day.heatStress && <span className="garden-indicator heat">🔥 Heat Stress</span>}
              {day.growingDegreeDays > 0 && (
                <span className="garden-indicator gdd">🌱 {day.growingDegreeDays} GDD</span>
              )}
            </div>

            {/* Recommendations for today/tomorrow */}
            {index < 2 && day.recommendedActions && day.recommendedActions.length > 0 && (
              <div className="day-recommendations">
                {day.recommendedActions.slice(0, 2).map((action, actionIndex) => (
                  <div key={actionIndex} className="recommendation">
                    ✓ {action}
                  </div>
                ))}
              </div>
            )}
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
          <h4>Garden Planning Impact</h4>
          <div className="impact-factors">
            <div className="impact-item">
              <span className="impact-label">Temperature Stability:</span>
              <span className="impact-value">{simulationFactors.temperatureStability}%</span>
            </div>
            <div className="impact-item">
              <span className="impact-label">Moisture Index:</span>
              <span className="impact-value">{simulationFactors.moistureIndex}%</span>
            </div>
          </div>
          
          {Object.entries(simulationFactors.riskFactors).some(([_, risk]) => risk) && (
            <div className="risk-factors">
              <strong>Risk Factors:</strong>
              {simulationFactors.riskFactors.frost && <span className="risk-tag frost">Frost</span>}
              {simulationFactors.riskFactors.heat && <span className="risk-tag heat">Heat Stress</span>}
              {simulationFactors.riskFactors.drought && <span className="risk-tag drought">Drought</span>}
              {simulationFactors.riskFactors.excess_moisture && <span className="risk-tag moisture">Excess Moisture</span>}
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