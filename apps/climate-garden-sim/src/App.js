import React, { useState, useEffect, useMemo } from 'react';
import { generateSuccessOutlook } from './config.js';
import { 
  generateDurhamMonthlyFocus,
  generateDurhamWeeklyActions,
  generateDurhamTopCrops,
  generateDurhamSiteRecommendations,
  generateDurhamInvestmentPriority
} from './services/durhamRecommendations.js';

// New modular imports
import { generateLocationSpecificScenarios } from './data/climateScenarios.js';
import { getPortfolioStrategies, createCustomPortfolio, validatePortfolioAllocations } from './data/portfolioStrategies.js';
import { useSimulation } from './hooks/useSimulation.js';
import { useClimateSelection, useInvestmentConfig } from './hooks/useLocalStorage.js';
import { useShoppingList } from './hooks/useShoppingList.js';
import { useTaskManager } from './hooks/useTaskManager.js';
import { DURHAM_CONFIG } from './config/durhamConfig.js';

// Navigation and Views
import Navigation from './components/Navigation.js';
import DashboardView from './components/DashboardView.js';
import TasksView from './components/TasksView.js';
import ShoppingView from './components/ShoppingView.js';
import CardDemo from './components/CardDemo.js';

// Configuration Components
import ClimateScenarioSelector from './components/ClimateScenarioSelector.js';
import PortfolioManager from './components/PortfolioManager.js';
import SimulationResults from './components/SimulationResults.js';
import GardenCalendar from './components/GardenCalendar.js';
import InvestmentConfigurer from './components/InvestmentConfigurer.js';
import ActionDashboard from './components/ActionDashboard.js';
import { generateDatabaseGardenCalendar } from './services/databaseCalendarService.js';
import './index.css';

function App() {
  // Navigation state
  const [activeView, setActiveView] = useState('dashboard');
  
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
  const taskActions = useTaskManager();

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
        const calendar = await generateDatabaseGardenCalendar(
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


  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView 
            shoppingActions={shoppingActions}
            taskActions={taskActions}
            monthlyFocus={monthlyFocus}
          />
        );
      case 'tasks':
        return <TasksView taskActions={taskActions} />;
      case 'shopping':
        return <ShoppingView shoppingActions={shoppingActions} />;
      case 'calendar':
        return <GardenCalendar gardenCalendar={gardenCalendar} />;
      case 'results':
        return (
          <div className="results-view">
            <SimulationResults 
              simulationResults={simulationResults}
              simulating={simulating}
              totalInvestment={totalInvestment}
            />
            <ActionDashboard
              simulationResults={simulationResults}
              weatherData={null}
              gardenConfig={locationConfig}
            />
          </div>
        );
      case 'config':
        return (
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
        );
      case 'cards':
        return <CardDemo />;
      default:
        return <DashboardView shoppingActions={shoppingActions} taskActions={taskActions} monthlyFocus={monthlyFocus} />;
    }
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
        onViewChange={setActiveView}
        hasShoppingItems={shoppingActions.totalItems}
        hasTasks={taskActions.getCompletedCount ? true : false}
      />
      
      {/* Main Content */}
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;