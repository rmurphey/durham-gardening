/**
 * Forecasting Engine for Durham Garden Planner
 * Provides comprehensive forecasting capabilities including weather, growth, risk, and economic predictions
 */

// import { databaseService } from './databaseService.js'; // Available for database-driven forecasting

/**
 * Core forecasting engine with multiple prediction models
 */
class ForecastingEngine {
  constructor() {
    this.modelVersions = {
      weather: '1.0.0',
      growth: '1.0.0',
      economic: '1.0.0',
      risk: '1.0.0'
    };
    
    // Default confidence levels
    this.defaultConfidence = {
      weather: 0.75,
      growth: 0.70,
      economic: 0.60,
      risk: 0.65
    };
  }

  /**
   * Generate comprehensive forecast for a garden
   * @param {Object} gardenConfig - Garden configuration
   * @param {number} forecastDays - Number of days to forecast
   * @returns {Promise<Object>} Complete forecast package
   */
  async generateComprehensiveForecast(gardenConfig, forecastDays = 90) {
    try {
      const regionId = gardenConfig.regionId || 1; // Default to Durham
      const currentDate = new Date();
      
      // Generate all forecast components in parallel
      const [
        weatherForecast,
        growthForecasts,
        riskAssessment,
        economicForecast,
        adaptiveRecommendations
      ] = await Promise.all([
        this.generateWeatherForecast(regionId, forecastDays),
        this.generateGrowthForecasts(gardenConfig, forecastDays),
        this.generateRiskAssessment(regionId, gardenConfig, forecastDays),
        this.generateEconomicForecast(regionId, forecastDays),
        this.generateAdaptiveRecommendations(gardenConfig, forecastDays)
      ]);

      return {
        metadata: {
          generatedAt: currentDate.toISOString(),
          forecastHorizon: forecastDays,
          regionId,
          modelVersions: this.modelVersions
        },
        weather: weatherForecast,
        growth: growthForecasts,
        risks: riskAssessment,
        economics: economicForecast,
        recommendations: adaptiveRecommendations,
        summary: this.generateForecastSummary({
          weather: weatherForecast,
          growth: growthForecasts,
          risks: riskAssessment,
          economics: economicForecast
        })
      };
    } catch (error) {
      console.error('Error generating comprehensive forecast:', error);
      throw new Error(`Forecasting failed: ${error.message}`);
    }
  }

  /**
   * Generate weather forecast with confidence intervals
   * @param {number} regionId - Region identifier
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Object>} Weather forecast data
   */
  async generateWeatherForecast(regionId, days) {
    // Simulate weather forecast generation
    // In production, this would integrate with weather APIs and historical data
    const forecast = {
      dailyForecasts: [],
      weeklyTrends: [],
      monthlyOutlook: {},
      extremeEvents: [],
      confidence: this.defaultConfidence.weather
    };

    const baseDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(baseDate);
      forecastDate.setDate(baseDate.getDate() + i);
      
      // Generate realistic Durham, NC weather patterns
      const monthIndex = forecastDate.getMonth();
      const dayOfYear = this.getDayOfYear(forecastDate);
      
      const dailyForecast = this.generateDailyWeatherForecast(dayOfYear, monthIndex, i);
      dailyForecast.date = forecastDate.toISOString().split('T')[0];
      dailyForecast.confidence = Math.max(0.4, this.defaultConfidence.weather - (i / days) * 0.3);
      
      forecast.dailyForecasts.push(dailyForecast);
    }

    // Generate weekly and monthly summaries
    forecast.weeklyTrends = this.aggregateWeatherTrends(forecast.dailyForecasts, 7);
    forecast.monthlyOutlook = this.generateMonthlyOutlook(forecast.dailyForecasts);
    forecast.extremeEvents = this.identifyExtremeWeatherEvents(forecast.dailyForecasts);

