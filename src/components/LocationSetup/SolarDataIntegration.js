/**
 * SolarDataIntegration Component
 * Handles solar data consent, API key management, and data fetching
 */

import React, { useState } from 'react';
import { 
  SHADEMAP_CONFIG, 
  convertSolarDataToCanopyShade,
  getEnhancedMicroclimateRecommendations 
} from '../../config.js';

const SolarDataIntegration = React.forwardRef(({ 
  customConfig, 
  onConfigChange,
  onSolarDataUpdate 
}, ref) => {
  const [solarDataConsent, setSolarDataConsent] = useState(false);
  const [shademapApiKey, setShademapApiKey] = useState('');
  const [loadingSolarData, setLoadingSolarData] = useState(false);
  const [solarData, setSolarData] = useState(null);

  const fetchSolarData = async () => {
    if (!solarDataConsent || !customConfig.lat || !customConfig.lon) {
      return null;
    }
    
    setLoadingSolarData(true);
    try {
      const data = await SHADEMAP_CONFIG.requestSolarData(
        customConfig.lat, 
        customConfig.lon, 
        shademapApiKey
      );
      setSolarData(data);
      
      // Auto-update canopy shade if solar data available
      if (data) {
        const suggestedShade = convertSolarDataToCanopyShade(data);
        if (suggestedShade) {
          onConfigChange({
            ...customConfig,
            microclimate: { ...customConfig.microclimate, canopyShade: suggestedShade }
          });
        }
      }
      
      // Notify parent of solar data update
      if (onSolarDataUpdate) {
        onSolarDataUpdate(data);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch solar data:', error);
      return null;
    } finally {
      setLoadingSolarData(false);
    }
  };

  const getEnhancedRecommendations = () => {
    return solarData ? 
      getEnhancedMicroclimateRecommendations(solarData, customConfig.microclimate) : [];
  };

  // Expose methods to parent
  React.useImperativeHandle(ref, () => ({
    fetchSolarData,
    getEnhancedRecommendations,
    getSolarData: () => solarData,
    isConsentGiven: () => solarDataConsent
  }));

  return (
    <div className="setup-section">
      <h3>🌞 Solar Data Integration (Optional)</h3>
      <p>Get precise sunlight data for your location to optimize plant placement</p>
      
      <div className="solar-consent">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={solarDataConsent}
            onChange={(e) => setSolarDataConsent(e.target.checked)}
          />
          I consent to using solar data services for my location
        </label>
      </div>

      {solarDataConsent && (
        <div className="solar-integration-form">
          <div className="config-item">
            <label>Coordinates (required for solar data):</label>
            <div className="coordinate-inputs">
              <input
                type="number"
                placeholder="Latitude"
                value={customConfig.lat}
                onChange={(e) => onConfigChange({
                  ...customConfig,
                  lat: e.target.value
                })}
                step="0.0001"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={customConfig.lon}
                onChange={(e) => onConfigChange({
                  ...customConfig,
                  lon: e.target.value
                })}
                step="0.0001"
              />
            </div>
          </div>

          <div className="config-item">
            <label>ShadeMap API Key (optional):</label>
            <input
              type="text"
              value={shademapApiKey}
              onChange={(e) => setShademapApiKey(e.target.value)}
              placeholder="Your ShadeMap API key for enhanced data"
            />
          </div>

          <button 
            className="button small"
            onClick={fetchSolarData}
            disabled={loadingSolarData || !customConfig.lat || !customConfig.lon}
          >
            {loadingSolarData ? 'Loading Solar Data...' : 'Fetch Solar Data'}
          </button>

          {solarData && (
            <div className="solar-data-preview">
              <h4>☀️ Solar Data Retrieved</h4>
              <p>Solar data successfully integrated - your microclimate settings have been automatically optimized!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SolarDataIntegration;