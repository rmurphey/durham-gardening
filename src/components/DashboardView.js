/**
 * Dashboard View Component
 * Critical decision-making information for climate-aware garden management
 */

import React from 'react';
import { generatePureShoppingRecommendations } from '../services/temporalShoppingService';
import GardenCalendar from './GardenCalendar.js';
import ForecastWidget from './ForecastWidget.js';
import CompactSettingsPanel from './CompactSettingsPanel.js';
import SimulationResults from './SimulationResults.js';
import { 
  getLocationWeatherAlerts, 
  getReadyToHarvest, 
  getCriticalTimingWindows,
  getSimulationSummary,
  getTodaysActionableGuidance 
} from '../services/dashboardDataService';
import { formatProbability } from '../config.js';
import { 
  getUrgencyClasses, 
  getUrgencyDisplay, 
  getMostUrgent,
  addUrgencyInfo 
} from '../utils/urgencyHelpers';

const DashboardView = ({ 
  shoppingActions, 
  monthlyFocus,
  simulationResults,
  totalInvestment,
  onViewChange,
  gardenCalendar = [],
  locationConfig,
  onLocationChange,
  // Garden log props
  gardenLog,
  forecastData,
  // Settings props
  climateScenarios,
  selectedSummer,
  selectedWinter,
  onSummerChange,
  onWinterChange,
  portfolioStrategies,
  selectedPortfolio,
  onPortfolioChange,
  onCustomPortfolioChange,
  investmentConfig,
  onInvestmentChange,
  isReadOnly = false,
  simulating = false
}) => {

  // Get critical data for decision making based on actual garden state
  const weatherAlerts = getLocationWeatherAlerts(locationConfig);
  const readyToHarvest = getReadyToHarvest(gardenLog, forecastData);
  const criticalWindows = getCriticalTimingWindows(gardenLog, forecastData, locationConfig);
  const simulationSummary = getSimulationSummary(simulationResults, totalInvestment);
  const actionableGuidance = getTodaysActionableGuidance();
  
  // Get urgent shopping items using the urgency system
  const allShopping = (generatePureShoppingRecommendations() || []).map(item => addUrgencyInfo(item));
  const urgentShopping = getMostUrgent(allShopping, 3);


  return (
    <div className="dashboard-view">

      <div className="critical-alerts">
        {weatherAlerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.urgency}`}>
            <span className="alert-icon">{alert.icon}</span>
            <div className="alert-content">
              <strong>{alert.title}:</strong> {alert.message}
              <div className="alert-action">👉 {alert.action}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Compact Settings Panel */}
      <CompactSettingsPanel
        climateScenarios={climateScenarios}
        selectedSummer={selectedSummer}
        selectedWinter={selectedWinter}
        onSummerChange={onSummerChange}
        onWinterChange={onWinterChange}
        portfolioStrategies={portfolioStrategies}
        selectedPortfolio={selectedPortfolio}
        onPortfolioChange={onPortfolioChange}
        onCustomPortfolioChange={onCustomPortfolioChange}
        investmentConfig={investmentConfig}
        onInvestmentChange={onInvestmentChange}
        locationConfig={locationConfig}
        onLocationChange={onLocationChange}
        disabled={isReadOnly}
      />

      <div className="dashboard-grid">
        {/* Critical Timing Windows */}
        {criticalWindows.length > 0 && (
          <div className="critical-timing card">
            <h3>⏰ Critical Timing</h3>
            {criticalWindows.map((window, index) => {
              const urgencyClasses = getUrgencyClasses(window.daysLeft);
              const urgencyDisplay = getUrgencyDisplay(window.daysLeft);
              return (
                <div key={index} className={`timing-window ${urgencyClasses.cardClass}`}>
                  <div className="timing-header">
                    <span className="timing-icon">{urgencyDisplay.icon}</span>
                    <strong>{window.title}</strong>
                    <span className={urgencyClasses.daysClass}>{urgencyDisplay.shortText}</span>
                  </div>
                  <p className="timing-message">{window.message}</p>
                  <div className="timing-action">✅ {window.action}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ready to Harvest */}
        {readyToHarvest.length > 0 && (
          <div className="harvest-ready card">
            <h3>🥬 Ready to Harvest</h3>
            <div className="harvest-list">
              {readyToHarvest.map((item, index) => {
                const urgencyClasses = getUrgencyClasses(item.daysReady || 0);
                const urgencyDisplay = getUrgencyDisplay(item.daysReady || 0);
                return (
                  <div key={index} className={`harvest-item ${urgencyClasses.cardClass}`}>
                    <div className="harvest-main">
                      <strong>{item.crop}</strong>
                      {item.variety && <span className="variety"> ({item.variety})</span>}
                      <span className="harvest-value">{item.value}</span>
                    </div>
                    <div className={`harvest-timing ${urgencyClasses.indicatorClass}`}>
                      {urgencyDisplay.icon} {item.daysReady === 0 ? 'Harvest Today' : `${item.daysReady} days`}
                    </div>
                    <div className="harvest-note">{item.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Simulation Summary */}
        <div className="simulation-summary card">
          <h3>📊 Garden Outlook</h3>
          {simulationSummary.hasSimulation ? (
            <div className="simulation-stats">
              <div className="stat-item">
                <span className="stat-label">Expected Return:</span>
                <span className="stat-value">{simulationSummary.confidenceText}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Success Rate:</span>
                <span className={`stat-value ${simulationSummary.successRate > 70 ? 'positive' : simulationSummary.successRate < 50 ? 'negative' : 'neutral'}`}>
                  {formatProbability(simulationSummary.successRate)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Risk Level:</span>
                <span className={`stat-value text-${simulationSummary.riskColor}`}>
                  {simulationSummary.riskLevel}
                </span>
              </div>
              <div className="simulation-message">
                {simulationSummary.message}
              </div>
            </div>
          ) : (
            <div className="no-simulation">
              <p>{simulationSummary.message}</p>
              <p className="simulation-note">Configure settings above to run simulation</p>
            </div>
          )}
        </div>

        {/* Today's Actionable Guidance */}
        {actionableGuidance.length > 0 && (
          <div className="actionable-guidance card">
            <h3>🎯 Today's Focus</h3>
            {actionableGuidance.map((guidance, index) => (
              <div key={index} className="guidance-section">
                <h4>
                  <span className="guidance-icon">{guidance.icon}</span>
                  {guidance.title}
                </h4>
                <ul className="guidance-actions">
                  {guidance.actions.map((action, actionIndex) => (
                    <li key={actionIndex}>{action}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Critical Shopping (Condensed) */}
        {urgentShopping.length > 0 && (
          <div className="urgent-shopping card">
            <h3>⚡ Critical Shopping</h3>
            <div className="shopping-list-condensed">
              {urgentShopping.slice(0, 3).map((item, index) => (
                <div key={index} className={`shopping-item-condensed ${item.urgencyClasses.cardClass}`}>
                  <span className={item.urgencyClasses.daysClass}>{item.urgencyDisplay.shortText}</span>
                  <span className="shopping-name">{item.item}</span>
                  <span className="shopping-price">${item.price}</span>
                  <button 
                    className="shopping-add-btn"
                    onClick={() => shoppingActions.addToShoppingList(item)}
                    disabled={shoppingActions.getItemStatus(item.id) !== 'unselected'}
                  >
                    {shoppingActions.getItemStatus(item.id) === 'shopping' ? '✓' : '+'}
                  </button>
                </div>
              ))}
            </div>
            {urgentShopping.length > 0 && (
              <button 
                className="view-all-shopping"
                onClick={() => onViewChange('shopping')}
              >
                View Shopping Plan ({urgentShopping.length > 3 ? '3+' : urgentShopping.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Weather Forecast */}
      <ForecastWidget locationConfig={locationConfig} />

      {/* Simulation Results */}
      <SimulationResults 
        simulationResults={simulationResults}
        simulating={simulating}
        totalInvestment={totalInvestment}
        isReadOnly={isReadOnly}
      />

      {/* Garden Calendar - Full Width */}
      <div className="garden-calendar-dashboard">
        <GardenCalendar 
          gardenCalendar={gardenCalendar}
          onAddToShoppingList={shoppingActions.addToShoppingList}
          existingShoppingItems={shoppingActions.shoppingList}
        />
      </div>
    </div>
  );
};

export default DashboardView;