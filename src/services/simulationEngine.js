/**
 * Monte Carlo Simulation Engine for Garden Planning
 * Handles statistical modeling, yield calculations, and risk analysis
 * Enhanced with real-time weather data integration
 */

import jStat from 'jstat';
import * as ss from 'simple-statistics';
import { 
  getClimateSeverity,
  BASE_YIELD_MULTIPLIERS,
  MARKET_PRICES
} from '../config.js';
// import { weatherDataService } from './weatherDataService.js'; // Currently unused
import { 
  generateWeatherSamplesFromRealData,
  applyWeatherAdjustments 
} from './weatherIntegration.js';
import { DEFAULT_CROPS as DURHAM_CROPS } from '../config/defaultConfig.js';

/**
 * Run complete Monte Carlo simulation for garden planning
 * @param {Object} config - Simulation configuration
 * @param {number} iterations - Number of simulation iterations
 * @returns {Object} Complete simulation results
 */
export const runCompleteSimulation = async (config, iterations = 1000) => {
  const { 
    portfolio, 
    baseInvestment, 
    selectedSummer, 
    selectedWinter, 
    locationConfig,
    portfolioMultiplier = 1.0,
    weatherData = null // Optional real-time weather data
  } = config;

  try {
    // Enhance simulation with weather data if available
    let enhancedConfig = { ...config };
    if (weatherData && weatherData.forecast && weatherData.forecast.length > 0) {
      enhancedConfig.weatherData = weatherData;
      console.log('Using real weather data in simulation with', weatherData.forecast.length, 'days of forecast');
    } else {
      console.log('Using synthetic weather scenarios - no real forecast data available');
    }

    // Run Monte Carlo simulation with enhanced weather data
    const monteCarloResults = runMonteCarloSimulation({
      portfolio,
      baseInvestment,
      selectedSummer,
      selectedWinter,
      locationConfig,
      portfolioMultiplier,
      weatherData: enhancedConfig.weatherData
    }, iterations);

    // Calculate statistics
    const statistics = calculateStatistics(monteCarloResults);
    
    // Generate visualization data with weather integration
    const weatherRiskData = generateWeatherRiskData(monteCarloResults, enhancedConfig.weatherData);
    const returnHistogram = generateHistogramData(monteCarloResults.map(r => r.netReturn), 25);
    const roiHistogram = generateHistogramData(monteCarloResults.map(r => r.roi), 25);

    // NEW: Generate probabilistic calendar from Monte Carlo scenarios
    const probabilisticCalendar = generateProbabilisticCalendar(monteCarloResults);
    
    console.log('Generated probabilistic calendar with', probabilisticCalendar.totalScenarios, 'scenarios');
    console.log('Planting recommendations:', probabilisticCalendar.plantingRecommendations.length);
    console.log('Harvest predictions:', probabilisticCalendar.harvestPredictions.length);
    console.log('Critical events:', probabilisticCalendar.criticalEvents.length);

    return {
      ...statistics,
      rawResults: monteCarloResults,
      weatherRiskData,
      returnHistogram,
      roiHistogram,
      probabilisticCalendar, // NEW: Calendar with date-specific recommendations
      weatherEnhanced: !!enhancedConfig.weatherData,
      weatherTimestamp: enhancedConfig.weatherData?.timestamp
    };
  } catch (error) {
    console.error('Simulation error:', error);
    throw error;
  }
};

/**
 * Core Monte Carlo simulation implementation
 * @param {Object} params - Simulation parameters
 * @param {number} iterations - Number of iterations
 * @returns {Array} Array of simulation results
 */
