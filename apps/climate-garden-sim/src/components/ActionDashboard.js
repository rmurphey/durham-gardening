/**
 * Action Dashboard Component
 * Provides action-priority homepage for actionable garden recommendations
 */

import React, { useState, useEffect, useCallback } from 'react';
// import { forecastingEngine } from '../services/forecastingEngine.js'; // Available for future forecast integration
import { generateWeatherRiskAnalysis } from '../services/weatherIntegration.js';
import { formatCurrency } from '../config.js';

const ActionDashboard = ({ simulationResults, weatherData, gardenConfig }) => {
  const [actions, setActions] = useState({
    urgent: [],
    thisMonth: [],
    planning: []
  });
  const [loading, setLoading] = useState(true);

  const generateActionItems = useCallback(async () => {
    setLoading(true);
    try {
      const currentActions = await analyzeCurrentSituation();
      setActions(currentActions);
    } catch (error) {
      console.error('Error generating action items:', error);
    } finally {
      setLoading(false);
    }
  }, [simulationResults, weatherData, gardenConfig]);

  useEffect(() => {
    generateActionItems();
  }, [generateActionItems]);

  const analyzeCurrentSituation = async () => {
    const urgent = [];
    const thisMonth = [];
    const planning = [];
    const today = new Date();
    // const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Available for future use
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Weather-based urgent actions
    if (weatherData) {
      const weatherRisk = generateWeatherRiskAnalysis(weatherData, gardenConfig);
      
      if (weatherRisk.riskLevel === 'high') {
        weatherRisk.recommendations.forEach(rec => {
          urgent.push({
            id: `weather-${urgent.length}`,
            type: 'weather_protection',
            title: rec,
            description: `Weather conditions require immediate attention`,
            timeframe: 'Next 24-48 hours',
            impact: 'high',
            effort: 'low',
            category: 'Protection'
          });
        });
      }
    }

    // Investment-based actions
    if (simulationResults?.rawResults?.[0]?.investmentSufficiency) {
      const investment = simulationResults.rawResults[0].investmentSufficiency;
      
      if (investment.status === 'insufficient' || investment.status === 'marginal') {
        urgent.push({
          id: 'investment-adjustment',
          type: 'financial',
          title: 'Adjust Investment Budget',
          description: `Current budget has ${investment.gap > 0 ? `${formatCurrency(investment.gap)} shortfall` : 'marginal coverage'} for planned activities`,
          timeframe: 'Before next planting',
          impact: 'high',
          effort: 'medium',
          category: 'Financial',
          action: () => scrollToInvestmentSection()
        });
      }

      // Critical category actions
      investment.criticalCategories?.forEach(cat => {
        if (cat.importance === 'critical') {
          urgent.push({
            id: `critical-${cat.category}`,
            type: 'resource',
            title: `Address ${cat.category} Requirements`,
            description: cat.description,
            timeframe: 'This week',
            impact: 'high',
            effort: 'medium',
            category: 'Resources'
          });
        }
      });
    }

    // Seasonal planting actions for this month
    const monthActions = generateSeasonalActions(today, nextMonth);
    thisMonth.push(...monthActions);

    // Planning actions for next season
    const planningActions = generatePlanningActions(nextMonth);
    planning.push(...planningActions);

    return { urgent, thisMonth, planning };
  };

  const generateSeasonalActions = (startDate, endDate) => {
    const month = startDate.getMonth(); // 0-11
    const seasonalActions = [];
    // endDate is available for future filtering logic

    // Durham, NC specific seasonal actions
    const seasonalTasks = {
      0: [ // January
        { title: 'Plan Spring Garden Layout', desc: 'Design bed rotations and succession plantings', effort: 'medium' },
        { title: 'Order Seeds for Spring', desc: 'Order cool-season crops for February/March planting', effort: 'low' },
        { title: 'Prepare Cold Frames', desc: 'Set up protection for early season starts', effort: 'medium' }
      ],
      1: [ // February
        { title: 'Start Cool-Season Seeds Indoors', desc: 'Kale, broccoli, cabbage for March transplant', effort: 'low' },
        { title: 'Direct Seed Hardy Crops', desc: 'Peas, radishes, spinach in protected areas', effort: 'low' },
        { title: 'Soil Test and Amendment', desc: 'Test soil pH and add compost/amendments', effort: 'medium' }
      ],
      2: [ // March
        { title: 'Transplant Cool-Season Starts', desc: 'Move February starts to garden beds', effort: 'medium' },
        { title: 'Direct Seed Cool Crops', desc: 'Lettuce, carrots, beets in main beds', effort: 'low' },
        { title: 'Prepare Heat-Loving Seed Starts', desc: 'Start tomatoes, peppers indoors', effort: 'medium' }
      ],
      3: [ // April
        { title: 'Plant Heat-Sensitive Crops', desc: 'Potatoes, onions before heat arrives', effort: 'medium' },
        { title: 'Succession Plant Cool Crops', desc: 'Second round of lettuce, radishes', effort: 'low' },
        { title: 'Harden Off Heat Starts', desc: 'Gradually acclimate tomato/pepper seedlings', effort: 'low' }
      ],
      4: [ // May
        { title: 'Transplant Heat-Loving Crops', desc: 'Tomatoes, peppers, squash to garden', effort: 'high' },
        { title: 'Install Support Systems', desc: 'Cages, trellises for climbing crops', effort: 'medium' },
        { title: 'Mulch All Beds', desc: 'Apply mulch for summer heat protection', effort: 'medium' }
      ],
      5: [ // June
        { title: 'Plant Heat-Loving Succession', desc: 'Beans, squash, okra for summer harvest', effort: 'medium' },
        { title: 'Install Irrigation System', desc: 'Set up drip lines for summer watering', effort: 'high' },
        { title: 'Harvest Early Crops', desc: 'Pick peas, spinach before heat stress', effort: 'low' }
      ]
      // Add more months as needed
    };

    const currentTasks = seasonalTasks[month] || [];
    return currentTasks.map((task, index) => ({
      id: `seasonal-${month}-${index}`,
      type: 'seasonal',
      title: task.title,
      description: task.desc,
      timeframe: 'This month',
      impact: 'medium',
      effort: task.effort,
      category: 'Seasonal'
    }));
  };

  const generatePlanningActions = (afterDate) => {
    return [
      {
        id: 'plan-succession',
        type: 'planning',
        title: 'Plan Succession Planting Schedule',
        description: 'Create detailed schedule for continuous harvests',
        timeframe: 'Next season',
        impact: 'medium',
        effort: 'medium',
        category: 'Planning'
      },
      {
        id: 'plan-infrastructure',
        type: 'planning',
        title: 'Plan Garden Infrastructure Upgrades',
        description: 'Design irrigation, storage, and tool improvements',
        timeframe: 'Off-season',
        impact: 'high',
        effort: 'high',
        category: 'Infrastructure'
      }
    ];
  };

  const scrollToInvestmentSection = () => {
    const element = document.querySelector('.investment-recommendations');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'impact-high';
      case 'medium': return 'impact-medium';
      case 'low': return 'impact-low';
      default: return 'impact-medium';
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'high': return 'effort-high';
      case 'medium': return 'effort-medium';
      case 'low': return 'effort-low';
      default: return 'effort-medium';
    }
  };

  const ActionCard = ({ action, priority }) => (
    <div className={`action-card ${priority}`}>
      <div className="action-header">
        <h4 className="action-title">{action.title}</h4>
        <div className="action-badges">
          <span className={`impact-badge ${getImpactColor(action.impact)}`}>
            {action.impact} impact
          </span>
          <span className={`effort-badge ${getEffortColor(action.effort)}`}>
            {action.effort} effort
          </span>
        </div>
      </div>
      
      <p className="action-description">{action.description}</p>
      
      <div className="action-footer">
        <div className="action-meta">
          <span className="action-timeframe">{action.timeframe}</span>
          <span className="action-category">{action.category}</span>
        </div>
        
        {action.action && (
          <button 
            className="action-button"
            onClick={action.action}
          >
            Take Action
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="card action-dashboard">
        <div className="card-header">
          <h2 className="card-title">🎯 Action Dashboard</h2>
        </div>
        <div className="loading">
          <span>Analyzing current garden situation...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="card action-dashboard">
      <div className="card-header">
        <h2 className="card-title">🎯 Action Dashboard</h2>
        <p className="card-subtitle">Your prioritized garden action items</p>
      </div>
      
      <div className="action-sections">
        {/* Urgent Actions */}
        <div className="action-section urgent-section">
          <div className="section-header">
            <h3 className="section-title">🚨 Urgent (Next 48 Hours)</h3>
            <span className="action-count">{actions.urgent.length}</span>
          </div>
          
          {actions.urgent.length === 0 ? (
            <div className="no-actions">
              <span>✅ No urgent actions needed</span>
            </div>
          ) : (
            <div className="action-grid">
              {actions.urgent.map(action => (
                <ActionCard key={action.id} action={action} priority="urgent" />
              ))}
            </div>
          )}
        </div>

        {/* This Month Actions */}
        <div className="action-section month-section">
          <div className="section-header">
            <h3 className="section-title">📅 This Month</h3>
            <span className="action-count">{actions.thisMonth.length}</span>
          </div>
          
          {actions.thisMonth.length === 0 ? (
            <div className="no-actions">
              <span>All caught up for this month</span>
            </div>
          ) : (
            <div className="action-grid">
              {actions.thisMonth.slice(0, 4).map(action => (
                <ActionCard key={action.id} action={action} priority="month" />
              ))}
              {actions.thisMonth.length > 4 && (
                <div className="more-actions">
                  <button className="show-more-btn">
                    Show {actions.thisMonth.length - 4} more actions
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Planning Actions */}
        <div className="action-section planning-section">
          <div className="section-header">
            <h3 className="section-title">📋 Planning & Preparation</h3>
            <span className="action-count">{actions.planning.length}</span>
          </div>
          
          {actions.planning.length === 0 ? (
            <div className="no-actions">
              <span>No planning actions at this time</span>
            </div>
          ) : (
            <div className="action-grid">
              {actions.planning.slice(0, 2).map(action => (
                <ActionCard key={action.id} action={action} priority="planning" />
              ))}
              {actions.planning.length > 2 && (
                <div className="more-actions">
                  <button className="show-more-btn">
                    View all planning items
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ActionDashboard;