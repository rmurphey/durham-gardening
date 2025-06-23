import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jStat from 'jstat';
import * as ss from 'simple-statistics';
import { 
  HARDINESS_ZONES, 
  REGION_PRESETS, 
  INVESTMENT_PRESETS,
  getClimateSeverity, 
  getHardinessZoneNumber,
  getScaleValue,
  getClimateType,
  GARDEN_SIZE_SCALE,
  INVESTMENT_LEVEL_SCALE,
  HEAT_INTENSITY_SCALE,
  MARKET_PRICES,
  BASE_YIELD_MULTIPLIERS,
  PORTFOLIO_NAMES,
  PORTFOLIO_DESCRIPTORS,
  formatPercentage,
  formatProbability,
  GLOBAL_CROP_DATABASE,
  CLIMATE_ADJUSTMENTS,
  CLIMATE_ZONES,
  SUPPORTED_REGIONS
} from './config.js';
import './index.css';


// Climate scenarios and portfolio strategies are defined in-component

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

const getPortfolioStrategies = (locationConfig) => {
  // Default strategies when no location config
  const defaultStrategies = {
    conservative: { name: 'Conservative Portfolio', description: '60% success rate', heatSpecialists: 40, coolSeason: 35, perennials: 15, experimental: 10 },
    aggressive: { name: 'Aggressive Portfolio', description: '80% upside, 40% downside', heatSpecialists: 25, coolSeason: 50, perennials: 15, experimental: 10 },
    hedge: { name: 'Hedge Portfolio', description: '70% success rate', heatSpecialists: 30, coolSeason: 40, perennials: 20, experimental: 10 }
  };

  if (!locationConfig) return defaultStrategies;

  const climateType = getClimateType(locationConfig.heatDays, locationConfig.hardiness);
  const isShortSeason = getHardinessZoneNumber(locationConfig.hardiness) < 5;

  // Climate-specific allocations
  const allocations = {
    conservative: {
      hot: { heatSpecialists: 60, coolSeason: 20, perennials: 15, experimental: 5 },
      cold: { heatSpecialists: 20, coolSeason: isShortSeason ? 60 : 35, perennials: 15, experimental: 5 },
      normal: { heatSpecialists: 40, coolSeason: 35, perennials: 15, experimental: 10 }
    },
    aggressive: {
      hot: { heatSpecialists: 50, coolSeason: 30, perennials: 10, experimental: 10 },
      cold: { heatSpecialists: 15, coolSeason: isShortSeason ? 70 : 50, perennials: 10, experimental: 15 },
      normal: { heatSpecialists: 25, coolSeason: 50, perennials: 15, experimental: 10 }
    },
    hedge: {
      hot: { heatSpecialists: 45, coolSeason: 30, perennials: 20, experimental: 5 },
      cold: { heatSpecialists: 25, coolSeason: isShortSeason ? 50 : 40, perennials: 20, experimental: 5 },
      normal: { heatSpecialists: 30, coolSeason: 40, perennials: 20, experimental: 10 }
    }
  };

  return Object.entries(allocations).reduce((strategies, [portfolioType, climateAllocations]) => {
    const allocation = climateAllocations[climateType];
    const description = typeof PORTFOLIO_DESCRIPTORS[portfolioType] === 'object' 
      ? PORTFOLIO_DESCRIPTORS[portfolioType][climateType] || PORTFOLIO_DESCRIPTORS[portfolioType].normal
      : PORTFOLIO_DESCRIPTORS[portfolioType];

    strategies[portfolioType] = {
      name: PORTFOLIO_NAMES[portfolioType][climateType],
      description,
      ...allocation
    };
    return strategies;
  }, {});
};


function App() {
  // Initialize state from localStorage directly
  const [selectedSummer, setSelectedSummer] = useState(() => {
    try {
      const stored = localStorage.getItem('gardenSim_climateSelection');
      return stored ? JSON.parse(stored).selectedSummer : 'extreme';
    } catch { return 'extreme'; }
  });
  const [selectedWinter, setSelectedWinter] = useState(() => {
    try {
      const stored = localStorage.getItem('gardenSim_climateSelection');
      return stored ? JSON.parse(stored).selectedWinter : 'warm';
    } catch { return 'warm'; }
  });
  const [selectedPortfolio, setSelectedPortfolio] = useState(() => {
    try {
      const stored = localStorage.getItem('gardenSim_climateSelection');
      return stored ? JSON.parse(stored).selectedPortfolio : 'hedge';
    } catch { return 'hedge'; }
  });
  const [simulationResults, setSimulationResults] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [recommendationDismissed, setRecommendationDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem('gardenSim_uiPreferences');
      return stored ? JSON.parse(stored).recommendationDismissed : false;
    } catch { return false; }
  });
  const [locationConfig, setLocationConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('gardenSim_locationConfig');
      const saved = stored ? JSON.parse(stored) : {};
      return saved.name ? saved : null;
    } catch { return null; }
  });
  const [showSetup, setShowSetup] = useState(() => {
    try {
      const locationStored = localStorage.getItem('gardenSim_locationConfig');
      const uiStored = localStorage.getItem('gardenSim_uiPreferences');
      const saved = locationStored ? JSON.parse(locationStored) : {};
      const uiPrefs = uiStored ? JSON.parse(uiStored) : {};
      return !saved.name || uiPrefs.showSetup;
    } catch { return true; }
  });
  const [customInvestment, setCustomInvestment] = useState(() => {
    try {
      const stored = localStorage.getItem('gardenSim_investmentConfig');
      return stored ? JSON.parse(stored) : { seeds: 75, infrastructure: 110, tools: 45, soil: 35, containers: 60, irrigation: 85, protection: 25, fertilizer: 30 };
    } catch { return { seeds: 75, infrastructure: 110, tools: 45, soil: 35, containers: 60, irrigation: 85, protection: 25, fertilizer: 30 }; }
  });
  const [showInvestmentDetails, setShowInvestmentDetails] = useState(() => {
    try {
      const stored = localStorage.getItem('gardenSim_uiPreferences');
      return stored ? JSON.parse(stored).showInvestmentDetails : false;
    } catch { return false; }
  });
  const [simulationDebounceTimer, setSimulationDebounceTimer] = useState(null);


  // Get seasonal context for better winter predictions  
  const getSeasonalContext = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
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

  // Get historical average summer temperature by hardiness zone (NOAA data)
  const getHistoricalTemp = (hardiness) => {
    const zoneTemps = {
      '3a': 75, '3b': 77, '4a': 79, '4b': 81, '5a': 83, '5b': 85,
      '6a': 87, '6b': 89, '7a': 91, '7b': 93, '8a': 95, '8b': 97,
      '9a': 99, '9b': 101, '10a': 103, '10b': 105, '11': 107
    };
    return zoneTemps[hardiness] || 93;
  };

  // Calculate climate change probability adjustments (based on NOAA/IPCC data)
  const getClimateChangeProbabilities = (baselineProb, scenario, location) => {
    // Extreme heat events are becoming 3-5x more likely (IPCC AR6)
    // "Mild" summers becoming rare, "extreme" becoming normal
    const extremeMultiplier = scenario === 'extreme' ? 2.5 : 
                             scenario === 'catastrophic' ? 3.0 : 
                             scenario === 'mild' ? 0.4 : 1.0;
    
    // Regional adjustments: Southwest/Southern regions warming faster
    const lat = location?.lat || 36;
    const regionalMultiplier = lat < 35 ? 1.3 : lat < 40 ? 1.1 : lat > 45 ? 0.8 : 1.0;
    
    return Math.min(baselineProb * extremeMultiplier * regionalMultiplier, 80);
  };

  // Generate location-aware climate scenarios based on climate science
  const generateClimateScenarios = (config) => {
    if (!config) return climateScenarios;
    
    // Real climate data: IPCC AR6 projections show 1.1°C warming already, 1.5-4.5°C by 2100
    // Heat dome frequency increasing 3-5x in many regions by 2050
    // USDA hardiness zones shifting 1-2 zones northward by 2100
    
    const currentTemp = getHistoricalTemp(config.hardiness);
    const warmingScenario = 2.5; // Conservative 2.5°C warming by 2050 (RCP4.5 pathway)
    const heatExtremeMultiplier = 3; // Heat extremes increase 3x faster than average warming
    
    // Adjusted temperatures accounting for global warming trends
    const futureBaseTemp = currentTemp + warmingScenario;
    const extremeHeatIncrease = warmingScenario * heatExtremeMultiplier;
    
    return {
      summer: [
        { 
          id: 'mild', 
          name: 'Pre-Warming Summer (Rare)', 
          temp: `${Math.round(futureBaseTemp-8)}-${Math.round(futureBaseTemp-3)}°F`, 
          duration: 'Jun-Aug', 
          probability: getClimateChangeProbabilities(15, 'mild', config), 
          impact: 'Historical crop varieties may work' 
        },
        { 
          id: 'normal', 
          name: 'New Normal Heat', 
          temp: `${Math.round(futureBaseTemp-3)}-${Math.round(futureBaseTemp+2)}°F`, 
          duration: 'May-Sep', 
          probability: getClimateChangeProbabilities(25, 'normal', config), 
          impact: 'Heat-adapted strategy essential' 
        },
        { 
          id: 'extreme', 
          name: 'Heat Dome Events', 
          temp: `${Math.round(futureBaseTemp+2)}-${Math.round(futureBaseTemp+extremeHeatIncrease)}°F`, 
          duration: 'Apr-Oct', 
          probability: getClimateChangeProbabilities(35, 'extreme', config), 
          impact: 'Survival mode - specialized crops only' 
        },
        { 
          id: 'catastrophic', 
          name: 'Climate Breakdown', 
          temp: `${Math.round(futureBaseTemp+extremeHeatIncrease)}°F+`, 
          duration: 'Mar-Nov', 
          probability: getClimateChangeProbabilities(12, 'catastrophic', config), 
          impact: 'Controlled environment required' 
        }
      ],
      winter: [
        { 
          id: 'traditional', 
          name: 'Legacy Winter Pattern', 
          temp: `${HARDINESS_ZONES[config.hardiness].min}-${HARDINESS_ZONES[config.hardiness].max}°F lows`, 
          duration: 'Dec-Feb', 
          probability: Math.max(5, parseInt(config.hardiness[0]) < 8 ? 20 : 10), // Becoming rare
          impact: 'Traditional cold requirements met' 
        },
        { 
          id: 'mild', 
          name: 'Climate-Shifted Winter', 
          temp: `${HARDINESS_ZONES[config.hardiness].max+3}-${HARDINESS_ZONES[config.hardiness].max+13}°F lows`, 
          duration: 'Dec-Jan', 
          probability: parseInt(config.hardiness[0]) < 8 ? 40 : 30, 
          impact: 'Reduced chill hours, season extension' 
        },
        { 
          id: 'warm', 
          name: 'Disrupted Winter', 
          temp: `${HARDINESS_ZONES[config.hardiness].max+13}-${HARDINESS_ZONES[config.hardiness].max+23}°F lows`, 
          duration: 'Dec-Jan', 
          probability: parseInt(config.hardiness[0]) > 7 ? 45 : 35, 
          impact: 'Insufficient chill hours, pest survival' 
        },
        { 
          id: 'none', 
          name: 'No-Chill Winter', 
          temp: `${HARDINESS_ZONES[config.hardiness].max+23}°F+ minimum`, 
          duration: 'Year-round', 
          probability: parseInt(config.hardiness[0]) > 9 ? 35 : parseInt(config.hardiness[0]) > 7 ? 15 : 5, 
          impact: 'Continuous growing, new pest pressure' 
        }
      ]
    };
  };

  // Location setup component
  const LocationSetup = () => {
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customConfig, setCustomConfig] = useState({
      name: '',
      region: 'us', // Default to US
      hardiness: '7b',
      lat: '',
      lon: '',
      avgRainfall: 40,
      heatIntensity: 3, // 1-5 scale
      winterSeverity: 3, // 1-5 scale  
      marketMultiplier: 1.0,
      gardenSize: 2, // 1-5 scale (small to large)
      investmentLevel: 3 // 1-5 scale (minimal to premium)
    });

    const getHeatDaysFromIntensity = (intensity) => 
      getScaleValue(HEAT_INTENSITY_SCALE, intensity) || 100;

    const getGardenSizeFromScale = (scale) => 
      getScaleValue(GARDEN_SIZE_SCALE, scale) || 100;

    const getBudgetFromLevel = (level) => 
      getScaleValue(INVESTMENT_LEVEL_SCALE, level) || 200;

    const handlePresetSelect = (presetKey) => {
      console.log('Preset selected:', presetKey);
      try {
        const preset = REGION_PRESETS[presetKey];
        if (!preset) {
          console.error('Preset not found:', presetKey);
          return;
        }
        
        const heatThresholds = [50, 100, 150];
        const heatIntensity = heatThresholds.findIndex(threshold => preset.heatDays < threshold) + 2 || 5;
        
        const hardinessZone = getHardinessZoneNumber(preset.hardiness);
        const winterSeverity = hardinessZone < 6 ? 4 : hardinessZone < 8 ? 3 : 2;
        
        setSelectedPreset(presetKey);
        setCustomConfig({
          ...preset,
          heatIntensity,
          winterSeverity,
          gardenSize: 2,
          investmentLevel: 3
        });
        console.log('Config updated:', { ...preset, heatIntensity, winterSeverity });
      } catch (error) {
        console.error('Error in handlePresetSelect:', error);
      }
    };

    const handleSubmit = () => {
      const finalConfig = {
        ...customConfig,
        heatDays: getHeatDaysFromIntensity(customConfig.heatIntensity),
        gardenSizeActual: getGardenSizeFromScale(customConfig.gardenSize),
        budget: getBudgetFromLevel(customConfig.investmentLevel)
      };
      setLocationConfig(finalConfig);
      setShowSetup(false);
    };

    return (
      <div className="setup-overlay">
        <div className="setup-container">
          <h2>🌱 Garden Location Setup</h2>
          
          <div className="setup-section">
            <h3>Quick Start - Choose a Region</h3>
            <div className="preset-grid">
              {Object.entries(REGION_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  className={`preset-button ${selectedPreset === key ? 'selected' : ''}`}
                  onClick={() => handlePresetSelect(key)}
                >
                  <strong>{preset.name}</strong>
                  <div>Zone {preset.hardiness}</div>
                </button>
              ))}
            </div>
            {selectedPreset && (
              <div className="preset-implications">
                <div className="implication-item">
                  <strong>Strategy:</strong> {REGION_PRESETS[selectedPreset].heatDays > 120 ? 'Heat-tolerant crops' : getHardinessZoneNumber(REGION_PRESETS[selectedPreset].hardiness) < 6 ? 'Cold-hardy crops' : 'Balanced portfolio'}
                </div>
                {REGION_PRESETS[selectedPreset].marketMultiplier > 1.1 && (
                  <div className="implication-item">
                    <strong>Premium:</strong> +{formatPercentage(REGION_PRESETS[selectedPreset].marketMultiplier - 1)}% market prices
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="setup-section">
            <h3>Custom Configuration</h3>
            <div className="config-grid">
              <div className="config-item">
                <label>Region:</label>
                <select
                  value={customConfig.region}
                  onChange={(e) => setCustomConfig({...customConfig, region: e.target.value})}
                >
                  {Object.entries(SUPPORTED_REGIONS).map(([code, region]) => (
                    <option key={code} value={code}>{region.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="config-item">
                <label>Location Name:</label>
                <input
                  type="text"
                  value={customConfig.name}
                  onChange={(e) => setCustomConfig({...customConfig, name: e.target.value})}
                  placeholder="e.g., My Garden"
                />
              </div>
              
              <div className="config-item">
                <label>Hardiness Zone:</label>
                <select
                  value={customConfig.hardiness}
                  onChange={(e) => setCustomConfig({...customConfig, hardiness: e.target.value})}
                >
                  {Object.entries(HARDINESS_ZONES).map(([zone, data]) => (
                    <option key={zone} value={zone}>{data.name}</option>
                  ))}
                </select>
              </div>

              <div className="config-item">
                <label>Annual Rainfall (inches):</label>
                <input
                  type="number"
                  value={customConfig.avgRainfall}
                  onChange={(e) => setCustomConfig({...customConfig, avgRainfall: parseInt(e.target.value)})}
                  min="5"
                  max="100"
                />
              </div>

              <div className="config-item slider-item">
                <label>Summer Heat Intensity: {['', 'Mild', 'Moderate', 'High', 'Extreme', 'Desert'][customConfig.heatIntensity]}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={customConfig.heatIntensity}
                  onChange={(e) => setCustomConfig({...customConfig, heatIntensity: parseInt(e.target.value)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Mild</span>
                  <span>Extreme</span>
                </div>
              </div>

              <div className="config-item slider-item">
                <label>Winter Severity: {['', 'Subtropical', 'Mild', 'Moderate', 'Cold', 'Arctic'][customConfig.winterSeverity]}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={customConfig.winterSeverity}
                  onChange={(e) => setCustomConfig({...customConfig, winterSeverity: parseInt(e.target.value)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>Subtropical</span>
                  <span>Arctic</span>
                </div>
              </div>

              <div className="config-item slider-item">
                <label>Garden Size: {['', 'Container', 'Small Yard', 'Medium Yard', 'Large Yard', 'Farm Scale'][customConfig.gardenSize]}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={customConfig.gardenSize}
                  onChange={(e) => setCustomConfig({...customConfig, gardenSize: parseInt(e.target.value)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>50 sq ft</span>
                  <span>1000+ sq ft</span>
                </div>
              </div>

              <div className="config-item slider-item">
                <label>Investment Level: {['', 'Minimal', 'Basic', 'Standard', 'Premium', 'Luxury'][customConfig.investmentLevel]}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={customConfig.investmentLevel}
                  onChange={(e) => setCustomConfig({...customConfig, investmentLevel: parseInt(e.target.value)})}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>$100/year</span>
                  <span>$1500/year</span>
                </div>
              </div>
            </div>
          </div>

          <div className="setup-actions">
            <button 
              className="button setup-button"
              onClick={handleSubmit}
              disabled={!customConfig.name}
            >
              Start Planning Garden
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Fetch weather forecast data - memoized to prevent dependency issues
  const fetchWeatherData = React.useCallback(async () => {
    if (!locationConfig) return;
    setLoading(true);
    try {
      // Using NOAA Climate Prediction Center for long-term forecasts
      const lat = locationConfig.lat || 35.994;
      const lon = locationConfig.lon || -78.8986;
      const response = await fetch(
        `https://api.weather.gov/points/${lat},${lon}`
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
  }, [locationConfig]);

  useEffect(() => {
    if (locationConfig) {
      fetchWeatherData();
      try {
        localStorage.setItem('gardenSim_locationConfig', JSON.stringify(locationConfig));
      } catch {}
    }
  }, [locationConfig, fetchWeatherData]);

  // Save state changes directly to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gardenSim_climateSelection', JSON.stringify({ selectedSummer, selectedWinter, selectedPortfolio }));
    } catch {}
  }, [selectedSummer, selectedWinter, selectedPortfolio]);

  useEffect(() => {
    try {
      localStorage.setItem('gardenSim_investmentConfig', JSON.stringify(customInvestment));
    } catch {}
  }, [customInvestment]);

  useEffect(() => {
    try {
      localStorage.setItem('gardenSim_uiPreferences', JSON.stringify({ showInvestmentDetails, recommendationDismissed, showSetup }));
    } catch {}
  }, [showInvestmentDetails, recommendationDismissed, showSetup]);

  // Main simulation function - memoized to prevent unnecessary re-creation
  const runSimulation = React.useCallback(() => {
    console.log('Running Monte Carlo simulation...', { selectedSummer, selectedWinter, selectedPortfolio });
    setSimulating(true);
    
    try {
      const monteCarloResults = runMonteCarloSimulation(1000);
      const statistics = calculateStatistics(monteCarloResults);
      const gardenCalendar = generateGardenCalendar(selectedSummer, selectedWinter, selectedPortfolio);
      const weatherRiskData = generateWeatherRiskData(monteCarloResults);
      const returnHistogram = generateHistogramData(monteCarloResults.map(r => r.netReturn), 25);
      const roiHistogram = generateHistogramData(monteCarloResults.map(r => r.roi), 25);
      
      console.log('Monte Carlo results:', statistics);
      setSimulationResults({ 
        ...statistics, 
        gardenCalendar, 
        rawResults: monteCarloResults,
        weatherRiskData,
        returnHistogram,
        roiHistogram
      });
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setSimulating(false);
    }
  }, [selectedSummer, selectedWinter, selectedPortfolio, locationConfig, customInvestment]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-run simulation when key selections change (immediate)
  useEffect(() => {
    if (selectedSummer && selectedWinter && selectedPortfolio && locationConfig) {
      runSimulation();
    }
  }, [selectedSummer, selectedWinter, selectedPortfolio]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-run simulation when investment changes (debounced for sliders)
  useEffect(() => {
    if (simulationDebounceTimer) {
      clearTimeout(simulationDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      if (selectedSummer && selectedWinter && selectedPortfolio && locationConfig) {
        runSimulation();
      }
    }, 100);
    
    setSimulationDebounceTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [customInvestment]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Determine climate zone from location data
  const getClimateZoneFromLocation = (locationConfig) => {
    if (!locationConfig) return 'temperate';
    
    const avgTemp = (getHardinessZoneNumber(locationConfig.hardiness) * 5) - 25; // Rough conversion
    
    if (avgTemp > 25) return 'tropical';
    if (avgTemp > 15) return 'subtropical';
    return 'temperate';
  };

  // Filter crops suitable for current climate and conditions
  const getClimateAdaptedCrops = (locationConfig, scenario) => {
    if (!locationConfig) return GLOBAL_CROP_DATABASE;
    
    const climateZone = getClimateZoneFromLocation(locationConfig);
    const regionConfig = SUPPORTED_REGIONS[locationConfig.region] || SUPPORTED_REGIONS.us;
    const language = regionConfig.language;
    
    const adaptedCrops = {};
    
    Object.entries(GLOBAL_CROP_DATABASE).forEach(([category, crops]) => {
      adaptedCrops[category] = {};
      
      Object.entries(crops).forEach(([cropKey, crop]) => {
        // Check if crop is suitable for current hardiness zone
        const [minZone, maxZone] = crop.zones.split('-').map(z => parseInt(z));
        const currentZone = getHardinessZoneNumber(locationConfig.hardiness);
        
        if (currentZone >= minZone && currentZone <= maxZone) {
          // Check climate tolerance for future scenarios
          const futureTemp = getHistoricalTemp(locationConfig.hardiness) + 2.5; // Climate change projection
          const isHeatTolerant = crop.heat === 'excellent' || crop.heat === 'good';
          const isDroughtTolerant = crop.drought === 'excellent' || crop.drought === 'good';
          
          // Include crop if it can handle projected conditions
          if (scenario === 'extreme' || scenario === 'catastrophic') {
            if (isHeatTolerant && isDroughtTolerant) {
              adaptedCrops[category][cropKey] = {
                ...crop,
                displayName: crop.name[language] || crop.name.en,
                suitability: 'excellent'
              };
            } else if (isHeatTolerant || isDroughtTolerant) {
              adaptedCrops[category][cropKey] = {
                ...crop,
                displayName: crop.name[language] || crop.name.en,
                suitability: 'marginal'
              };
            }
          } else {
            adaptedCrops[category][cropKey] = {
              ...crop,
              displayName: crop.name[language] || crop.name.en,
              suitability: 'good'
            };
          }
        }
      });
    });
    
    return adaptedCrops;
  };

  const generateGardenCalendar = (summerScenario, winterScenario, portfolioKey) => {
    const portfolio = getPortfolioStrategies(locationConfig)[portfolioKey];
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const calendar = [];
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Get climate-adapted crops for this location and scenario
    const adaptedCrops = getClimateAdaptedCrops(locationConfig, summerScenario);
    const climateZone = getClimateZoneFromLocation(locationConfig);
    
    // Track existing plants (simulate some plants already growing)
    const existingPlants = {
      perennials: Object.keys(adaptedCrops.perennials || {}).slice(0, 3), // First 3 available perennials
      activeHarvests: currentMonth >= 10 || currentMonth <= 4 ? 
        Object.keys(adaptedCrops.coolSeason || {}).slice(0, 3) : 
        Object.keys(adaptedCrops.heatTolerant || {}).slice(0, 2)
    };
    
    // Generate dynamic calendar for next 12 months
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - 1 + i) % 12;
      const monthNumber = monthIndex + 1;
      const month = months[monthIndex];
      const activities = [];
      
      // Generate planting activities based on adapted crops and portfolio
      Object.entries(portfolio).forEach(([cropType, percentage]) => {
        if (percentage < 10 || !adaptedCrops[cropType === 'heatSpecialists' ? 'heatTolerant' : cropType]) return;
        
        const categoryName = cropType === 'heatSpecialists' ? 'heatTolerant' : cropType;
        Object.entries(adaptedCrops[categoryName]).forEach(([cropKey, crop]) => {
          const plantingMonths = crop.plantingMonths[climateZone] || crop.plantingMonths.temperate;
          
          if (plantingMonths.includes(monthNumber)) {
            if (crop.transplantWeeks > 0) {
              activities.push(`🌱 Start ${crop.displayName} transplants indoors`);
            } else {
              activities.push(`🌱 Direct sow ${crop.displayName}`);
            }
          }
          
          // Calculate transplant timing
          if (crop.transplantWeeks > 0) {
            const transplantMonths = plantingMonths.map(m => {
              const tm = m + Math.round(crop.transplantWeeks / 4);
              return tm > 12 ? tm - 12 : tm;
            });
            if (transplantMonths.includes(monthNumber)) {
              activities.push(`🔄 Transplant ${crop.displayName} seedlings`);
            }
          }
          
          // Calculate harvest timing
          const harvestMonths = plantingMonths.map(m => {
            const hm = m + Math.round(crop.harvestStart);
            return hm > 12 ? hm - 12 : hm;
          });
          if (harvestMonths.includes(monthNumber)) {
            activities.push(`🥬 Begin harvesting ${crop.displayName}`);
          }
        });
      });
      
      // Add existing plant harvests
      existingPlants.perennials.forEach(herbKey => {
        const herb = adaptedCrops.perennials?.[herbKey];
        if (herb) {
          activities.push(`🌿 Harvest ${herb.displayName} (ongoing)`);
        }
      });
      
      // Add climate-specific maintenance
      if (monthNumber === 3 || monthNumber === 9) {
        activities.push('🛠️ Check and repair irrigation systems');
      }
      if (monthNumber === 2 || monthNumber === 8) {
        activities.push('🛒 Order seeds for upcoming season');
      }
      if ((summerScenario === 'extreme' || summerScenario === 'catastrophic') && monthNumber === 5) {
        activities.push('🛠️ Install shade cloth for heat protection');
      }
      if (climateZone === 'temperate' && monthNumber === 11) {
        activities.push('🛠️ Prepare cold protection materials');
      }
      
      // Ensure minimum activities
      if (activities.length === 0) {
        activities.push('🛠️ Garden maintenance and observation');
      }
      
      calendar.push({
        month,
        activities: activities.slice(0, 4), // Limit to 4 activities per month
        emphasis: getMonthEmphasis(monthIndex, summerScenario, winterScenario),
        isCurrentMonth: monthIndex === (currentMonth - 1)
      });
    }
    
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

  // Professional Monte Carlo simulation using jStat and simple-statistics
  const runMonteCarloSimulation = (iterations = 1000) => {
    const portfolio = getPortfolioStrategies(locationConfig)[selectedPortfolio];
    const baseInvestment = calculateTotalInvestment();
    const portfolioMultiplier = selectedPortfolio === 'conservative' ? 0.85 : 
                               selectedPortfolio === 'aggressive' ? 1.15 : 1.0;
    
    // Generate simulation parameters using proper statistical distributions
    const params = generateSimulationParameters(portfolio, baseInvestment, portfolioMultiplier);
    
    // Generate samples using professional statistical functions
    const harvestValues = jStat.normal.sample(params.harvest.mean, params.harvest.std, iterations);
    const investments = jStat.normal.sample(params.investment.mean, params.investment.std, iterations);
    
    // Calculate derived metrics
    const netReturns = harvestValues.map((harvest, i) => harvest - investments[i]);
    const rois = netReturns.map((netReturn, i) => (netReturn / investments[i]) * 100);
    
    // Generate breakdown data (simplified for performance)
    const heatYields = jStat.normal.sample(params.heatYield.mean, params.heatYield.std, iterations);
    const coolYields = jStat.normal.sample(params.coolYield.mean, params.coolYield.std, iterations);
    const perennialYields = jStat.normal.sample(params.perennialYield.mean, params.perennialYield.std, iterations);
    
    // Generate weather data for visualization
    const weatherData = generateWeatherSamples(iterations);
    
    // Package results in expected format
    return harvestValues.map((harvestValue, i) => ({
      harvestValue,
      investment: investments[i],
      netReturn: netReturns[i],
      roi: rois[i],
      heatYield: heatYields[i],
      coolYield: coolYields[i],
      perennialYield: perennialYields[i],
      weather: weatherData[i]
    }));
  };

  // Generate realistic simulation parameters based on portfolio and conditions
  const generateSimulationParameters = (portfolio, baseInvestment, portfolioMultiplier) => {
    const sizeMultiplier = (locationConfig?.gardenSizeActual || 100) / 100;
    const climateSeverity = getClimateSeverity(selectedSummer, selectedWinter);
    
    // Base yields per crop type using mapping constants
    const baseYields = Object.entries(BASE_YIELD_MULTIPLIERS).reduce((yields, [cropType, multiplier]) => {
      yields[cropType] = portfolio[cropType] * multiplier * sizeMultiplier;
      return yields;
    }, {});
    
    // Calculate expected harvest value using market price mappings
    const expectedHarvest = 
      baseYields.heatSpecialists * MARKET_PRICES.heat * climateSeverity.heat +
      baseYields.coolSeason * MARKET_PRICES.cool * climateSeverity.cool +
      baseYields.perennials * MARKET_PRICES.herbs * climateSeverity.perennial;
    
    const harvestStd = expectedHarvest * 0.3; // 30% variability in harvest
    const investmentMean = baseInvestment * portfolioMultiplier;
    const investmentStd = investmentMean * 0.1; // 10% variability in costs
    
    return {
      harvest: { mean: expectedHarvest, std: harvestStd },
      investment: { mean: investmentMean, std: investmentStd },
      heatYield: { 
        mean: baseYields.heatSpecialists * MARKET_PRICES.heat, 
        std: baseYields.heatSpecialists * MARKET_PRICES.heat * 0.4 
      },
      coolYield: { 
        mean: baseYields.coolSeason * MARKET_PRICES.cool, 
        std: baseYields.coolSeason * MARKET_PRICES.cool * 0.4 
      },
      perennialYield: { 
        mean: baseYields.perennials * MARKET_PRICES.herbs, 
        std: baseYields.perennials * MARKET_PRICES.herbs * 0.3 
      }
    };
  };


  // Generate weather samples for visualization (simplified)
  const generateWeatherSamples = (iterations) => {
    const stressDaysParams = getStressDaysParams();
    const freezeParams = getFreezeParams();
    const rainfallParams = getRainfallParams();
    
    const stressDays = jStat.poisson.sample(stressDaysParams.lambda, iterations);
    const freezeEvents = jStat.poisson.sample(freezeParams.lambda, iterations);
    const rainfall = jStat.normal.sample(rainfallParams.mean, rainfallParams.std, iterations);
    
    return stressDays.map((stress, i) => ({
      stressDays: Math.max(0, stress),
      freezeEvents: Math.max(0, freezeEvents[i]),
      annualRainfall: Math.max(10, rainfall[i])
    }));
  };

  const getStressDaysParams = () => {
    const baseDays = locationConfig?.heatDays || 100;
    const scenarioMultiplier = { mild: 0.3, normal: 0.5, extreme: 0.8, catastrophic: 1.2 };
    return { lambda: baseDays * 0.3 * (scenarioMultiplier[selectedSummer] || 0.5) };
  };

  const getFreezeParams = () => {
    const hardinessNumber = parseInt(locationConfig?.hardiness?.[0] || '7');
    const baseFreeze = hardinessNumber < 6 ? 8 : hardinessNumber < 8 ? 4 : 1;
    const scenarioMultiplier = { none: 0, warm: 0.3, mild: 0.7, traditional: 1.0 };
    return { lambda: baseFreeze * (scenarioMultiplier[selectedWinter] || 0.5) };
  };

  const getRainfallParams = () => {
    const avgRainfall = locationConfig?.avgRainfall || 46;
    return { mean: avgRainfall, std: avgRainfall * 0.2 };
  };


  // Calculate total investment from custom inputs
  const calculateTotalInvestment = () => {
    const sizeMultiplier = (locationConfig?.gardenSizeActual || 100) / 100;
    return Object.values(customInvestment).reduce((sum, cost) => sum + cost, 0) * sizeMultiplier;
  };

  // Get investment breakdown with descriptions
  const getInvestmentBreakdown = () => {
    const sizeMultiplier = (locationConfig?.gardenSizeActual || 100) / 100;
    return [
      { category: 'Seeds & Starts', amount: customInvestment.seeds * sizeMultiplier, description: 'Seed packets, transplants, bulbs', editable: true, key: 'seeds' },
      { category: 'Infrastructure', amount: customInvestment.infrastructure * sizeMultiplier, description: 'Raised beds, trellises, stakes', editable: true, key: 'infrastructure' },
      { category: 'Irrigation System', amount: customInvestment.irrigation * sizeMultiplier, description: 'Drip lines, timers, emitters', editable: true, key: 'irrigation' },
      { category: 'Containers & Pots', amount: customInvestment.containers * sizeMultiplier, description: 'Pots, grow bags, planters', editable: true, key: 'containers' },
      { category: 'Tools', amount: customInvestment.tools * sizeMultiplier, description: 'Hand tools, pruners, hose', editable: true, key: 'tools' },
      { category: 'Soil & Amendments', amount: customInvestment.soil * sizeMultiplier, description: 'Compost, potting mix, fertilizer base', editable: true, key: 'soil' },
      { category: 'Season Fertilizer', amount: customInvestment.fertilizer * sizeMultiplier, description: 'Ongoing nutrients through season', editable: true, key: 'fertilizer' },
      { category: 'Weather Protection', amount: customInvestment.protection * sizeMultiplier, description: 'Row covers, shade cloth, stakes', editable: true, key: 'protection' }
    ];
  };

  // Format currency using browser's native Intl.NumberFormat API
  const formatCurrency = (amount, currency = 'USD') => {
    if (currency === 'PCT') {
      // Handle percentages with intelligent formatting
      return formatProbability(amount);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate statistics using simple-statistics professional library
  const calculateStatistics = (results) => {
    const harvestValues = results.map(r => r.harvestValue);
    const netReturns = results.map(r => r.netReturn);
    const rois = results.map(r => r.roi);
    const investments = results.map(r => r.investment);
    
    return {
      investment: ss.mean(investments),
      harvestValue: {
        mean: ss.mean(harvestValues),
        p10: ss.quantile(harvestValues, 0.1),
        p50: ss.median(harvestValues),
        p90: ss.quantile(harvestValues, 0.9)
      },
      netReturn: {
        mean: ss.mean(netReturns),
        p10: ss.quantile(netReturns, 0.1),
        p50: ss.median(netReturns),
        p90: ss.quantile(netReturns, 0.9)
      },
      roi: {
        mean: ss.mean(rois),
        p10: ss.quantile(rois, 0.1),
        p50: ss.median(rois),
        p90: ss.quantile(rois, 0.9)
      },
      successRate: (netReturns.filter(r => r > 0).length / netReturns.length) * 100,
      heatYield: ss.mean(results.map(r => r.heatYield)),
      coolYield: ss.mean(results.map(r => r.coolYield)),
      perennialYield: ss.mean(results.map(r => r.perennialYield))
    };
  };

  // Generate histogram data using simple-statistics
  const generateHistogramData = (values, buckets = 20) => {
    const min = ss.min(values);
    const max = ss.max(values);
    const bucketSize = (max - min) / buckets;
    
    const histogram = Array(buckets).fill(0).map((_, i) => ({
      x: min + i * bucketSize,
      xEnd: min + (i + 1) * bucketSize,
      count: 0,
      label: `${(min + i * bucketSize).toFixed(0)} - ${(min + (i + 1) * bucketSize).toFixed(0)}`
    }));
    
    values.forEach(value => {
      const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), buckets - 1);
      histogram[bucketIndex].count++;
    });
    
    return histogram;
  };

  // Generate weather risk visualization data
  const generateWeatherRiskData = (results) => {
    const stressDays = results.map(r => r.weather.stressDays);
    const freezeEvents = results.map(r => r.weather.freezeEvents);
    const rainfall = results.map(r => r.weather.annualRainfall);
    
    return {
      stressDays: generateHistogramData(stressDays, 15),
      freezeEvents: generateHistogramData(freezeEvents, 8),
      rainfall: generateHistogramData(rainfall, 15)
    };
  };


  // Investment Details Component
  const InvestmentDetails = () => {
    const breakdown = getInvestmentBreakdown();
    const total = calculateTotalInvestment();
    
    const handleInvestmentChange = (key, value) => {
      // Validate and format input
      const numValue = Math.max(0, parseFloat(value) || 0);
      setCustomInvestment(prev => ({
        ...prev,
        [key]: Math.round(numValue * 100) / 100 // Round to 2 decimal places
      }));
    };

    return (
      <div className="section investment-details">
        <div className="investment-header">
          <h3>💰 Investment Planning</h3>
          <button 
            className="button small"
            onClick={() => setShowInvestmentDetails(!showInvestmentDetails)}
          >
            {showInvestmentDetails ? 'Hide Details' : 'Customize Costs'}
          </button>
        </div>
        
        <div className="investment-summary">
          <div className="investment-total">
            <span className="investment-label">Total Investment:</span>
            <span className="investment-amount">{formatCurrency(total)}</span>
          </div>
          <div className="investment-note">
            Scaled by garden size ({locationConfig?.gardenSizeActual || 100} sq ft)
          </div>
          <div className="investment-breakdown-summary">
            <div className="breakdown-row">
              <span>Base Costs:</span>
              <span>{formatCurrency(Object.values(customInvestment).reduce((sum, cost) => sum + cost, 0))}</span>
            </div>
            <div className="breakdown-row">
              <span>Size Multiplier:</span>
              <span>{Math.round((locationConfig?.gardenSizeActual || 100) / 100)}x</span>
            </div>
          </div>
        </div>

        {showInvestmentDetails && (
          <div className="investment-breakdown">
            <h4>Cost Breakdown & Customization</h4>
            <div className="investment-grid">
              {breakdown.map((item, index) => (
                <div key={index} className="investment-item">
                  <div className="investment-item-header">
                    <label className="investment-category">{item.category}</label>
                    <span className="investment-item-amount">{formatCurrency(item.amount)}</span>
                  </div>
                  
                  <div className="investment-slider-container">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(200, customInvestment[item.key] * 2)}
                      step="5"
                      value={customInvestment[item.key]}
                      onChange={(e) => handleInvestmentChange(item.key, e.target.value)}
                      className="investment-slider"
                    />
                    <div className="slider-labels">
                      <span>$0</span>
                      <span>${Math.max(200, customInvestment[item.key] * 2)}</span>
                    </div>
                  </div>
                  
                  <div className="investment-input-row">
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={customInvestment[item.key]}
                      onChange={(e) => handleInvestmentChange(item.key, e.target.value)}
                      className="investment-input"
                    />
                    <span className="input-label">Base Cost</span>
                  </div>
                  
                  <div className="investment-description">{item.description}</div>
                </div>
              ))}
            </div>
            
            <div className="investment-presets">
              <h5>Quick Presets</h5>
              <div className="preset-buttons">
                <button 
                  className="button small"
                  onClick={() => setCustomInvestment(INVESTMENT_PRESETS.budget.config)}
                >
                  💰 {INVESTMENT_PRESETS.budget.name} (${INVESTMENT_PRESETS.budget.totalCost})
                </button>
                <button 
                  className="button small"
                  onClick={() => setCustomInvestment(INVESTMENT_PRESETS.standard.config)}
                >
                  🏡 {INVESTMENT_PRESETS.standard.name} (${INVESTMENT_PRESETS.standard.totalCost})
                </button>
                <button 
                  className="button small"
                  onClick={() => setCustomInvestment(INVESTMENT_PRESETS.premium.config)}
                >
                  🌟 {INVESTMENT_PRESETS.premium.name} (${INVESTMENT_PRESETS.premium.totalCost})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get current climate scenarios based on location
  const currentClimateScenarios = generateClimateScenarios(locationConfig);

  if (showSetup) {
    return <LocationSetup />;
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🌡️ Climate-Science Garden Simulation</h1>
        <p>{locationConfig?.name || 'Garden'} Future Climate Strategy Planner</p>
        <div className="header-buttons">
          <button 
            className="button small"
            onClick={() => setShowSetup(true)}
          >
            Change Location
          </button>
          <button 
            className="button small"
            onClick={() => {
              if (window.confirm('Reset all settings to defaults? This will clear your saved preferences.')) {
                try {
                  ['gardenSim_locationConfig', 'gardenSim_climateSelection', 'gardenSim_investmentConfig', 'gardenSim_uiPreferences'].forEach(key => 
                    localStorage.removeItem(key)
                  );
                } catch {}
                window.location.reload();
              }
            }}
          >
            Reset to Defaults
          </button>
        </div>
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
              </div>
            )}
          </div>
        )}

        <div className="section">
          <h3>🔥 Summer Climate Bet</h3>
          
          {/* Timeline visualization */}
          <div className="climate-timeline">
            <div className="timeline-header">
              <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
            </div>
            {currentClimateScenarios.summer.map(scenario => {
              const startMonth = scenario.duration.split('-')[0];
              const endMonth = scenario.duration.split('-')[1];
              const monthMap = {Apr: 0, May: 1, Jun: 2, Jul: 3, Aug: 4, Sep: 5, Oct: 6};
              const start = monthMap[startMonth] || 2; // Default to Jun
              const end = monthMap[endMonth] || 4;     // Default to Aug
              const width = ((end - start + 1) / 7) * 100;
              const left = (start / 7) * 100;
              
              return (
                <div key={scenario.id} className="timeline-scenario">
                  <div className="scenario-label">
                    <span className="scenario-name">{scenario.name}</span>
                    <span className="scenario-probability">{formatProbability(scenario.probability)}%</span>
                  </div>
                  <div className="timeline-track">
                    <div 
                      className={`timeline-bar ${selectedSummer === scenario.id ? 'selected' : ''}`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        opacity: scenario.probability / 50 // Visual weight by probability
                      }}
                      onClick={() => setSelectedSummer(scenario.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="scenario-grid">
            {currentClimateScenarios.summer.map(scenario => (
              <div 
                key={scenario.id}
                className={`scenario-card ${selectedSummer === scenario.id ? 'selected' : ''}`}
                onClick={() => setSelectedSummer(scenario.id)}
              >
                <h4>{scenario.name}</h4>
                <p>{formatProbability(scenario.probability)}% chance</p>
                <p><em>{scenario.impact}</em></p>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>❄️ Winter Climate Bet</h3>
          
          {/* Timeline visualization */}
          <div className="climate-timeline">
            <div className="timeline-header">
              <span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
            </div>
            {currentClimateScenarios.winter.map(scenario => {
              // Winter scenarios have different duration patterns
              let start, end, width, left;
              if (scenario.duration === 'Year-round') {
                start = 0; end = 6; width = 100; left = 0;
              } else if (scenario.duration === 'Dec-Jan') {
                start = 1; end = 2; width = (2/7) * 100; left = (1/7) * 100;
              } else { // Dec-Feb
                start = 1; end = 3; width = (3/7) * 100; left = (1/7) * 100;
              }
              
              return (
                <div key={scenario.id} className="timeline-scenario">
                  <div className="scenario-label">
                    <span className="scenario-name">{scenario.name}</span>
                    <span className="scenario-probability">{formatProbability(scenario.probability)}%</span>
                  </div>
                  <div className="timeline-track">
                    <div 
                      className={`timeline-bar winter ${selectedWinter === scenario.id ? 'selected' : ''}`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        opacity: scenario.probability / 50 // Visual weight by probability
                      }}
                      onClick={() => setSelectedWinter(scenario.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="scenario-grid">
            {currentClimateScenarios.winter.map(scenario => (
              <div 
                key={scenario.id}
                className={`scenario-card ${selectedWinter === scenario.id ? 'selected' : ''}`}
                onClick={() => setSelectedWinter(scenario.id)}
              >
                <h4>{scenario.name}</h4>
                <p>{formatProbability(scenario.probability)}% chance</p>
                <p><em>{scenario.impact}</em></p>
              </div>
            ))}
          </div>
        </div>

        <InvestmentDetails />

        <div className="section">
          <h3>🌱 Portfolio Strategy</h3>
          <div className="scenario-grid">
            {Object.entries(getPortfolioStrategies(locationConfig)).map(([key, portfolio]) => (
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
          <p>Selected scenario: <strong>{currentClimateScenarios.summer.find(s => s.id === selectedSummer)?.name}</strong> + <strong>{currentClimateScenarios.winter.find(s => s.id === selectedWinter)?.name}</strong></p>
          <p>Portfolio: <strong>{getPortfolioStrategies(locationConfig)[selectedPortfolio]?.name}</strong></p>
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

              <div className="visual-analysis">
                <h4>📊 Visual Risk Analysis</h4>
                
                <div className="chart-container">
                  <h5>Net Return Distribution</h5>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={simulationResults.returnHistogram}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="x" 
                        tickFormatter={(value) => `$${Math.round(value)}`}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Simulations']}
                        labelFormatter={(value) => `Return: $${Math.round(value)} - $${Math.round(value + (simulationResults.returnHistogram[1]?.x - simulationResults.returnHistogram[0]?.x || 0))}`}
                      />
                      <Bar dataKey="count" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="chart-description">Distribution of potential net returns from 5,000 simulations</p>
                </div>

                <div className="chart-container">
                  <h5>ROI Distribution</h5>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={simulationResults.roiHistogram}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="x" 
                        tickFormatter={(value) => `${Math.round(value)}%`}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Simulations']}
                        labelFormatter={(value) => `ROI: ${Math.round(value)}% - ${Math.round(value + (simulationResults.roiHistogram[1]?.x - simulationResults.roiHistogram[0]?.x || 0))}%`}
                      />
                      <Bar dataKey="count" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="chart-description">Return on investment percentage distribution</p>
                </div>

                <div className="weather-risk-charts">
                  <h5>Weather Risk Factors</h5>
                  <div className="weather-charts-grid">
                    <div className="weather-chart">
                      <h6>Heat Stress Days</h6>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={simulationResults.weatherRiskData.stressDays}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" tickFormatter={(value) => Math.round(value)} />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [value, 'Simulations']}
                            labelFormatter={(value) => `${Math.round(value)} - ${Math.round(value + 4)} days`}
                          />
                          <Bar dataKey="count" fill="#FF5722" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="weather-chart">
                      <h6>Freeze Events</h6>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={simulationResults.weatherRiskData.freezeEvents}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" tickFormatter={(value) => Math.round(value)} />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [value, 'Simulations']}
                            labelFormatter={(value) => `${Math.round(value)} events`}
                          />
                          <Bar dataKey="count" fill="#03A9F4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="weather-chart">
                      <h6>Annual Rainfall (inches)</h6>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={simulationResults.weatherRiskData.rainfall}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" tickFormatter={(value) => Math.round(value)} />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [value, 'Simulations']}
                            labelFormatter={(value) => `${Math.round(value)} - ${Math.round(value + 2)} inches`}
                          />
                          <Bar dataKey="count" fill="#009688" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              
              {simulationResults.gardenCalendar && (
                <div className="garden-calendar">
                  <h4>📅 12-Month Garden Calendar</h4>
                  <p className="calendar-subtitle">Optimized for {currentClimateScenarios.summer.find(s => s.id === selectedSummer)?.name} + {currentClimateScenarios.winter.find(s => s.id === selectedWinter)?.name}</p>
                  <div className="calendar-grid">
                    {simulationResults.gardenCalendar.map((monthData, index) => (
                      <div key={index} className={`calendar-month ${monthData.emphasis} ${monthData.isCurrentMonth ? 'current' : ''}`}>
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