import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Navigation and Views
import Navigation from './Navigation.js';
import DashboardView from './DashboardView.js';
import ShoppingView from './ShoppingView.js';
import DefaultGardenRedirect from './DefaultGardenRedirect.js';
import AppHeader from './AppHeader.js';
import GardenStateProvider, { useGardenAppState } from './GardenStateProvider.js';

// Configuration Components
// Note: unifiedCalendarService is dynamically imported to avoid database initialization in development
import { getCriticalTimingWindows, getReadyToHarvest } from '../services/dashboardDataService.js';
import { generateGardenId } from '../utils/gardenId.js';

function AppContentInner() {
  // Navigation state using React Router
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.slice(1) || 'dashboard';
  
  // Get state from provider
  const {
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    setSelectedSummer,
    setSelectedWinter,
    setSelectedPortfolio,
    shoppingActions,
    calendarTaskManager,
    locationConfig,
    customInvestment,
    setCustomInvestment,
    handleCustomPortfolioChange,
    simulationResults,
    simulating,
    totalInvestment,
    currentClimateScenarios,
    portfolioStrategies,
    recommendations,
    gardenLog
  } = useGardenAppState();
  
  // State for async garden calendar
  const [gardenCalendar, setGardenCalendar] = useState([]);

  // Generate garden calendar asynchronously
  useEffect(() => {
    const loadGardenCalendar = async () => {
      try {
        // Dynamic import to avoid database initialization in development
        const { generateUnifiedCalendar } = await import('../services/unifiedCalendarService.js');
        const calendar = await generateUnifiedCalendar(
          selectedSummer, 
          selectedWinter, 
          selectedPortfolio, 
          locationConfig, 
          portfolioStrategies.custom || null
        );
        setGardenCalendar(calendar);
      } catch (error) {
        console.error('Error loading garden calendar:', error);
        setGardenCalendar([]);
      }
    };

    loadGardenCalendar();
  }, [selectedSummer, selectedWinter, selectedPortfolio, locationConfig, portfolioStrategies]);

  const handleViewChange = (view) => {
    navigate(`/${view}`);
  };

  // Garden management functions
  const handleCreateGarden = () => {
    try {
      const newGardenId = generateGardenId();
      
      // Mark as owned
      const myGardens = JSON.parse(localStorage.getItem('myGardens') || '[]');
      if (!myGardens.includes(newGardenId)) {
        myGardens.push(newGardenId);
        localStorage.setItem('myGardens', JSON.stringify(myGardens));
      }
      
      // Set as default
      localStorage.setItem('defaultGardenId', newGardenId);
      
      // Navigate to garden dashboard
      navigate(`/garden/${newGardenId}/dashboard`);
    } catch (error) {
      console.error('Failed to create garden:', error);
    }
  };

  const handleShareGarden = () => {
    // For now, just copy current URL
    if (navigator.clipboard && window.location.href) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Calculate valuable header information
  const criticalWindows = getCriticalTimingWindows(gardenLog, null, locationConfig);
  const readyToHarvest = getReadyToHarvest(gardenLog, null, locationConfig);
  const urgentTasksCount = criticalWindows.length;
  const readyToHarvestCount = readyToHarvest.length;

  return (
    <div className="App">
      {/* Header */}
      <AppHeader 
        locationConfig={locationConfig}
        urgentTasksCount={urgentTasksCount}
        readyToHarvestCount={readyToHarvestCount}
        simulationResults={simulationResults}
        onCreateGarden={handleCreateGarden}
        onShareGarden={handleShareGarden}
      />

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
              monthlyFocus={recommendations.monthlyFocus}
              simulationResults={simulationResults}
              totalInvestment={totalInvestment}
              onViewChange={handleViewChange}
              gardenCalendar={gardenCalendar}
              // Garden log props
              gardenLog={gardenLog}
              forecastData={null} // TODO: Add forecast data integration
              // Settings props
              climateScenarios={currentClimateScenarios}
              selectedSummer={selectedSummer}
              selectedWinter={selectedWinter}
              onSummerChange={setSelectedSummer}
              onWinterChange={setSelectedWinter}
              portfolioStrategies={portfolioStrategies}
              selectedPortfolio={selectedPortfolio}
              onPortfolioChange={setSelectedPortfolio}
              onCustomPortfolioChange={handleCustomPortfolioChange}
              investmentConfig={customInvestment}
              onInvestmentChange={setCustomInvestment}
              locationConfig={locationConfig}
              onLocationChange={() => {}} // TODO: Add location change handler
              isReadOnly={false}
              simulating={simulating}
            />
          } />
          <Route path="/tasks" element={<Navigate to="/dashboard" replace />} />
          <Route path="/calendar" element={<Navigate to="/dashboard" replace />} />
          <Route path="/shopping" element={<ShoppingView shoppingActions={shoppingActions} />} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  return (
    <GardenStateProvider isReadOnly={false}>
      <AppContentInner />
    </GardenStateProvider>
  );
}

export default AppContent;