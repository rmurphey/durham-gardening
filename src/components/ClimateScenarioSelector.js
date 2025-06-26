/**
 * ClimateScenarioSelector Component
 * Handles climate scenario selection for summer and winter conditions
 */

import React from 'react';
import { formatProbability } from '../config.js';

const ClimateScenarioSelector = ({
  climateScenarios,
  selectedSummer,
  selectedWinter,
  onSummerChange,
  onWinterChange
}) => {

  if (!climateScenarios) {
    return (
      <section className="card scenario-section">
        <div className="card-header">
          <h2 className="card-title">Climate Scenarios</h2>
        </div>
        <p>Loading climate scenarios...</p>
      </section>
    );
  }

  return (
    <section className="card scenario-section">
      <div className="card-header">
        <h2 className="card-title">Climate Scenarios</h2>
        <p className="card-subtitle">Select summer and winter climate conditions for Durham</p>
      </div>
      <div className="scenario-grid">
        <div className="scenario-column">
          <h3>Summer Heat</h3>
          {climateScenarios.summer.map(scenario => (
            <button
              key={scenario.id}
              className={`scenario-button ${selectedSummer === scenario.id ? 'selected' : ''}`}
              onClick={() => onSummerChange(scenario.id)}
            >
              <div className="scenario-header">
                <strong>{scenario.name}</strong>
                <span className="probability">{formatProbability(scenario.probability)}</span>
              </div>
              <div className="scenario-details">
                <div>{scenario.temp}</div>
                <div>{scenario.duration}</div>
                <div className="impact">{scenario.impact}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="scenario-column">
          <h3>Winter Cold</h3>
          {climateScenarios.winter.map(scenario => (
            <button
              key={scenario.id}
              className={`scenario-button ${selectedWinter === scenario.id ? 'selected' : ''}`}
              onClick={() => onWinterChange(scenario.id)}
            >
              <div className="scenario-header">
                <strong>{scenario.name}</strong>
                <span className="probability">{formatProbability(scenario.probability)}</span>
              </div>
              <div className="scenario-details">
                <div>{scenario.temp}</div>
                <div>{scenario.duration}</div>
                <div className="impact">{scenario.impact}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClimateScenarioSelector;