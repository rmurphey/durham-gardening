/**
 * RegionPresetSelector Component
 * Handles preset region selection with climate implications
 */

import React from 'react';
import { 
  REGION_PRESETS, 
  getHardinessZoneNumber, 
  formatPercentage 
} from '../../config.js';

const RegionPresetSelector = ({ 
  selectedPreset, 
  onPresetSelect 
}) => {
  return (
    <div className="setup-section">
      <h3>Quick Start - Choose a Region</h3>
      <div className="preset-grid">
        {Object.entries(REGION_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            className={`preset-button ${selectedPreset === key ? 'selected' : ''}`}
            onClick={() => onPresetSelect(key)}
          >
            <strong>{preset.name}</strong>
            <div>Zone {preset.hardiness}</div>
          </button>
        ))}
      </div>
      {selectedPreset && (
        <div className="preset-implications">
          <div className="implication-item">
            <strong>Strategy:</strong> {
              REGION_PRESETS[selectedPreset].heatDays > 120 
                ? 'Heat-tolerant crops' 
                : getHardinessZoneNumber(REGION_PRESETS[selectedPreset].hardiness) < 6 
                  ? 'Cold-hardy crops' 
                  : 'Balanced portfolio'
            }
          </div>
          {REGION_PRESETS[selectedPreset].marketMultiplier > 1.1 && (
            <div className="implication-item">
              <strong>Premium:</strong> +{formatPercentage(REGION_PRESETS[selectedPreset].marketMultiplier - 1)}% market prices
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegionPresetSelector;