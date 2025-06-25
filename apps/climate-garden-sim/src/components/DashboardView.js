/**
 * Dashboard View Component
 * Critical decision-making information for Durham garden management
 */

import React from 'react';
import { generateGardenTasks, generatePureShoppingRecommendations } from '../services/temporalShoppingService';
import { 
  getDurhamWeatherAlerts, 
  getReadyToHarvest, 
  getCriticalTimingWindows,
  getSimulationSummary,
  getTodaysActionableGuidance 
} from '../services/dashboardDataService';
import { 
  getUrgencyClasses, 
  getUrgencyDisplay, 
  getMostUrgent,
  addUrgencyInfo 
} from '../utils/urgencyHelpers';

const DashboardView = ({ 
  shoppingActions, 
  taskActions,
  monthlyFocus,
  simulationResults,
  totalInvestment,
  onViewChange 
}) => {
  // Get critical data for decision making
  const weatherAlerts = getDurhamWeatherAlerts();
  const readyToHarvest = getReadyToHarvest();
  const criticalWindows = getCriticalTimingWindows();
  const simulationSummary = getSimulationSummary(simulationResults, totalInvestment);
  const actionableGuidance = getTodaysActionableGuidance();
  
  // Get urgent items using the urgency system
  const allTasks = (generateGardenTasks() || []).map(task => addUrgencyInfo(task));
  const allShopping = (generatePureShoppingRecommendations() || []).map(item => addUrgencyInfo(item));
  
  const urgentTasks = getMostUrgent(allTasks, 3);
  const urgentShopping = getMostUrgent(allShopping, 3);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTimeOfDayIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 17) return '☀️';
    if (hour >= 17 && hour < 20) return '🌆';
    return '🌙';
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>{getTimeOfDayIcon()} Durham Garden Dashboard</h2>
        <p className="current-date">{getCurrentDate()}</p>
      </div>

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
                  {simulationSummary.successRate}%
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
              <button 
                className="view-analysis-btn"
                onClick={() => onViewChange('results')}
              >
                {simulationSummary.action}
              </button>
            </div>
          ) : (
            <div className="no-simulation">
              <p>{simulationSummary.message}</p>
              <button 
                className="run-simulation-btn"
                onClick={() => onViewChange('config')}
              >
                {simulationSummary.action}
              </button>
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

        {/* Urgent Tasks (Condensed) */}
        {urgentTasks.length > 0 && (
          <div className="urgent-tasks card">
            <h3>🔥 Urgent Tasks</h3>
            <div className="task-list-condensed">
              {urgentTasks.map((task, index) => (
                <div key={index} className={`task-item-condensed ${task.urgencyClasses.cardClass}`}>
                  <span className={task.urgencyClasses.daysClass}>{task.urgencyDisplay.shortText}</span>
                  <span className="task-name">{task.crop} - {task.action}</span>
                  <button 
                    className="task-complete-btn"
                    onClick={() => taskActions.markTaskComplete(task.id)}
                    disabled={taskActions.getTaskStatus(task.id) === 'completed'}
                  >
                    {taskActions.getTaskStatus(task.id) === 'completed' ? '✓' : '○'}
                  </button>
                </div>
              ))}
            </div>
            {urgentTasks.length > 0 && (
              <button 
                className="view-all-tasks"
                onClick={() => onViewChange('tasks')}
              >
                View All Tasks ({urgentTasks.length > 3 ? '3+' : urgentTasks.length})
              </button>
            )}
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
    </div>
  );
};

export default DashboardView;