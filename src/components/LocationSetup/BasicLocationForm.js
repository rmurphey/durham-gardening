/**
 * BasicLocationForm Component  
 * Handles core location configuration inputs and sliders
 */

import React from 'react';
import { SUPPORTED_REGIONS, HARDINESS_ZONES } from '../../config.js';

const BasicLocationForm = ({ 
  customConfig, 
  onConfigChange 
}) => {
  const handleConfigUpdate = (updates) => {
    onConfigChange({ ...customConfig, ...updates });
  };

  const handleSliderUpdate = (field, value) => {
    handleConfigUpdate({ [field]: parseInt(value) });
  };

  return (
    <div className="setup-section">
      <h3>Custom Configuration</h3>
      <div className="config-grid">
        <div className="config-item">
          <label>Region:</label>
          <select
            value={customConfig.region}
            onChange={(e) => handleConfigUpdate({ region: e.target.value })}
          >
            {Object.entries(SUPPORTED_REGIONS).map(([code, region]) => (
              <option key={code} value={code}>{region.name}</option>
            ))}
          </select>
        </div>
        
        <div className="config-item">
          <label>Location Name:</label>
          <input
            type="text"
            value={customConfig.name}
            onChange={(e) => handleConfigUpdate({ name: e.target.value })}
            placeholder="e.g., My Garden"
          />
        </div>
        
        <div className="config-item">
          <label>Coordinates:</label>
          <div className="coordinate-inputs">
            <input
              type="number"
              placeholder="Latitude"
              value={customConfig.lat}
              onChange={(e) => handleConfigUpdate({ lat: parseFloat(e.target.value) || '' })}
              step="0.0001"
            />
            <input
              type="number"
              placeholder="Longitude" 
              value={customConfig.lon}
              onChange={(e) => handleConfigUpdate({ lon: parseFloat(e.target.value) || '' })}
              step="0.0001"
            />
            <button
              type="button"
              className="button small geolocation-btn"
              onClick={() => handleConfigUpdate({ requestGeolocation: true })}
            >
              📍 Use My Location
            </button>
          </div>
        </div>
        
        <div className="config-item">
          <label>Hardiness Zone:</label>
          <select
            value={customConfig.hardiness}
            onChange={(e) => handleConfigUpdate({ hardiness: e.target.value })}
          >
            {Object.entries(HARDINESS_ZONES).map(([zone, data]) => (
              <option key={zone} value={zone}>{data.name}</option>
            ))}
          </select>
        </div>

        <div className="config-item">
          <label>Annual Rainfall (inches):</label>
          <input
            type="number"
            value={customConfig.avgRainfall}
            onChange={(e) => handleConfigUpdate({ avgRainfall: parseInt(e.target.value) })}
            min="5"
            max="100"
          />
        </div>

        <div className="config-item slider-item">
          <label>
            Summer Heat Intensity: {['', 'Mild', 'Moderate', 'High', 'Extreme', 'Desert'][customConfig.heatIntensity]}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={customConfig.heatIntensity}
            onChange={(e) => handleSliderUpdate('heatIntensity', e.target.value)}
            className="slider"
          />
          <div className="slider-labels">
            <span>Mild</span>
            <span>Extreme</span>
          </div>
        </div>

        <div className="config-item slider-item">
          <label>
            Winter Severity: {['', 'Subtropical', 'Mild', 'Moderate', 'Cold', 'Arctic'][customConfig.winterSeverity]}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={customConfig.winterSeverity}
            onChange={(e) => handleSliderUpdate('winterSeverity', e.target.value)}
            className="slider"
          />
          <div className="slider-labels">
            <span>Subtropical</span>
            <span>Arctic</span>
          </div>
        </div>

        <div className="config-item slider-item">
          <label>
            Garden Size: {['', 'Container', 'Small Yard', 'Medium Yard', 'Large Yard', 'Farm Scale'][customConfig.gardenSize]}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={customConfig.gardenSize}
            onChange={(e) => handleSliderUpdate('gardenSize', e.target.value)}
            className="slider"
          />
          <div className="slider-labels">
            <span>50 sq ft</span>
            <span>1000+ sq ft</span>
          </div>
        </div>

        <div className="config-item slider-item">
          <label>
            Investment Level: {['', 'Minimal', 'Basic', 'Standard', 'Premium', 'Luxury'][customConfig.investmentLevel]}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={customConfig.investmentLevel}
            onChange={(e) => handleSliderUpdate('investmentLevel', e.target.value)}
            className="slider"
          />
          <div className="slider-labels">
            <span>$100/year</span>
            <span>$1500/year</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicLocationForm;