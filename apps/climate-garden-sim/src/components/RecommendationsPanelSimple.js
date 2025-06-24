/**
 * Simplified RecommendationsPanel Component
 * Uses SimpleInvestmentPanel with shopping list integration
 */

import React from 'react';
import SimpleInvestmentPanel from './SimpleInvestmentPanel';
import ShoppingListPanel from './ShoppingListPanel';
import GardenTasksPanel from './GardenTasksPanel';
import { generatePureShoppingRecommendations, generateGardenTasks } from '../services/temporalShoppingService';
import { useShoppingList } from '../hooks/useShoppingList';
import { useTaskManager } from '../hooks/useTaskManager';

const RecommendationsPanelSimple = ({
  monthlyFocus,
  weeklyActions,
  successOutlook,
  topCropRecommendations,
  siteSpecificRecommendations
}) => {
  // Generate pure shopping recommendations (purchases only)
  const shoppingRecommendations = generatePureShoppingRecommendations();
  
  // Generate garden tasks (non-purchase actions)
  const gardenTasks = generateGardenTasks();
  
  // Shopping list management
  const {
    shoppingList,
    addToShoppingList,
    markAsOwned,
    rejectItem,
    removeFromShoppingList,
    clearShoppingList,
    getItemStatus,
    getTotalCost
  } = useShoppingList();

  // Task management
  const {
    markTaskComplete,
    getTaskStatus
  } = useTaskManager();

  const recommendations = [
    {
      title: "This Month's Focus",
      content: monthlyFocus,
      icon: "📅"
    },
    {
      title: "Weekly Actions", 
      content: weeklyActions,
      icon: "✅"
    },
    {
      title: "Success Outlook",
      content: successOutlook,
      icon: "🎯"
    },
    {
      title: "Top Crop Recommendations",
      content: topCropRecommendations,
      icon: "🌱"
    },
    {
      title: "Site-Specific Tips",
      content: siteSpecificRecommendations,
      icon: "🏡"
    }
  ].filter(rec => {
    if (!rec.content) return false;
    
    if (typeof rec.content === 'string') {
      return rec.content.trim().length > 0;
    }
    
    if (typeof rec.content === 'object') {
      if (Array.isArray(rec.content)) {
        return rec.content.length > 0;
      }
      return Object.keys(rec.content).length > 0;
    }
    
    return false;
  });

  if (recommendations.length === 0 && investmentRecommendations.length === 0) {
    return (
      <section className="card recommendations-section">
        <div className="card-header">
          <h2 className="card-title">Smart Recommendations</h2>
        </div>
        <p>Loading recommendations...</p>
      </section>
    );
  }

  return (
    <section className="card recommendations-section">
      <div className="card-header">
        <h2 className="card-title">Smart Recommendations</h2>
        <p className="card-subtitle">Durham-specific gardening guidance</p>
      </div>
      
      {/* Shopping List Panel */}
      <ShoppingListPanel 
        shoppingList={shoppingList}
        totalCost={getTotalCost()}
        onRemoveItem={removeFromShoppingList}
        onClearList={clearShoppingList}
      />

      {/* Garden Tasks Panel */}
      {gardenTasks.length > 0 && (
        <GardenTasksPanel 
          tasks={gardenTasks}
          onMarkComplete={markTaskComplete}
          getTaskStatus={getTaskStatus}
        />
      )}

      {/* Pure Shopping Panel */}
      {shoppingRecommendations.length > 0 && (
        <SimpleInvestmentPanel 
          recommendations={shoppingRecommendations}
          onAddToShoppingList={addToShoppingList}
          onMarkAsOwned={markAsOwned}
          onRejectItem={rejectItem}
          getItemStatus={getItemStatus}
        />
      )}
      
      {/* Other Recommendations */}
      <div className="recommendations-grid">
        {recommendations.map((recommendation, index) => (
          <div key={index} className="recommendation-card">
            <h3>
              <span className="recommendation-icon">{recommendation.icon}</span>
              {recommendation.title}
            </h3>
            {typeof recommendation.content === 'string' ? (
              <div className="recommendation-content">
                {recommendation.content.split('\n').map((line, lineIdx) => {
                  if (line.trim() === '') return <br key={lineIdx} />;
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={lineIdx} className="content-header">{line.slice(2, -2)}</h4>;
                  }
                  if (line.startsWith('- ')) {
                    return <div key={lineIdx} className="content-bullet">{line.slice(2)}</div>;
                  }
                  return <p key={lineIdx}>{line}</p>;
                })}
              </div>
            ) : Array.isArray(recommendation.content) ? (
              <div className="recommendation-list">
                {recommendation.content.map((item, idx) => (
                  <div key={idx} className="recommendation-item">
                    {item.icon && <span className="item-icon">{item.icon}</span>}
                    {item.task && (
                      <div className="task-item">
                        <strong>{item.task}</strong>
                        {item.timing && <span className="timing"> - {item.timing}</span>}
                        {item.urgency && <span className={`urgency urgency-${item.urgency}`}>{item.urgency}</span>}
                      </div>
                    )}
                    {item.crop && (
                      <div className="crop-item">
                        <strong>{item.crop}</strong>
                        {item.reason && <span className="reason"> - {item.reason}</span>}
                        {item.varieties && item.varieties.length > 0 && (
                          <div className="varieties">Try: {item.varieties.join(', ')}</div>
                        )}
                      </div>
                    )}
                    {item.tip && (
                      <div className="site-tip">
                        {item.tip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Complex recommendation data available</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendationsPanelSimple;