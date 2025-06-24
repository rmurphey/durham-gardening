/**
 * Dashboard View Component
 * Critical decision-making information for Durham garden management
 */

import React from 'react';
import TaskCardList from './TaskCardList';
import ShoppingCardList from './ShoppingCardList';
import { generateGardenTasks, generatePureShoppingRecommendations } from '../services/temporalShoppingService';
import { 
  getDurhamWeatherAlerts, 
  getReadyToHarvest, 
  getCriticalTimingWindows,
  getInvestmentPerformance,
  getTodaysActionableGuidance 
} from '../services/dashboardDataService';

const DashboardView = ({ 
  shoppingActions, 
  taskActions,
  monthlyFocus,
  simulationResults,
  onViewChange 
}) => {
  // Get critical data for decision making
  const weatherAlerts = getDurhamWeatherAlerts();
  const readyToHarvest = getReadyToHarvest();
  const criticalWindows = getCriticalTimingWindows();
  const investmentData = getInvestmentPerformance(shoppingActions, simulationResults);
  const actionableGuidance = getTodaysActionableGuidance();
  
  // Get urgent items (limited for dashboard focus)
  const urgentTasks = (generateGardenTasks() || []).filter(task => 
    task.urgency === 'urgent' || task.daysUntilPlanting <= 7
  ).slice(0, 3); // Limit to top 3 for dashboard
  
  const urgentShopping = (generatePureShoppingRecommendations() || []).filter(item => 
    item.urgency === 'urgent' || item.daysUntilPlanting <= 14
  ).slice(0, 3); // Limit to top 3 for dashboard

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
            {criticalWindows.map((window, index) => (
              <div key={index} className="timing-window">
                <div className="timing-header">
                  <span className="timing-icon">{window.icon}</span>
                  <strong>{window.title}</strong>
                  <span className="days-left">{window.daysLeft} days</span>
                </div>
                <p className="timing-message">{window.message}</p>
                <div className="timing-action">✅ {window.action}</div>
              </div>
            ))}
          </div>
        )}

        {/* Ready to Harvest */}
        {readyToHarvest.length > 0 && (
          <div className="harvest-ready card">
            <h3>🥬 Ready to Harvest</h3>
            <div className="harvest-list">
              {readyToHarvest.map((item, index) => (
                <div key={index} className="harvest-item">
                  <div className="harvest-main">
                    <strong>{item.crop}</strong>
                    {item.variety && <span className="variety"> ({item.variety})</span>}
                    <span className="harvest-value">{item.value}</span>
                  </div>
                  {item.daysReady === 0 ? (
                    <div className="harvest-now">🔴 Harvest Today</div>
                  ) : (
                    <div className="harvest-soon">📅 {item.daysReady} days</div>
                  )}
                  <div className="harvest-note">{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investment Performance */}
        <div className="investment-performance card">
          <h3>💰 Garden ROI</h3>
          <div className="performance-stats">
            <div className="stat-item">
              <span className="stat-label">Invested:</span>
              <span className="stat-value">${investmentData.totalSpent.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Est. Value:</span>
              <span className="stat-value">${investmentData.estimatedValue.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">ROI:</span>
              <span className={`stat-value ${investmentData.roi > 0 ? 'positive' : 'neutral'}`}>
                {investmentData.roi > 0 ? '+' : ''}{investmentData.roi.toFixed(1)}%
              </span>
            </div>
          </div>
          {investmentData.roi > 50 && (
            <div className="roi-success">🎉 Excellent return on investment!</div>
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
                <div key={index} className="task-item-condensed">
                  <span className="task-urgency">{task.daysUntilPlanting}d</span>
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
                <div key={index} className="shopping-item-condensed">
                  <span className="shopping-urgency">{item.daysUntilPlanting}d</span>
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