/**
 * Dashboard View Component
 * Focused view of today's priorities and actionable items
 */

import React from 'react';
import TaskCardList from './TaskCardList';
import ShoppingCardList from './ShoppingCardList';
import { generateGardenTasks, generatePureShoppingRecommendations } from '../services/temporalShoppingService';

const DashboardView = ({ 
  shoppingActions, 
  taskActions,
  monthlyFocus 
}) => {
  // Get only the most urgent items for dashboard
  const urgentTasks = (generateGardenTasks() || []).filter(task => 
    task.urgency === 'urgent' || task.daysUntilPlanting <= 14
  );
  
  const urgentShopping = (generatePureShoppingRecommendations() || []).filter(item => 
    item.urgency === 'urgent' || item.daysUntilPlanting <= 30
  );

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>🎯 Today's Priorities</h2>
        <p className="current-date">{getCurrentDate()}</p>
      </div>

      <div className="priority-grid">
        {/* This Month's Focus */}
        <div className="focus-card">
          <h3>📅 This Month's Focus</h3>
          <div className="focus-content">
            {monthlyFocus ? (
              monthlyFocus.split('\n').slice(0, 3).map((line, index) => {
                if (line.trim() === '') return null;
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <h4 key={index} className="focus-header">{line.slice(2, -2)}</h4>;
                }
                if (line.startsWith('- ')) {
                  return <div key={index} className="focus-bullet">{line.slice(2)}</div>;
                }
                return <p key={index}>{line}</p>;
              })
            ) : (
              <p>Loading this month's focus...</p>
            )}
          </div>
        </div>

        {/* Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <div className="urgent-section">
            <h3>🔥 Urgent Garden Tasks</h3>
            <TaskCardList 
              tasks={urgentTasks}
              onMarkComplete={taskActions.markTaskComplete}
              getTaskStatus={taskActions.getTaskStatus}
            />
          </div>
        )}

        {/* Critical Shopping */}
        {urgentShopping.length > 0 && (
          <div className="urgent-section">
            <h3>⚡ Time-Sensitive Shopping</h3>
            <ShoppingCardList 
              recommendations={urgentShopping}
              onAddToShoppingList={shoppingActions.addToShoppingList}
              onMarkAsOwned={shoppingActions.markAsOwned}
              onRejectItem={shoppingActions.rejectItem}
              getItemStatus={shoppingActions.getItemStatus}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <h3>⚡ Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="quick-action" onClick={() => window.location.reload()}>
              🔄 Refresh recommendations
            </button>
            <button className="quick-action">
              📋 View all tasks
            </button>
            <button className="quick-action">
              🛒 Check shopping list
            </button>
            <button className="quick-action">
              📅 View calendar
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="status-summary">
          <h3>📊 Garden Status</h3>
          <div className="status-items">
            <div className="status-item">
              <span className="status-label">Active Tasks:</span>
              <span className="status-value">{urgentTasks.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Shopping Items:</span>
              <span className="status-value">{urgentShopping.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Season:</span>
              <span className="status-value">Summer Growing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;