export const runMonteCarloSimulation = (params, iterations = 1000) => {
  const { portfolio, baseInvestment, selectedSummer, selectedWinter, locationConfig, portfolioMultiplier, weatherData } = params;
  
  // Generate simulation parameters using proper statistical distributions
  // Enhanced with real-time weather data if available
  const simParams = generateSimulationParameters(
    portfolio, 
    baseInvestment, 
    portfolioMultiplier, 
    locationConfig,
    selectedSummer,
    selectedWinter,
    weatherData
  );
  
  // Generate normal distribution samples using correct jStat API
  const generateNormalSamples = (mean, std, count) => {
    // Ensure valid parameters to prevent NaN
    const safeMean = isFinite(mean) ? mean : 100;
    const safeStd = isFinite(std) && std > 0 ? std : 10;
    
    return Array.from({length: count}, () => {
      const sample = jStat.normal.sample(safeMean, safeStd);
      return isFinite(sample) ? sample : safeMean;
    });
  };

  const harvestValues = generateNormalSamples(simParams.harvest.mean, simParams.harvest.std, iterations);
  const investments = generateNormalSamples(simParams.investment.mean, simParams.investment.std, iterations);
  
  // Calculate derived metrics
  const netReturns = harvestValues.map((harvest, i) => harvest - investments[i]);
  const rois = netReturns.map((netReturn, i) => {
    const investment = investments[i];
    if (investment <= 0) return 0; // Prevent division by zero
    return (netReturn / investment) * 100;
  });
  
  // Generate breakdown data (simplified for performance)
  const heatYields = generateNormalSamples(simParams.heatYield.mean, simParams.heatYield.std, iterations);
  const coolYields = generateNormalSamples(simParams.coolYield.mean, simParams.coolYield.std, iterations);
  const perennialYields = generateNormalSamples(simParams.perennialYield.mean, simParams.perennialYield.std, iterations);
  
  // Generate weather data for visualization
  // Use real weather data if available, otherwise use synthetic data
  const simulationWeatherData = weatherData 
    ? generateWeatherSamplesFromRealData(iterations, weatherData, locationConfig)
    : generateWeatherSamples(iterations, locationConfig, selectedSummer, selectedWinter);
  
  // NEW: Generate calendar events for each scenario iteration
  const calendarScenarios = simulationWeatherData.map(weatherScenario => 
    generateCalendarFromScenario(portfolio, weatherScenario, locationConfig)
  );
  
  // Package results in expected format with investment analysis AND calendar data
  return harvestValues.map((harvestValue, i) => ({
    harvestValue,
    investment: investments[i],
    netReturn: netReturns[i],
    roi: rois[i],
    heatYield: heatYields[i],
    coolYield: coolYields[i],
    perennialYield: perennialYields[i],
    weather: simulationWeatherData[i],
    calendar: calendarScenarios[i], // NEW: Each iteration has probabilistic calendar
    investmentSufficiency: simParams.investmentSufficiency,
    requiredInvestment: simParams.requiredInvestment
  }));
};

/**
 * Generate realistic simulation parameters based on portfolio and conditions
 * @param {Object} portfolio - Portfolio allocation
 * @param {number} baseInvestment - Base investment amount
 * @param {number} portfolioMultiplier - Portfolio risk multiplier
 * @param {Object} locationConfig - Location configuration
 * @param {string} selectedSummer - Summer scenario
 * @param {string} selectedWinter - Winter scenario
 * @returns {Object} Simulation parameters
 */
export const generateSimulationParameters = (
  portfolio, 
  baseInvestment, 
  portfolioMultiplier, 
  locationConfig,
  selectedSummer,
  selectedWinter,
  weatherData = null
) => {
  const sizeMultiplier = (locationConfig?.gardenSizeActual || 100) / 100;
  const climateSeverity = getClimateSeverity(selectedSummer, selectedWinter);
  
  // Base yields per crop type using mapping constants
  const baseYields = Object.entries(BASE_YIELD_MULTIPLIERS).reduce((yields, [cropType, multiplier]) => {
    yields[cropType] = (portfolio[cropType] || 0) * multiplier * sizeMultiplier;
    return yields;
  }, {});
  
  // Calculate expected harvest value using market price mappings
  const expectedHarvest = 
    (baseYields.heatSpecialists || 0) * MARKET_PRICES.heat * climateSeverity.heat +
    (baseYields.coolSeason || 0) * MARKET_PRICES.cool * climateSeverity.cool +
    (baseYields.perennials || 0) * MARKET_PRICES.herbs * climateSeverity.perennial;
  
  const harvestStd = expectedHarvest * 0.3; // 30% variability in harvest
  const investmentMean = baseInvestment * portfolioMultiplier;
  const investmentStd = investmentMean * 0.1; // 10% variability in costs
  
  // Calculate required investment for conditions
  const requiredInvestment = calculateRequiredInvestment(
    portfolio, 
    selectedSummer, 
    selectedWinter, 
    sizeMultiplier,
    locationConfig
  );
  
  const baseParams = {
    harvest: { mean: expectedHarvest, std: harvestStd },
    investment: { mean: investmentMean, std: investmentStd },
    requiredInvestment,
    investmentSufficiency: calculateInvestmentSufficiency(investmentMean, requiredInvestment),
    heatYield: { 
      mean: (baseYields.heatSpecialists || 0) * MARKET_PRICES.heat, 
      std: (baseYields.heatSpecialists || 0) * MARKET_PRICES.heat * 0.4 
    },
    coolYield: { 
      mean: (baseYields.coolSeason || 0) * MARKET_PRICES.cool, 
      std: (baseYields.coolSeason || 0) * MARKET_PRICES.cool * 0.4 
    },
    perennialYield: { 
      mean: (baseYields.perennials || 0) * MARKET_PRICES.herbs, 
      std: (baseYields.perennials || 0) * MARKET_PRICES.herbs * 0.3 
    }
  };

  // Apply weather adjustments if real weather data is available
  if (weatherData) {
    console.log('Applying weather adjustments to simulation parameters');
    const adjustedParams = applyWeatherAdjustments(baseParams, weatherData, locationConfig);
    console.log('Weather impact:', {
      originalHarvest: baseParams.harvest.mean.toFixed(0),
      adjustedHarvest: adjustedParams.harvest.mean.toFixed(0),
      weatherMultiplier: (adjustedParams.harvest.mean / baseParams.harvest.mean).toFixed(2)
    });
    return adjustedParams;
  }
  
  console.log('No weather data - using base simulation parameters');
  return baseParams;
};

/**
 * Generate weather samples for visualization
 * @param {number} iterations - Number of samples
 * @param {Object} locationConfig - Location configuration
 * @param {string} selectedSummer - Summer scenario
 * @param {string} selectedWinter - Winter scenario
 * @returns {Array} Weather sample data
 */
export const generateWeatherSamples = (iterations, locationConfig, selectedSummer, selectedWinter) => {
  const stressDaysParams = getStressDaysParams(selectedSummer, locationConfig);
  const freezeParams = getFreezeParams(selectedWinter, locationConfig);
  const rainfallParams = getRainfallParams(locationConfig);
  
  // Generate samples using individual calls (same pattern as normal distribution)
  const stressDays = Array.from({length: iterations}, () => jStat.poisson.sample(stressDaysParams.lambda));
  const freezeEvents = Array.from({length: iterations}, () => jStat.poisson.sample(freezeParams.lambda));
  const rainfall = Array.from({length: iterations}, () => jStat.normal.sample(rainfallParams.mean, rainfallParams.std));
  
  return stressDays.map((stress, i) => ({
    stressDays: Math.max(0, stress),
    freezeEvents: Math.max(0, freezeEvents[i]),
    annualRainfall: Math.max(10, rainfall[i])
  }));
};

/**
 * Calculate stress days parameters based on summer scenario
 * @param {string} selectedSummer - Summer scenario
 * @param {Object} locationConfig - Location configuration
 * @returns {Object} Stress days parameters
 */
export const getStressDaysParams = (selectedSummer, locationConfig) => {
  const heatIntensity = locationConfig?.heatIntensity || 3;
  const baseStressDays = { mild: 5, normal: 15, extreme: 35, catastrophic: 60 };
  const lambda = (baseStressDays[selectedSummer] || 15) * (heatIntensity / 3);
  return { lambda };
};

/**
 * Calculate freeze event parameters based on winter scenario
 * @param {string} selectedWinter - Winter scenario
 * @param {Object} locationConfig - Location configuration
 * @returns {Object} Freeze parameters
 */
export const getFreezeParams = (selectedWinter, locationConfig) => {
  const winterSeverity = locationConfig?.winterSeverity || 3;
  const baseFreezeEvents = { traditional: 20, mild: 8, warm: 3, none: 0 };
  const lambda = (baseFreezeEvents[selectedWinter] || 8) * (winterSeverity / 3);
  return { lambda };
};

/**
 * Calculate rainfall parameters based on location
 * @param {Object} locationConfig - Location configuration
 * @returns {Object} Rainfall parameters
 */
export const getRainfallParams = (locationConfig) => {
  const mean = locationConfig?.avgRainfall || 40;
  const std = mean * 0.2; // 20% variability
  return { mean, std };
};

/**
 * Calculate statistics from Monte Carlo results
 * @param {Array} results - Raw Monte Carlo results
 * @returns {Object} Statistical summary
 */
export const calculateStatistics = (results) => {
  if (!results || results.length === 0) {
    return { mean: 0, median: 0, std: 0, percentiles: {}, successRate: 0 };
  }

  // Filter out invalid results and ensure we have valid numbers
  const validResults = results.filter(r => 
    isFinite(r.netReturn) && isFinite(r.roi) && isFinite(r.harvestValue)
  );

  if (validResults.length === 0) {
    return { mean: 0, median: 0, std: 0, percentiles: {}, successRate: 0 };
  }

  const netReturns = validResults.map(r => r.netReturn);
  const rois = validResults.map(r => r.roi);
  const harvestValues = validResults.map(r => r.harvestValue);
  
  // Helper function to safely calculate statistics
  const safeCalculate = (values, func, defaultValue = 0) => {
    try {
      const result = func(values);
      return isFinite(result) ? result : defaultValue;
    } catch (error) {
      console.warn('Statistics calculation error:', error);
      return defaultValue;
    }
  };

  return {
    mean: safeCalculate(netReturns, ss.mean),
    median: safeCalculate(netReturns, ss.median),
    std: safeCalculate(netReturns, ss.standardDeviation),
    percentiles: {
      p10: safeCalculate(netReturns, (vals) => ss.quantile(vals, 0.1)),
      p25: safeCalculate(netReturns, (vals) => ss.quantile(vals, 0.25)),
      p75: safeCalculate(netReturns, (vals) => ss.quantile(vals, 0.75)),
      p90: safeCalculate(netReturns, (vals) => ss.quantile(vals, 0.9))
    },
    roi: {
      mean: safeCalculate(rois, ss.mean),
      median: safeCalculate(rois, ss.median),
      std: safeCalculate(rois, ss.standardDeviation)
    },
    harvestValue: {
      mean: safeCalculate(harvestValues, ss.mean),
      median: safeCalculate(harvestValues, ss.median),
      std: safeCalculate(harvestValues, ss.standardDeviation)
    },
    successRate: netReturns.filter(r => r > 0).length / netReturns.length * 100
  };
};

/**
 * Generate histogram data for visualization
 * @param {Array} data - Data array
 * @param {number} bins - Number of bins
 * @returns {Array} Histogram data
 */
export const generateHistogramData = (data, bins = 25) => {
  if (!data || data.length === 0) return [];
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;
  
  const histogram = Array(bins).fill(0).map((_, i) => ({
    x: min + (i + 0.5) * binWidth,
    value: 0,
    count: 0
  }));
  
  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
    if (binIndex >= 0 && binIndex < bins) {
      histogram[binIndex].count++;
      histogram[binIndex].value = histogram[binIndex].count;
    }
  });
  
  return histogram;
};

/**
 * Calculate required investment based on growing conditions
 * @param {Object} portfolio - Portfolio allocation
 * @param {string} selectedSummer - Summer scenario
 * @param {string} selectedWinter - Winter scenario
 * @param {number} sizeMultiplier - Garden size multiplier
 * @param {Object} locationConfig - Location configuration
 * @returns {Object} Required investment breakdown
 */
export const calculateRequiredInvestment = (
  portfolio, 
  selectedSummer, 
  selectedWinter, 
  sizeMultiplier,
  locationConfig
) => {
  // Base costs per category (scaled to Durham garden size)
  const baseCosts = {
    seeds: 80 * sizeMultiplier,
    soil: 45 * sizeMultiplier,
    fertilizer: 35 * sizeMultiplier,
    protection: 25 * sizeMultiplier,
    infrastructure: 15 * sizeMultiplier,
    tools: 10 * sizeMultiplier,
    containers: 12 * sizeMultiplier,
    irrigation: 8 * sizeMultiplier
  };

  // Climate adjustment factors
  const climateFactors = {
    extreme: { heat: 1.4, protection: 1.6, irrigation: 1.8 },
    catastrophic: { heat: 1.8, protection: 2.2, irrigation: 2.5 },
    normal: { heat: 1.0, protection: 1.0, irrigation: 1.0 },
    mild: { heat: 0.9, protection: 0.8, irrigation: 0.7 }
  };

  // Portfolio adjustment factors
  const portfolioFactors = {
    heatSpecialists: { protection: 1.3, irrigation: 1.4 },
    coolSeason: { protection: 0.9, soil: 1.1 },
    perennials: { infrastructure: 1.2, tools: 1.1 }
  };

  const summerFactor = climateFactors[selectedSummer] || climateFactors.normal;
  const winterFactor = climateFactors[selectedWinter] || climateFactors.normal;

  // Calculate adjusted costs
  const adjustedCosts = { ...baseCosts };
  
  // Apply climate adjustments
  adjustedCosts.protection *= Math.max(summerFactor.protection, winterFactor.protection || 1.0);
  adjustedCosts.irrigation *= summerFactor.irrigation || 1.0;
  adjustedCosts.fertilizer *= summerFactor.heat || 1.0;

  // Apply portfolio adjustments
  Object.entries(portfolio).forEach(([cropType, allocation]) => {
    if (allocation > 0 && portfolioFactors[cropType]) {
      Object.entries(portfolioFactors[cropType]).forEach(([category, factor]) => {
        if (adjustedCosts[category]) {
          adjustedCosts[category] *= 1 + ((factor - 1) * allocation / 100);
        }
      });
    }
  });

  const totalRequired = Object.values(adjustedCosts).reduce((sum, cost) => sum + cost, 0);

  return {
    breakdown: adjustedCosts,
    total: totalRequired,
    climateAdjustments: {
      summer: selectedSummer,
      winter: selectedWinter,
      summerFactor: summerFactor.protection,
      winterFactor: winterFactor.protection || 1.0
    }
  };
};

/**
 * Calculate investment sufficiency analysis
 * @param {number} actualInvestment - User's planned investment
 * @param {Object} requiredInvestment - Required investment breakdown
 * @returns {Object} Investment sufficiency analysis
 */
