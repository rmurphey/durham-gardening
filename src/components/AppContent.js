import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Navigation and Views
import Navigation from './Navigation.js';
import DashboardView from './DashboardView.js';
import ShoppingView from './ShoppingView.js';
import GardenAppContent from './GardenAppContent.js';
import DefaultGardenRedirect from './DefaultGardenRedirect.js';
import AppHeader from './AppHeader.js';
import GardenStateProvider, { useGardenAppState } from './GardenStateProvider.js';

// Configuration Components
import { generateUnifiedCalendar } from '../services/unifiedCalendarService.js';

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
    recommendations
  } = useGardenAppState();
  
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

  return (
    <div className="App">
      {/* Header */}
      <AppHeader />

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
              isReadOnly={false}
              simulating={simulating}
            />
          } />
          <Route path="/garden/:id/*" element={<GardenAppContent />} />
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