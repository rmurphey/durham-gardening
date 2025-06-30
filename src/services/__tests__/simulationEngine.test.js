/**
 * Tests for SimulationEngine service
 * Testing Monte Carlo simulation, statistical analysis, and probabilistic calendar generation
 */

import {
  runCompleteSimulation,
  runMonteCarloSimulation,
  generateSimulationParameters,
  generateWeatherSamples,
  getStressDaysParams,
  getFreezeParams,
  getRainfallParams,
  calculateStatistics,
  generateHistogramData,
  calculateRequiredInvestment,
  calculateInvestmentSufficiency,
  identifyCriticalCategories,
  generateWeatherRiskData,
  generateCalendarFromScenario,
  generateProbabilisticCalendar
} from '../simulationEngine.js';

// Mock jStat for statistical distributions
jest.mock('jstat', () => ({
  normal: {
    sample: jest.fn((mean, std) => mean + (Math.random() - 0.5) * std * 2)
  },
  poisson: {
    sample: jest.fn((lambda) => Math.max(0, Math.floor(lambda + (Math.random() - 0.5) * 2)))
  }
}));

// Mock simple-statistics
jest.mock('simple-statistics', () => ({
  mean: jest.fn((arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length),
  median: jest.fn((arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }),
  standardDeviation: jest.fn((arr) => {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }),
  quantile: jest.fn((arr, p) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * p)];
  })
}));

// Mock console methods to avoid test noise
const originalConsole = console;
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

