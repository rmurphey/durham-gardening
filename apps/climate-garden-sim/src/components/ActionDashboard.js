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
  const [expertModeActions, setExpertModeActions] = useState(new Set());
  
  // Phase 2: Progressive Disclosure state
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    urgency: 'all',
    completion: 'incomplete'
  });
  const [viewMode, setViewMode] = useState('smart'); // 'smart', 'compact', 'detailed'
  const [showFilters, setShowFilters] = useState(false);

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

  const toggleExpertMode = (actionId) => {
    setExpertModeActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
  };

  // Phase 2: Smart filtering functions
  const filterActions = (actionList) => {
    return actionList.filter(action => {
      // Category filter
      if (activeFilters.category !== 'all' && action.category.toLowerCase() !== activeFilters.category) {
        return false;
      }
      
      // Urgency filter
      if (activeFilters.urgency !== 'all') {
        if (activeFilters.urgency === 'high' && action.impact !== 'high') return false;
        if (activeFilters.urgency === 'medium' && action.impact !== 'medium') return false;
        if (activeFilters.urgency === 'low' && action.impact !== 'low') return false;
      }
      
      // Completion filter
      const isCompleted = completedActions.has(action.id);
      if (activeFilters.completion === 'completed' && !isCompleted) return false;
      if (activeFilters.completion === 'incomplete' && isCompleted) return false;
      
      return true;
    });
  };

  // Smart view logic - show most relevant actions by default
  const getSmartActions = (actionList, maxItems = 3) => {
    if (viewMode === 'detailed') return actionList;
    
    // In smart mode, prioritize incomplete high-impact actions
    const incomplete = actionList.filter(action => !completedActions.has(action.id));
    const highImpact = incomplete.filter(action => action.impact === 'high');
    const mediumImpact = incomplete.filter(action => action.impact === 'medium');
    
    const smartList = [...highImpact, ...mediumImpact].slice(0, maxItems);
    return smartList.length > 0 ? smartList : actionList.slice(0, maxItems);
  };

  // Quick action handlers
  const completeAllUrgent = () => {
    const urgentIds = actions.urgent.map(action => action.id);
    setCompletedActions(prev => {
      const newSet = new Set(prev);
      urgentIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const clearCompleted = () => {
    setCompletedActions(new Set());
  };

  const updateFilter = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getSeasonalInstructions = (actionTitle) => {
    const instructionMaps = {
      'Plan Spring Garden Layout': [
        { step: '1. Review last year\'s notes', details: 'What worked? What failed? Where were pest/disease issues?', timing: 'Before planning new layout', expert: 'Create digital records with photos, yields, and soil test results for data-driven decisions' },
        { step: '2. Plan crop rotation', details: 'Don\'t plant same families in same spots. Tomatoes→greens→legumes→root crops', timing: 'Use garden journal', expert: 'Use 4-year rotation cycle. Map plant families: Solanaceae (tomatoes/peppers), Brassicaceae (kale/broccoli), Legumes (beans/peas), Alliums (onions/garlic)' },
        { step: '3. Calculate space needs', details: 'Durham beds: 3×15 (45 sq ft), 4×8 (32 sq ft), 4×5 (20 sq ft). Total: 97 sq ft', timing: 'Include succession plantings', expert: 'Factor in mature plant sizes: Tomatoes need 4 sq ft, kale 1 sq ft, carrots 0.25 sq ft. Plan vertical growing for beans/peas' },
        { step: '4. Create planting calendar', details: 'Durham Zone 7b: Last frost ~April 15, first frost ~November 15', timing: 'Schedule by weeks, not months', expert: 'Track soil temperature for precision. Cool crops at 35°F+, warm crops at 60°F+. Use 10-day weather forecasts for optimal timing' }
      ],
      'Order Seeds for Spring': [
        { step: '1. Review portfolio allocation', details: 'Check simulation results: focus on high-performing crop categories from your analysis', timing: 'Use simulation data' },
        { step: '2. Calculate seed quantities', details: 'Durham beds total 97 sq ft. Cool crops: kale (1 pkt/25 sq ft), lettuce (succession every 2 weeks)', timing: 'Plan for multiple plantings' },
        { step: '3. Choose Durham varieties', details: 'Red Russian kale (heat tolerant), Buttercrunch lettuce, Easter Egg radishes', timing: 'Focus on heat tolerance' },
        { step: '4. Place order at True Leaf Market', details: 'Preferred vendor with proven success. Order by January 31 for February delivery', timing: 'Order early for best selection' }
      ],
      'Prepare Cold Frames': [
        { step: '1. Choose location', details: 'South-facing spot protected from north winds. Needs 6+ hours direct sun', timing: 'Scout location in December' },
        { step: '2. Build or buy frame', details: 'DIY: old window + lumber box. Commercial: $80-120. Size: 3x6 ft covers 18 sq ft', timing: 'Complete by mid-January' },
        { step: '3. Prepare soil inside', details: 'Add 4" compost, ensure drainage. Durham clay needs sand/perlite amendment', timing: '2 weeks before planting' },
        { step: '4. Test temperature control', details: 'Install automatic opener ($25) or check daily. Vent when over 75°F', timing: 'Practice before using' }
      ],
      'Start Cool-Season Seeds Indoors': [
        { step: '1. Set up seed starting area', details: 'Use south-facing window or grow lights. Maintain 65-70°F temperature', timing: 'Do this first' },
        { step: '2. Choose varieties', details: 'Red Russian kale, broccoli (Green Magic), cabbage (Early Jersey Wakefield)', timing: '6-8 weeks before last frost' },
        { step: '3. Plant seeds', details: 'Use seed starting mix, plant 1/4" deep, keep moist but not soggy', timing: 'February 15-March 1' },
        { step: '4. Care instructions', details: 'Water from bottom, thin seedlings when 2" tall, fertilize weekly with diluted fish emulsion', timing: 'Ongoing until transplant' }
      ],
      'Direct Seed Hardy Crops': [
        { step: '1. Check soil conditions', details: 'Soil workable, not muddy. Durham clay: add compost if too wet', timing: 'When soil crumbles in hand' },
        { step: '2. Choose protected areas', details: 'Cold frame, south side of house, or row cover areas', timing: 'Use microclimates' },
        { step: '3. Plant peas and radishes', details: 'Peas: 2" apart, 1" deep. Radishes: 1" apart, 1/2" deep. Soak peas overnight', timing: 'Soil temp 35°F+' },
        { step: '4. Install protection', details: 'Row cover on hoops, remove when temps hit 60°F consistently', timing: 'Cover immediately after planting' }
      ],
      'Soil Test and Amendment': [
        { step: '1. Take soil samples', details: 'Dig 6" deep, take from 5 spots per bed, mix together. Avoid recent rain', timing: 'When soil is moist, not wet' },
        { step: '2. Send for testing', details: 'NC State Extension: $4 test, 7-day results. Test pH, nutrients, organic matter', timing: 'Mail by February 15' },
        { step: '3. Interpret results', details: 'Durham target: pH 6.0-6.8, 3%+ organic matter. Note recommendations', timing: 'Results arrive in 1 week' },
        { step: '4. Apply amendments', details: 'Add lime if pH<6.0, sulfur if pH>7.0. Always add 2-4" compost', timing: '4 weeks before planting' }
      ],
      'Transplant Cool-Season Starts': [
        { step: '1. Harden off seedlings', details: 'Gradually expose to outdoor conditions over 7 days. Start with 2 hours, increase daily', timing: 'Week before transplant' },
        { step: '2. Check soil temperature', details: 'Soil 45°F+ for cool crops. Use soil thermometer at 2" depth', timing: 'Check 3 consecutive days' },
        { step: '3. Prepare planting holes', details: 'Dig holes same depth as pot, twice as wide. Space kale 12", broccoli 18"', timing: 'Day of transplanting' },
        { step: '4. Plant and protect', details: 'Plant at soil level, water well, install row cover if frost expected', timing: 'Evening planting reduces stress' }
      ],
      'Direct Seed Cool Crops': [
        { step: '1. Prepare seedbed', details: 'Rake smooth, remove rocks. Durham clay: add compost and sand for drainage', timing: 'Day before planting' },
        { step: '2. Create planting rows', details: 'Lettuce rows 8" apart, carrot rows 6" apart. Use string line for straight rows', timing: 'Mark with stakes' },
        { step: '3. Plant seeds', details: 'Lettuce: 1/4" deep, thin to 4". Carrots: 1/2" deep, thin to 2". Beets: 1/2" deep, thin to 3"', timing: 'Follow packet instructions' },
        { step: '4. Water and mark', details: 'Gentle mist daily, mark rows with labels. Germination: lettuce 7 days, carrots 14 days', timing: 'Keep soil moist until germination' }
      ],
      'Prepare Heat-Loving Seed Starts': [
        { step: '1. Set up warm starting area', details: 'Heat mat to maintain 75-80°F soil temperature. Use thermostat for control', timing: '8-10 weeks before last frost' },
        { step: '2. Choose varieties for Durham', details: 'Cherokee Purple tomatoes, Fish pepper, Hungarian Hot Wax peppers - heat tolerant', timing: 'Focus on heat adaptation' },
        { step: '3. Plant seeds', details: 'Use seed starting mix, plant 1/4" deep, one seed per cell. Keep soil consistently moist', timing: 'March 1-15 for Durham' },
        { step: '4. Provide adequate light', details: 'Grow lights 2" above seedlings, 14-16 hours daily, or bright south window', timing: 'Start lights immediately after germination' }
      ],
      'Start Tomato/Pepper Seeds Indoors': [
        { step: '1. Calculate transplant date', details: 'Durham last frost ~April 15. Start tomatoes 8-10 weeks early (mid-February)', timing: 'Count backwards from transplant' },
        { step: '2. Choose heat-loving varieties', details: 'Celebrity tomatoes, Early Girl, Fish peppers, Hungarian Hot Wax - Durham heat tolerance', timing: 'Select proven varieties' },
        { step: '3. Use heat mat setup', details: 'Maintain 75-80°F soil temperature for germination. Seeds need consistent warmth', timing: 'Critical for germination success' },
        { step: '4. Plan for 8-week growth', details: 'Will need space for 6-8" tall plants by transplant time. Prepare adequate indoor space', timing: 'Plants get large indoors' }
      ],
      'Start Early Brassicas Indoors': [
        { step: '1. Choose cold-tolerant varieties', details: 'Broccoli (Green Magic), cauliflower (Snow Crown), cabbage (Early Jersey Wakefield)', timing: 'Can handle light frost' },
        { step: '2. Start 6-8 weeks early', details: 'For March 15 transplant, start late January/early February indoors', timing: 'Count backwards from transplant' },
        { step: '3. Keep cool after germination', details: '60-65°F daytime temperature prevents leggy growth. Cool windowsill or basement', timing: 'After initial germination' },
        { step: '4. Harden off gradually', details: 'Expose to outdoor conditions 7-10 days before transplant. Start with 2 hours', timing: 'Week before transplant' }
      ],
      'Start Fall Brassicas Indoors': [
        { step: '1. Beat the heat with indoor starts', details: 'July heat makes outdoor seeding difficult. Start indoors with AC/fans', timing: 'Critical during Durham summers' },
        { step: '2. Choose fall varieties', details: 'Broccoli (Calabrese), kale (Red Russian), cauliflower - varieties that mature in cool weather', timing: 'Plan for fall harvest' },
        { step: '3. Keep seedlings cool', details: 'Use coolest indoor location. Basement, north window, or air-conditioned room', timing: 'Prevent heat stress' },
        { step: '4. Time for September transplant', details: 'Start 6-8 weeks before transplant when temperatures drop below 85°F', timing: 'Usually late August/early September' }
      ],
      'Start Summer Succession Indoors': [
        { step: '1. Extend growing season', details: 'Start beans, cucumbers indoors for pest-free early start', timing: 'Get jump on outdoor planting' },
        { step: '2. Choose quick varieties', details: 'Bush beans (Provider), cucumber (Suyo Long), summer squash for fast growth', timing: 'Select 50-60 day varieties' },
        { step: '3. Use larger containers', details: 'These grow fast and large. Use 4" pots minimum for good root development', timing: 'Prevent root binding' },
        { step: '4. Transplant timing', details: 'Move outdoors when soil is 60°F+ and night temps stay above 50°F', timing: 'Usually late June/July in Durham' }
      ],
      'Start Winter Greens Indoors': [
        { step: '1. Plan for cold frame growing', details: 'Start spinach, arugula, lettuce indoors for cold frame transplant', timing: 'Prepare for winter growing' },
        { step: '2. Choose cold-hardy varieties', details: 'Spinach (Space), arugula (Roquette), lettuce (Winter Density) - cold tolerance', timing: 'Select for Durham winters' },
        { step: '3. Start 4-6 weeks early', details: 'For October transplant to cold frames, start late August/early September', timing: 'Time for cold frame setup' },
        { step: '4. Plan protection', details: 'These will need cold frames or row covers for Durham winter survival', timing: 'Prepare protection systems' }
      ]
      'Plant Heat-Sensitive Crops': [
        { step: '1. Check last frost date', details: 'Durham average: April 15. Wait 2 weeks after for heat-sensitive crops', timing: 'May 1+ for safety' },
        { step: '2. Prepare beds', details: 'Work in 2-4" compost, ensure good drainage. Raised beds work best in Durham clay', timing: '2 weeks before planting' },
        { step: '3. Plant potatoes', details: 'Cut seed potatoes with 2+ eyes, let dry 2 days. Plant 4" deep, 12" apart', timing: 'Soil temp 45°F+' },
        { step: '4. Plant onion sets', details: 'Plant sets 1" deep, 4" apart. Choose short-day varieties for Durham', timing: 'Same time as potatoes' }
      ],
      'Succession Plant Cool Crops': [
        { step: '1. Calculate timing', details: 'Plant lettuce every 2 weeks, radishes every 10 days for continuous harvest', timing: 'Mark calendar through May' },
        { step: '2. Prepare small sections', details: 'Only prepare area needed for each planting. Keep rest of bed productive', timing: 'Work in sections' },
        { step: '3. Use heat-tolerant varieties', details: 'Switch to heat-tolerant lettuce: Nevada, Jericho, Muir for later plantings', timing: 'Different varieties by season' },
        { step: '4. Provide afternoon shade', details: 'Use taller plants or shade cloth as temperatures rise', timing: 'Install before 80°F days' }
      ],
      'Harden Off Heat Starts': [
        { step: '1. Check plant readiness', details: 'Plants 6-8 weeks old, 6"+ tall with strong stems. Not recently fertilized', timing: '2 weeks before transplant date' },
        { step: '2. Start gradual exposure', details: 'Day 1-2: shade for 2 hours. Day 3-4: morning sun for 2 hours', timing: 'Increase exposure daily' },
        { step: '3. Increase outdoor time', details: 'Day 5-7: full sun 4 hours. Day 8-10: full day outside, bring in at night', timing: 'Watch for wilting, stress' },
        { step: '4. Final preparation', details: 'Day 11-14: leave outside overnight if temps above 50°F', timing: 'Ready to transplant after 2 weeks' }
      ],
      'Transplant Heat-Loving Crops': [
        { step: '1. Check soil temperature', details: 'Soil must be 60°F+ at 2" depth for 3 consecutive days', timing: 'Use soil thermometer daily' },
        { step: '2. Harden off seedlings', details: 'Gradually expose to outdoor conditions over 7-10 days', timing: '1 week before transplanting' },
        { step: '3. Prepare beds', details: 'Add 2-4" compost, ensure good drainage. In Durham clay, consider raised beds', timing: '2 weeks before transplant' },
        { step: '4. Plant transplants', details: 'Plant after last frost date (April 15 in Durham). Space tomatoes 24" apart, peppers 18" apart', timing: 'May 1-15 in Durham' }
      ],
      'Install Support Systems': [
        { step: '1. Install tomato cages', details: 'Use 6-ft tall cages, install at transplanting. Indeterminate varieties need stronger support', timing: 'Same day as transplanting' },
        { step: '2. Set up trellises', details: 'Install 6-8 ft posts, string with wire or netting. For beans, peas, cucumbers', timing: 'Before plants need support' },
        { step: '3. Stake tall plants', details: 'Use 1"x2" stakes, 6 ft tall. Tie with soft material, not wire', timing: 'Install early, tie as plants grow' },
        { step: '4. Plan for expansion', details: 'Plants grow bigger than expected. Leave room for full-sized plants', timing: 'Design for mature size' }
      ],
      'Mulch All Beds': [
        { step: '1. Choose mulch type', details: 'Organic: straw, shredded leaves, compost. Inorganic: landscape fabric, cardboard', timing: 'Source mulch in advance' },
        { step: '2. Prepare soil first', details: 'Weed thoroughly, water well, apply fertilizer. Mulch locks in current conditions', timing: 'Clean beds completely' },
        { step: '3. Apply proper thickness', details: '2-4" organic mulch, keep 3" away from plant stems to prevent disease', timing: 'After soil warms to 60°F' },
        { step: '4. Maintain throughout season', details: 'Add more as it decomposes. Pull back for new plantings', timing: 'Check monthly, refresh as needed' }
      ],
      'Plant Heat-Loving Succession': [
        { step: '1. Choose heat-adapted varieties', details: 'Okra (heat lover), yard-long beans, Malabar spinach for Durham summers', timing: 'Plant after soil hits 70°F' },
        { step: '2. Plan succession timing', details: 'Plant beans every 3 weeks through July. Squash every 4 weeks', timing: 'Mark calendar dates' },
        { step: '3. Prepare beds in heat', details: 'Work soil early morning or evening. Add extra compost for water retention', timing: 'Avoid midday soil work' },
        { step: '4. Provide immediate protection', details: 'Shade cloth first week, extra water, mulch heavily', timing: 'Protect from heat stress' }
      ],
      'Install Irrigation System': [
        { step: '1. Plan layout', details: 'Map bed locations, water source, and slope. Durham yards often have clay soil requiring slower water application', timing: 'Before purchasing materials' },
        { step: '2. Buy materials', details: 'Drip tape, pressure compensating emitters, timer, filter, pressure regulator', timing: 'Order 2 weeks before installation' },
        { step: '3. Install system', details: 'Connect to spigot, run main lines, install drip tape in beds. Test thoroughly', timing: 'Early May before heat arrives' },
        { step: '4. Set schedule', details: 'Durham summers: water deeply 2-3x/week early morning. Adjust for rainfall', timing: 'Program timer monthly' }
      ],
      'Harvest Early Crops': [
        { step: '1. Check harvest timing', details: 'Peas: pick daily when pods fill out. Spinach: cut outer leaves when 4"+ long', timing: 'Harvest in cool morning' },
        { step: '2. Use proper technique', details: 'Cut, don\'t pull. Use clean knife or scissors. Leave roots for nitrogen', timing: 'Clean tools between plants' },
        { step: '3. Handle heat stress', details: 'Cool crops bolt in heat. Harvest everything before 85°F+ days', timing: 'Watch weather forecast' },
        { step: '4. Succession planning', details: 'Remove spent plants immediately, prepare space for heat-loving crops', timing: 'Quick turnaround for bed space' }
      ]
    };
    
    return instructionMaps[actionTitle] || [
      { step: 'General garden task', details: 'This is a standard gardening activity for your area and season', timing: 'Follow normal gardening practices' }
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
        { title: 'Prepare Cold Frames', desc: 'Set up protection for early season starts', effort: 'medium' },
        { title: 'Start Tomato/Pepper Seeds Indoors', desc: 'Begin heat-loving transplants 8-10 weeks early', effort: 'low' }
      ],
      1: [ // February
        { title: 'Start Cool-Season Seeds Indoors', desc: 'Kale, broccoli, cabbage for March transplant', effort: 'low' },
        { title: 'Direct Seed Hardy Crops', desc: 'Peas, radishes, spinach in protected areas', effort: 'low' },
        { title: 'Soil Test and Amendment', desc: 'Test soil pH and add compost/amendments', effort: 'medium' },
        { title: 'Start Early Brassicas Indoors', desc: 'Broccoli, cauliflower, cabbage for early spring', effort: 'low' }
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
        { title: 'Harvest Early Crops', desc: 'Pick peas, spinach before heat stress', effort: 'low' },
        { title: 'Start Summer Succession Indoors', desc: 'Begin beans, cucumbers, squash for July planting', effort: 'low' }
      ],
      6: [ // July
        { title: 'Start Fall Brassicas Indoors', desc: 'Broccoli, kale, cauliflower for fall transplant', effort: 'low' },
        { title: 'Start Fall Garden Planning', desc: 'Order seeds for August/September planting', effort: 'medium' }
      ],
      7: [ // August
        { title: 'Start Fall Crops Indoors', desc: 'Cabbage, Brussels sprouts for October harvest', effort: 'low' },
        { title: 'Start Cool-Season Herbs Indoors', desc: 'Cilantro, parsley for September transplant', effort: 'low' }
      ],
      8: [ // September
        { title: 'Start Winter Greens Indoors', desc: 'Spinach, arugula, lettuce for cold frame growing', effort: 'low' },
        { title: 'Transplant Fall Starts', desc: 'Move July/August starts to garden beds', effort: 'medium' }
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
    const isExpertMode = expertModeActions.has(action.id);
    const hasDetails = action.details || action.type === 'seasonal';
    const isCompactView = viewMode === 'compact';
    
    return (
      <div className={`action-card ${priority} ${isCompleted ? 'completed' : ''} ${isCompactView ? 'compact-mode' : ''}`}>
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
        
        {!isCompactView && (
          <p className={`action-description ${isCompleted ? 'completed-text' : ''}`}>
            {action.description}
          </p>
        )}

        {hasDetails && !isCompactView && (
          <button 
            className="details-toggle"
            onClick={() => toggleActionExpansion(action.id)}
          >
            {isExpanded ? '↑ Hide details' : '↓ Show details'}
          </button>
        )}

        {isCompactView && hasDetails && (
          <button 
            className="details-toggle compact"
            onClick={() => toggleActionExpansion(action.id)}
            title={action.description}
          >
            {isExpanded ? '−' : '+'}
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
              <div className="detail-header">
                <h5>Durham, NC Specific Instructions:</h5>
                <button 
                  className={`expert-toggle ${isExpertMode ? 'active' : ''}`}
                  onClick={() => toggleExpertMode(action.id)}
                  title="Toggle expert mode details"
                >
                  {isExpertMode ? '🎓 Expert Mode' : '👤 Basic Mode'}
                </button>
              </div>
              <div className="instruction-list">
                {getSeasonalInstructions(action.title).map((instruction, index) => (
                  <div key={index} className="instruction-item">
                    <strong>{instruction.step}</strong>
                    <p>{instruction.details}</p>
                    {instruction.timing && (
                      <span className="timing-note">⏰ {instruction.timing}</span>
                    )}
                    {isExpertMode && instruction.expert && (
                      <div className="expert-details">
                        <span className="expert-label">🎓 Expert:</span>
                        <p className="expert-text">{instruction.expert}</p>
                      </div>
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
        
        {/* Phase 2: Dashboard Controls */}
        <div className="dashboard-controls">
          <div className="view-controls">
            <button 
              className={`view-button ${viewMode === 'smart' ? 'active' : ''}`}
              onClick={() => setViewMode('smart')}
            >
              Smart View
            </button>
            <button 
              className={`view-button ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
            >
              Compact
            </button>
            <button 
              className={`view-button ${viewMode === 'detailed' ? 'active' : ''}`}
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </button>
          </div>
          
          <div className="quick-actions">
            {actions.urgent.length > 0 && (
              <button 
                className="quick-action-button urgent"
                onClick={completeAllUrgent}
                title="Mark all urgent actions as complete"
              >
                Complete All Urgent
              </button>
            )}
            {completedActions.size > 0 && (
              <button 
                className="quick-action-button secondary"
                onClick={clearCompleted}
                title="Clear all completed actions"
              >
                Clear Completed
              </button>
            )}
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {activeFilters.category !== 'all' || activeFilters.urgency !== 'all' || activeFilters.completion !== 'incomplete' ? '(On)' : ''}
            </button>
          </div>
        </div>

        {/* Phase 2: Smart Filters */}
        {showFilters && (
          <div className="filter-controls">
            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={activeFilters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="seasonal">Seasonal</option>
                <option value="financial">Financial</option>
                <option value="protection">Protection</option>
                <option value="resources">Resources</option>
                <option value="planning">Planning</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Impact:</label>
              <select 
                value={activeFilters.urgency}
                onChange={(e) => updateFilter('urgency', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="high">High Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="low">Low Impact</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={activeFilters.completion}
                onChange={(e) => updateFilter('completion', e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="incomplete">Incomplete</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      <div className="action-sections">
        {/* Urgent Actions */}
        <div className="action-section urgent-section">
          <div className="section-header">
            <h3 className="section-title">🚨 Urgent (Next 48 Hours)</h3>
            <span className="action-count">{filterActions(actions.urgent).length}</span>
          </div>
          
          {filterActions(actions.urgent).length === 0 ? (
            <div className="no-actions">
              <span>✅ No urgent actions needed</span>
            </div>
          ) : (
            <div className="action-grid">
              {getSmartActions(filterActions(actions.urgent), 5).map(action => (
                <ActionCard key={action.id} action={action} priority="urgent" />
              ))}
              {viewMode === 'smart' && filterActions(actions.urgent).length > 5 && (
                <div className="more-actions">
                  <button 
                    className="show-more-btn"
                    onClick={() => setViewMode('detailed')}
                  >
                    Show {filterActions(actions.urgent).length - 5} more urgent actions
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* This Month Actions */}
        <div className="action-section month-section">
          <div className="section-header">
            <h3 className="section-title">📅 This Month</h3>
            <span className="action-count">{filterActions(actions.thisMonth).length}</span>
          </div>
          
          {filterActions(actions.thisMonth).length === 0 ? (
            <div className="no-actions">
              <span>All caught up for this month</span>
            </div>
          ) : (
            <div className="action-grid">
              {getSmartActions(filterActions(actions.thisMonth), 4).map(action => (
                <ActionCard key={action.id} action={action} priority="month" />
              ))}
              {viewMode === 'smart' && filterActions(actions.thisMonth).length > 4 && (
                <div className="more-actions">
                  <button 
                    className="show-more-btn"
                    onClick={() => setViewMode('detailed')}
                  >
                    Show {filterActions(actions.thisMonth).length - 4} more actions
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
            <span className="action-count">{filterActions(actions.planning).length}</span>
          </div>
          
          {filterActions(actions.planning).length === 0 ? (
            <div className="no-actions">
              <span>No planning actions at this time</span>
            </div>
          ) : (
            <div className="action-grid">
              {getSmartActions(filterActions(actions.planning), 2).map(action => (
                <ActionCard key={action.id} action={action} priority="planning" />
              ))}
              {viewMode === 'smart' && filterActions(actions.planning).length > 2 && (
                <div className="more-actions">
                  <button 
                    className="show-more-btn"
                    onClick={() => setViewMode('detailed')}
                  >
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