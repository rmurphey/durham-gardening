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
import { useClimateSelection, useLocationConfig, useInvestmentConfig, useUIPreferences } from './hooks/useLocalStorage.js';
import LocationSetup from './components/LocationSetup.js';
import ClimateScenarioSelector from './components/ClimateScenarioSelector.js';
import PortfolioManager from './components/PortfolioManager.js';
import SimulationResults from './components/SimulationResults.js';
import GardenCalendar from './components/GardenCalendar.js';
import RecommendationsPanel from './components/RecommendationsPanel.js';
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

  const [locationConfig, setLocationConfig] = useLocationConfig();
  const [customInvestment, setCustomInvestment] = useInvestmentConfig();
  const { showSetup, setShowSetup } = useUIPreferences();

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

  // Handle location setup completion
  const handleLocationSetupComplete = (newConfig) => {
    setLocationConfig(newConfig);
    setShowSetup(false);
  };

  // Handle custom portfolio changes
  const handleCustomPortfolioChange = (allocations) => {
    if (validatePortfolioAllocations(allocations)) {
      const portfolio = createCustomPortfolio(null, allocations);
      setCustomPortfolio(portfolio);
      setSelectedPortfolio('custom');
    }
  };

  // Show setup screen if needed
  if (showSetup) {
    return (
      <LocationSetup 
        onConfigUpdate={setLocationConfig}
        onComplete={handleLocationSetupComplete}
      />
    );
  }

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
            <h1 className="app-title">🌱 Climate Garden Simulation</h1>
            <p className="app-subtitle">Science-based garden planning for {locationConfig.name}</p>
          </div>
          <div className="header-actions">
            <button 
              className="button small setup-button"
              onClick={() => setShowSetup(true)}
            >
              ⚙️ Setup
            </button>
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