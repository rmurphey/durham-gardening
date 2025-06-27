/**
 * GardenStateProvider Component
 * Centralized state management for garden application state
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { generateSuccessOutlook } from '../config.js';
import { 
  generateLocationMonthlyFocus,
  generateLocationWeeklyActions,
  generateLocationTopCrops,
  generateLocationSiteRecommendations,
  generateLocationInvestmentPriority
} from '../services/locationRecommendations.js';
import { generateLocationSpecificScenarios } from '../data/climateScenarios.js';
import { getPortfolioStrategies, createCustomPortfolio, validatePortfolioAllocations } from '../data/portfolioStrategies.js';
import { useSimulation } from '../hooks/useSimulation.js';
import { useClimateSelection, useInvestmentConfig, useLocationConfig } from '../hooks/useLocalStorage.js';
import { useShoppingList } from '../hooks/useShoppingList.js';
import { useCalendarTaskManager } from '../hooks/useCalendarTaskManager.js';
import { 
  createEmptyGardenLog,
  addPlanting,
  updatePlanting,
  removePlanting,
  getActivePlantings,
  getPlantingsByStatus,
  PLANTING_STATUS
} from '../services/gardenLog.js';

const GardenStateContext = createContext();

export function GardenStateProvider({ children, isReadOnly = false }) {
  // Core state management hooks
  const {
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    setSelectedSummer,
    setSelectedWinter,
    setSelectedPortfolio
  } = useClimateSelection();

  // Shopping and task management (read-only for shared gardens)
  const shoppingActions = useShoppingList();
  const calendarTaskManager = useCalendarTaskManager();

  // Dynamic location configuration with localStorage persistence
  const [locationConfig, setLocationConfig] = useLocationConfig();
  
  const [customInvestment, setCustomInvestment] = useInvestmentConfig();
  const [customPortfolio, setCustomPortfolio] = useState(null);
  
  // Garden log state management
  const [gardenLog, setGardenLog] = useState(() => createEmptyGardenLog());
  
  // Use simulation hook
  const { simulationResults, simulating, totalInvestment } = useSimulation(
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    locationConfig,
    customPortfolio,
    customInvestment
  );

  // Get current climate scenarios and portfolio strategies
  const currentClimateScenarios = useMemo(() => 
    generateLocationSpecificScenarios(locationConfig), 
    [locationConfig]
  );
  
  const portfolioStrategies = useMemo(() => 
    getPortfolioStrategies(locationConfig, customPortfolio), 
    [locationConfig, customPortfolio]
  );

  // Garden log management functions
  const handleAddPlanting = (plantingData) => {
    if (!isReadOnly) {
      setGardenLog(currentLog => addPlanting(currentLog, plantingData));
    }
  };

  const handleUpdatePlanting = (plantingId, updates) => {
    if (!isReadOnly) {
      setGardenLog(currentLog => updatePlanting(currentLog, plantingId, updates));
    }
  };

  const handleRemovePlanting = (plantingId) => {
    if (!isReadOnly) {
      setGardenLog(currentLog => removePlanting(currentLog, plantingId));
    }
  };

  // Handle custom portfolio changes
  const handleCustomPortfolioChange = (allocations) => {
    if (validatePortfolioAllocations(allocations)) {
      const portfolio = createCustomPortfolio(null, allocations);
      setCustomPortfolio(portfolio);
      setSelectedPortfolio('custom');
    }
  };

  // Generate location-aware recommendations
  const recommendations = useMemo(() => {
    const monthlyFocus = generateLocationMonthlyFocus(portfolioStrategies[selectedPortfolio], simulationResults, locationConfig);
    const weeklyActions = generateLocationWeeklyActions(portfolioStrategies[selectedPortfolio]);
    const successOutlook = simulationResults ? 
      generateSuccessOutlook(simulationResults, locationConfig)?.message || 'Analyzing garden potential...' : 
      'Run simulation to see success outlook';
    const investmentPriority = generateLocationInvestmentPriority(customInvestment, locationConfig);
    const topCropRecommendations = generateLocationTopCrops(portfolioStrategies[selectedPortfolio], locationConfig, gardenLog);
    const siteSpecificRecommendations = generateLocationSiteRecommendations(locationConfig);

    return {
      monthlyFocus,
      weeklyActions,
      successOutlook,
      investmentPriority,
      topCropRecommendations,
      siteSpecificRecommendations
    };
  }, [portfolioStrategies, selectedPortfolio, simulationResults, locationConfig, customInvestment]);

  // Garden log derived data
  const activePlantings = useMemo(() => getActivePlantings(gardenLog), [gardenLog]);
  const readyToHarvest = useMemo(() => 
    getPlantingsByStatus(gardenLog, PLANTING_STATUS.READY), [gardenLog]
  );

  const value = {
    // Core selection state
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    setSelectedSummer,
    setSelectedWinter,
    setSelectedPortfolio,
    
    // Shopping and task management
    shoppingActions: isReadOnly ? { totalItems: 0 } : shoppingActions,
    calendarTaskManager,
    
    // Configuration
    locationConfig,
    setLocationConfig,
    customInvestment,
    setCustomInvestment,
    customPortfolio,
    setCustomPortfolio,
    handleCustomPortfolioChange,
    
    // Garden log state and actions
    gardenLog,
    activePlantings,
    readyToHarvest,
    handleAddPlanting,
    handleUpdatePlanting,
    handleRemovePlanting,
    PLANTING_STATUS,
    
    // Simulation data
    simulationResults,
    simulating,
    totalInvestment,
    
    // Derived data
    currentClimateScenarios,
    portfolioStrategies,
    recommendations,
    
    // Read-only state
    isReadOnly
  };

  return (
    <GardenStateContext.Provider value={value}>
      {children}
    </GardenStateContext.Provider>
  );
}

export function useGardenAppState() {
  const context = useContext(GardenStateContext);
  if (context === undefined) {
    throw new Error('useGardenAppState must be used within a GardenStateProvider');
  }
  return context;
}

export default GardenStateProvider;