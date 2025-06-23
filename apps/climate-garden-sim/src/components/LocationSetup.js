/**
 * LocationSetup Component
 * Handles location configuration, microclimate settings, and solar data integration
 */

import React, { useState } from 'react';
import {
  REGION_PRESETS,
  SUPPORTED_REGIONS,
  HARDINESS_ZONES,
  MICROCLIMATE_OPTIONS,
  INVESTMENT_PRESETS,
  SHADEMAP_CONFIG,
  getScaleValue,
  getHardinessZoneNumber,
  formatPercentage,
  calculateMicroclimateEffects,
  getMicroclimateAdjustedRecommendations,
  getEnhancedMicroclimateRecommendations,
  convertSolarDataToCanopyShade,
  HEAT_INTENSITY_SCALE,
  GARDEN_SIZE_SCALE,
  INVESTMENT_LEVEL_SCALE
} from '../config.js';

const LocationSetup = ({ onConfigUpdate, onComplete }) => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showMicroclimate, setShowMicroclimate] = useState(false);
  const [solarDataConsent, setSolarDataConsent] = useState(false);
  const [shademapApiKey, setShademapApiKey] = useState('');
  const [loadingSolarData, setLoadingSolarData] = useState(false);
  const [solarData, setSolarData] = useState(null);
  const [customConfig, setCustomConfig] = useState({
    name: '',
    region: 'us',
    hardiness: '7b',
    lat: '',
    lon: '',
    avgRainfall: 40,
    heatIntensity: 3,
    winterSeverity: 3,
    marketMultiplier: 1.0,
    gardenSize: 2,
    investmentLevel: 3,
    microclimate: {
      slope: 'flat',
      aspect: 'south',
      windExposure: 'moderate',
      soilDrainage: 'moderate',
      buildingHeat: 'minimal',
      canopyShade: 'partial',
      elevation: 'average',
      waterAccess: 'municipal',
      frostPocket: false,
      reflectiveHeat: 'minimal'
    }
  });

  const getHeatDaysFromIntensity = (intensity) => 
    getScaleValue(HEAT_INTENSITY_SCALE, intensity) || 100;

  const getGardenSizeFromScale = (scale) => 
    getScaleValue(GARDEN_SIZE_SCALE, scale) || 100;

  const getBudgetFromLevel = (level) => 
    getScaleValue(INVESTMENT_LEVEL_SCALE, level) || 200;

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
          setCustomConfig(prev => ({
            ...prev,
            microclimate: { ...prev.microclimate, canopyShade: suggestedShade }
          }));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch solar data:', error);
      return null;
    } finally {
      setLoadingSolarData(false);
    }
  };

  const handlePresetSelect = (presetKey) => {
    console.log('Preset selected:', presetKey);
    try {
      const preset = REGION_PRESETS[presetKey];
      if (!preset) {
        console.error('Preset not found:', presetKey);
        return;
      }
      
      const heatThresholds = [50, 100, 150];
      const heatIntensity = heatThresholds.findIndex(threshold => preset.heatDays < threshold) + 2 || 5;
      
      const hardinessZone = getHardinessZoneNumber(preset.hardiness);
      const winterSeverity = hardinessZone < 6 ? 4 : hardinessZone < 8 ? 3 : 2;
      
      setSelectedPreset(presetKey);
      setCustomConfig({
        ...preset,
        heatIntensity,
        winterSeverity,
        gardenSize: 2,
        investmentLevel: 3,
        microclimate: {
          slope: 'flat',
          aspect: 'south',
          windExposure: 'moderate',
          soilDrainage: 'moderate',
          buildingHeat: 'minimal',
          canopyShade: 'partial',
          elevation: 'average',
          waterAccess: 'municipal',
          frostPocket: false,
          reflectiveHeat: 'minimal'
        }
      });
      console.log('Config updated:', { ...preset, heatIntensity, winterSeverity });
    } catch (error) {
      console.error('Error in handlePresetSelect:', error);
    }
  };

  const handleSubmit = async () => {
    // Fetch solar data if consented
    const currentSolarData = solarDataConsent ? await fetchSolarData() : null;
    
    // Calculate microclimate effects
    const microclimateEffects = calculateMicroclimateEffects(customConfig.microclimate);
    const adjustedConfig = getMicroclimateAdjustedRecommendations(customConfig, microclimateEffects);
    
    // Generate enhanced recommendations with solar data
    const enhancedRecommendations = currentSolarData ? 
      getEnhancedMicroclimateRecommendations(currentSolarData, customConfig.microclimate) : [];
    
    const finalConfig = {
      ...customConfig,
      ...adjustedConfig,
      heatDays: getHeatDaysFromIntensity(customConfig.heatIntensity),
      gardenSizeActual: getGardenSizeFromScale(customConfig.gardenSize),
      budget: getBudgetFromLevel(customConfig.investmentLevel),
      microclimateEffects,
      solarData: currentSolarData,
      enhancedRecommendations
    };
    
    if (onConfigUpdate) {
      onConfigUpdate(finalConfig);
    }
    
    if (onComplete) {
      onComplete(finalConfig);
    }
  };

  return (
    <div className="setup-overlay">
      <div className="setup-container">
        <h2>🌱 Garden Location Setup</h2>
        
        <div className="setup-section">
          <h3>Quick Start - Choose a Region</h3>
          <div className="preset-grid">
            {Object.entries(REGION_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={`preset-button ${selectedPreset === key ? 'selected' : ''}`}
                onClick={() => handlePresetSelect(key)}
              >
                <strong>{preset.name}</strong>
                <div>Zone {preset.hardiness}</div>
              </button>
            ))}
          </div>
          {selectedPreset && (
            <div className="preset-implications">
              <div className="implication-item">
                <strong>Strategy:</strong> {REGION_PRESETS[selectedPreset].heatDays > 120 ? 'Heat-tolerant crops' : getHardinessZoneNumber(REGION_PRESETS[selectedPreset].hardiness) < 6 ? 'Cold-hardy crops' : 'Balanced portfolio'}
              </div>
              {REGION_PRESETS[selectedPreset].marketMultiplier > 1.1 && (
                <div className="implication-item">
                  <strong>Premium:</strong> +{formatPercentage(REGION_PRESETS[selectedPreset].marketMultiplier - 1)}% market prices
                </div>
              )}
            </div>
          )}
        </div>

        <div className="setup-section">
          <h3>Custom Configuration</h3>
          <div className="config-grid">
            <div className="config-item">
              <label>Region:</label>
              <select
                value={customConfig.region}
                onChange={(e) => setCustomConfig({...customConfig, region: e.target.value})}
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
                onChange={(e) => setCustomConfig({...customConfig, name: e.target.value})}
                placeholder="e.g., My Garden"
              />
            </div>
            
            <div className="config-item">
              <label>Hardiness Zone:</label>
              <select
                value={customConfig.hardiness}
                onChange={(e) => setCustomConfig({...customConfig, hardiness: e.target.value})}
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
                onChange={(e) => setCustomConfig({...customConfig, avgRainfall: parseInt(e.target.value)})}
                min="5"
                max="100"
              />
            </div>

            <div className="config-item slider-item">
              <label>Summer Heat Intensity: {['', 'Mild', 'Moderate', 'High', 'Extreme', 'Desert'][customConfig.heatIntensity]}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={customConfig.heatIntensity}
                onChange={(e) => setCustomConfig({...customConfig, heatIntensity: parseInt(e.target.value)})}
                className="slider"
              />
              <div className="slider-labels">
                <span>Mild</span>
                <span>Extreme</span>
              </div>
            </div>

            <div className="config-item slider-item">
              <label>Winter Severity: {['', 'Subtropical', 'Mild', 'Moderate', 'Cold', 'Arctic'][customConfig.winterSeverity]}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={customConfig.winterSeverity}
                onChange={(e) => setCustomConfig({...customConfig, winterSeverity: parseInt(e.target.value)})}
                className="slider"
              />
              <div className="slider-labels">
                <span>Subtropical</span>
                <span>Arctic</span>
              </div>
            </div>

            <div className="config-item slider-item">
              <label>Garden Size: {['', 'Container', 'Small Yard', 'Medium Yard', 'Large Yard', 'Farm Scale'][customConfig.gardenSize]}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={customConfig.gardenSize}
                onChange={(e) => setCustomConfig({...customConfig, gardenSize: parseInt(e.target.value)})}
                className="slider"
              />
              <div className="slider-labels">
                <span>50 sq ft</span>
                <span>1000+ sq ft</span>
              </div>
            </div>

            <div className="config-item slider-item">
              <label>Investment Level: {['', 'Minimal', 'Basic', 'Standard', 'Premium', 'Luxury'][customConfig.investmentLevel]}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={customConfig.investmentLevel}
                onChange={(e) => setCustomConfig({...customConfig, investmentLevel: parseInt(e.target.value)})}
                className="slider"
              />
              <div className="slider-labels">
                <span>$100/year</span>
                <span>$1500/year</span>
              </div>
            </div>
          </div>
        </div>

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
                    <label>{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</label>
                    {category === 'frostPocket' ? (
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={customConfig.microclimate.frostPocket}
                          onChange={(e) => setCustomConfig({
                            ...customConfig,
                            microclimate: { ...customConfig.microclimate, frostPocket: e.target.checked }
                          })}
                        />
                        Frost Pocket
                      </label>
                    ) : (
                      <select
                        value={customConfig.microclimate[category]}
                        onChange={(e) => setCustomConfig({
                          ...customConfig,
                          microclimate: { ...customConfig.microclimate, [category]: e.target.value }
                        })}
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

        <div className="setup-actions">
          <button 
            className="button setup-button"
            onClick={handleSubmit}
            disabled={!customConfig.name}
          >
            Start Planning Garden
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSetup;