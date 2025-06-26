/**
 * GardenAppContent Component
 * Handles garden-scoped routing with full app functionality
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
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
import useCloudSync from '../hooks/useCloudSync.js';

// Navigation and Views
import Navigation from './Navigation.js';
import DashboardView from './DashboardView.js';
import ShoppingView from './ShoppingView.js';

// Configuration Components
import ClimateScenarioSelector from './ClimateScenarioSelector.js';
import PortfolioManager from './PortfolioManager.js';
import SimulationResults from './SimulationResults.js';
import GardenCalendar from './GardenCalendar.js';
import InvestmentConfigurer from './InvestmentConfigurer.js';
import { generateUnifiedCalendar } from '../services/unifiedCalendarService.js';

/**
 * Check if user is the creator of this garden
 */
const isGardenCreator = (gardenId) => {
  try {
    const myGardens = JSON.parse(localStorage.getItem('myGardens') || '[]');
    return myGardens.includes(gardenId);
  } catch {
    return false;
  }
};

/**
 * Mark garden as owned by current user
 */
const markGardenAsOwned = (gardenId) => {
  try {
    const myGardens = JSON.parse(localStorage.getItem('myGardens') || '[]');
    if (!myGardens.includes(gardenId)) {
      myGardens.push(gardenId);
      localStorage.setItem('myGardens', JSON.stringify(myGardens));
    }
  } catch (error) {
    console.error('Failed to mark garden as owned:', error);
  }
};

