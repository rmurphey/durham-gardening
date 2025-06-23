/**
 * MicroclimateTuner Component
 * Handles microclimate configuration with preview effects
 */

import React, { useState } from 'react';
import { MICROCLIMATE_OPTIONS, calculateMicroclimateEffects } from '../../config.js';

const MicroclimateTuner = ({ 
  customConfig, 
  onConfigChange 
}) => {
  const [showMicroclimate, setShowMicroclimate] = useState(false);

  const handleMicroclimateUpdate = (field, value) => {
    const updatedMicroclimate = { 
      ...customConfig.microclimate, 
      [field]: value 
    };
    onConfigChange({ 
      ...customConfig, 
      microclimate: updatedMicroclimate 
    });
  };

  return (
    <div className="setup-section">
      <div className="microclimate-header">
        <h3>🏡 Microclimate Mapping</h3>
        <p>Your specific site conditions can create temperature differences of 10-20°F and extend seasons by 2-4 weeks</p>
        <button 
          className="button small"
          onClick={() => setShowMicroclimate(!showMicroclimate)}
        >
          {showMicroclimate ? 'Hide Advanced Settings' : 'Customize Site Conditions'}
        </button>
      </div>
      
      {showMicroclimate && (
        <div className="microclimate-wizard">
          <div className="microclimate-grid">
            {Object.entries(MICROCLIMATE_OPTIONS).map(([category, options]) => (
              <div key={category} className="microclimate-item">
                <label>
                  {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </label>
                {category === 'frostPocket' ? (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={customConfig.microclimate.frostPocket}
                      onChange={(e) => handleMicroclimateUpdate('frostPocket', e.target.checked)}
                    />
                    Frost Pocket
                  </label>
                ) : (
                  <select
                    value={customConfig.microclimate[category]}
                    onChange={(e) => handleMicroclimateUpdate(category, e.target.value)}
                  >
                    {Object.entries(options).map(([key, option]) => (
                      <option key={key} value={key}>{option.name}</option>
                    ))}
                  </select>
                )}
                <div className="microclimate-description">
                  {category === 'frostPocket' 
                    ? 'Low area where cold air settles, creating frost 2+ weeks later in spring'
                    : options[customConfig.microclimate[category]]?.description
                  }
                </div>
              </div>
            ))}
          </div>

          <div className="microclimate-preview">
            <h4>🔍 Your Microclimate Effects</h4>
            {(() => {
              const effects = calculateMicroclimateEffects(customConfig.microclimate);
              return (
                <div className="effects-summary">
                  <div className="effect-item">
                    <span className="effect-label">Temperature Adjustment:</span>
                    <span className="effect-value">
                      {effects.temperatureAdjustment > 0 ? '+' : ''}{effects.temperatureAdjustment}°F
                    </span>
                  </div>
                  <div className="effect-item">
                    <span className="effect-label">Season Extension:</span>
                    <span className="effect-value">
                      {effects.seasonExtension > 0 ? '+' : ''}{effects.seasonExtension} weeks
                    </span>
                  </div>
                  <div className="effect-item">
                    <span className="effect-label">Available Sunlight:</span>
                    <span className="effect-value">{effects.sunlightHours} hours/day</span>
                  </div>
                  <div className="effect-item">
                    <span className="effect-label">Water Requirements:</span>
                    <span className="effect-value">
                      {effects.waterRequirementMultiplier > 1 ? 'Higher' : 
                       effects.waterRequirementMultiplier < 1 ? 'Lower' : 'Normal'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MicroclimateTuner;