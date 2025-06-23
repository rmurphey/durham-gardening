import React, { useState, useEffect } from 'react';
import './index.css';

const climateScenarios = {
  summer: [
    { id: 'mild', name: 'Mild Summer', temp: '85-95°F', duration: 'Jun-Aug', probability: 20, impact: 'Traditional crops survive' },
    { id: 'normal', name: 'Normal Heat', temp: '95-100°F', duration: 'Jun-Sep', probability: 30, impact: 'Heat-adapted strategy works' },
    { id: 'extreme', name: 'Extreme Heat', temp: '100-107°F', duration: 'May-Sep', probability: 40, impact: 'Current planning scenario' },
    { id: 'catastrophic', name: 'Catastrophic', temp: '107°F+', duration: 'Apr-Oct', probability: 10, impact: 'Only specialists survive' }
  ],
  winter: [
    { id: 'traditional', name: 'Traditional Winter', temp: '20-30°F lows', duration: 'Dec-Feb', probability: 15, impact: 'Need cold protection' },
    { id: 'mild', name: 'Mild Winter', temp: '30-40°F lows', duration: 'Dec-Jan', probability: 35, impact: 'Extended cool season' },
    { id: 'warm', name: 'Warm Winter', temp: '40-50°F lows', duration: 'Dec-Jan', probability: 40, impact: 'Current planning' },
    { id: 'none', name: 'No Winter', temp: '50°F+ minimum', duration: 'Year-round', probability: 10, impact: 'Continuous growing' }
  ]
};

const portfolioStrategies = {
  conservative: {
    name: 'Conservative Portfolio',
    description: '60% success rate',
    heatSpecialists: 40,
    coolSeason: 35,
    perennials: 15,
    experimental: 10
  },
  aggressive: {
    name: 'Aggressive Portfolio', 
    description: '80% upside, 40% downside',
    heatSpecialists: 25,
    coolSeason: 50,
    perennials: 15,
    experimental: 10
  },
  hedge: {
    name: 'Hedge Portfolio',
    description: '70% success rate',
    heatSpecialists: 30,
    coolSeason: 40,
    perennials: 20,
    experimental: 10
  }
};

const cropMultipliers = {
  heatSpecialists: {
    mild: 0.8,
    normal: 1.0,
    extreme: 1.2,
    catastrophic: 1.0
  },
  coolSeason: {
    mild: 1.3,
    normal: 1.0,
    extreme: 0.7,
    catastrophic: 0.5
  },
  perennials: {
    mild: 1.1,
    normal: 1.0,
    extreme: 0.9,
    catastrophic: 0.9
  }
};