function GardenAppContent() {
  const { id: gardenId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the sub-route (after /garden/id/)
  const pathParts = location.pathname.split('/');
  const activeView = pathParts[3] || 'dashboard'; // /garden/id/[activeView]
  
  // Cloud sync for this specific garden
  const {
    gardenData,
    isLoading: gardenLoading,
    error: gardenError,
    isSyncing,
    lastSyncTime,
    shareableUrl,
    saveGardenData,
    clearError
  } = useCloudSync();

  // Check if user is the creator
  const isCreator = isGardenCreator(gardenId);
  const isReadOnly = !isCreator;

  // Mark as owned if we created this garden ID
  useEffect(() => {
    if (gardenId && !isCreator) {
      // This is a shared garden - don't mark as owned
      // Only mark as owned when user explicitly forks it
    }
  }, [gardenId, isCreator]);

  // Use custom hooks for state management (with garden-specific data)
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

  // Durham-only configuration - memoize to prevent useEffect re-runs
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

  // Handle navigation within garden context
  const handleViewChange = (view) => {
    navigate(`/garden/${gardenId}/${view}`);
  };

  // Handle forking a garden
  const handleForkGarden = async () => {
    try {
      // Generate new garden ID
      const { generateGardenId } = await import('../utils/gardenId.js');
      const newGardenId = generateGardenId();
      
      // Mark new garden as owned
      markGardenAsOwned(newGardenId);
      
      // Navigate to new garden with current data
      navigate(`/garden/${newGardenId}/dashboard`);
      
      // Save current garden data to new garden
      if (gardenData) {
        // Will be handled by the new garden's useCloudSync
      }
    } catch (error) {
      console.error('Failed to fork garden:', error);
    }
  };

  // Loading state
  if (gardenLoading) {
    return (
      <div className="garden-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <h2>Loading Garden...</h2>
        <p>Initializing garden data for {gardenId?.slice(0, 8)}...</p>
      </div>
    );
  }

  // Error state
  if (gardenError) {
    return (
      <div className="garden-error">
        <div className="error-content">
          <h2>🌱 Garden Error</h2>
          <p className="error-message">{gardenError}</p>
          <div className="error-actions">
            <button 
              className="error-retry-btn"
              onClick={() => {
                clearError();
                window.location.reload();
              }}
            >
              Try Again
            </button>
            <button 
              className="error-home-btn"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header with garden context */}
      <header className="header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="app-title">🌱 Durham Garden Planner</h1>
            <p className="app-subtitle">
              {isReadOnly ? (
                <>Viewing Garden: {gardenId?.slice(0, 8)}... (Read-Only)</>
              ) : (
                <>Your Garden: {gardenId?.slice(0, 8)}...</>
              )}
            </p>
          </div>
          
          {/* Garden actions */}
          <div className="garden-actions">
            {/* Sync status */}
            {(isSyncing || lastSyncTime) && (
              <div className={`sync-status ${isSyncing ? 'syncing' : 'synced'}`}>
                {isSyncing ? (
                  <span className="sync-indicator">
                    <div className="sync-spinner"></div>
                    Syncing...
                  </span>
                ) : (
                  <span className="sync-indicator">
                    ✓ {new Date(lastSyncTime).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
            
            {/* Fork button for read-only gardens */}
            {isReadOnly && (
              <button 
                className="fork-garden-btn"
                onClick={handleForkGarden}
                title="Create your own copy of this garden"
              >
                🍴 Fork Garden
              </button>
            )}
            
            {/* Share button for owned gardens */}
            {!isReadOnly && shareableUrl && (
              <button 
                className="share-garden-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(shareableUrl);
                  // Could add toast notification here
                }}
                title="Copy sharing link"
              >
                📋 Share
              </button>
            )}
          </div>
        </div>
      </header>

      <Navigation 
        activeView={activeView}
        onViewChange={handleViewChange}
        hasShoppingItems={shoppingActions.totalItems}
        hasTasks={calendarTaskManager.getUrgentPendingCount(gardenCalendar.flatMap(month => month.activities)) > 0}
        gardenMode={true}
        isReadOnly={isReadOnly}
      />
      
      {/* Main Content */}
      <main className="main-content">
        <Routes>
          {/* Default route redirects to dashboard */}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <DashboardView 
              shoppingActions={isReadOnly ? { totalItems: 0 } : shoppingActions}
              monthlyFocus={monthlyFocus}
              simulationResults={simulationResults}
              totalInvestment={totalInvestment}
              onViewChange={handleViewChange}
              gardenCalendar={gardenCalendar}
              gardenId={gardenId}
              gardenData={gardenData}
              isReadOnly={isReadOnly}
            />
          } />
          
          <Route path="/shopping" element={
            <ShoppingView 
              shoppingActions={isReadOnly ? { totalItems: 0 } : shoppingActions} 
              isReadOnly={isReadOnly}
            />
          } />
          
          <Route path="/analysis" element={
            <div className="results-view">
              <SimulationResults 
                simulationResults={simulationResults}
                simulating={simulating}
                totalInvestment={totalInvestment}
                isReadOnly={isReadOnly}
              />
              
              {!isReadOnly && (
                <>
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
                </>
              )}
            </div>
          } />
          
          <Route path="/config" element={
            <div className="config-view">
              <div className="view-header">
                <h2>⚙️ Garden Configuration</h2>
                <p className="view-subtitle">
                  {isReadOnly ? 'Viewing garden parameters (read-only)' : 'Set up your garden parameters and preferences'}
                </p>
              </div>
              
              <ClimateScenarioSelector
                climateScenarios={currentClimateScenarios}
                selectedSummer={selectedSummer}
                selectedWinter={selectedWinter}
                onSummerChange={isReadOnly ? () => {} : setSelectedSummer}
                onWinterChange={isReadOnly ? () => {} : setSelectedWinter}
                disabled={isReadOnly}
              />

              <PortfolioManager
                portfolioStrategies={portfolioStrategies}
                selectedPortfolio={selectedPortfolio}
                onPortfolioChange={isReadOnly ? () => {} : setSelectedPortfolio}
                onCustomPortfolioChange={isReadOnly ? () => {} : handleCustomPortfolioChange}
                disabled={isReadOnly}
              />

              <InvestmentConfigurer
                investmentConfig={customInvestment}
                onInvestmentChange={isReadOnly ? () => {} : setCustomInvestment}
                disabled={isReadOnly}
              />
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default GardenAppContent;