import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { generateSuccessOutlook } from '../config.js';
import { 
  generateDurhamMonthlyFocus,
  generateDurhamWeeklyActions,
  generateDurhamTopCrops,
  generateDurhamSiteRecommendations,
  generateDurhamInvestmentPriority
} from '../services/durhamRecommendations.js';

// New modular imports
import { generateLocationSpecificScenarios } from '../data/climateScenarios.js';
import { getPortfolioStrategies, createCustomPortfolio, validatePortfolioAllocations } from '../data/portfolioStrategies.js';
import { useSimulation } from '../hooks/useSimulation.js';
import { useClimateSelection, useInvestmentConfig } from '../hooks/useLocalStorage.js';
import { useShoppingList } from '../hooks/useShoppingList.js';
import { useCalendarTaskManager } from '../hooks/useCalendarTaskManager.js';
import { DURHAM_CONFIG } from '../config/durhamConfig.js';

// Navigation and Views
import Navigation from './Navigation.js';
import DashboardView from './DashboardView.js';
import ShoppingView from './ShoppingView.js';
import GardenAppContent from './GardenAppContent.js';
import DefaultGardenRedirect from './DefaultGardenRedirect.js';

// Configuration Components
import ClimateScenarioSelector from './ClimateScenarioSelector.js';
import PortfolioManager from './PortfolioManager.js';
import SimulationResults from './SimulationResults.js';
import GardenCalendar from './GardenCalendar.js';
import InvestmentConfigurer from './InvestmentConfigurer.js';
import { generateUnifiedCalendar } from '../services/unifiedCalendarService.js';

function AppContent() {
  // Navigation state using React Router
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.slice(1) || 'dashboard';
  
  // Use custom hooks for state management
  const {
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    setSelectedSummer,
    setSelectedWinter,
    setSelectedPortfolio
  } = useClimateSelection();

  // Shopping and task management
  const shoppingActions = useShoppingList();
  const calendarTaskManager = useCalendarTaskManager();

  // Durham-only configuration - memoize to prevent useEffect re-runs
  const locationConfig = useMemo(() => ({
    ...DURHAM_CONFIG,
    gardenSize: 2,
    investmentLevel: 3,
    marketMultiplier: 1.0,
    gardenSizeActual: 100,
    budget: 400,
    heatIntensity: 3, // Durham heat intensity level
    heatDays: 95 // Extreme heat days per year
  }), []);
  
  const [customInvestment, setCustomInvestment] = useInvestmentConfig();

  // Custom portfolio state (not persisted by default)
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

  // Generate Durham-specific recommendations
  const monthlyFocus = generateDurhamMonthlyFocus(portfolioStrategies[selectedPortfolio], simulationResults);
  const weeklyActions = generateDurhamWeeklyActions(portfolioStrategies[selectedPortfolio]);
  const successOutlook = simulationResults ? 
    generateSuccessOutlook(simulationResults, locationConfig)?.message || 'Analyzing garden potential...' : 
    'Run simulation to see success outlook';
  const investmentPriority = generateDurhamInvestmentPriority(customInvestment);
  const topCropRecommendations = generateDurhamTopCrops(portfolioStrategies[selectedPortfolio]);
  const siteSpecificRecommendations = generateDurhamSiteRecommendations();
  
  // State for async garden calendar
  const [gardenCalendar, setGardenCalendar] = useState([]);

  // Generate garden calendar asynchronously
  useEffect(() => {
    const loadGardenCalendar = async () => {
      try {
        const calendar = await generateUnifiedCalendar(
          selectedSummer, 
          selectedWinter, 
          selectedPortfolio, 
          locationConfig, 
          customPortfolio
        );
        setGardenCalendar(calendar);
      } catch (error) {
        console.error('Error loading garden calendar:', error);
        setGardenCalendar([]);
      }
    };

    loadGardenCalendar();
  }, [selectedSummer, selectedWinter, selectedPortfolio, locationConfig, customPortfolio]);

  const handleViewChange = (view) => {
    navigate(`/${view}`);
  };

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

      <Navigation 
        activeView={activeView}
        onViewChange={handleViewChange}
        hasShoppingItems={shoppingActions.totalItems}
        hasTasks={calendarTaskManager.getUrgentPendingCount(gardenCalendar.flatMap(month => month.activities)) > 0}
      />
      
      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DefaultGardenRedirect />} />
          <Route path="/dashboard" element={
            <DashboardView 
              shoppingActions={shoppingActions}
              monthlyFocus={monthlyFocus}
              simulationResults={simulationResults}
              totalInvestment={totalInvestment}
              onViewChange={handleViewChange}
              gardenCalendar={gardenCalendar}
            />
          } />
          <Route path="/garden/:id/*" element={<GardenAppContent />} />
          <Route path="/tasks" element={<Navigate to="/dashboard" replace />} />
          <Route path="/calendar" element={<Navigate to="/dashboard" replace />} />
          <Route path="/shopping" element={<ShoppingView shoppingActions={shoppingActions} />} />
          <Route path="/results" element={
            <div className="results-view">
              <SimulationResults 
                simulationResults={simulationResults}
                simulating={simulating}
                totalInvestment={totalInvestment}
              />
              
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

              <InvestmentConfigurer
                investmentConfig={customInvestment}
                onInvestmentChange={setCustomInvestment}
              />
            </div>
          } />
          <Route path="/config" element={
            <div className="config-view">
              <div className="view-header">
                <h2>⚙️ Garden Configuration</h2>
                <p className="view-subtitle">Set up your garden parameters and preferences</p>
              </div>
              
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

              <InvestmentConfigurer
                investmentConfig={customInvestment}
                onInvestmentChange={setCustomInvestment}
              />
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default AppContent;