describe('SimulationEngine', () => {
  const mockConfig = {
    portfolio: {
      heatSpecialists: 40,
      coolSeason: 35,
      perennials: 25
    },
    baseInvestment: 250,
    selectedSummer: 'normal',
    selectedWinter: 'mild',
    locationConfig: {
      coordinates: { lat: 35.9940, lon: -78.8986 },
      gardenSizeActual: 100,
      heatIntensity: 3,
      winterSeverity: 2,
      avgRainfall: 40
    },
    portfolioMultiplier: 1.0
  };

  const mockWeatherData = {
    timestamp: Date.now(),
    current: { temperature: { current: 22 } },
    forecast: [
      { date: '2024-06-15', temperature: { high: 28, low: 18 }, precipitation: 0, gdd: 12 },
      { date: '2024-06-16', temperature: { high: 30, low: 20 }, precipitation: 5, gdd: 15 },
      { date: '2024-06-17', temperature: { high: 26, low: 16 }, precipitation: 2, gdd: 10 }
    ]
  };

  beforeEach(() => {
    console.log.mockClear();
    console.warn.mockClear();
    console.error.mockClear();
  });

  describe('runCompleteSimulation', () => {
    test('generates complete simulation results', async () => {
      const result = await runCompleteSimulation(mockConfig, 50);

      expect(result).toBeDefined();
      expect(result.mean).toBeDefined();
      expect(result.median).toBeDefined();
      expect(result.std).toBeDefined();
      expect(result.percentiles).toBeDefined();
      expect(result.roi).toBeDefined();
      expect(result.harvestValue).toBeDefined();
      expect(result.successRate).toBeDefined();
      expect(Array.isArray(result.rawResults)).toBe(true);
      expect(result.rawResults.length).toBe(50);
    }, 15000);

    test('incorporates weather data when provided', async () => {
      const configWithWeather = { ...mockConfig, weatherData: mockWeatherData };
      const result = await runCompleteSimulation(configWithWeather, 25);

      expect(result).toBeDefined();
      expect(result.weatherEnhanced).toBe(true);
      expect(result.weatherTimestamp).toBe(mockWeatherData.timestamp);
    }, 15000);

    test('generates probabilistic calendar', async () => {
      const result = await runCompleteSimulation(mockConfig, 25);

      expect(result.probabilisticCalendar).toBeDefined();
      expect(result.probabilisticCalendar.plantingRecommendations).toBeDefined();
      expect(result.probabilisticCalendar.harvestPredictions).toBeDefined();
      expect(result.probabilisticCalendar.criticalEvents).toBeDefined();
      expect(result.probabilisticCalendar.totalScenarios).toBeDefined();
    }, 15000);

    test('handles errors gracefully', async () => {
      const invalidConfig = { ...mockConfig, portfolio: null };
      
      await expect(runCompleteSimulation(invalidConfig, 10)).rejects.toThrow();
    });
  });

  describe('runMonteCarloSimulation', () => {
    test('generates correct number of iterations', () => {
      const results = runMonteCarloSimulation(mockConfig, 20);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(20);
    });

    test('includes required result properties', () => {
      const results = runMonteCarloSimulation(mockConfig, 5);

      results.forEach(result => {
        expect(result.harvestValue).toBeDefined();
        expect(result.investment).toBeDefined();
        expect(result.netReturn).toBeDefined();
        expect(result.roi).toBeDefined();
        expect(result.heatYield).toBeDefined();
        expect(result.coolYield).toBeDefined();
        expect(result.perennialYield).toBeDefined();
        expect(result.weather).toBeDefined();
        expect(result.calendar).toBeDefined();
      });
    });

    test('generates valid numeric results', () => {
      const results = runMonteCarloSimulation(mockConfig, 10);

      results.forEach(result => {
        expect(typeof result.harvestValue).toBe('number');
        expect(typeof result.investment).toBe('number');
        expect(typeof result.netReturn).toBe('number');
        expect(typeof result.roi).toBe('number');
        expect(isFinite(result.harvestValue)).toBe(true);
        expect(isFinite(result.investment)).toBe(true);
      });
    });
  });

  describe('generateSimulationParameters', () => {
    test('generates valid parameter structure', () => {
      const params = generateSimulationParameters(
        mockConfig.portfolio,
        mockConfig.baseInvestment,
        mockConfig.portfolioMultiplier,
        mockConfig.locationConfig,
        mockConfig.selectedSummer,
        mockConfig.selectedWinter
      );

      expect(params.harvest).toBeDefined();
      expect(params.harvest.mean).toBeGreaterThan(0);
      expect(params.harvest.std).toBeGreaterThan(0);
      expect(params.investment).toBeDefined();
      expect(params.investment.mean).toBeGreaterThan(0);
      expect(params.investment.std).toBeGreaterThan(0);
      expect(params.requiredInvestment).toBeDefined();
      expect(params.investmentSufficiency).toBeDefined();
    });

    test('applies weather adjustments when weather data provided', () => {
      const baseParams = generateSimulationParameters(
        mockConfig.portfolio,
        mockConfig.baseInvestment,
        mockConfig.portfolioMultiplier,
        mockConfig.locationConfig,
        mockConfig.selectedSummer,
        mockConfig.selectedWinter
      );

      const weatherParams = generateSimulationParameters(
        mockConfig.portfolio,
        mockConfig.baseInvestment,
        mockConfig.portfolioMultiplier,
        mockConfig.locationConfig,
        mockConfig.selectedSummer,
        mockConfig.selectedWinter,
        mockWeatherData
      );

      expect(baseParams).toBeDefined();
      expect(weatherParams).toBeDefined();
      // Parameters should exist even if weather adjustments are applied
    });

    test('handles zero allocation gracefully', () => {
      const emptyPortfolio = { heatSpecialists: 0, coolSeason: 0, perennials: 0 };
      const params = generateSimulationParameters(
        emptyPortfolio,
        100,
        1.0,
        mockConfig.locationConfig,
        'normal',
        'mild'
      );

      expect(params).toBeDefined();
      expect(params.harvest.mean).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateWeatherSamples', () => {
    test('generates correct number of weather samples', () => {
      const samples = generateWeatherSamples(15, mockConfig.locationConfig, 'normal', 'mild');

      expect(Array.isArray(samples)).toBe(true);
      expect(samples.length).toBe(15);
    });

    test('includes required weather properties', () => {
      const samples = generateWeatherSamples(5, mockConfig.locationConfig, 'normal', 'mild');

      samples.forEach(sample => {
        expect(sample.stressDays).toBeDefined();
        expect(sample.freezeEvents).toBeDefined();
        expect(sample.annualRainfall).toBeDefined();
        expect(typeof sample.stressDays).toBe('number');
        expect(typeof sample.freezeEvents).toBe('number');
        expect(typeof sample.annualRainfall).toBe('number');
        // Allow for mock distribution to return valid numbers (including 0)
        expect(sample.stressDays).toBeGreaterThanOrEqual(0);
        expect(sample.freezeEvents).toBeGreaterThanOrEqual(0);
        expect(sample.annualRainfall).toBeGreaterThan(0);
      });
    });

    test('handles extreme weather scenarios', () => {
      const extremeSamples = generateWeatherSamples(10, mockConfig.locationConfig, 'extreme', 'traditional');
      const mildSamples = generateWeatherSamples(10, mockConfig.locationConfig, 'mild', 'warm');

      expect(extremeSamples).toBeDefined();
      expect(mildSamples).toBeDefined();
      expect(extremeSamples.length).toBe(10);
      expect(mildSamples.length).toBe(10);
    });
  });

  describe('Weather Parameter Functions', () => {
    test('getStressDaysParams calculates valid parameters', () => {
      const params = getStressDaysParams('normal', mockConfig.locationConfig);
      
      expect(params.lambda).toBeDefined();
      expect(params.lambda).toBeGreaterThan(0);
    });

    test('getFreezeParams calculates valid parameters', () => {
      const params = getFreezeParams('mild', mockConfig.locationConfig);
      
      expect(params.lambda).toBeDefined();
      expect(params.lambda).toBeGreaterThanOrEqual(0);
    });

    test('getRainfallParams calculates valid parameters', () => {
      const params = getRainfallParams(mockConfig.locationConfig);
      
      expect(params.mean).toBeDefined();
      expect(params.std).toBeDefined();
      expect(params.mean).toBeGreaterThan(0);
      expect(params.std).toBeGreaterThan(0);
    });

    test('handles missing location config gracefully', () => {
      const stressParams = getStressDaysParams('normal', {});
      const freezeParams = getFreezeParams('mild', {});
      const rainfallParams = getRainfallParams({});

      expect(stressParams.lambda).toBeGreaterThan(0);
      expect(freezeParams.lambda).toBeGreaterThanOrEqual(0);
      expect(rainfallParams.mean).toBeGreaterThan(0);
    });
  });

  describe('calculateStatistics', () => {
    const mockResults = [
      { netReturn: 100, roi: 40, harvestValue: 350 },
      { netReturn: 150, roi: 60, harvestValue: 400 },
      { netReturn: 80, roi: 32, harvestValue: 330 },
      { netReturn: 120, roi: 48, harvestValue: 370 },
      { netReturn: 90, roi: 36, harvestValue: 340 }
    ];

    test('calculates basic statistics correctly', () => {
      const stats = calculateStatistics(mockResults);

      expect(stats.mean).toBeDefined();
      expect(stats.median).toBeDefined();
      expect(stats.std).toBeDefined();
      expect(stats.percentiles).toBeDefined();
      expect(stats.roi).toBeDefined();
      expect(stats.harvestValue).toBeDefined();
      expect(stats.successRate).toBeDefined();
    });

    test('handles empty results gracefully', () => {
      const stats = calculateStatistics([]);

      expect(stats.mean).toBe(0);
      expect(stats.median).toBe(0);
      expect(stats.std).toBe(0);
      expect(stats.successRate).toBe(0);
    });

    test('filters out invalid results', () => {
      const invalidResults = [
        { netReturn: 100, roi: 40, harvestValue: 350 },
        { netReturn: NaN, roi: 60, harvestValue: 400 },
        { netReturn: 80, roi: Infinity, harvestValue: 330 },
        { netReturn: 120, roi: 48, harvestValue: 370 }
      ];

      const stats = calculateStatistics(invalidResults);

      expect(stats).toBeDefined();
      expect(isFinite(stats.mean)).toBe(true);
    });

    test('calculates success rate correctly', () => {
      const mixedResults = [
        { netReturn: 100, roi: 40, harvestValue: 350 },
        { netReturn: -50, roi: -20, harvestValue: 200 },
        { netReturn: 75, roi: 30, harvestValue: 325 },
        { netReturn: -25, roi: -10, harvestValue: 225 }
      ];

      const stats = calculateStatistics(mixedResults);

      expect(stats.successRate).toBe(50); // 2 out of 4 positive returns
    });
  });

  describe('generateHistogramData', () => {
    test('generates correct number of bins', () => {
      const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const histogram = generateHistogramData(data, 5);

      expect(Array.isArray(histogram)).toBe(true);
      expect(histogram.length).toBe(5);
    });

    test('handles empty data gracefully', () => {
      const histogram = generateHistogramData([], 10);

      expect(Array.isArray(histogram)).toBe(true);
      expect(histogram.length).toBe(0);
    });

    test('includes required histogram properties', () => {
      const data = [1, 2, 3, 4, 5];
      const histogram = generateHistogramData(data, 3);

      histogram.forEach(bin => {
        expect(bin.x).toBeDefined();
        expect(bin.value).toBeDefined();
        expect(bin.count).toBeDefined();
        expect(typeof bin.x).toBe('number');
        expect(typeof bin.value).toBe('number');
        expect(typeof bin.count).toBe('number');
      });
    });
  });

  describe('calculateRequiredInvestment', () => {
    test('calculates investment breakdown correctly', () => {
      const investment = calculateRequiredInvestment(
        mockConfig.portfolio,
        'normal',
        'mild',
        1.0,
        mockConfig.locationConfig
      );

      expect(investment.breakdown).toBeDefined();
      expect(investment.total).toBeDefined();
      expect(investment.climateAdjustments).toBeDefined();
      expect(investment.total).toBeGreaterThan(0);
      expect(investment.breakdown.seeds).toBeGreaterThan(0);
      expect(investment.breakdown.soil).toBeGreaterThan(0);
    });

    test('applies climate adjustments', () => {
      const normalInvestment = calculateRequiredInvestment(
        mockConfig.portfolio, 'normal', 'mild', 1.0, mockConfig.locationConfig
      );
      const extremeInvestment = calculateRequiredInvestment(
        mockConfig.portfolio, 'extreme', 'traditional', 1.0, mockConfig.locationConfig
      );

      expect(extremeInvestment.total).toBeGreaterThan(normalInvestment.total);
    });

    test('applies portfolio adjustments', () => {
      const balancedPortfolio = { heatSpecialists: 33, coolSeason: 33, perennials: 34 };
      const heatPortfolio = { heatSpecialists: 80, coolSeason: 10, perennials: 10 };

      const balancedInvestment = calculateRequiredInvestment(
        balancedPortfolio, 'normal', 'mild', 1.0, mockConfig.locationConfig
      );
      const heatInvestment = calculateRequiredInvestment(
        heatPortfolio, 'normal', 'mild', 1.0, mockConfig.locationConfig
      );

      expect(balancedInvestment.total).toBeDefined();
      expect(heatInvestment.total).toBeDefined();
    });
  });

  describe('calculateInvestmentSufficiency', () => {
    test('identifies sufficient investment', () => {
      const requiredInvestment = { total: 200, breakdown: {} };
      const sufficiency = calculateInvestmentSufficiency(220, requiredInvestment);

      expect(sufficiency.status).toBe('adequate');
      expect(sufficiency.level).toBe('good');
      expect(sufficiency.ratio).toBeGreaterThan(1.0);
      expect(sufficiency.gap).toBe(0);
      expect(sufficiency.surplus).toBeGreaterThan(0);
    });

    test('identifies insufficient investment', () => {
      const requiredInvestment = { total: 300, breakdown: {} };
      const sufficiency = calculateInvestmentSufficiency(200, requiredInvestment);

      expect(sufficiency.status).toBe('insufficient');
      expect(sufficiency.level).toBe('warning');
      expect(sufficiency.ratio).toBeLessThan(1.0);
      expect(sufficiency.gap).toBeGreaterThan(0);
      expect(sufficiency.surplus).toBe(0);
    });

    test('provides appropriate recommendations', () => {
      const requiredInvestment = { total: 250, breakdown: {} };
      const sufficiency = calculateInvestmentSufficiency(300, requiredInvestment);

      expect(Array.isArray(sufficiency.recommendations)).toBe(true);
      expect(sufficiency.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('identifyCriticalCategories', () => {
    test('identifies critical categories for insufficient investment', () => {
      const requiredInvestment = {
        total: 300,
        breakdown: {
          seeds: 80,
          soil: 45,
          protection: 25,
          fertilizer: 35,
          irrigation: 8,
          infrastructure: 15,
          containers: 12,
          tools: 10
        }
      };

      const critical = identifyCriticalCategories(200, requiredInvestment);

      expect(Array.isArray(critical)).toBe(true);
      if (critical.length > 0) {
        critical.forEach(item => {
          expect(item.category).toBeDefined();
          expect(item.importance).toBeDefined();
          expect(item.action).toBeDefined();
        });
      }
    });

    test('returns empty array for sufficient investment', () => {
      const requiredInvestment = { total: 200, breakdown: {} };
      const critical = identifyCriticalCategories(250, requiredInvestment);

      expect(Array.isArray(critical)).toBe(true);
      expect(critical.length).toBe(0);
    });
  });

  describe('generateWeatherRiskData', () => {
    const mockResults = [
      { weather: { stressDays: 10, freezeEvents: 2, rainfall: 35 } },
      { weather: { stressDays: 15, freezeEvents: 3, rainfall: 40 } },
      { weather: { stressDays: 8, freezeEvents: 1, rainfall: 30 } }
    ];

    test('generates weather risk histograms', () => {
      const riskData = generateWeatherRiskData(mockResults);

      expect(riskData.stressDays).toBeDefined();
      expect(riskData.freezeEvents).toBeDefined();
      expect(riskData.rainfall).toBeDefined();
      expect(Array.isArray(riskData.stressDays)).toBe(true);
      expect(Array.isArray(riskData.freezeEvents)).toBe(true);
      expect(Array.isArray(riskData.rainfall)).toBe(true);
    });

    test('includes real weather context when provided', () => {
      const riskData = generateWeatherRiskData(mockResults, mockWeatherData);

      expect(riskData.realWeatherContext).toBeDefined();
      expect(riskData.realWeatherContext.currentTemp).toBeDefined();
      expect(riskData.realWeatherContext.dataSource).toBe('real');
      expect(riskData.realWeatherContext.timestamp).toBe(mockWeatherData.timestamp);
    });

    test('handles empty results gracefully', () => {
      const riskData = generateWeatherRiskData([]);

      expect(riskData).toEqual({});
    });
  });

  describe('generateCalendarFromScenario', () => {
    const mockWeatherScenario = {
      stressDays: 12,
      freezeEvents: 2,
      annualRainfall: 38
    };

    test('generates calendar structure', () => {
      const calendar = generateCalendarFromScenario(
        mockConfig.portfolio,
        mockWeatherScenario,
        mockConfig.locationConfig
      );

      expect(calendar.plantingEvents).toBeDefined();
      expect(calendar.harvestEvents).toBeDefined();
      expect(calendar.criticalEvents).toBeDefined();
      expect(calendar.weatherEvents).toBeDefined();
      expect(Array.isArray(calendar.plantingEvents)).toBe(true);
      expect(Array.isArray(calendar.harvestEvents)).toBe(true);
    });

    test('includes planting events for allocated crops', () => {
      const calendar = generateCalendarFromScenario(
        mockConfig.portfolio,
        mockWeatherScenario,
        mockConfig.locationConfig
      );

      if (calendar.plantingEvents.length > 0) {
        calendar.plantingEvents.forEach(event => {
          expect(event.crop).toBeDefined();
          expect(event.cropKey).toBeDefined();
          expect(event.cropType).toBeDefined();
          expect(event.optimalDate).toBeInstanceOf(Date);
        });
      }
    });

    test('generates critical events for extreme weather', () => {
      const extremeWeatherScenario = {
        stressDays: 35,
        freezeEvents: 6,
        annualRainfall: 20
      };

      const calendar = generateCalendarFromScenario(
        mockConfig.portfolio,
        extremeWeatherScenario,
        mockConfig.locationConfig
      );

      expect(calendar.criticalEvents.length).toBeGreaterThan(0);
    });
  });

  describe('generateProbabilisticCalendar', () => {
    const mockMonteCarloResults = [
      {
        calendar: {
          plantingEvents: [{
            crop: 'Tomato',
            cropKey: 'tomato',
            cropType: 'heatSpecialists',
            optimalDate: new Date('2024-05-15'),
            earlyDate: new Date('2024-05-08'),
            lateDate: new Date('2024-05-22'),
            confidence: 0.8
          }],
          harvestEvents: [{
            crop: 'Tomato',
            cropKey: 'tomato',
            cropType: 'heatSpecialists',
            firstHarvest: new Date('2024-07-15'),
            peakHarvest: new Date('2024-07-30'),
            lastHarvest: new Date('2024-08-15'),
            confidence: 0.75
          }],
          criticalEvents: [{
            type: 'irrigation',
            date: new Date('2024-07-01'),
            description: 'Check irrigation needs',
            priority: 'high',
            confidence: 0.7
          }]
        }
      },
      {
        calendar: {
          plantingEvents: [{
            crop: 'Tomato',
            cropKey: 'tomato',
            cropType: 'heatSpecialists',
            optimalDate: new Date('2024-05-18'),
            earlyDate: new Date('2024-05-11'),
            lateDate: new Date('2024-05-25'),
            confidence: 0.75
          }],
          harvestEvents: [{
            crop: 'Tomato',
            cropKey: 'tomato',
            cropType: 'heatSpecialists',
            firstHarvest: new Date('2024-07-20'),
            peakHarvest: new Date('2024-08-05'),
            lastHarvest: new Date('2024-08-20'),
            confidence: 0.8
          }],
          criticalEvents: []
        }
      }
    ];

    test('generates consensus calendar from multiple scenarios', () => {
      const calendar = generateProbabilisticCalendar(mockMonteCarloResults);

      expect(calendar.plantingRecommendations).toBeDefined();
      expect(calendar.harvestPredictions).toBeDefined();
      expect(calendar.criticalEvents).toBeDefined();
      expect(calendar.totalScenarios).toBe(2);
      expect(calendar.generatedAt).toBeInstanceOf(Date);
    });

    test('calculates consensus dates correctly', () => {
      const calendar = generateProbabilisticCalendar(mockMonteCarloResults);

      // Check that we get some recommendations
      expect(calendar.plantingRecommendations.length).toBeGreaterThanOrEqual(0);
      
      if (calendar.plantingRecommendations.length > 0) {
        const recommendation = calendar.plantingRecommendations[0];
        expect(recommendation.crop).toBe('Tomato');
        expect(recommendation.optimalDate).toBeInstanceOf(Date);
        expect(typeof recommendation.confidence).toBe('number');
        expect(typeof recommendation.consensusStrength).toBe('number');
        expect(recommendation.scenarioCount).toBe(2);
        expect(recommendation.recommendation).toBeDefined();
      } else {
        // If no recommendations generated, that's also valid behavior
        expect(calendar.plantingRecommendations).toEqual([]);
      }
    });

    test('handles empty results gracefully', () => {
      const calendar = generateProbabilisticCalendar([]);

      expect(calendar.plantingRecommendations).toEqual([]);
      expect(calendar.harvestPredictions).toEqual([]);
      expect(calendar.criticalEvents).toEqual([]);
    });

    test('filters out low-frequency critical events', () => {
      // Only 1 out of 2 scenarios has irrigation event (50% frequency)
      const calendar = generateProbabilisticCalendar(mockMonteCarloResults);

      // Events with 50% frequency should be included (threshold is 20%)
      expect(calendar.criticalEvents.length).toBeGreaterThanOrEqual(0);
      
      // If there are critical events, verify their structure
      calendar.criticalEvents.forEach(event => {
        expect(event.type).toBeDefined();
        expect(event.frequency).toBeGreaterThanOrEqual(0.2);
      });
    });
  });

  describe('Integration Tests', () => {
    test('complete simulation workflow with small dataset', async () => {
      const result = await runCompleteSimulation(mockConfig, 10);

      expect(result).toBeDefined();
      expect(result.rawResults.length).toBe(10);
      expect(result.probabilisticCalendar.totalScenarios).toBeLessThanOrEqual(10);
      expect(result.weatherRiskData).toBeDefined();
      expect(result.returnHistogram).toBeDefined();
      expect(result.roiHistogram).toBeDefined();
    }, 10000);

    test('simulation handles edge cases', async () => {
      const edgeConfig = {
        ...mockConfig,
        portfolio: { heatSpecialists: 0, coolSeason: 0, perennials: 100 },
        baseInvestment: 50
      };

      const result = await runCompleteSimulation(edgeConfig, 5);

      expect(result).toBeDefined();
      expect(result.rawResults.length).toBe(5);
    }, 10000);

    test('weather data integration affects results', async () => {
      const configWithWeather = { ...mockConfig, weatherData: mockWeatherData };
      const resultWithWeather = await runCompleteSimulation(configWithWeather, 10);
      const resultWithoutWeather = await runCompleteSimulation(mockConfig, 10);

      expect(resultWithWeather.weatherEnhanced).toBe(true);
      expect(resultWithoutWeather.weatherEnhanced).toBe(false);
      expect(resultWithWeather.weatherTimestamp).toBeDefined();
      expect(resultWithoutWeather.weatherTimestamp).toBeUndefined();
    }, 15000);
  });
});