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
    const topCropRecommendations = generateLocationTopCrops(portfolioStrategies[selectedPortfolio], locationConfig);
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