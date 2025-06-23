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
import { weatherDataService } from './weatherDataService.js';
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
    // Enhance simulation with weather data if available (temporarily disabled)
    let enhancedConfig = { ...config };
    if (weatherData) {
      enhancedConfig.weatherData = weatherData;
    } else {
      // Skip weather API calls for now to restore basic functionality
      console.log('Skipping weather data integration for performance');
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
    return Array.from({length: count}, () => jStat.normal.sample(mean, std));
  };

  const harvestValues = generateNormalSamples(simParams.harvest.mean, simParams.harvest.std, iterations);
  const investments = generateNormalSamples(simParams.investment.mean, simParams.investment.std, iterations);
  
  // Calculate derived metrics
  const netReturns = harvestValues.map((harvest, i) => harvest - investments[i]);
  const rois = netReturns.map((netReturn, i) => (netReturn / investments[i]) * 100);
  
  // Generate breakdown data (simplified for performance)
  const heatYields = generateNormalSamples(simParams.heatYield.mean, simParams.heatYield.std, iterations);
  const coolYields = generateNormalSamples(simParams.coolYield.mean, simParams.coolYield.std, iterations);
  const perennialYields = generateNormalSamples(simParams.perennialYield.mean, simParams.perennialYield.std, iterations);
  
  // Generate weather data for visualization
  // Use real weather data if available, otherwise use synthetic data
  const simulationWeatherData = weatherData 
    ? generateWeatherSamplesFromRealData(iterations, weatherData, locationConfig)
    : generateWeatherSamples(iterations, locationConfig, selectedSummer, selectedWinter);
  
  // Package results in expected format
  return harvestValues.map((harvestValue, i) => ({
    harvestValue,
    investment: investments[i],
    netReturn: netReturns[i],
    roi: rois[i],
    heatYield: heatYields[i],
    coolYield: coolYields[i],
    perennialYield: perennialYields[i],
    weather: simulationWeatherData[i]
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
  
  const baseParams = {
    harvest: { mean: expectedHarvest, std: harvestStd },
    investment: { mean: investmentMean, std: investmentStd },
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

  const netReturns = results.map(r => r.netReturn);
  const rois = results.map(r => r.roi);
  const harvestValues = results.map(r => r.harvestValue);
  
  return {
    mean: ss.mean(netReturns),
    median: ss.median(netReturns),
    std: ss.standardDeviation(netReturns),
    percentiles: {
      p10: ss.quantile(netReturns, 0.1),
      p25: ss.quantile(netReturns, 0.25),
      p75: ss.quantile(netReturns, 0.75),
      p90: ss.quantile(netReturns, 0.9)
    },
    roi: {
      mean: ss.mean(rois),
      median: ss.median(rois),
      std: ss.standardDeviation(rois)
    },
    harvestValue: {
      mean: ss.mean(harvestValues),
      median: ss.median(harvestValues),
      std: ss.standardDeviation(harvestValues)
    },
    successRate: (netReturns.filter(r => r > 0).length / netReturns.length) * 100
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