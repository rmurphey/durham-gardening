/**
 * GardenAppContent Component
 * Handles garden-scoped routing with full app functionality
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import useCloudSync from '../hooks/useCloudSync.js';

// Navigation and Views
import Navigation from './Navigation.js';
import DashboardView from './DashboardView.js';
import ShoppingView from './ShoppingView.js';
import AppHeader from './AppHeader.js';
import GardenStateProvider, { useGardenAppState } from './GardenStateProvider.js';

// Configuration Components
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

function GardenAppContentInner() {
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
      <AppHeader 
        gardenId={gardenId}
        isReadOnly={isReadOnly}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        shareableUrl={shareableUrl}
        onForkGarden={handleForkGarden}
      />

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
              shoppingActions={shoppingActions}
              monthlyFocus={recommendations.monthlyFocus}
              simulationResults={simulationResults}
              totalInvestment={totalInvestment}
              onViewChange={handleViewChange}
              gardenCalendar={gardenCalendar}
              gardenId={gardenId}
              gardenData={gardenData}
              isReadOnly={isReadOnly}
              locationConfig={locationConfig}
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
              simulating={simulating}
            />
          } />
          
          <Route path="/shopping" element={
            <ShoppingView 
              shoppingActions={shoppingActions} 
              isReadOnly={isReadOnly}
            />
          } />
          
          
        </Routes>
      </main>
    </div>
  );
}

function GardenAppContent() {
  const { id: gardenId } = useParams();
  
  // Check if user is the creator to determine read-only status
  const isCreator = isGardenCreator(gardenId);
  const isReadOnly = !isCreator;

  return (
    <GardenStateProvider isReadOnly={isReadOnly}>
      <GardenAppContentInner />
    </GardenStateProvider>
  );
}

export default GardenAppContent;