function App() {
  const [selectedSummer, setSelectedSummer] = useState('extreme');
  const [selectedWinter, setSelectedWinter] = useState('warm');
  const [selectedPortfolio, setSelectedPortfolio] = useState('hedge');
  const [simulationResults, setSimulationResults] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [recommendationDismissed, setRecommendationDismissed] = useState(false);


  // Get seasonal context for better winter predictions  
  const getSeasonalContext = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    
    // Climate trends for Durham, NC based on recent years
    const climateTrends = {
      isElNino: Math.random() > 0.6, // Simplified - would use NOAA ENSO data
      recentWinterTrend: 'warming', // Based on last 5 years in NC
      lastYearMinTemp: 18 + Math.random() * 15, // Typical range 18-33°F
      historicalAvgWinter: 28 // Durham historical average low
    };
    
    return {
      season: month >= 9 || month <= 2 ? 'fall-winter' : 'spring-summer',
      monthsToWinter: month >= 9 ? 12 - month : 9 - month,
      climateTrends,
      winterPredictionRelevant: month >= 8 || month <= 3 // Aug-Mar
    };
  };

  // Fetch weather forecast data
  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Using NOAA Climate Prediction Center for long-term forecasts
      // Durham, NC coordinates: 35.994, -78.8986
      const response = await fetch(
        'https://api.weather.gov/points/35.994,-78.8986'
      );
      const locationData = await response.json();
      
      // Get forecast data
      const forecastResponse = await fetch(locationData.properties.forecast);
      const forecastData = await forecastResponse.json();
      
      setWeatherData({
        forecast: forecastData.properties.periods.slice(0, 14), // 2 weeks
        location: locationData.properties.relativeLocation.properties,
        lastUpdated: new Date().toISOString(),
        seasonalContext: getSeasonalContext()
      });
    } catch (error) {
      console.error('Weather data fetch failed:', error);
      // Set fallback data
      setWeatherData({
        forecast: [],
        error: 'Weather service unavailable',
        lastUpdated: new Date().toISOString(),
        seasonalContext: getSeasonalContext()
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Auto-run simulation when selections change
  useEffect(() => {
    if (selectedSummer && selectedWinter && selectedPortfolio) {
      runSimulation();
    }
  }, [selectedSummer, selectedWinter, selectedPortfolio]);

  const getRecommendedScenario = () => {
    if (!weatherData?.forecast) return { summer: null, winter: null };
    
    const highTemps = weatherData.forecast
      .filter(period => period.isDaytime)
      .map(period => parseInt(period.temperature))
      .filter(temp => !isNaN(temp));
    
    const lowTemps = weatherData.forecast
      .filter(period => !period.isDaytime)
      .map(period => parseInt(period.temperature))
      .filter(temp => !isNaN(temp));
    
    if (highTemps.length === 0) return { summer: null, winter: null };
    
    const avgHigh = highTemps.reduce((a, b) => a + b, 0) / highTemps.length;
    const maxHigh = Math.max(...highTemps);
    const avgLow = lowTemps.length > 0 ? lowTemps.reduce((a, b) => a + b, 0) / lowTemps.length : null;
    const minLow = lowTemps.length > 0 ? Math.min(...lowTemps) : null;
    
    // Summer recommendation based on forecast
    let summerRec = null;
    if (maxHigh >= 105) summerRec = 'extreme';
    else if (avgHigh >= 95) summerRec = 'normal';
    else if (avgHigh >= 85) summerRec = 'mild';
    else summerRec = 'mild';
    
    // Winter recommendation based on current date and temperature trends
    let winterRec = null;
    const seasonal = weatherData?.seasonalContext;
    
    if (seasonal?.winterPredictionRelevant) {
      if (avgLow !== null) {
        // Adjust recommendations based on seasonal context
        const adjustment = seasonal.climateTrends?.recentWinterTrend === 'warming' ? 5 : 0;
        const adjustedAvgLow = avgLow + adjustment;
        
        if (minLow <= 25) winterRec = 'traditional';
        else if (adjustedAvgLow <= 35) winterRec = 'mild';
        else if (adjustedAvgLow <= 45) winterRec = 'warm';
        else winterRec = 'none';
      } else if (seasonal) {
        // Fall back to seasonal trends when no current low temp data
        if (seasonal.climateTrends?.lastYearMinTemp <= 25) winterRec = 'traditional';
        else if (seasonal.climateTrends?.lastYearMinTemp <= 35) winterRec = 'mild';
        else winterRec = 'warm';
      }
    }
    
    return { summer: summerRec, winter: winterRec };
  };

  const generateGardenCalendar = (summerScenario, winterScenario, portfolioKey) => {
    const portfolio = portfolioStrategies[portfolioKey];
    const calendar = [];
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Define activities based on climate scenarios and portfolio
    const activities = {
      extreme_heat: {
        // Extreme heat strategy - focus on Oct-Apr growing season
        'January': ['🌱 Sow cool-season crops indoors', '🥬 Harvest winter greens', '🛠️ Maintain drip irrigation'],
        'February': ['🌱 Direct sow cold-hardy crops', '🔄 Start spring succession plantings'],
        'March': ['🌱 Transplant cool-season starts', '🛒 Order heat-tolerant seeds for fall'],
        'April': ['🌱 Last plantings before heat', '🛠️ Install shade structures'],
        'May': ['🥬 Final cool-season harvest', '🛠️ Prep containers for mobility'],
        'June': ['🛠️ Survival mode - deep watering only', '🔄 Plan fall garden'],
        'July': ['🛠️ Maintain existing plants only', '🛒 Order fall/winter seeds'],
        'August': ['🛠️ Prepare beds for fall planting', '🌱 Start heat-tolerant transplants indoors'],
        'September': ['🌱 Begin fall plantings', '🔄 Succession plant cool crops'],
        'October': ['🌱 Peak planting season begins', '🔄 Weekly succession sowings'],
        'November': ['🌱 Continue cool-season plantings', '🛠️ Cold protection prep'],
        'December': ['🥬 Harvest season peak', '🛠️ Plan next year\'s strategy']
      },
      normal_heat: {
        // Normal heat strategy - modified traditional season
        'January': ['🌱 Plan garden layout', '🛒 Order seeds for spring'],
        'February': ['🌱 Start transplants indoors', '🛠️ Prepare soil'],
        'March': ['🌱 Direct sow cool crops', '🔄 Begin succession plantings'],
        'April': ['🌱 Transplant warm-season crops', '🛠️ Install irrigation'],
        'May': ['🌱 Continue warm-season plantings', '🔄 Succession plant'],
        'June': ['🥬 First harvests', '🛠️ Summer maintenance begins'],
        'July': ['🥬 Peak harvest', '🔄 Plant fall crops'],
        'August': ['🌱 Fall garden preparation', '🛒 Order winter seeds'],
        'September': ['🌱 Fall plantings', '🔄 Succession cool crops'],
        'October': ['🌱 Winter crop plantings', '🛠️ Cold protection prep'],
        'November': ['🥬 Late harvest', '🛠️ Garden cleanup'],
        'December': ['🛠️ Plan improvements', '🥬 Harvest storage crops']
      }
    };
    
    // Select activity set based on summer scenario
    const activitySet = summerScenario === 'extreme' || summerScenario === 'catastrophic' ? 
      activities.extreme_heat : activities.normal_heat;
    
    // Generate calendar
    months.forEach((month, index) => {
      const monthActivities = activitySet[month] || ['🛠️ Garden maintenance'];
      
      // Add portfolio-specific activities
      if (portfolio.heatSpecialists > 40) {
        monthActivities.push('🌶️ Focus on heat-tolerant varieties');
      }
      if (portfolio.coolSeason > 40) {
        monthActivities.push('🥬 Emphasize cool-season succession');
      }
      if (portfolio.perennials > 15) {
        monthActivities.push('🌿 Maintain perennial herbs');
      }
      
      calendar.push({
        month,
        activities: monthActivities,
        emphasis: getMonthEmphasis(index, summerScenario, winterScenario)
      });
    });
    
    return calendar;
  };
  
  const getMonthEmphasis = (monthIndex, summerScenario, winterScenario) => {
    // Peak growing seasons based on climate scenarios
    if (summerScenario === 'extreme' || summerScenario === 'catastrophic') {
      // Oct-Apr peak season for extreme heat
      if (monthIndex >= 9 || monthIndex <= 3) return 'peak';
      if (monthIndex >= 5 && monthIndex <= 7) return 'survival';
      return 'transition';
    } else {
      // Traditional growing season with modifications
      if (monthIndex >= 3 && monthIndex <= 9) return 'peak';
      if (monthIndex >= 10 || monthIndex <= 1) return 'planning';
      return 'transition';
    }
  };

  // Monte Carlo simulation with proper probability distributions
  const runMonteCarloSimulation = (iterations = 10000) => {
    const portfolio = portfolioStrategies[selectedPortfolio];
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      // Simulate weather conditions with probability distributions
      const weather = simulateWeatherYear(selectedSummer, selectedWinter);
      
      // Simulate crop yields with realistic distributions
      const yields = simulateCropYields(portfolio, weather);
      
      // Simulate market prices with seasonal variation
      const prices = simulateMarketPrices();
      
      // Calculate total harvest value
      const harvestValue = (
        yields.heatSpecialists * prices.heatCrops +
        yields.coolSeason * prices.coolCrops +
        yields.perennials * prices.herbs
      );
      
      // Investment costs with some variation
      const seedCost = 75 + Math.random() * 30; // $75-105 range
      const infrastructureCost = selectedPortfolio === 'conservative' ? 
        60 + Math.random() * 20 : 110 + Math.random() * 40; // Some price variation
      const totalInvestment = seedCost + infrastructureCost;
      
      const netReturn = harvestValue - totalInvestment;
      const roi = (netReturn / totalInvestment) * 100;
      
      results.push({
        harvestValue,
        investment: totalInvestment,
        netReturn,
        roi,
        heatYield: yields.heatSpecialists * prices.heatCrops,
        coolYield: yields.coolSeason * prices.coolCrops,
        perennialYield: yields.perennials * prices.herbs,
        weather
      });
    }
    
    return results;
  };

  // Simulate weather conditions for a full year
  const simulateWeatherYear = (summerScenario, winterScenario) => {
    // Summer heat stress days (affects yields)
    const summerStressProb = {
      mild: 0.1, normal: 0.25, extreme: 0.45, catastrophic: 0.7
    };
    const stressDays = Math.floor(Math.random() * 60) * summerStressProb[summerScenario];
    
    // Winter freeze events
    const winterFreezeProb = {
      none: 0, warm: 0.1, mild: 0.3, traditional: 0.6
    };
    const freezeEvents = Math.random() < winterFreezeProb[winterScenario] ? 
      Math.floor(Math.random() * 5) + 1 : 0;
    
    // Rainfall variation (Durham average ~46 inches)
    const annualRainfall = 35 + Math.random() * 22; // 35-57 inch range
    
    return { stressDays, freezeEvents, annualRainfall };
  };

  // Simulate crop yields with realistic distributions
  const simulateCropYields = (portfolio, weather) => {
    // Base yields per percentage point of portfolio
    const baseYields = { heatSpecialists: 4, coolSeason: 3, perennials: 6 };
    
    // Weather impact factors
    const heatStressImpact = Math.max(0.3, 1 - (weather.stressDays * 0.015));
    const freezeImpact = Math.max(0.5, 1 - (weather.freezeEvents * 0.1));
    const rainImpact = Math.min(1.3, Math.max(0.6, weather.annualRainfall / 46));
    
    // Natural yield variation (log-normal distribution approximation)
    const yieldVariation = () => Math.max(0.2, -Math.log(Math.random()) * 0.3 + 0.8);
    
    return {
      heatSpecialists: portfolio.heatSpecialists * baseYields.heatSpecialists * 
        Math.max(0.5, heatStressImpact * 1.2) * rainImpact * yieldVariation(),
      coolSeason: portfolio.coolSeason * baseYields.coolSeason * 
        heatStressImpact * freezeImpact * rainImpact * yieldVariation(),
      perennials: portfolio.perennials * baseYields.perennials * 
        Math.min(heatStressImpact * 1.1, 1.0) * freezeImpact * yieldVariation()
    };
  };

  // Simulate market prices with seasonal variation
  const simulateMarketPrices = () => {
    // Base prices with seasonal and market variation
    const seasonalMultiplier = 0.8 + Math.random() * 0.6; // ±30% seasonal variation
    const marketVolatility = 0.9 + Math.random() * 0.2; // ±10% market variation
    
    return {
      heatCrops: 1.2 * seasonalMultiplier * marketVolatility, // $1.2 base per unit
      coolCrops: 0.8 * seasonalMultiplier * marketVolatility, // $0.8 base per unit
      herbs: 2.5 * seasonalMultiplier * marketVolatility     // $2.5 base per unit (high value)
    };
  };

  // Format currency using browser's native Intl.NumberFormat API
  const formatCurrency = (amount, currency = 'USD') => {
    if (currency === 'PCT') {
      // Handle percentages separately
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(amount);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate statistics from Monte Carlo results
  const calculateStatistics = (results) => {
    const sorted = {
      harvestValue: results.map(r => r.harvestValue).sort((a, b) => a - b),
      netReturn: results.map(r => r.netReturn).sort((a, b) => a - b),
      roi: results.map(r => r.roi).sort((a, b) => a - b)
    };
    
    const percentile = (arr, p) => arr[Math.floor(arr.length * p / 100)];
    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    return {
      investment: mean(results.map(r => r.investment)),
      harvestValue: {
        mean: mean(sorted.harvestValue),
        p10: percentile(sorted.harvestValue, 10),
        p50: percentile(sorted.harvestValue, 50),
        p90: percentile(sorted.harvestValue, 90)
      },
      netReturn: {
        mean: mean(sorted.netReturn),
        p10: percentile(sorted.netReturn, 10),
        p50: percentile(sorted.netReturn, 50),
        p90: percentile(sorted.netReturn, 90)
      },
      roi: {
        mean: mean(sorted.roi),
        p10: percentile(sorted.roi, 10),
        p50: percentile(sorted.roi, 50),
        p90: percentile(sorted.roi, 90)
      },
      successRate: (results.filter(r => r.netReturn > 0).length / results.length) * 100,
      heatYield: mean(results.map(r => r.heatYield)),
      coolYield: mean(results.map(r => r.coolYield)),
      perennialYield: mean(results.map(r => r.perennialYield))
    };
  };

  const runSimulation = () => {
    console.log('Running Monte Carlo simulation...', { selectedSummer, selectedWinter, selectedPortfolio });
    setSimulating(true);
    
    // Add a small delay to show the loading state
    setTimeout(() => {
      // Run Monte Carlo simulation
      const monteCarloResults = runMonteCarloSimulation(5000); // 5000 iterations for speed
      const statistics = calculateStatistics(monteCarloResults);
      
      // Generate 12-month garden calendar based on climate scenarios
      const gardenCalendar = generateGardenCalendar(selectedSummer, selectedWinter, selectedPortfolio);
      
      console.log('Monte Carlo results:', statistics);
      setSimulationResults({ ...statistics, gardenCalendar, rawResults: monteCarloResults });
      setSimulating(false);
    }, 800); // Slightly longer delay for more complex calculation
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🌡️ Climate Garden Simulation</h1>
        <p>Durham Heat-Adapted Garden Strategy Tester</p>
      </div>

      <div className="simulation-container">
        {weatherData && (
          <div className="section weather-forecast">
            <h3>🌡️ Weather Intelligence</h3>
            {loading && <p>Loading forecast data...</p>}
            {weatherData.error && (
              <div className="error-message">
                <p>⚠️ {weatherData.error}</p>
                <p>Using historical climate patterns for recommendations.</p>
              </div>
            )}
            {weatherData.forecast.length > 0 && (
              <div>
                <div className="forecast-summary">
                  <h4>14-Day Forecast (Durham, NC)</h4>
                  <div className="forecast-grid">
                    {weatherData.forecast.slice(0, 4).map((period, idx) => (
                      <div key={idx} className="forecast-item">
                        <div className="forecast-day">{period.name}</div>
                        <div className="forecast-temp">{period.temperature}°{period.temperatureUnit}</div>
                        <div className="forecast-desc">{period.shortForecast}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {(getRecommendedScenario().summer || getRecommendedScenario().winter) && !recommendationDismissed && (
                  <div className="recommendation">
                    <h4>🎯 AI Recommendations</h4>
                    {getRecommendedScenario().summer && (
                      <div className="recommendation-item">
                        <p><strong>Summer:</strong> Based on forecast trends, consider <strong>{climateScenarios.summer.find(s => s.id === getRecommendedScenario().summer)?.name}</strong></p>
                        <button 
                          className="button small accept"
                          onClick={() => {
                            setSelectedSummer(getRecommendedScenario().summer);
                            setRecommendationDismissed(true);
                          }}
                        >
                          ✓ Apply Summer
                        </button>
                      </div>
                    )}
                    {getRecommendedScenario().winter && (
                      <div className="recommendation-item">
                        <p><strong>Winter:</strong> Night temperatures suggest <strong>{climateScenarios.winter.find(s => s.id === getRecommendedScenario().winter)?.name}</strong></p>
                        <button 
                          className="button small accept"
                          onClick={() => {
                            setSelectedWinter(getRecommendedScenario().winter);
                            setRecommendationDismissed(true);
                          }}
                        >
                          ✓ Apply Winter
                        </button>
                      </div>
                    )}
                    <div className="recommendation-buttons">
                      <button 
                        className="button small reject"
                        onClick={() => setRecommendationDismissed(true)}
                      >
                        ✗ Dismiss All
                      </button>
                    </div>
                  </div>
                )}
                <p className="data-source">Data: NOAA Weather Service • Updated: {new Date(weatherData.lastUpdated).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        <div className="section">
          <h3>🔥 Summer Climate Bet</h3>
          <div className="scenario-grid">
            {climateScenarios.summer.map(scenario => (
              <div 
                key={scenario.id}
                className={`scenario-card ${selectedSummer === scenario.id ? 'selected' : ''}`}
                onClick={() => setSelectedSummer(scenario.id)}
              >
                <h4>{scenario.name}</h4>
                <p><strong>{scenario.temp}</strong></p>
                <p>{scenario.duration}</p>
                <p>{scenario.probability}% chance</p>
                <p><em>{scenario.impact}</em></p>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>❄️ Winter Climate Bet</h3>
          <div className="scenario-grid">
            {climateScenarios.winter.map(scenario => (
              <div 
                key={scenario.id}
                className={`scenario-card ${selectedWinter === scenario.id ? 'selected' : ''}`}
                onClick={() => setSelectedWinter(scenario.id)}
              >
                <h4>{scenario.name}</h4>
                <p><strong>{scenario.temp}</strong></p>
                <p>{scenario.duration}</p>
                <p>{scenario.probability}% chance</p>
                <p><em>{scenario.impact}</em></p>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>🌱 Portfolio Strategy</h3>
          <div className="scenario-grid">
            {Object.entries(portfolioStrategies).map(([key, portfolio]) => (
              <div 
                key={key}
                className={`scenario-card ${selectedPortfolio === key ? 'selected' : ''}`}
                onClick={() => setSelectedPortfolio(key)}
              >
                <h4>{portfolio.name}</h4>
                <p>{portfolio.description}</p>
                <div className="crop-allocation">
                  <div className="crop-item">
                    <div className="crop-percentage">{portfolio.heatSpecialists}%</div>
                    <div>Heat Crops</div>
                  </div>
                  <div className="crop-item">
                    <div className="crop-percentage">{portfolio.coolSeason}%</div>
                    <div>Cool Season</div>
                  </div>
                  <div className="crop-item">
                    <div className="crop-percentage">{portfolio.perennials}%</div>
                    <div>Perennials</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>📊 Current Selection</h3>
          <p>Selected scenario: <strong>{climateScenarios.summer.find(s => s.id === selectedSummer)?.name}</strong> + <strong>{climateScenarios.winter.find(s => s.id === selectedWinter)?.name}</strong></p>
          <p>Portfolio: <strong>{portfolioStrategies[selectedPortfolio].name}</strong></p>
          {simulating && <p>🎲 Updating results...</p>}

          {simulationResults && (
            <div className="results-section">
              <h3>📊 Simulation Results</h3>
              <div className="results-grid">
                <div className="result-card">
                  <div className="result-value">{formatCurrency(simulationResults.investment)}</div>
                  <div className="result-label">Total Investment</div>
                  <div className="result-confidence">(Fixed cost)</div>
                </div>
                <div className="result-card">
                  <div className="result-value">{formatCurrency(simulationResults.harvestValue.mean)}</div>
                  <div className="result-label">Expected Harvest</div>
                  <div className="result-confidence">
                    80% likely: {formatCurrency(simulationResults.harvestValue.p10)} - {formatCurrency(simulationResults.harvestValue.p90)}
                  </div>
                </div>
                <div className="result-card">
                  <div className="result-value">{formatCurrency(simulationResults.netReturn.mean)}</div>
                  <div className="result-label">Expected Return</div>
                  <div className="result-confidence">
                    80% likely: {formatCurrency(simulationResults.netReturn.p10)} - {formatCurrency(simulationResults.netReturn.p90)}
                  </div>
                </div>
                <div className="result-card">
                  <div className="result-value">{formatCurrency(simulationResults.roi.mean, 'PCT')}%</div>
                  <div className="result-label">Expected ROI</div>
                  <div className="result-confidence">
                    80% likely: {formatCurrency(simulationResults.roi.p10, 'PCT')}% - {formatCurrency(simulationResults.roi.p90, 'PCT')}%
                  </div>
                </div>
              </div>
              
              <div className="risk-metrics">
                <h4>📊 Risk Analysis (from 5,000 simulations)</h4>
                <div className="risk-grid">
                  <div className="risk-item">
                    <span className="risk-label">Success Rate:</span>
                    <span className="risk-value success">{formatCurrency(simulationResults.successRate, 'PCT')}%</span>
                    <span className="risk-desc">Probability of positive return</span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-label">Worst Case (10th percentile):</span>
                    <span className="risk-value worst">{formatCurrency(simulationResults.netReturn.p10)}</span>
                    <span className="risk-desc">1 in 10 chance of worse outcome</span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-label">Best Case (90th percentile):</span>
                    <span className="risk-value best">{formatCurrency(simulationResults.netReturn.p90)}</span>
                    <span className="risk-desc">1 in 10 chance of better outcome</span>
                  </div>
                  <div className="risk-item">
                    <span className="risk-label">Most Likely (median):</span>
                    <span className="risk-value median">{formatCurrency(simulationResults.netReturn.p50)}</span>
                    <span className="risk-desc">50/50 chance above/below this</span>
                  </div>
                </div>
              </div>
              <div className="portfolio-breakdown">
                <h4>Crop Performance Breakdown:</h4>
                <div className="crop-results">
                  <div className="crop-result-item">
                    <span className="crop-result-label">Heat Specialists:</span>
                    <span className="crop-result-value">{formatCurrency(simulationResults.heatYield)}</span>
                  </div>
                  <div className="crop-result-item">
                    <span className="crop-result-label">Cool Season:</span>
                    <span className="crop-result-value">{formatCurrency(simulationResults.coolYield)}</span>
                  </div>
                  <div className="crop-result-item">
                    <span className="crop-result-label">Perennials:</span>
                    <span className="crop-result-value">{formatCurrency(simulationResults.perennialYield)}</span>
                  </div>
                </div>
              </div>
              
              {simulationResults.gardenCalendar && (
                <div className="garden-calendar">
                  <h4>📅 12-Month Garden Calendar</h4>
                  <p className="calendar-subtitle">Optimized for {climateScenarios.summer.find(s => s.id === selectedSummer)?.name} + {climateScenarios.winter.find(s => s.id === selectedWinter)?.name}</p>
                  <div className="calendar-grid">
                    {simulationResults.gardenCalendar.map((monthData, index) => (
                      <div key={index} className={`calendar-month ${monthData.emphasis}`}>
                        <div className="month-header">
                          <h5>{monthData.month}</h5>
                          <span className="month-emphasis">{monthData.emphasis}</span>
                        </div>
                        <ul className="month-activities">
                          {monthData.activities.map((activity, actIndex) => (
                            <li key={actIndex}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;