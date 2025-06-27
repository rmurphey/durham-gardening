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

    return {
      ...statistics,
      rawResults: monteCarloResults,
      weatherRiskData,
      returnHistogram,
      roiHistogram,
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
  
  // Package results in expected format with investment analysis
  return harvestValues.map((harvestValue, i) => ({
    harvestValue,
    investment: investments[i],
    netReturn: netReturns[i],
    roi: rois[i],
    heatYield: heatYields[i],
    coolYield: coolYields[i],
    perennialYield: perennialYields[i],
    weather: simulationWeatherData[i],
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
  return weatherData 
    ? applyWeatherAdjustments(baseParams, weatherData, locationConfig)
    : baseParams;
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