export const calculateInvestmentSufficiency = (actualInvestment, requiredInvestment) => {
  const ratio = actualInvestment / requiredInvestment.total;
  const gap = requiredInvestment.total - actualInvestment;
  
  let status, level, recommendations;
  
  if (ratio >= 1.2) {
    status = 'abundant';
    level = 'excellent';
    recommendations = [
      'Investment exceeds requirements - consider premium varieties',
      'Opportunity for infrastructure upgrades',
      'Buffer available for unexpected costs'
    ];
  } else if (ratio >= 1.0) {
    status = 'adequate';
    level = 'good';
    recommendations = [
      'Investment meets requirements',
      'Consider small buffer for contingencies',
      'Well-positioned for planned portfolio'
    ];
  } else if (ratio >= 0.8) {
    status = 'marginal';
    level = 'caution';
    recommendations = [
      `Consider increasing investment by $${Math.ceil(gap)}`,
      'Focus on essential categories (seeds, soil, protection)',
      'Risk of reduced yields or crop failures'
    ];
  } else {
    status = 'insufficient';
    level = 'warning';
    recommendations = [
      `Investment shortfall of $${Math.ceil(gap)} may cause significant issues`,
      'Prioritize seeds and soil amendments',
      'Consider reducing portfolio complexity',
      'Risk of poor garden performance'
    ];
  }

  return {
    ratio,
    gap: Math.max(0, gap),
    surplus: Math.max(0, -gap),
    status,
    level,
    recommendations,
    criticalCategories: identifyCriticalCategories(actualInvestment, requiredInvestment)
  };
};

/**
 * Identify categories that need attention based on investment levels
 * @param {number} actualInvestment - User's planned investment
 * @param {Object} requiredInvestment - Required investment breakdown
 * @returns {Array} Critical categories that need more investment
 */
export const identifyCriticalCategories = (actualInvestment, requiredInvestment) => {
  const critical = [];
  const ratio = actualInvestment / requiredInvestment.total;
  
  if (ratio < 1.0) {
    // Prioritize categories by importance for garden success
    const priorityOrder = [
      { category: 'seeds', importance: 'critical', description: 'Essential for any harvest' },
      { category: 'soil', importance: 'critical', description: 'Foundation of plant health' },
      { category: 'protection', importance: 'high', description: 'Weather and pest protection' },
      { category: 'fertilizer', importance: 'high', description: 'Sustained plant nutrition' },
      { category: 'irrigation', importance: 'medium', description: 'Water delivery systems' },
      { category: 'infrastructure', importance: 'medium', description: 'Support structures' },
      { category: 'containers', importance: 'low', description: 'Additional growing space' },
      { category: 'tools', importance: 'low', description: 'Garden maintenance equipment' }
    ];

    // Suggest cuts based on priority if investment is insufficient
    priorityOrder.forEach(item => {
      if (ratio < 0.6 && item.importance === 'low') {
        critical.push({
          ...item,
          action: 'consider reducing',
          required: requiredInvestment.breakdown[item.category]
        });
      } else if (ratio < 0.8 && (item.importance === 'critical' || item.importance === 'high')) {
        critical.push({
          ...item,
          action: 'prioritize funding',
          required: requiredInvestment.breakdown[item.category]
        });
      }
    });
  }

  return critical;
};

/**
 * Generate weather risk visualization data
 * @param {Array} results - Monte Carlo results
 * @returns {Object} Weather risk data
 */
export const generateWeatherRiskData = (results, weatherData = null) => {
  if (!results || results.length === 0) return {};
  
  const stressDays = results.map(r => r.weather?.stressDays || 0);
  const freezeEvents = results.map(r => r.weather?.freezeEvents || 0);
  const rainfall = results.map(r => r.weather?.rainfall || 0);
  
  const riskData = {
    stressDays: generateHistogramData(stressDays, 15),
    freezeEvents: generateHistogramData(freezeEvents, 15),
    rainfall: generateHistogramData(rainfall, 15)
  };

  // Add real weather context if available
  if (weatherData) {
    riskData.realWeatherContext = {
      currentTemp: weatherData.current?.temperature?.current,
      weeklyGDD: weatherData.forecast?.slice(0, 7).reduce((sum, day) => sum + (day.gdd || 0), 0),
      upcomingPrecipitation: weatherData.forecast?.slice(0, 7).reduce((sum, day) => sum + (day.precipitation || 0), 0),
      dataSource: 'real',
      timestamp: weatherData.timestamp
    };
  }
  
  return riskData;
};

/**
 * Generate a garden calendar from a single weather scenario
 * @param {Object} portfolio - Crop portfolio allocation
 * @param {Object} weatherScenario - Single weather iteration data
 * @param {Object} locationConfig - Location configuration
 * @returns {Object} Calendar with probabilistic dates
 */
export const generateCalendarFromScenario = (portfolio, weatherScenario, locationConfig) => {
  const calendar = {
    plantingEvents: [],
    harvestEvents: [],
    criticalEvents: [],
    weatherEvents: []
  };
  
  const currentYear = new Date().getFullYear();
  const baseFrostDate = new Date(currentYear, 3, 15); // April 15 baseline
  
  // Adjust frost dates based on weather scenario
  const lastFrostDate = adjustFrostDate(baseFrostDate, weatherScenario, locationConfig);
  // firstFallFrost and allCrops available but not used in current implementation
  
  Object.entries(portfolio).forEach(([cropType, allocation]) => {
    if (allocation > 0) {
      // Get crops for this type
      const cropTypeMap = {
        heatSpecialists: DURHAM_CROPS.heatLovers,
        coolSeason: DURHAM_CROPS.coolSeason,
        perennials: DURHAM_CROPS.perennials
      };
      
      const crops = cropTypeMap[cropType] || {};
      
      Object.entries(crops).forEach(([cropKey, crop]) => {
        const plantingWindow = calculatePlantingWindow(crop, lastFrostDate, weatherScenario);
        const harvestWindow = calculateHarvestWindow(crop, plantingWindow, weatherScenario);
        
        calendar.plantingEvents.push({
          crop: crop.name,
          cropKey,
          cropType,
          allocation,
          ...plantingWindow
        });
        
        calendar.harvestEvents.push({
          crop: crop.name,
          cropKey,
          cropType,
          ...harvestWindow
        });
      });
    }
  });
  
  // Add weather-driven critical events
  calendar.criticalEvents = generateCriticalEvents(weatherScenario, locationConfig);
  calendar.weatherEvents = extractWeatherEvents(weatherScenario);
  
  return calendar;
};

/**
 * Calculate optimal planting window for a crop based on weather scenario
 */
