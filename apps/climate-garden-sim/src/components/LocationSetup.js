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

const LocationSetup = ({ onConfigUpdate, onComplete }) => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const solarIntegrationRef = useRef(null);
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