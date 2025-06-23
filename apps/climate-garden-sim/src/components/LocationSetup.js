/**
 * LocationSetup Component
 * Orchestrates location configuration through extracted sub-components
 */

import React, { useState, useRef } from 'react';
import {
  REGION_PRESETS,
  getScaleValue,
  getHardinessZoneNumber,
  calculateMicroclimateEffects,
  getMicroclimateAdjustedRecommendations,
  HEAT_INTENSITY_SCALE,
  GARDEN_SIZE_SCALE,
  INVESTMENT_LEVEL_SCALE
} from '../config.js';
import RegionPresetSelector from './LocationSetup/RegionPresetSelector.js';
import BasicLocationForm from './LocationSetup/BasicLocationForm.js';
import MicroclimateTuner from './LocationSetup/MicroclimateTuner.js';
import SolarDataIntegration from './LocationSetup/SolarDataIntegration.js';
import { useWeatherData } from '../hooks/useWeatherData.js';
import { generateWeatherRiskAnalysis } from '../services/weatherIntegration.js';

const LocationSetup = ({ onConfigUpdate, onComplete }) => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const solarIntegrationRef = useRef(null);
  const [showWeatherPreview, setShowWeatherPreview] = useState(false);
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

  // Use weather data hook for location preview
  const weatherData = useWeatherData(
    customConfig.lat && customConfig.lon ? customConfig : null,
    {
      autoRefresh: false,
      enableForecast: true,
      enableHistorical: false,
      enableGDD: true,
      enableFrostDates: true
    }
  );

  const getHeatDaysFromIntensity = (intensity) => 
    getScaleValue(HEAT_INTENSITY_SCALE, intensity) || 100;

  const getGardenSizeFromScale = (scale) => 
    getScaleValue(GARDEN_SIZE_SCALE, scale) || 100;

  const getBudgetFromLevel = (level) => 
    getScaleValue(INVESTMENT_LEVEL_SCALE, level) || 200;


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
    // Get solar data and enhanced recommendations if available
    let currentSolarData = null;
    let enhancedRecommendations = [];
    
    if (solarIntegrationRef.current) {
      if (solarIntegrationRef.current.isConsentGiven()) {
        currentSolarData = await solarIntegrationRef.current.fetchSolarData();
      }
      enhancedRecommendations = solarIntegrationRef.current.getEnhancedRecommendations();
    }
    
    // Calculate microclimate effects
    const microclimateEffects = calculateMicroclimateEffects(customConfig.microclimate);
    const adjustedConfig = getMicroclimateAdjustedRecommendations(customConfig, microclimateEffects);
    
    // Include weather data and risk analysis if available
    let weatherRiskAnalysis = null;
    if (weatherData.hasWeatherData) {
      weatherRiskAnalysis = generateWeatherRiskAnalysis({
        current: weatherData.current,
        forecast: weatherData.forecast,
        gddData: weatherData.gddData
      }, customConfig);
    }

    const finalConfig = {
      ...customConfig,
      ...adjustedConfig,
      heatDays: getHeatDaysFromIntensity(customConfig.heatIntensity),
      gardenSizeActual: getGardenSizeFromScale(customConfig.gardenSize),
      budget: getBudgetFromLevel(customConfig.investmentLevel),
      microclimateEffects,
      solarData: currentSolarData,
      enhancedRecommendations,
      weatherData: weatherData.hasWeatherData ? {
        current: weatherData.current,
        forecast: weatherData.forecast,
        gddData: weatherData.gddData,
        frostDates: weatherData.frostDates
      } : null,
      weatherRiskAnalysis
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
        
        <RegionPresetSelector 
          selectedPreset={selectedPreset}
          onPresetSelect={handlePresetSelect}
        />

        <BasicLocationForm 
          customConfig={customConfig}
          onConfigChange={setCustomConfig}
        />

        <MicroclimateTuner 
          customConfig={customConfig}
          onConfigChange={setCustomConfig}
        />

        <SolarDataIntegration 
          ref={solarIntegrationRef}
          customConfig={customConfig}
          onConfigChange={setCustomConfig}
        />

        {customConfig.lat && customConfig.lon && (
          <div className="setup-section">
            <div className="weather-preview-header">
              <h3>🌦️ Location Weather Preview</h3>
              <button 
                className="button small"
                onClick={() => setShowWeatherPreview(!showWeatherPreview)}
              >
                {showWeatherPreview ? 'Hide Weather Info' : 'Show Weather Info'}
              </button>
            </div>
            
            {showWeatherPreview && (
              <div className="weather-preview">
                {weatherData.loading && (
                  <div className="weather-loading">
                    <span>🌦️ Loading weather data...</span>
                  </div>
                )}
                
                {weatherData.current && (
                  <div className="weather-current">
                    <h4>Current Conditions</h4>
                    <div className="weather-summary">
                      <span className="temp">{weatherData.current.temperature.current}°F</span>
                      <span className="condition">{weatherData.current.condition.description}</span>
                    </div>
                  </div>
                )}
                
                {weatherData.forecast.length > 0 && (
                  <div className="weather-forecast">
                    <h4>7-Day Outlook</h4>
                    <div className="forecast-summary">
                      <div className="forecast-item">
                        <span className="label">Temperature Range:</span>
                        <span className="value">
                          {Math.min(...weatherData.forecast.slice(0, 7).map(d => d.temperature.min))}°F - 
                          {Math.max(...weatherData.forecast.slice(0, 7).map(d => d.temperature.max))}°F
                        </span>
                      </div>
                      <div className="forecast-item">
                        <span className="label">Weekly GDD:</span>
                        <span className="value">
                          {Math.round(weatherData.forecast.slice(0, 7).reduce((sum, d) => sum + d.gdd, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {weatherData.frostDates && (
                  <div className="weather-frost">
                    <h4>Frost Information</h4>
                    <div className="frost-summary">
                      <div className="frost-item">
                        <span className="label">Growing Season:</span>
                        <span className="value">{weatherData.frostDates.growingSeasonLength || 'Unknown'} days</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {weatherData.errors.length > 0 && (
                  <div className="weather-errors">
                    <h4>⚠️ Weather Data Issues</h4>
                    {weatherData.errors.slice(0, 2).map((error, index) => (
                      <div key={index} className="error-message">{error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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