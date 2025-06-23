import React, { useState } from 'react';
import { 
  generateMonthlyFocus,
  generateSuccessOutlook,
  generateTopCropRecommendations,
  generateWeeklyActions,
  generateInvestmentPriority,
  generateSiteSpecificRecommendations
} from './config.js';

// New modular imports
import { generateLocationSpecificScenarios } from './data/climateScenarios.js';
import { getPortfolioStrategies, createCustomPortfolio, validatePortfolioAllocations } from './data/portfolioStrategies.js';
import { useSimulation } from './hooks/useSimulation.js';
import { useClimateSelection, useInvestmentConfig, useUIPreferences } from './hooks/useLocalStorage.js';
import { DURHAM_CONFIG } from './config/durhamConfig.js';
import ClimateScenarioSelector from './components/ClimateScenarioSelector.js';
import PortfolioManager from './components/PortfolioManager.js';
import SimulationResults from './components/SimulationResults.js';
import GardenCalendar from './components/GardenCalendar.js';
import RecommendationsPanel from './components/RecommendationsPanel.js';
import DurhamShoppingList from './components/DurhamShoppingList.js';
import { generateGardenCalendar } from './services/gardenCalendar.js';
import './index.css';

function App() {
  // Use custom hooks for state management
  const {
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    setSelectedSummer,
    setSelectedWinter,
    setSelectedPortfolio
  } = useClimateSelection();

  // Durham-only configuration - no location setup needed
  const locationConfig = {
    ...DURHAM_CONFIG,
    gardenSize: 2,
    investmentLevel: 3,
    marketMultiplier: 1.0,
    gardenSizeActual: 100,
    budget: 400
  };
  
  const [customInvestment, setCustomInvestment] = useInvestmentConfig();

  // Custom portfolio state (not persisted by default)
  const [customPortfolio, setCustomPortfolio] = useState(null);
  
  // Use simulation hook
  const { simulationResults, simulating, triggerSimulation, totalInvestment } = useSimulation(
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    locationConfig,
    customPortfolio,
    customInvestment
  );

  // Get current climate scenarios based on location
  const currentClimateScenarios = generateLocationSpecificScenarios(locationConfig);
  
  // Get current portfolio strategies
  const portfolioStrategies = getPortfolioStrategies(locationConfig, customPortfolio);

  // Handle custom portfolio changes
  const handleCustomPortfolioChange = (allocations) => {
    if (validatePortfolioAllocations(allocations)) {
      const portfolio = createCustomPortfolio(null, allocations);
      setCustomPortfolio(portfolio);
      setSelectedPortfolio('custom');
    }
  };

  // Generate enhanced recommendations if simulation results are available
  const monthlyFocus = simulationResults ? generateMonthlyFocus(locationConfig, portfolioStrategies[selectedPortfolio], simulationResults) : '';
  const weeklyActions = generateWeeklyActions(locationConfig, portfolioStrategies[selectedPortfolio]);
  const successOutlook = simulationResults ? generateSuccessOutlook(simulationResults, locationConfig) : '';
  const investmentPriority = generateInvestmentPriority(customInvestment);
  const topCropRecommendations = generateTopCropRecommendations(locationConfig, portfolioStrategies[selectedPortfolio]);
  const siteSpecificRecommendations = generateSiteSpecificRecommendations(locationConfig);
  const gardenCalendar = generateGardenCalendar(selectedSummer, selectedWinter, selectedPortfolio, locationConfig, customPortfolio);


  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="app-title">🌱 Durham Garden Planner</h1>
            <p className="app-subtitle">Heat-adapted gardening for Durham, North Carolina (Zone 7b)</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <ClimateScenarioSelector
          climateScenarios={currentClimateScenarios}
          selectedSummer={selectedSummer}
          selectedWinter={selectedWinter}
          onSummerChange={setSelectedSummer}
          onWinterChange={setSelectedWinter}
        />

        <PortfolioManager
          portfolioStrategies={portfolioStrategies}
          selectedPortfolio={selectedPortfolio}
          onPortfolioChange={setSelectedPortfolio}
          onCustomPortfolioChange={handleCustomPortfolioChange}
        />

        <SimulationResults
          simulationResults={simulationResults}
          simulating={simulating}
          totalInvestment={totalInvestment}
        />

        <DurhamShoppingList 
          portfolio={portfolioStrategies[selectedPortfolio]}
          gardenSize={locationConfig.gardenSizeActual || 100}
        />

        <GardenCalendar gardenCalendar={gardenCalendar} />

        <RecommendationsPanel
          monthlyFocus={monthlyFocus}
          weeklyActions={weeklyActions}
          successOutlook={successOutlook}
          investmentPriority={investmentPriority}
          topCropRecommendations={topCropRecommendations}
          siteSpecificRecommendations={siteSpecificRecommendations}
        />
      </main>
    </div>
  );
}

export default App;