    return forecast;
  }

  /**
   * Generate growth forecasts for all plants in the garden
   * @param {Object} gardenConfig - Garden configuration
   * @param {number} days - Forecast horizon
   * @returns {Promise<Object>} Growth forecast data
   */
  async generateGrowthForecasts(gardenConfig, days) {
    const growthForecasts = {
      plantForecasts: [],
      harvestCalendar: [],
      yieldPredictions: {},
      optimizationSuggestions: []
    };

    // Get current plantings and planned plantings
    const currentPlantings = await this.getCurrentPlantings(gardenConfig);
    const plannedPlantings = await this.getPlannedPlantings(gardenConfig, days);
    
    const allPlantings = [...currentPlantings, ...plannedPlantings];

    for (const planting of allPlantings) {
      const plantForecast = await this.generatePlantGrowthForecast(planting, days);
      growthForecasts.plantForecasts.push(plantForecast);
      
      // Add to harvest calendar if harvest is predicted within forecast period
      if (plantForecast.harvestWindow.start && 
          new Date(plantForecast.harvestWindow.start) <= new Date(Date.now() + days * 24 * 60 * 60 * 1000)) {
        growthForecasts.harvestCalendar.push({
          plantKey: planting.plantKey,
          plantName: planting.plantName,
          bedName: planting.bedName,
          harvestStart: plantForecast.harvestWindow.start,
          harvestEnd: plantForecast.harvestWindow.end,
          expectedYield: plantForecast.expectedYield,
          confidence: plantForecast.confidence
        });
      }
    }

    // Sort harvest calendar by date
    growthForecasts.harvestCalendar.sort((a, b) => 
      new Date(a.harvestStart) - new Date(b.harvestStart)
    );

    return growthForecasts;
  }

  /**
   * Generate risk assessment for the forecast period
   * @param {number} regionId - Region identifier
   * @param {Object} gardenConfig - Garden configuration
   * @param {number} days - Forecast horizon
   * @returns {Promise<Object>} Risk assessment data
   */
  async generateRiskAssessment(regionId, gardenConfig, days) {
    const riskAssessment = {
      overallRiskLevel: 'moderate',
      riskFactors: [],
      mitigationStrategies: [],
      alertThresholds: {},
      confidenceLevel: this.defaultConfidence.risk
    };

    // Weather-related risks
    const weatherRisks = await this.assessWeatherRisks(regionId, days);
    riskAssessment.riskFactors.push(...weatherRisks);

    // Plant-specific risks
    const plantRisks = await this.assessPlantSpecificRisks(gardenConfig, days);
    riskAssessment.riskFactors.push(...plantRisks);

    // Economic risks
    const economicRisks = await this.assessEconomicRisks(regionId, days);
    riskAssessment.riskFactors.push(...economicRisks);

    // Calculate overall risk level
    riskAssessment.overallRiskLevel = this.calculateOverallRiskLevel(riskAssessment.riskFactors);

    // Generate mitigation strategies
    riskAssessment.mitigationStrategies = this.generateMitigationStrategies(riskAssessment.riskFactors);

    return riskAssessment;
  }

  /**
   * Generate economic forecast
   * @param {number} regionId - Region identifier
   * @param {number} days - Forecast horizon
   * @returns {Promise<Object>} Economic forecast data
   */
  async generateEconomicForecast(regionId, days) {
    const economicForecast = {
      costTrends: {},
      marketValues: {},
      roiProjections: {},
      seasonalFactors: {},
      confidence: this.defaultConfidence.economic
    };

    // Simulate cost trends (in production, integrate with market data APIs)
    economicForecast.costTrends = {
      seeds: this.generateCostTrend(1.0, 0.02, days), // 2% annual inflation
      amendments: this.generateCostTrend(1.0, 0.03, days), // 3% annual inflation
      tools: this.generateCostTrend(1.0, 0.01, days), // 1% annual inflation
      utilities: this.generateCostTrend(1.0, 0.04, days) // 4% annual inflation
    };

    // Market value projections for common crops
    economicForecast.marketValues = {
      leafyGreens: this.generateMarketValueTrend(8.50, 0.15, days), // $8.50/lb base
      herbs: this.generateMarketValueTrend(24.00, 0.25, days), // $24/oz base
      tomatoes: this.generateMarketValueTrend(4.20, 0.20, days), // $4.20/lb base
      peppers: this.generateMarketValueTrend(5.80, 0.18, days), // $5.80/lb base
      rootVegetables: this.generateMarketValueTrend(3.90, 0.12, days) // $3.90/lb base
    };

    return economicForecast;
  }

  /**
   * Generate adaptive recommendations based on forecasts
   * @param {Object} gardenConfig - Garden configuration
   * @param {number} days - Forecast horizon
   * @returns {Promise<Array>} Array of adaptive recommendations
   */
  async generateAdaptiveRecommendations(gardenConfig, days) {
    const recommendations = [];
    // const currentDate = new Date(); // Available for date-based recommendation filtering

    // Weather-based recommendations
    const weatherRecommendations = await this.generateWeatherBasedRecommendations(gardenConfig, days);
    recommendations.push(...weatherRecommendations);

    // Growth stage recommendations
    const growthRecommendations = await this.generateGrowthBasedRecommendations(gardenConfig, days);
    recommendations.push(...growthRecommendations);

    // Risk mitigation recommendations
    const riskRecommendations = await this.generateRiskMitigationRecommendations(gardenConfig, days);
    recommendations.push(...riskRecommendations);

    // Sort by priority and timing
    recommendations.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(a.timingWindow.start) - new Date(b.timingWindow.start);
    });

    return recommendations;
  }

  // Helper methods for forecast generation

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  generateDailyWeatherForecast(dayOfYear, monthIndex, daysAhead) {
    // Durham, NC climate patterns
    const durhamClimatology = {
      // Average temperatures by month (high, low)
      temps: [
        [51, 31], [55, 34], [63, 41], [72, 49], [80, 58], [87, 66],
        [90, 70], [88, 69], [82, 62], [73, 50], [64, 40], [54, 32]
      ],
      // Precipitation patterns (inches per month)
      precipitation: [3.5, 3.2, 3.8, 3.1, 3.9, 4.2, 4.6, 4.2, 3.4, 3.1, 2.9, 3.2]
    };

    const monthData = durhamClimatology.temps[monthIndex];
    const baseHigh = monthData[0];
    const baseLow = monthData[1];
    
    // Add realistic daily variation and forecast uncertainty
    const tempVariation = Math.random() * 10 - 5; // ±5°F daily variation
    const forecastUncertainty = Math.sqrt(daysAhead) * 2; // Increasing uncertainty
    
    return {
      tempHigh: Math.round(baseHigh + tempVariation + (Math.random() - 0.5) * forecastUncertainty),
      tempLow: Math.round(baseLow + tempVariation + (Math.random() - 0.5) * forecastUncertainty),
      tempAvg: Math.round((baseHigh + baseLow) / 2 + tempVariation),
      soilTemp: Math.round((baseHigh + baseLow) / 2 + tempVariation - 3), // Soil lags air temp
      
      precipitation: Math.max(0, (Math.random() * 0.5) - 0.1), // 0-0.4 inches daily
      precipitationProbability: Math.round(Math.random() * 100),
      humidity: Math.round(60 + Math.random() * 30), // 60-90%
      
      frostProbability: monthIndex < 3 || monthIndex > 10 ? Math.round(Math.random() * 30) : 0,
      heatStressProbability: monthIndex >= 5 && monthIndex <= 8 ? Math.round(Math.random() * 40) : 0,
      droughtRiskLevel: Math.ceil(Math.random() * 3), // 1-3 for daily
      
      tempUncertainty: forecastUncertainty,
      precipUncertainty: Math.sqrt(daysAhead) * 0.1
    };
  }

  aggregateWeatherTrends(dailyForecasts, windowDays) {
    const trends = [];
    
    for (let i = 0; i < dailyForecasts.length; i += windowDays) {
      const weekData = dailyForecasts.slice(i, i + windowDays);
      if (weekData.length === 0) continue;
      
      const trend = {
        startDate: weekData[0].date,
        endDate: weekData[weekData.length - 1].date,
        avgTempHigh: Math.round(weekData.reduce((sum, d) => sum + d.tempHigh, 0) / weekData.length),
        avgTempLow: Math.round(weekData.reduce((sum, d) => sum + d.tempLow, 0) / weekData.length),
        totalPrecipitation: Math.round(weekData.reduce((sum, d) => sum + d.precipitation, 0) * 100) / 100,
        avgHumidity: Math.round(weekData.reduce((sum, d) => sum + d.humidity, 0) / weekData.length),
        maxFrostRisk: Math.max(...weekData.map(d => d.frostProbability)),
        maxHeatRisk: Math.max(...weekData.map(d => d.heatStressProbability))
      };
      
      trends.push(trend);
    }
    
    return trends;
  }

  generateMonthlyOutlook(dailyForecasts) {
    // Group by month and provide outlook
    const monthlyData = {};
    
    dailyForecasts.forEach(forecast => {
      const month = forecast.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = {
          temperatures: [],
          precipitation: 0,
          extremeRisks: []
        };
      }
      
      monthlyData[month].temperatures.push(forecast.tempAvg);
      monthlyData[month].precipitation += forecast.precipitation;
      
      if (forecast.frostProbability > 50) monthlyData[month].extremeRisks.push('frost');
      if (forecast.heatStressProbability > 70) monthlyData[month].extremeRisks.push('heat');
    });

    // Convert to outlook format
    const outlook = {};
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      outlook[month] = {
        avgTemperature: Math.round(data.temperatures.reduce((a, b) => a + b, 0) / data.temperatures.length),
        totalPrecipitation: Math.round(data.precipitation * 100) / 100,
        temperatureTrend: this.calculateTrend(data.temperatures),
        primaryRisks: [...new Set(data.extremeRisks)]
      };
    });

    return outlook;
  }

  identifyExtremeWeatherEvents(dailyForecasts) {
    const events = [];
    
    dailyForecasts.forEach((forecast, index) => {
      // Frost events
      if (forecast.frostProbability > 70) {
        events.push({
          type: 'frost',
          date: forecast.date,
          probability: forecast.frostProbability,
          severity: forecast.tempLow < 28 ? 'severe' : 'moderate',
          impact: 'High risk to tender plants'
        });
      }
      
      // Heat wave events
      if (forecast.tempHigh > 95) {
        events.push({
          type: 'extreme_heat',
          date: forecast.date,
          temperature: forecast.tempHigh,
          severity: forecast.tempHigh > 100 ? 'severe' : 'moderate',
          impact: 'Heat stress risk for all plants'
        });
      }
      
      // Heavy precipitation
      if (forecast.precipitation > 1.0) {
        events.push({
          type: 'heavy_rain',
          date: forecast.date,
          amount: forecast.precipitation,
          severity: forecast.precipitation > 2.0 ? 'severe' : 'moderate',
          impact: 'Potential flooding and soil saturation'
        });
      }
    });
    
    return events;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 2) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  async getCurrentPlantings(gardenConfig) {
    // Mock current plantings - in production, query from database
    return [
      {
        plantKey: 'kale',
        plantName: 'Red Russian Kale',
        bedName: '3×15 Bed',
        plantedDate: '2025-02-15',
        expectedHarvest: '2025-04-15'
      },
      {
        plantKey: 'hot_peppers',
        plantName: 'Jalapeño Peppers',
        bedName: '4×8 Bed',
        plantedDate: '2025-03-01',
        expectedHarvest: '2025-07-01'
      }
    ];
  }

  async getPlannedPlantings(gardenConfig, days) {
    // Mock planned plantings - in production, get from calendar/database
    return [
      {
        plantKey: 'tomatoes',
        plantName: 'Cherokee Purple Tomatoes',
        bedName: '4×8 Bed',
        plannedDate: '2025-04-15',
        expectedHarvest: '2025-07-15'
      }
    ];
  }

  async generatePlantGrowthForecast(planting, days) {
    // Mock plant growth forecast - in production, use growth models
    // const plantedDate = new Date(planting.plantedDate || planting.plannedDate); // Available for growth stage calculation
    const harvestDate = new Date(planting.expectedHarvest);
    
    return {
      plantKey: planting.plantKey,
      plantName: planting.plantName,
      bedName: planting.bedName,
      currentStage: 'vegetative',
      harvestWindow: {
        start: harvestDate.toISOString().split('T')[0],
        end: new Date(harvestDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      expectedYield: 2.5, // lbs
      qualityPrediction: 4, // 1-5 scale
      successProbability: 0.85,
      confidence: 0.75,
      riskFactors: ['heat_stress', 'late_blight']
    };
  }

  generateCostTrend(baseValue, annualInflation, days) {
    const trend = [];
    const dailyInflation = annualInflation / 365;
    
    for (let i = 0; i < days; i += 7) { // Weekly data points
      const weekValue = baseValue * Math.pow(1 + dailyInflation, i);
      trend.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.round(weekValue * 100) / 100,
        trend: i > 0 ? 'increasing' : 'stable'
      });
    }
    
    return trend;
  }

  generateMarketValueTrend(basePrice, volatility, days) {
    const trend = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < days; i += 7) { // Weekly data points
      // Add seasonal and random variation
      const seasonalFactor = 1 + 0.2 * Math.sin((i / 365) * 2 * Math.PI); // 20% seasonal variation
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      
      currentPrice = basePrice * seasonalFactor * randomFactor;
      
      trend.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.round(currentPrice * 100) / 100,
        seasonalFactor: Math.round(seasonalFactor * 100) / 100,
        volatility: Math.round(Math.abs(randomFactor - 1) * 100) / 100
      });
    }
    
    return trend;
  }

  async assessWeatherRisks(regionId, days) {
    // Mock weather risk assessment
    return [
      {
        riskType: 'weather',
        riskName: 'Late Spring Frost',
        probability: 0.3,
        severity: 4,
        timeframe: 'next_30_days',
        impact: 'Damage to tender seedlings and early plantings',
        mitigation: ['Row covers', 'Delay planting', 'Cold-hardy varieties']
      },
      {
        riskType: 'weather',
        riskName: 'Summer Heat Wave',
        probability: 0.6,
        severity: 3,
        timeframe: 'next_90_days',
        impact: 'Heat stress, reduced yields, increased water needs',
        mitigation: ['Shade cloth', 'Increased watering', 'Heat-tolerant varieties']
      }
    ];
  }

  async assessPlantSpecificRisks(gardenConfig, days) {
    // Mock plant-specific risk assessment
    return [
      {
        riskType: 'disease',
        riskName: 'Tomato Late Blight',
        probability: 0.4,
        severity: 5,
        timeframe: 'next_60_days',
        impact: 'Potential total crop loss for tomatoes',
        mitigation: ['Resistant varieties', 'Fungicide application', 'Improved air circulation']
      }
    ];
  }

  async assessEconomicRisks(regionId, days) {
    // Mock economic risk assessment
    return [
      {
        riskType: 'economic',
        riskName: 'Supply Chain Disruption',
        probability: 0.2,
        severity: 3,
        timeframe: 'next_90_days',
        impact: 'Increased seed and amendment costs',
        mitigation: ['Stock up on essentials', 'Local suppliers', 'Seed saving']
      }
    ];
  }

  calculateOverallRiskLevel(riskFactors) {
    if (riskFactors.length === 0) return 'low';
    
    const weightedRisk = riskFactors.reduce((total, risk) => 
      total + (risk.probability * risk.severity), 0) / riskFactors.length;
    
    if (weightedRisk < 1.5) return 'low';
    if (weightedRisk < 2.5) return 'moderate';
    if (weightedRisk < 3.5) return 'high';
    return 'critical';
  }

  generateMitigationStrategies(riskFactors) {
    const strategies = [];
    
    riskFactors.forEach(risk => {
      if (risk.mitigation) {
        strategies.push({
          forRisk: risk.riskName,
          strategies: risk.mitigation,
          priority: risk.severity * risk.probability,
          timeframe: risk.timeframe
        });
      }
    });
    
    return strategies.sort((a, b) => b.priority - a.priority);
  }

  async generateWeatherBasedRecommendations(gardenConfig, days) {
    // Mock weather-based recommendations
    return [
      {
        type: 'weather_protection',
        priority: 4,
        action: 'Install row covers on tender seedlings',
        reason: 'Frost probability >70% in next 3 days',
        timingWindow: {
          start: new Date().toISOString().split('T')[0],
          end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        expectedBenefit: 'Protect $50+ worth of seedlings from frost damage'
      }
    ];
  }

  async generateGrowthBasedRecommendations(gardenConfig, days) {
    // Mock growth-based recommendations
    return [
      {
        type: 'harvesting',
        priority: 5,
        action: 'Harvest kale leaves before they become bitter',
        reason: 'Plants entering flower stage in 5-7 days',
        timingWindow: {
          start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        expectedBenefit: 'Maximize harvest quality and yield'
      }
    ];
  }

  async generateRiskMitigationRecommendations(gardenConfig, days) {
    // Mock risk mitigation recommendations
    return [
      {
        type: 'disease_prevention',
        priority: 3,
        action: 'Apply preventive fungicide to tomato plants',
        reason: 'High humidity and temperature conditions favor late blight',
        timingWindow: {
          start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        expectedBenefit: 'Reduce disease risk from 40% to 10%'
      }
    ];
  }

  generateForecastSummary(forecasts) {
    return {
      overallOutlook: 'favorable',
      keyOpportunities: [
        'Extended warm period ideal for heat-loving crops',
        'Good soil moisture levels reduce watering needs'
      ],
      majorConcerns: [
        'Late frost risk for tender plantings',
        'Potential disease pressure in humid conditions'
      ],
      recommendedActions: [
        'Delay tender plant installation by 1-2 weeks',
        'Increase air circulation around susceptible plants',
        'Consider succession planting for continuous harvest'
      ],
      confidenceLevel: 0.72
    };
  }
}

// Export singleton instance
export const forecastingEngine = new ForecastingEngine();
export default forecastingEngine;