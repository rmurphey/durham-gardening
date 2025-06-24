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
  const [completedActions, setCompletedActions] = useState(new Set());
  const [expandedActions, setExpandedActions] = useState(new Set());

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
            title: `${cat.category}: ${formatCurrency(cat.required)} needed`,
            description: cat.description,
            timeframe: 'This week',
            impact: 'high',
            effort: 'medium',
            category: 'Resources',
            details: {
              currentBudget: formatCurrency(0), // Would get from actual category budget
              requiredBudget: formatCurrency(cat.required),
              specificItems: getSpecificItemsForCategory(cat.category),
              vendors: getVendorsForCategory(cat.category)
            }
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

  const getSpecificItemsForCategory = (category) => {
    const itemMaps = {
      seeds: [
        { item: 'Kale seeds (Red Russian)', price: '$3.50', source: 'True Leaf Market', urgent: true },
        { item: 'Pepper transplants (6-pack)', price: '$12.00', source: 'Local nursery', urgent: true },
        { item: 'Okra seeds (Clemson Spineless)', price: '$3.00', source: 'True Leaf Market', urgent: false }
      ],
      soil: [
        { item: 'Compost (2 cu ft bags)', price: '$8.50', source: 'Home Depot', urgent: true },
        { item: 'Organic potting mix', price: '$12.00', source: 'Local nursery', urgent: true },
        { item: 'Vermiculite (8 qt)', price: '$15.00', source: 'Amazon', urgent: false }
      ],
      fertilizer: [
        { item: 'Fish emulsion (32 oz)', price: '$14.00', source: 'True Leaf Market', urgent: true },
        { item: 'Organic all-purpose (4 lb)', price: '$18.00', source: 'Home Depot', urgent: true },
        { item: 'Bone meal (4 lb)', price: '$12.00', source: 'Local nursery', urgent: false }
      ],
      protection: [
        { item: 'Row cover fabric (10x20 ft)', price: '$25.00', source: 'Amazon', urgent: true },
        { item: 'Garden stakes (pack of 10)', price: '$8.00', source: 'Home Depot', urgent: true },
        { item: 'Copper fungicide spray', price: '$12.00', source: 'Local nursery', urgent: false }
      ],
      infrastructure: [
        { item: 'Tomato cages (set of 6)', price: '$35.00', source: 'Home Depot', urgent: true },
        { item: 'Drip irrigation starter kit', price: '$45.00', source: 'Amazon', urgent: false },
        { item: 'Garden bed fabric (4x8 ft)', price: '$28.00', source: 'Local nursery', urgent: false }
      ]
    };
    return itemMaps[category] || [];
  };

  const getVendorsForCategory = (category) => {
    return [
      { name: 'True Leaf Market', type: 'Online', note: 'Best for seeds, proven success' },
      { name: 'Local nursery', type: 'Local', note: 'Fresh transplants, expert advice' },
      { name: 'Home Depot', type: 'Big box', note: 'Bulk items, immediate pickup' },
      { name: 'Amazon', type: 'Online', note: 'Specialty items, fast delivery' }
    ];
  };

  const toggleActionCompletion = (actionId) => {
    setCompletedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
  };

  const toggleActionExpansion = (actionId) => {
    setExpandedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
  };

  const getSeasonalInstructions = (actionTitle) => {
    const instructionMaps = {
      'Start Cool-Season Seeds Indoors': [
        { step: '1. Set up seed starting area', details: 'Use a south-facing window or grow lights. Maintain 65-70°F temperature.', timing: 'Do this first' },
        { step: '2. Choose varieties', details: 'Red Russian kale, broccoli (Green Magic), cabbage (Early Jersey Wakefield)', timing: '6-8 weeks before last frost' },
        { step: '3. Plant seeds', details: 'Use seed starting mix, plant 1/4" deep, keep moist but not soggy', timing: 'February 15-March 1' },
        { step: '4. Care instructions', details: 'Water from bottom, thin seedlings when 2" tall, fertilize weekly with diluted fish emulsion', timing: 'Ongoing until transplant' }
      ],
      'Transplant Heat-Loving Crops': [
        { step: '1. Check soil temperature', details: 'Soil must be 60°F+ at 2" depth for 3 consecutive days', timing: 'Use soil thermometer daily' },
        { step: '2. Harden off seedlings', details: 'Gradually expose to outdoor conditions over 7-10 days', timing: '1 week before transplanting' },
        { step: '3. Prepare beds', details: 'Add 2-4" compost, ensure good drainage. In Durham clay, consider raised beds', timing: '2 weeks before transplant' },
        { step: '4. Plant transplants', details: 'Plant after last frost date (April 15 in Durham). Space tomatoes 24" apart, peppers 18" apart', timing: 'May 1-15 in Durham' }
      ],
      'Install Irrigation System': [
        { step: '1. Plan layout', details: 'Map bed locations, water source, and slope. Durham yards often have clay soil requiring slower water application', timing: 'Before purchasing materials' },
        { step: '2. Buy materials', details: 'Drip tape, pressure compensating emitters, timer, filter, pressure regulator', timing: 'Order 2 weeks before installation' },
        { step: '3. Install system', details: 'Connect to spigot, run main lines, install drip tape in beds. Test thoroughly', timing: 'Early May before heat arrives' },
        { step: '4. Set schedule', details: 'Durham summers: water deeply 2-3x/week early morning. Adjust for rainfall', timing: 'Program timer monthly' }
      ],
      'Plan Spring Garden Layout': [
        { step: '1. Review last year\'s notes', details: 'What worked? What failed? Where were pest/disease issues?', timing: 'Before planning new layout' },
        { step: '2. Plan crop rotation', details: 'Don\'t plant same families in same spots. Tomatoes→greens→legumes→root crops', timing: 'Use garden journal' },
        { step: '3. Calculate space needs', details: 'Durham beds: 3×15 (45 sq ft), 4×8 (32 sq ft), 4×5 (20 sq ft). Total: 97 sq ft', timing: 'Include succession plantings' },
        { step: '4. Create planting calendar', details: 'Durham Zone 7b: Last frost ~April 15, first frost ~November 15', timing: 'Schedule by weeks, not months' }
      ]
    };
    
    return instructionMaps[actionTitle] || [
      { step: 'Detailed instructions needed', details: 'This task needs more specific breakdown', timing: 'Contact for details' }
    ];
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

  const ActionCard = ({ action, priority }) => {
    const isCompleted = completedActions.has(action.id);
    const isExpanded = expandedActions.has(action.id);
    const hasDetails = action.details || action.type === 'seasonal';
    
    return (
      <div className={`action-card ${priority} ${isCompleted ? 'completed' : ''}`}>
        <div className="action-header">
          <div className="action-title-row">
            <button
              className={`completion-checkbox ${isCompleted ? 'checked' : ''}`}
              onClick={() => toggleActionCompletion(action.id)}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {isCompleted ? '✓' : ''}
            </button>
            <h4 className={`action-title ${isCompleted ? 'completed-text' : ''}`}>
              {action.title}
            </h4>
          </div>
          <div className="action-badges">
            <span className={`impact-badge ${getImpactColor(action.impact)}`}>
              {action.impact} impact
            </span>
            <span className={`effort-badge ${getEffortColor(action.effort)}`}>
              {action.effort} effort
            </span>
          </div>
        </div>
        
        <p className={`action-description ${isCompleted ? 'completed-text' : ''}`}>
          {action.description}
        </p>

        {hasDetails && (
          <button 
            className="details-toggle"
            onClick={() => toggleActionExpansion(action.id)}
          >
            {isExpanded ? '↑ Hide details' : '↓ Show details'}
          </button>
        )}

        {isExpanded && action.details && (
          <div className="action-details">
            {action.details.specificItems && (
              <div className="specific-items">
                <h5>Specific Items Needed:</h5>
                <div className="items-list">
                  {action.details.specificItems.map((item, index) => (
                    <div key={index} className={`item-row ${item.urgent ? 'urgent-item' : ''}`}>
                      <div className="item-info">
                        <strong>{item.item}</strong>
                        <span className="item-source">{item.source}</span>
                      </div>
                      <div className="item-price">{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {action.details.vendors && (
              <div className="vendor-options">
                <h5>Where to Buy:</h5>
                <div className="vendors-list">
                  {action.details.vendors.map((vendor, index) => (
                    <div key={index} className="vendor-row">
                      <strong>{vendor.name}</strong> ({vendor.type})
                      <span className="vendor-note">{vendor.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isExpanded && action.type === 'seasonal' && (
          <div className="action-details">
            <div className="seasonal-details">
              <h5>Durham, NC Specific Instructions:</h5>
              <div className="instruction-list">
                {getSeasonalInstructions(action.title).map((instruction, index) => (
                  <div key={index} className="instruction-item">
                    <strong>{instruction.step}</strong>
                    <p>{instruction.details}</p>
                    {instruction.timing && (
                      <span className="timing-note">⏰ {instruction.timing}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="action-footer">
          <div className="action-meta">
            <span className="action-timeframe">{action.timeframe}</span>
            <span className="action-category">{action.category}</span>
          </div>
          
          {action.action && !isCompleted && (
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
  };

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