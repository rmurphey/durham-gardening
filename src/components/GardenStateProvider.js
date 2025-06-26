/**
 * GardenStateProvider Component
 * Centralized state management for garden application state
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { generateSuccessOutlook } from '../config.js';
import { 
  generateDurhamMonthlyFocus,
  generateDurhamWeeklyActions,
  generateDurhamTopCrops,
  generateDurhamSiteRecommendations,
  generateDurhamInvestmentPriority
} from '../services/durhamRecommendations.js';
import { generateLocationSpecificScenarios } from '../data/climateScenarios.js';
import { getPortfolioStrategies, createCustomPortfolio, validatePortfolioAllocations } from '../data/portfolioStrategies.js';
import { useSimulation } from '../hooks/useSimulation.js';
import { useClimateSelection, useInvestmentConfig } from '../hooks/useLocalStorage.js';
import { useShoppingList } from '../hooks/useShoppingList.js';
import { useCalendarTaskManager } from '../hooks/useCalendarTaskManager.js';
import { DURHAM_CONFIG } from '../config/durhamConfig.js';

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

  // Durham-only configuration - memoized to prevent useEffect re-runs
  const locationConfig = useMemo(() => ({
    ...DURHAM_CONFIG,
    gardenSize: 2,
    investmentLevel: 3,
    marketMultiplier: 1.0,
    gardenSizeActual: 100,
    budget: 400,
    heatIntensity: 3,
    heatDays: 95
  }), []);
  
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

  // Generate Durham-specific recommendations
  const recommendations = useMemo(() => {
    const monthlyFocus = generateDurhamMonthlyFocus(portfolioStrategies[selectedPortfolio], simulationResults);
    const weeklyActions = generateDurhamWeeklyActions(portfolioStrategies[selectedPortfolio]);
    const successOutlook = simulationResults ? 
      generateSuccessOutlook(simulationResults, locationConfig)?.message || 'Analyzing garden potential...' : 
      'Run simulation to see success outlook';
    const investmentPriority = generateDurhamInvestmentPriority(customInvestment);
    const topCropRecommendations = generateDurhamTopCrops(portfolioStrategies[selectedPortfolio]);
    const siteSpecificRecommendations = generateDurhamSiteRecommendations();

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