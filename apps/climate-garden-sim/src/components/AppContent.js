/**
 * App Content Component
 * Main application logic extracted for router integration
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateSuccessOutlook } from '../config.js';
import { 
  generateDurhamMonthlyFocus,
  generateDurhamWeeklyActions,
  generateDurhamTopCrops,
  generateDurhamSiteRecommendations,
  generateDurhamInvestmentPriority
} from '../services/durhamRecommendations.js';

// Data imports
import { generateLocationSpecificScenarios } from '../data/climateScenarios.js';
import { getPortfolioStrategies, createCustomPortfolio, validatePortfolioAllocations } from '../data/portfolioStrategies.js';
import { useSimulation } from '../hooks/useSimulation.js';
import { useClimateSelection, useInvestmentConfig } from '../hooks/useLocalStorage.js';
import { useShoppingList } from '../hooks/useShoppingList.js';
import { useTaskManager } from '../hooks/useTaskManager.js';
import { DURHAM_CONFIG } from '../config/durhamConfig.js';

// Components
import Navigation from './Navigation.js';
import DashboardView from './DashboardView.js';
import TasksView from './TasksView.js';
import ShoppingView from './ShoppingView.js';
import ClimateScenarioSelector from './ClimateScenarioSelector.js';
import PortfolioManager from './PortfolioManager.js';
import SimulationResults from './SimulationResults.js';
import GardenCalendar from './GardenCalendar.js';
import InvestmentConfigurer from './InvestmentConfigurer.js';
import { generateDatabaseGardenCalendar } from '../services/databaseCalendarService.js';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract current route
  const currentRoute = location.pathname.slice(1) || 'dashboard';
  
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

  const [customInvestment, setCustomInvestment] = useInvestmentConfig();

  // Calculate total budget from investment categories
  const totalBudget = useMemo(() => {
    return Object.values(customInvestment || {}).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0);
    }, 0);
  }, [customInvestment]);
  
  // Durham-only configuration - memoize to prevent useEffect re-runs
  const locationConfig = useMemo(() => ({
    ...DURHAM_CONFIG,
    gardenSize: 2,
    investmentLevel: 3,
    marketMultiplier: 1.0,
    gardenSizeActual: 100,
    budget: totalBudget,
    heatIntensity: 3, // Durham heat intensity level
    heatDays: 95 // Extreme heat days per year
  }), [totalBudget]);

  // Custom portfolio state (not persisted by default)
  const [customPortfolio, setCustomPortfolio] = useState(null);
  
  // Use simulation hook
  const { simulationResults, simulating } = useSimulation(
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

  // Navigation handler for router
  const handleViewChange = (view) => {
    navigate(`/${view === 'dashboard' ? '' : view}`);
  };

  // Render current view based on route
  const renderView = () => {
    switch (currentRoute) {
      case 'dashboard':
      case '':
        return (
          <DashboardView 
            shoppingActions={shoppingActions}
            taskActions={taskActions}
            monthlyFocus={monthlyFocus}
            simulationResults={simulationResults}
            onViewChange={handleViewChange}
          />
        );
      case 'tasks':
        return <TasksView taskActions={taskActions} />;
      case 'shopping':
        return <ShoppingView shoppingActions={shoppingActions} />;
      case 'calendar':
        return <GardenCalendar gardenCalendar={gardenCalendar} />;
      case 'analysis':
        return (
          <div className="results-view">
            <div className="view-header">
              <h2>📊 Analysis & Results</h2>
              <p className="view-subtitle">Configure weather scenarios and view simulation results</p>
            </div>
            
            {/* Weather Scenario Selection */}
            <div className="weather-control card">
              <div className="card-header">
                <h3>🌡️ Weather Scenarios</h3>
                <p className="card-subtitle">
                  Current budget: <strong>${totalBudget}</strong> (set in Configuration tab)
                </p>
              </div>
              
              <ClimateScenarioSelector
                climateScenarios={currentClimateScenarios}
                selectedSummer={selectedSummer}
                selectedWinter={selectedWinter}
                onSummerChange={setSelectedSummer}
                onWinterChange={setSelectedWinter}
              />
            </div>
            
            <SimulationResults 
              simulationResults={simulationResults}
              simulating={simulating}
              totalInvestment={totalBudget}
            />
          </div>
        );
      case 'config':
        return (
          <div className="config-view">
            <div className="view-header">
              <h2>⚙️ Garden Configuration</h2>
              <p className="view-subtitle">Set your investment priorities and growing preferences</p>
            </div>
            
            <div className="config-grid">
              {/* Investment Configuration */}
              <div className="investment-config card">
                <div className="card-header">
                  <h3>💰 Investment Priorities</h3>
                  <p className="card-subtitle">
                    Total budget: <strong>${totalBudget}</strong>
                  </p>
                </div>
                <InvestmentConfigurer 
                  investment={customInvestment}
                  onInvestmentChange={setCustomInvestment}
                />
                
                <div className="investment-insight">
                  <h4>💡 Durham-Specific Investment Advice</h4>
                  <div className="advice-content">{investmentPriority}</div>
                </div>
              </div>

              {/* Portfolio Strategy */}
              <div className="portfolio-config card">
                <div className="card-header">
                  <h3>🌱 Growing Strategy</h3>
                </div>
                <PortfolioManager
                  portfolioStrategies={portfolioStrategies}
                  selectedPortfolio={selectedPortfolio}
                  onPortfolioChange={setSelectedPortfolio}
                  onCustomPortfolioChange={handleCustomPortfolioChange}
                />
              </div>

              {/* Recommendations Summary */}
              <div className="recommendations-summary card">
                <div className="card-header">
                  <h3>🎯 Your Durham Strategy</h3>
                </div>
                
                <div className="strategy-overview">
                  <div className="strategy-section">
                    <h4>🌟 Success Outlook</h4>
                    <p>{successOutlook}</p>
                  </div>
                  
                  <div className="strategy-section">
                    <h4>🥬 Top Crop Recommendations</h4>
                    <div className="crop-list">{topCropRecommendations}</div>
                  </div>
                  
                  <div className="strategy-section">
                    <h4>🏡 Site-Specific Tips</h4>
                    <div className="site-tips">{siteSpecificRecommendations}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="not-found">
            <h2>404 - Page Not Found</h2>
            <p>The requested page could not be found.</p>
            <button onClick={() => handleViewChange('dashboard')}>
              Return to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <Navigation 
        hasShoppingItems={shoppingActions.totalItems}
        hasTasks={taskActions.getCompletedCount() < taskActions.getTaskCount()}
      />
      
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
};

export default AppContent;