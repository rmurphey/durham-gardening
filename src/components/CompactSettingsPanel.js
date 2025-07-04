/**
 * CompactSettingsPanel Component
 * Collapsible settings for dashboard - minimal visual footprint
 */

import React, { useState } from 'react';
import { formatCurrency, REGION_PRESETS } from '../config.js';

const CompactSettingsPanel = ({ 
  climateScenarios,
  selectedSummer,
  selectedWinter,
  onSummerChange,
  onWinterChange,
  portfolioStrategies,
  selectedPortfolio,
  onPortfolioChange,
  onCustomPortfolioChange,
  investmentConfig,
  onInvestmentChange,
  locationConfig,
  onLocationChange,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLocationSetup, setShowLocationSetup] = useState(false);
  const [showLocationSaved, setShowLocationSaved] = useState(false);
  const [showSettingsSaved, setShowSettingsSaved] = useState(false);
  const [locationSetupConfig, setLocationSetupConfig] = useState({
    name: locationConfig?.name || '',
    lat: locationConfig?.lat || '',
    lon: locationConfig?.lon || '',
    hardiness: locationConfig?.hardiness || '7b'
  });

  // Get display names for current selections
  const currentSummerName = climateScenarios.summer?.find(s => s.id === selectedSummer)?.name || 'Unknown';
  const currentWinterName = climateScenarios.winter?.find(w => w.id === selectedWinter)?.name || 'Unknown';
  const currentPortfolioName = portfolioStrategies[selectedPortfolio]?.name || 'Unknown';
  const currentLocationName = locationConfig?.name || 'Not Set';
  const totalInvestment = investmentConfig ? Object.values(investmentConfig).reduce((sum, val) => sum + (val || 0), 0) : 0;

  // Helper function to show settings saved feedback
  const showSettingsSavedFeedback = () => {
    setShowSettingsSaved(true);
    setTimeout(() => {
      setShowSettingsSaved(false);
    }, 2000); // Shorter duration for general settings
  };

  // Wrapped handlers with feedback
  const handleSummerChange = (value) => {
    onSummerChange(value);
    showSettingsSavedFeedback();
  };

  const handleWinterChange = (value) => {
    onWinterChange(value);
    showSettingsSavedFeedback();
  };

  const handlePortfolioChange = (portfolioId) => {
    onPortfolioChange(portfolioId);
    
    // If custom portfolio selected, trigger custom portfolio handler
    if (portfolioId === 'custom' && onCustomPortfolioChange) {
      // Use default allocations for custom portfolio
      const defaultAllocations = {
        'Lettuce': 20,
        'Tomatoes': 25,
        'Carrots': 15,
        'Beans': 20,
        'Herbs': 20
      };
      onCustomPortfolioChange(defaultAllocations);
    }
    
    // Show feedback
    showSettingsSavedFeedback();
  };

  // Check if location is in continental US
  const validateContinentalUS = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=3&addressdetails=1`);
      const data = await response.json();
      
      const country = data.address?.country;
      const state = data.address?.state;
      
      // Check if location is in continental US (excludes Alaska, Hawaii, territories)
      if (country !== 'United States') {
        return { valid: false, reason: 'outside_us' };
      }
      
      if (state === 'Alaska' || state === 'Hawaii') {
        return { valid: false, reason: 'non_continental' };
      }
      
      return { valid: true };
    } catch (error) {
      console.warn('Could not validate location, allowing anyway:', error);
      return { valid: true }; // Default to allowing if validation fails
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Validate location is in continental US
        const validation = await validateContinentalUS(latitude, longitude);
        
        if (!validation.valid) {
          const message = validation.reason === 'outside_us' 
            ? 'GardenSim currently only supports gardens in the continental United States. Would you like to set up a garden in Durham, NC instead?'
            : 'GardenSim currently only supports the continental US (excluding Alaska and Hawaii). Would you like to set up a garden in Durham, NC instead?';
          
          if (window.confirm(message)) {
            // Use Durham, NC as fallback
            setLocationSetupConfig({
              name: 'Durham, NC (Default)',
              lat: 35.9940,
              lon: -78.8986,
              hardiness: '7b'
            });
          }
          return;
        }
        
        setLocationSetupConfig(prev => ({
          ...prev,
          lat: parseFloat(latitude.toFixed(4)),
          lon: parseFloat(longitude.toFixed(4)),
          name: prev.name || `Location ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
        }));
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handlePresetSelect = (presetKey) => {
    const preset = REGION_PRESETS[presetKey];
    if (preset) {
      setLocationSetupConfig({
        name: preset.name,
        lat: preset.lat,
        lon: preset.lon,
        hardiness: preset.hardiness
      });
    }
  };

  const handleSaveLocation = async () => {
    if (onLocationChange && locationSetupConfig.lat && locationSetupConfig.lon) {
      // Validate location is in continental US
      const validation = await validateContinentalUS(locationSetupConfig.lat, locationSetupConfig.lon);
      
      if (!validation.valid) {
        const message = validation.reason === 'outside_us' 
          ? 'GardenSim currently only supports gardens in the continental United States. Would you like to set up a garden in Durham, NC instead?'
          : 'GardenSim currently only supports the continental US (excluding Alaska and Hawaii). Would you like to set up a garden in Durham, NC instead?';
        
        if (window.confirm(message)) {
          // Use Durham, NC as fallback
          const durhamConfig = {
            name: 'Durham, NC (Default)',
            lat: 35.9940,
            lon: -78.8986,
            hardiness: '7b',
            zipCode: locationConfig?.zipCode
          };
          onLocationChange(durhamConfig);
          setLocationSetupConfig(durhamConfig);
        }
        return;
      }
      
      onLocationChange({
        ...locationSetupConfig,
        zipCode: locationConfig?.zipCode // Preserve existing zipCode if any
      });
      setShowLocationSetup(false);
      
      // Show success feedback
      setShowLocationSaved(true);
      setTimeout(() => {
        setShowLocationSaved(false);
      }, 3000); // Hide after 3 seconds
    }
  };

  return (
    <div className="compact-settings-panel">
      <button 
        className={`settings-toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        title={disabled ? 'Settings view-only' : 'Toggle garden settings'}
      >
        <span className="settings-icon">⚙️</span>
        <span className="settings-summary">
          <span className="current-selection">
            📍 {currentLocationName} • {currentSummerName} + {currentWinterName} • {currentPortfolioName}
            {investmentConfig && ` • ${formatCurrency(totalInvestment)}`}
          </span>
          {!disabled && (
            <span className="toggle-hint">{isExpanded ? 'Hide' : 'Edit'} Settings</span>
          )}
        </span>
        {!disabled && (
          <span className={`expand-arrow ${isExpanded ? 'up' : 'down'}`}>
            {isExpanded ? '▲' : '▼'}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="settings-content">
          {showSettingsSaved && (
            <div className="settings-saved-feedback">
              ✅ Settings saved!
            </div>
          )}
          {/* Location Settings */}
          <div className="setting-group">
            <h4 className="setting-title">📍 Garden Location</h4>
            {showLocationSaved && (
              <div className="location-saved-feedback">
                ✅ Location saved successfully!
              </div>
            )}
            
            {!showLocationSetup ? (
              <div className="setting-row">
                <div className="setting-item">
                  <label className="setting-label">Current:</label>
                  <span className="setting-value">{currentLocationName}</span>
                </div>
                <button 
                  className="button small location-change-btn"
                  onClick={() => setShowLocationSetup(true)}
                  disabled={disabled}
                >
                  📍 Change Location
                </button>
              </div>
            ) : (
              <div className="location-setup">
                {/* Regional Presets */}
                <div className="setting-row">
                  <div className="setting-item full-width">
                    <label className="setting-label">Quick Presets:</label>
                    <select 
                      className="setting-select"
                      onChange={(e) => e.target.value && handlePresetSelect(e.target.value)}
                      disabled={disabled}
                      value=""
                    >
                      <option value="">Choose a preset...</option>
                      {Object.entries(REGION_PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>{preset.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Manual Location Input */}
                <div className="setting-row">
                  <div className="setting-item">
                    <label className="setting-label">Location Name:</label>
                    <input
                      type="text"
                      className="setting-input"
                      value={locationSetupConfig.name}
                      onChange={(e) => setLocationSetupConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., My Garden"
                      disabled={disabled}
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="setting-row">
                  <div className="setting-item coordinate-group">
                    <label className="setting-label">Coordinates:</label>
                    <div className="coordinate-inputs">
                      <input
                        type="number"
                        placeholder="Latitude"
                        value={locationSetupConfig.lat}
                        onChange={(e) => setLocationSetupConfig(prev => ({ ...prev, lat: parseFloat(e.target.value) || '' }))}
                        step="0.0001"
                        disabled={disabled}
                      />
                      <input
                        type="number"
                        placeholder="Longitude"
                        value={locationSetupConfig.lon}
                        onChange={(e) => setLocationSetupConfig(prev => ({ ...prev, lon: parseFloat(e.target.value) || '' }))}
                        step="0.0001"
                        disabled={disabled}
                      />
                      <button
                        type="button"
                        className="button small geolocation-btn"
                        onClick={handleGeolocation}
                        disabled={disabled}
                      >
                        📍 Use My Location
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="setting-row">
                  <div className="setting-actions">
                    <button
                      className="button small"
                      onClick={() => setShowLocationSetup(false)}
                      disabled={disabled}
                    >
                      Cancel
                    </button>
                    <button
                      className="button small primary"
                      onClick={handleSaveLocation}
                      disabled={disabled || !locationSetupConfig.lat || !locationSetupConfig.lon}
                    >
                      Save Location
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Climate Scenarios */}
          <div className="setting-group">
            <h4 className="setting-title">🌡️ Climate Scenarios</h4>
            <div className="setting-row">
              <div className="setting-item">
                <label className="setting-label">Summer:</label>
                <select 
                  className="setting-select"
                  value={selectedSummer}
                  onChange={(e) => handleSummerChange(e.target.value)}
                  disabled={disabled}
                >
                  {climateScenarios.summer?.map(scenario => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="setting-item">
                <label className="setting-label">Winter:</label>
                <select 
                  className="setting-select"
                  value={selectedWinter}
                  onChange={(e) => handleWinterChange(e.target.value)}
                  disabled={disabled}
                >
                  {climateScenarios.winter?.map(scenario => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Portfolio Strategy */}
          <div className="setting-group">
            <h4 className="setting-title">🌱 Garden Strategy</h4>
            <div className="setting-row">
              <div className="setting-item full-width">
                <label className="setting-label">Portfolio:</label>
                <select 
                  className="setting-select"
                  value={selectedPortfolio}
                  onChange={(e) => handlePortfolioChange(e.target.value)}
                  disabled={disabled}
                >
                  {Object.entries(portfolioStrategies).map(([key, strategy]) => (
                    <option key={key} value={key}>
                      {strategy.name} - {strategy.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Show current portfolio allocation summary */}
            {portfolioStrategies[selectedPortfolio] && (
              <div className="portfolio-summary">
                <div className="allocation-chips">
                  {Object.entries(portfolioStrategies[selectedPortfolio].allocation || {}).map(([crop, percentage]) => (
                    <span key={crop} className="allocation-chip">
                      {crop}: {percentage}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Investment Configuration */}
          {investmentConfig && onInvestmentChange && (
            <div className="setting-group">
              <h4 className="setting-title">💰 Annual Budget</h4>
              <div className="setting-row">
                <div className="setting-item">
                  <label className="setting-label">Seeds & Plants:</label>
                  <input
                    type="number"
                    className="setting-input"
                    value={investmentConfig.seeds || 0}
                    onChange={(e) => onInvestmentChange({
                      ...investmentConfig,
                      seeds: parseFloat(e.target.value) || 0
                    })}
                    disabled={disabled}
                    min="0"
                    step="10"
                  />
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Soil & Compost:</label>
                  <input
                    type="number"
                    className="setting-input"
                    value={investmentConfig.soil || 0}
                    onChange={(e) => onInvestmentChange({
                      ...investmentConfig,
                      soil: parseFloat(e.target.value) || 0
                    })}
                    disabled={disabled}
                    min="0"
                    step="10"
                  />
                </div>
              </div>
              
              <div className="setting-row">
                <div className="setting-item">
                  <label className="setting-label">Fertilizer:</label>
                  <input
                    type="number"
                    className="setting-input"
                    value={investmentConfig.fertilizer || 0}
                    onChange={(e) => onInvestmentChange({
                      ...investmentConfig,
                      fertilizer: parseFloat(e.target.value) || 0
                    })}
                    disabled={disabled}
                    min="0"
                    step="10"
                  />
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Protection:</label>
                  <input
                    type="number"
                    className="setting-input"
                    value={investmentConfig.protection || 0}
                    onChange={(e) => onInvestmentChange({
                      ...investmentConfig,
                      protection: parseFloat(e.target.value) || 0
                    })}
                    disabled={disabled}
                    min="0"
                    step="10"
                  />
                </div>
              </div>
              
              <div className="investment-summary">
                <div className="total-investment">
                  <span className="total-label">Total Annual Budget:</span>
                  <span className="total-value">{formatCurrency(totalInvestment)}</span>
                </div>
              </div>
            </div>
          )}

          {!disabled && (
            <div className="settings-actions">
              <button 
                className="settings-action-btn"
                onClick={() => setIsExpanded(false)}
              >
                ✓ Done
              </button>
              <button 
                className="settings-advanced-btn"
                onClick={() => {
                  // Navigate to analysis page for advanced settings
                  if (window.location.pathname.includes('/garden/')) {
                    // Garden mode navigation
                    const pathParts = window.location.pathname.split('/');
                    const gardenId = pathParts[2];
                    window.location.pathname = `/garden/${gardenId}/analysis`;
                  } else {
                    // Regular navigation
                    window.location.pathname = '/analysis';
                  }
                }}
              >
                Advanced Settings →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactSettingsPanel;