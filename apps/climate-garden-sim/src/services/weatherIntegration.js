/**
 * Weather Integration for Simulation Engine
 * Converts real weather data into simulation parameters
 */

// import { WEATHER_CONFIG } from '../config/weatherConfig.js'; // Currently unused

/**
 * Generate weather samples from real weather data
 * Bridges real weather data with Monte Carlo simulation
 */
export const generateWeatherSamplesFromRealData = (iterations, weatherData, locationConfig) => {
  const { current, forecast, gddData } = weatherData;
  
  // Extract real weather metrics
  const realMetrics = extractWeatherMetrics(current, forecast, gddData);
  
  // Generate samples that reflect real conditions
  return Array.from({ length: iterations }, (_, i) => {
    return {
      stressDays: generateStressDaysFromReal(realMetrics, locationConfig),
      freezeEvents: generateFreezeEventsFromReal(realMetrics, locationConfig),
      rainfall: generateRainfallFromReal(realMetrics, locationConfig),
      gdd: realMetrics.gdd + (Math.random() - 0.5) * realMetrics.gdd * 0.1, // 10% variance
      temperature: {
        current: realMetrics.currentTemp + (Math.random() - 0.5) * 5,
        min: realMetrics.minTemp + (Math.random() - 0.5) * 3,
        max: realMetrics.maxTemp + (Math.random() - 0.5) * 3
      },
      dataSource: 'real',
      timestamp: new Date()
    };
  });
};

/**
 * Extract key weather metrics from real weather data
 */
const extractWeatherMetrics = (current, forecast, gddData) => {
  const metrics = {
    currentTemp: current?.temperature?.current || 70,
    minTemp: Math.min(...(forecast.slice(0, 7).map(day => day.temperature.min) || [50])),
    maxTemp: Math.max(...(forecast.slice(0, 7).map(day => day.temperature.max) || [80])),
    gdd: gddData?.yearToDate || 500,
    weeklyGDD: forecast.slice(0, 7).reduce((sum, day) => sum + (day.gdd || 0), 0),
    precipitation: forecast.slice(0, 7).reduce((sum, day) => sum + (day.precipitation || 0), 0),
    heatStressDays: forecast.slice(0, 7).filter(day => day.temperature.max > 90).length,
    frostRisk: forecast.slice(0, 7).filter(day => day.temperature.min < 35).length > 0
  };
  
  return metrics;
};

/**
 * Generate stress days based on real weather conditions
 */
const generateStressDaysFromReal = (realMetrics, locationConfig) => {
  const baseStress = realMetrics.heatStressDays * 2; // Scale weekly to annual
  const heatIntensity = locationConfig?.heatIntensity || 3;
  
  // Add some randomness while anchoring to real conditions
  const variance = baseStress * 0.3;
  return Math.max(0, baseStress + (Math.random() - 0.5) * variance * (heatIntensity / 3));
};

/**
 * Generate freeze events based on real weather conditions
 */
const generateFreezeEventsFromReal = (realMetrics, locationConfig) => {
  const freezeRisk = realMetrics.frostRisk ? 5 : 1; // Base annual freeze events
  const winterSeverity = locationConfig?.winterSeverity || 3;
  
  const variance = freezeRisk * 0.4;
  return Math.max(0, freezeRisk + (Math.random() - 0.5) * variance * (winterSeverity / 3));
};

/**
 * Generate rainfall based on real weather conditions
 */
const generateRainfallFromReal = (realMetrics, locationConfig) => {
  const weeklyPrecip = realMetrics.precipitation;
  const annualEstimate = weeklyPrecip * 26; // Scale weekly to annual rough estimate
  const configRainfall = locationConfig?.avgRainfall || 40;
  
  // Blend real data with location averages
  const blendedEstimate = (annualEstimate * 0.3) + (configRainfall * 0.7);
  const variance = blendedEstimate * 0.2;
  
  return Math.max(5, blendedEstimate + (Math.random() - 0.5) * variance);
};

/**
 * Apply weather-based yield adjustments to simulation parameters
 */
export const applyWeatherAdjustments = (baseParams, weatherData, locationConfig) => {
  if (!weatherData) return baseParams;
  
  const realMetrics = extractWeatherMetrics(
    weatherData.current, 
    weatherData.forecast, 
    weatherData.gddData
  );
  
  // Calculate weather adjustment factors
  const adjustments = calculateWeatherAdjustments(realMetrics, locationConfig);
  
  // Apply adjustments to simulation parameters
  return {
    ...baseParams,
    harvest: {
      mean: baseParams.harvest.mean * adjustments.yieldMultiplier,
      std: baseParams.harvest.std * adjustments.varianceMultiplier
    },
    heatYield: {
      mean: baseParams.heatYield.mean * adjustments.heatCropMultiplier,
      std: baseParams.heatYield.std * adjustments.varianceMultiplier
    },
    coolYield: {
      mean: baseParams.coolYield.mean * adjustments.coolCropMultiplier,
      std: baseParams.coolYield.std * adjustments.varianceMultiplier
    },
    weatherAdjustments: adjustments,
    weatherTimestamp: weatherData.timestamp
  };
};

/**
 * Calculate weather-based adjustment factors
 */
const calculateWeatherAdjustments = (realMetrics, locationConfig) => {
  let yieldMultiplier = 1.0;
  let heatCropMultiplier = 1.0;
  let coolCropMultiplier = 1.0;
  let varianceMultiplier = 1.0;
  
  // Temperature stress adjustments
  if (realMetrics.heatStressDays > 3) {
    heatCropMultiplier *= 0.85; // Heat crops suffer in extreme heat
    coolCropMultiplier *= 0.7;  // Cool crops suffer more
    varianceMultiplier *= 1.2;  // More variability under stress
  } else if (realMetrics.heatStressDays === 0) {
    coolCropMultiplier *= 1.1;  // Cool crops benefit from mild weather
  }
  
  // Frost risk adjustments
  if (realMetrics.frostRisk) {
    coolCropMultiplier *= 0.8;  // Cool crops can handle some frost
    heatCropMultiplier *= 0.3;  // Heat crops devastated by frost
    varianceMultiplier *= 1.5;  // High uncertainty with frost risk
  }
  
  // GDD progress adjustments
  const expectedGDD = (locationConfig?.heatDays || 100) * 3; // Rough annual estimate
  const gddRatio = realMetrics.gdd / expectedGDD;
  
  if (gddRatio > 1.2) {
    heatCropMultiplier *= 1.15; // Heat crops benefit from high GDD
  } else if (gddRatio < 0.8) {
    heatCropMultiplier *= 0.9;  // Heat crops struggle with low GDD
    coolCropMultiplier *= 1.05; // Cool crops do better
  }
  
  // Precipitation adjustments
  const optimalRainfall = locationConfig?.avgRainfall || 40;
  const precipitationRatio = realMetrics.precipitation / (optimalRainfall / 26); // Weekly comparison
  
  if (precipitationRatio > 1.5) {
    yieldMultiplier *= 0.9; // Too much rain reduces yields
    varianceMultiplier *= 1.3; // More disease/pest pressure
  } else if (precipitationRatio < 0.5) {
    yieldMultiplier *= 0.85; // Drought stress
    varianceMultiplier *= 1.4; // High uncertainty in drought
  }
  
  // Overall yield calculation
  yieldMultiplier *= (heatCropMultiplier + coolCropMultiplier) / 2;
  
  return {
    yieldMultiplier: Math.max(0.2, Math.min(1.8, yieldMultiplier)),
    heatCropMultiplier: Math.max(0.1, Math.min(2.0, heatCropMultiplier)),
    coolCropMultiplier: Math.max(0.1, Math.min(2.0, coolCropMultiplier)),
    varianceMultiplier: Math.max(0.5, Math.min(3.0, varianceMultiplier)),
    confidenceLevel: calculateConfidenceLevel(realMetrics),
    weatherScore: calculateWeatherScore(realMetrics)
  };
};

/**
 * Calculate confidence level in weather-based predictions
 */
const calculateConfidenceLevel = (realMetrics) => {
  let confidence = 0.8; // Base confidence
  
  // Reduce confidence for extreme conditions
  if (realMetrics.heatStressDays > 4) confidence *= 0.8;
  if (realMetrics.frostRisk) confidence *= 0.7;
  if (realMetrics.precipitation < 0.1 || realMetrics.precipitation > 3) confidence *= 0.9;
  
  return Math.max(0.3, Math.min(0.95, confidence));
};

/**
 * Calculate overall weather favorability score
 */
const calculateWeatherScore = (realMetrics) => {
  let score = 50; // Neutral baseline
  
  // Temperature scoring
  if (realMetrics.currentTemp >= 60 && realMetrics.currentTemp <= 80) {
    score += 15;
  } else if (realMetrics.currentTemp < 40 || realMetrics.currentTemp > 95) {
    score -= 15;
  }
  
  // Heat stress scoring
  score -= realMetrics.heatStressDays * 5;
  
  // Frost risk scoring
  if (realMetrics.frostRisk) score -= 20;
  
  // Precipitation scoring
  if (realMetrics.precipitation >= 0.5 && realMetrics.precipitation <= 2) {
    score += 10;
  } else if (realMetrics.precipitation < 0.1 || realMetrics.precipitation > 4) {
    score -= 15;
  }
  
  // GDD scoring (relative to reasonable expectations)
  if (realMetrics.weeklyGDD >= 50 && realMetrics.weeklyGDD <= 200) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Generate weather risk analysis for dashboard display
 */
export const generateWeatherRiskAnalysis = (weatherData, locationConfig) => {
  if (!weatherData) {
    return {
      riskLevel: 'unknown',
      factors: [],
      recommendations: ['Configure weather data integration for detailed risk analysis']
    };
  }
  
  const realMetrics = extractWeatherMetrics(
    weatherData.current, 
    weatherData.forecast, 
    weatherData.gddData
  );
  
  const risks = [];
  const recommendations = [];
  let riskLevel = 'low';
  
  // Analyze current conditions
  if (realMetrics.currentTemp < 35) {
    risks.push('Frost damage risk');
    recommendations.push('Protect sensitive plants overnight');
    riskLevel = 'high';
  } else if (realMetrics.currentTemp > 95) {
    risks.push('Heat stress risk');
    recommendations.push('Increase watering frequency');
    riskLevel = 'medium';
  }
  
  // Analyze forecast conditions
  if (realMetrics.heatStressDays > 3) {
    risks.push('Extended heat wave conditions');
    recommendations.push('Consider shade cloth for vulnerable crops');
    riskLevel = 'high';
  }
  
  if (realMetrics.frostRisk) {
    risks.push('Frost risk in coming week');
    recommendations.push('Delay planting of heat-sensitive crops');
    riskLevel = 'high';
  }
  
  if (realMetrics.precipitation < 0.1) {
    risks.push('Drought conditions');
    recommendations.push('Implement water conservation measures');
    if (riskLevel === 'low') riskLevel = 'medium';
  } else if (realMetrics.precipitation > 3) {
    risks.push('Excessive moisture conditions');
    recommendations.push('Monitor for fungal diseases');
    if (riskLevel === 'low') riskLevel = 'medium';
  }
  
  return {
    riskLevel,
    factors: risks,
    recommendations,
    weatherScore: calculateWeatherScore(realMetrics),
    confidenceLevel: calculateConfidenceLevel(realMetrics),
    timestamp: new Date()
  };
};

const weatherIntegration = {
  generateWeatherSamplesFromRealData,
  applyWeatherAdjustments,
  generateWeatherRiskAnalysis
};

export default weatherIntegration;