const calculatePlantingWindow = (crop, lastFrostDate, weatherScenario) => {
  const plantingTiming = crop.planting?.timing || '';
  
  // Parse planting timing and adjust based on weather
  let optimalDate = lastFrostDate;
  let riskWindow = { early: 7, late: 14 }; // days before/after optimal
  
  // Adjust based on crop type and weather stress
  if (plantingTiming.includes('March')) {
    optimalDate = new Date(lastFrostDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days earlier
  } else if (plantingTiming.includes('May')) {
    optimalDate = new Date(lastFrostDate.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days after
  }
  
  // Weather stress adjustments
  if (weatherScenario.stressDays > 20) {
    optimalDate = new Date(optimalDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Plant earlier for hot summers
  }
  
  if (weatherScenario.freezeEvents > 3) {
    optimalDate = new Date(optimalDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Plant later for harsh winters
  }
  
  return {
    optimalDate,
    earlyDate: new Date(optimalDate.getTime() - riskWindow.early * 24 * 60 * 60 * 1000),
    lateDate: new Date(optimalDate.getTime() + riskWindow.late * 24 * 60 * 60 * 1000),
    confidence: calculatePlantingConfidence(crop, weatherScenario)
  };
};

/**
 * Calculate harvest window based on planting date and weather
 */
const calculateHarvestWindow = (crop, plantingWindow, weatherScenario) => {
  const harvestTiming = crop.harvest?.firstHarvest || '60 days';
  const daysToHarvest = parseInt(harvestTiming.match(/\d+/)?.[0]) || 60;
  
  // Adjust maturity time based on weather
  let adjustedDays = daysToHarvest;
  
  // Heat speeds up some crops, slows others
  if (weatherScenario.stressDays > 15) {
    adjustedDays = crop.name.includes('Lettuce') ? daysToHarvest - 5 : daysToHarvest + 3;
  }
  
  // Cool weather generally slows growth
  if (weatherScenario.freezeEvents > 2) {
    adjustedDays += 7;
  }
  
  const harvestDate = new Date(plantingWindow.optimalDate.getTime() + adjustedDays * 24 * 60 * 60 * 1000);
  
  return {
    firstHarvest: harvestDate,
    peakHarvest: new Date(harvestDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    lastHarvest: new Date(harvestDate.getTime() + 30 * 24 * 60 * 60 * 1000),
    confidence: calculateHarvestConfidence(crop, weatherScenario)
  };
};

/**
 * Helper functions for date and confidence calculations
 */
const adjustFrostDate = (baseDate, weatherScenario, locationConfig) => {
  // Adjust frost date based on weather scenario
  let adjustment = 0;
  
  if (weatherScenario.freezeEvents > 5) adjustment += 7; // Later last frost
  if (weatherScenario.freezeEvents < 2) adjustment -= 7; // Earlier last frost
  
  return new Date(baseDate.getTime() + adjustment * 24 * 60 * 60 * 1000);
};

const calculatePlantingConfidence = (crop, weatherScenario) => {
  let confidence = 0.8; // Base confidence
  
  // Reduce confidence for extreme weather
  if (weatherScenario.stressDays > 25) confidence -= 0.2;
  if (weatherScenario.freezeEvents > 5) confidence -= 0.1;
  if (weatherScenario.annualRainfall < 20 || weatherScenario.annualRainfall > 60) confidence -= 0.1;
  
  return Math.max(0.3, Math.min(0.95, confidence));
};

const calculateHarvestConfidence = (crop, weatherScenario) => {
  let confidence = 0.75; // Base confidence
  
  // Weather stress reduces harvest predictability
  if (weatherScenario.stressDays > 20) confidence -= 0.15;
  if (weatherScenario.freezeEvents > 4) confidence -= 0.1;
  
  return Math.max(0.4, Math.min(0.9, confidence));
};

const generateCriticalEvents = (weatherScenario, locationConfig) => {
  const events = [];
  
  // Generate irrigation decisions based on stress days
  if (weatherScenario.stressDays > 15) {
    events.push({
      type: 'irrigation',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // ~45 days from now
      description: 'High stress weather predicted - assess irrigation needs',
      priority: 'high',
      confidence: 0.7
    });
  }
  
  // Generate protection events for extreme weather
  if (weatherScenario.stressDays > 30) {
    events.push({
      type: 'protection',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // ~60 days from now
      description: 'Extreme heat likely - install shade protection',
      priority: 'critical',
      confidence: 0.8
    });
  }
  
  return events;
};

const extractWeatherEvents = (weatherScenario) => {
  return [
    {
      type: 'heat_stress',
      count: weatherScenario.stressDays,
      severity: weatherScenario.stressDays > 25 ? 'high' : 'moderate'
    },
    {
      type: 'freeze_events', 
      count: weatherScenario.freezeEvents,
      severity: weatherScenario.freezeEvents > 5 ? 'severe' : 'normal'
    },
    {
      type: 'precipitation',
      annual: weatherScenario.annualRainfall,
      adequacy: weatherScenario.annualRainfall < 30 ? 'drought' : weatherScenario.annualRainfall > 50 ? 'excess' : 'adequate'
    }
  ];
};

/**
 * Generate probabilistic calendar from thousands of Monte Carlo scenario calendars
 * @param {Array} monteCarloResults - Array of simulation results with calendar data
 * @returns {Object} Consensus calendar with confidence intervals
 */
export const generateProbabilisticCalendar = (monteCarloResults) => {
  if (!monteCarloResults || monteCarloResults.length === 0) {
    return { plantingRecommendations: [], harvestPredictions: [], criticalEvents: [] };
  }

  // Extract all calendar scenarios from Monte Carlo iterations
  const calendarScenarios = monteCarloResults
    .map(result => result.calendar)
    .filter(calendar => calendar && calendar.plantingEvents);

  if (calendarScenarios.length === 0) {
    return { plantingRecommendations: [], harvestPredictions: [], criticalEvents: [] };
  }

  // Group planting events by crop for consensus calculation
  const plantingEventsByCrop = {};
  const harvestEventsByCrop = {};
  const criticalEventsByType = {};

  calendarScenarios.forEach(calendar => {
    // Process planting events
    calendar.plantingEvents.forEach(event => {
      const key = `${event.cropKey}_${event.cropType}`;
      if (!plantingEventsByCrop[key]) {
        plantingEventsByCrop[key] = [];
      }
      plantingEventsByCrop[key].push(event);
    });

    // Process harvest events
    calendar.harvestEvents.forEach(event => {
      const key = `${event.cropKey}_${event.cropType}`;
      if (!harvestEventsByCrop[key]) {
        harvestEventsByCrop[key] = [];
      }
      harvestEventsByCrop[key].push(event);
    });

    // Process critical events
    calendar.criticalEvents.forEach(event => {
      if (!criticalEventsByType[event.type]) {
        criticalEventsByType[event.type] = [];
      }
      criticalEventsByType[event.type].push(event);
    });
  });

  // Generate consensus planting recommendations
  const plantingRecommendations = Object.entries(plantingEventsByCrop).map(([cropKey, events]) => {
    const optimalDates = events.map(e => e.optimalDate?.getTime()).filter(Boolean);
    const earlyDates = events.map(e => e.earlyDate?.getTime()).filter(Boolean);
    const lateDates = events.map(e => e.lateDate?.getTime()).filter(Boolean);
    const confidences = events.map(e => e.confidence).filter(Boolean);

    if (optimalDates.length === 0) return null;

    // Calculate consensus dates using median
    const consensusOptimal = new Date(ss.median(optimalDates));
    const consensusEarly = earlyDates.length > 0 ? new Date(ss.median(earlyDates)) : 
      new Date(consensusOptimal.getTime() - 7 * 24 * 60 * 60 * 1000);
    const consensusLate = lateDates.length > 0 ? new Date(ss.median(lateDates)) : 
      new Date(consensusOptimal.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Calculate confidence as average of all scenarios
    const avgConfidence = confidences.length > 0 ? ss.mean(confidences) : 0.5;

    // Calculate confidence interval (percentage of scenarios within date range)
    const dateRange = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    const withinRange = optimalDates.filter(date => 
      Math.abs(date - consensusOptimal.getTime()) <= dateRange
    ).length;
    const consensusStrength = withinRange / optimalDates.length;

    return {
      crop: events[0].crop,
      cropKey: events[0].cropKey,
      cropType: events[0].cropType,
      optimalDate: consensusOptimal,
      earlyDate: consensusEarly,
      lateDate: consensusLate,
      confidence: avgConfidence,
      consensusStrength,
      scenarioCount: events.length,
      recommendation: formatPlantingRecommendation(consensusOptimal, avgConfidence, consensusStrength)
    };
  }).filter(Boolean);

  // Generate consensus harvest predictions
  const harvestPredictions = Object.entries(harvestEventsByCrop).map(([cropKey, events]) => {
    const firstHarvestDates = events.map(e => e.firstHarvest?.getTime()).filter(Boolean);
    const peakHarvestDates = events.map(e => e.peakHarvest?.getTime()).filter(Boolean);
    const lastHarvestDates = events.map(e => e.lastHarvest?.getTime()).filter(Boolean);
    const confidences = events.map(e => e.confidence).filter(Boolean);

    if (firstHarvestDates.length === 0) return null;

    const consensusFirst = new Date(ss.median(firstHarvestDates));
    const consensusPeak = peakHarvestDates.length > 0 ? new Date(ss.median(peakHarvestDates)) :
      new Date(consensusFirst.getTime() + 14 * 24 * 60 * 60 * 1000);
    const consensusLast = lastHarvestDates.length > 0 ? new Date(ss.median(lastHarvestDates)) :
      new Date(consensusFirst.getTime() + 30 * 24 * 60 * 60 * 1000);

    const avgConfidence = confidences.length > 0 ? ss.mean(confidences) : 0.5;

    return {
      crop: events[0].crop,
      cropKey: events[0].cropKey,
      cropType: events[0].cropType,
      firstHarvest: consensusFirst,
      peakHarvest: consensusPeak,
      lastHarvest: consensusLast,
      confidence: avgConfidence,
      scenarioCount: events.length,
      prediction: formatHarvestPrediction(consensusFirst, consensusPeak, avgConfidence)
    };
  }).filter(Boolean);

  // Generate consensus critical events
  const criticalEvents = Object.entries(criticalEventsByType).map(([eventType, events]) => {
    const dates = events.map(e => e.date?.getTime()).filter(Boolean);
    const priorities = events.map(e => e.priority);
    const confidences = events.map(e => e.confidence).filter(Boolean);

    if (dates.length === 0) return null;

    const consensusDate = new Date(ss.median(dates));
    const avgConfidence = confidences.length > 0 ? ss.mean(confidences) : 0.5;
    const eventFrequency = events.length / calendarScenarios.length;

    // Only include events that occur in more than 20% of scenarios
    if (eventFrequency < 0.2) return null;

    return {
      type: eventType,
      date: consensusDate,
      description: events[0].description,
      priority: priorities[0] || 'medium',
      confidence: avgConfidence,
      frequency: eventFrequency,
      scenarioCount: events.length,
      recommendation: formatCriticalEventRecommendation(eventType, consensusDate, eventFrequency)
    };
  }).filter(Boolean);

  return {
    plantingRecommendations: plantingRecommendations.sort((a, b) => a.optimalDate - b.optimalDate),
    harvestPredictions: harvestPredictions.sort((a, b) => a.firstHarvest - b.firstHarvest),
    criticalEvents: criticalEvents.sort((a, b) => a.date - b.date),
    totalScenarios: calendarScenarios.length,
    generatedAt: new Date()
  };
};

/**
 * Helper functions for formatting calendar recommendations
 */
const formatPlantingRecommendation = (date, confidence, consensusStrength) => {
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const confidenceLevel = confidence > 0.8 ? 'High' : confidence > 0.6 ? 'Medium' : 'Low';
  const consensus = consensusStrength > 0.7 ? 'Strong' : consensusStrength > 0.5 ? 'Moderate' : 'Weak';
  
  return `Plant around ${dateStr} (${confidenceLevel} confidence, ${consensus} consensus)`;
};

const formatHarvestPrediction = (firstHarvest, peakHarvest, confidence) => {
  const firstStr = firstHarvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const peakStr = peakHarvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const confidenceLevel = confidence > 0.8 ? 'Highly likely' : confidence > 0.6 ? 'Likely' : 'Possible';
  
  return `${confidenceLevel} first harvest ${firstStr}, peak around ${peakStr}`;
};

const formatCriticalEventRecommendation = (eventType, date, frequency) => {
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const likelihood = frequency > 0.7 ? 'Very likely' : frequency > 0.5 ? 'Likely' : frequency > 0.3 ? 'Possible' : 'Occasional';
  
  return `${likelihood} around ${dateStr} (${Math.round(frequency * 100)}% of scenarios)`;
};