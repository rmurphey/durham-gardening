/**
 * ProbabilisticCalendar Component
 * Displays Monte Carlo generated planting and harvest recommendations with confidence levels
 */

import React from 'react';

const ProbabilisticCalendar = ({ probabilisticCalendar }) => {
  if (!probabilisticCalendar) {
    return null;
  }

  const { plantingRecommendations, harvestPredictions, criticalEvents, totalScenarios } = probabilisticCalendar;

  // Helper function to format confidence level
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'var(--color-success)';
    if (confidence >= 0.6) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const formatDateRange = (earlyDate, optimalDate, lateDate) => {
    const options = { month: 'short', day: 'numeric' };
    const early = earlyDate.toLocaleDateString('en-US', options);
    const optimal = optimalDate.toLocaleDateString('en-US', options);
    const late = lateDate.toLocaleDateString('en-US', options);
    
    return `${early} - ${late} (optimal: ${optimal})`;
  };

  return (
    <section className="card probabilistic-calendar">
      <div className="card-header">
        <h2 className="card-title">Probabilistic Garden Calendar</h2>
        <p className="card-subtitle">
          Weather-responsive recommendations from {totalScenarios.toLocaleString()} Monte Carlo scenarios
        </p>
      </div>

      {/* Planting Recommendations */}
      {plantingRecommendations.length > 0 && (
        <div className="calendar-section">
          <h3 className="section-title">🌱 Planting Windows</h3>
          <div className="recommendations-grid">
            {plantingRecommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="recommendation-header">
                  <h4 className="crop-name">{rec.crop}</h4>
                  <div 
                    className="confidence-badge"
                    style={{ 
                      backgroundColor: getConfidenceColor(rec.confidence),
                      color: 'white'
                    }}
                  >
                    {getConfidenceLabel(rec.confidence)} Confidence
                  </div>
                </div>
                
                <div className="recommendation-details">
                  <div className="date-range">
                    📅 {formatDateRange(rec.earlyDate, rec.optimalDate, rec.lateDate)}
                  </div>
                  
                  <div className="scenario-info">
                    📊 {Math.round(rec.consensusStrength * 100)}% scenario agreement
                    <span className="scenario-count">({rec.scenarioCount} scenarios)</span>
                  </div>
                  
                  <div className="recommendation-text">
                    {rec.recommendation}
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="confidence-bar-container">
                  <div className="confidence-label">Confidence: {Math.round(rec.confidence * 100)}%</div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ 
                        width: `${rec.confidence * 100}%`,
                        backgroundColor: getConfidenceColor(rec.confidence)
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Harvest Predictions */}
      {harvestPredictions.length > 0 && (
        <div className="calendar-section">
          <h3 className="section-title">🥬 Harvest Predictions</h3>
          <div className="predictions-grid">
            {harvestPredictions.map((pred, index) => (
              <div key={index} className="prediction-card">
                <div className="prediction-header">
                  <h4 className="crop-name">{pred.crop}</h4>
                  <div 
                    className="confidence-badge"
                    style={{ 
                      backgroundColor: getConfidenceColor(pred.confidence),
                      color: 'white'
                    }}
                  >
                    {getConfidenceLabel(pred.confidence)}
                  </div>
                </div>
                
                <div className="prediction-timeline">
                  <div className="harvest-phase">
                    <span className="phase-label">First Harvest</span>
                    <span className="phase-date">
                      {pred.firstHarvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="harvest-phase peak">
                    <span className="phase-label">Peak Season</span>
                    <span className="phase-date">
                      {pred.peakHarvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="harvest-phase">
                    <span className="phase-label">Last Harvest</span>
                    <span className="phase-date">
                      {pred.lastHarvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="prediction-text">
                  {pred.prediction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Events */}
      {criticalEvents.length > 0 && (
        <div className="calendar-section">
          <h3 className="section-title">⚠️ Weather-Driven Critical Events</h3>
          <div className="critical-events-list">
            {criticalEvents.map((event, index) => (
              <div key={index} className={`critical-event priority-${event.priority}`}>
                <div className="event-header">
                  <span className="event-type">{event.type.replace(/-/g, ' ')}</span>
                  <span className="event-date">
                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="event-frequency">
                    {Math.round(event.frequency * 100)}% likely
                  </span>
                </div>
                <div className="event-description">{event.description}</div>
                <div className="event-recommendation">{event.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="calendar-summary">
        <div className="summary-stat">
          <span className="stat-label">Total Scenarios</span>
          <span className="stat-value">{totalScenarios.toLocaleString()}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Planting Windows</span>
          <span className="stat-value">{plantingRecommendations.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Harvest Predictions</span>
          <span className="stat-value">{harvestPredictions.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Critical Events</span>
          <span className="stat-value">{criticalEvents.length}</span>
        </div>
      </div>
    </section>
  );
};

export default ProbabilisticCalendar;