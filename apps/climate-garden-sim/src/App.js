import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  formatPercentage,
  formatProbability,
  generateMonthlyFocus,
  generateSuccessOutlook,
  generateTopCropRecommendations,
  generateWeeklyActions,
  generateInvestmentPriority,
  generateSiteSpecificRecommendations
} from './config.js';

// New modular imports
import { BASE_CLIMATE_SCENARIOS, generateLocationSpecificScenarios } from './data/climateScenarios.js';
import { getPortfolioStrategies, createCustomPortfolio, validatePortfolioAllocations } from './data/portfolioStrategies.js';
import { useSimulation } from './hooks/useSimulation.js';
import { useClimateSelection, useLocationConfig, useInvestmentConfig, useUIPreferences } from './hooks/useLocalStorage.js';
import LocationSetup from './components/LocationSetup.js';
import { generateGardenCalendar } from './services/gardenCalendar.js';
import './index.css';

function App() {
  // Use custom hooks for state management
  const {
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    setSelectedSummer,
    setSelectedWinter,
    setSelectedPortfolio
  } = useClimateSelection();

  const [locationConfig, setLocationConfig] = useLocationConfig();
  const [customInvestment, setCustomInvestment] = useInvestmentConfig();
  const { showSetup, setShowSetup } = useUIPreferences();

  // Custom portfolio state (not persisted by default)
  const [customPortfolio, setCustomPortfolio] = useState(null);
  
  // Use simulation hook
  const { simulationResults, simulating, triggerSimulation, totalInvestment } = useSimulation(
    selectedSummer,
    selectedWinter,
    selectedPortfolio,
    locationConfig,
    customPortfolio,
    customInvestment
  );

  // Get current climate scenarios based on location
  const currentClimateScenarios = generateLocationSpecificScenarios(locationConfig);
  
  // Get current portfolio strategies
  const portfolioStrategies = getPortfolioStrategies(locationConfig, customPortfolio);

  // Handle location setup completion
  const handleLocationSetupComplete = (newConfig) => {
    setLocationConfig(newConfig);
    setShowSetup(false);
  };

  // Handle custom portfolio changes
  const handleCustomPortfolioChange = (allocations) => {
    if (validatePortfolioAllocations(allocations)) {
      const portfolio = createCustomPortfolio(null, allocations);
      setCustomPortfolio(portfolio);
      setSelectedPortfolio('custom');
    }
  };

  // Show setup screen if needed
  if (showSetup) {
    return (
      <LocationSetup 
        onConfigUpdate={setLocationConfig}
        onComplete={handleLocationSetupComplete}
      />
    );
  }

  // Generate enhanced recommendations if simulation results are available
  const monthlyFocus = simulationResults ? generateMonthlyFocus(locationConfig, portfolioStrategies[selectedPortfolio], simulationResults) : '';
  const weeklyActions = generateWeeklyActions(locationConfig, portfolioStrategies[selectedPortfolio]);
  const successOutlook = simulationResults ? generateSuccessOutlook(simulationResults, locationConfig) : '';
  const investmentPriority = generateInvestmentPriority(customInvestment);
  const topCropRecommendations = generateTopCropRecommendations(locationConfig, portfolioStrategies[selectedPortfolio]);
  const siteSpecificRecommendations = generateSiteSpecificRecommendations(locationConfig);
  const gardenCalendar = generateGardenCalendar(selectedSummer, selectedWinter, selectedPortfolio, locationConfig, customPortfolio);

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="app-title">🌱 Climate Garden Simulation</h1>
            <p className="app-subtitle">Science-based garden planning for {locationConfig.name}</p>
          </div>
          <div className="header-actions">
            <button 
              className="button small setup-button"
              onClick={() => setShowSetup(true)}
            >
              ⚙️ Setup
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Climate Scenarios Section */}
        <section className="scenario-section">
          <h2>Climate Scenarios</h2>
          <div className="scenario-grid">
            <div className="scenario-column">
              <h3>Summer Heat</h3>
              {currentClimateScenarios.summer.map(scenario => (
                <button
                  key={scenario.id}
                  className={`scenario-button ${selectedSummer === scenario.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSummer(scenario.id)}
                >
                  <div className="scenario-header">
                    <strong>{scenario.name}</strong>
                    <span className="probability">{formatProbability(scenario.probability)}</span>
                  </div>
                  <div className="scenario-details">
                    <div>{scenario.temp}</div>
                    <div>{scenario.duration}</div>
                    <div className="impact">{scenario.impact}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="scenario-column">
              <h3>Winter Cold</h3>
              {currentClimateScenarios.winter.map(scenario => (
                <button
                  key={scenario.id}
                  className={`scenario-button ${selectedWinter === scenario.id ? 'selected' : ''}`}
                  onClick={() => setSelectedWinter(scenario.id)}
                >
                  <div className="scenario-header">
                    <strong>{scenario.name}</strong>
                    <span className="probability">{formatProbability(scenario.probability)}</span>
                  </div>
                  <div className="scenario-details">
                    <div>{scenario.temp}</div>
                    <div>{scenario.duration}</div>
                    <div className="impact">{scenario.impact}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Strategy Section */}
        <section className="portfolio-section">
          <h2>Portfolio Strategy</h2>
          <div className="portfolio-grid">
            {Object.entries(portfolioStrategies).map(([key, strategy]) => (
              <button
                key={key}
                className={`portfolio-button ${selectedPortfolio === key ? 'selected' : ''}`}
                onClick={() => setSelectedPortfolio(key)}
              >
                <strong>{strategy.name}</strong>
                <div className="portfolio-description">{strategy.description}</div>
                <div className="portfolio-allocations">
                  <div>Heat Crops: {strategy.heatSpecialists}%</div>
                  <div>Cool Crops: {strategy.coolSeason}%</div>
                  <div>Herbs: {strategy.perennials}%</div>
                  <div>Experimental: {strategy.experimental}%</div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Portfolio Builder */}
          {selectedPortfolio === 'custom' && (
            <div className="custom-portfolio">
              <h3>Custom Portfolio Builder</h3>
              <p>Adjust allocations to create your custom strategy:</p>
              {/* Custom portfolio controls would go here */}
            </div>
          )}
        </section>

        {/* Simulation Results */}
        {simulationResults && (
          <section className="results-section">
            <h2>Simulation Results</h2>
            
            {simulating && (
              <div className="simulation-spinner">
                <div className="spinner"></div>
                <span>Running Monte Carlo simulation...</span>
              </div>
            )}

            <div className="results-grid">
              {/* Key Metrics */}
              <div className="metric-card">
                <h3>Expected Net Return</h3>
                <div className="metric-value">${simulationResults.mean?.toFixed(0) || '0'}</div>
                <div className="metric-range">
                  Range: ${simulationResults.percentiles?.p10?.toFixed(0) || '0'} - ${simulationResults.percentiles?.p90?.toFixed(0) || '0'}
                </div>
              </div>

              <div className="metric-card">
                <h3>Success Rate</h3>
                <div className="metric-value">{formatPercentage(simulationResults.successRate / 100)}</div>
                <div className="metric-desc">Probability of positive return</div>
              </div>

              <div className="metric-card">
                <h3>ROI</h3>
                <div className="metric-value">{simulationResults.roi?.mean?.toFixed(1) || '0'}%</div>
                <div className="metric-range">
                  Median: {simulationResults.roi?.median?.toFixed(1) || '0'}%
                </div>
              </div>

              <div className="metric-card">
                <h3>Total Investment</h3>
                <div className="metric-value">${totalInvestment}</div>
                <div className="metric-desc">Annual budget allocation</div>
              </div>
            </div>

            {/* Return Distribution Chart */}
            {simulationResults.returnHistogram && (
              <div className="chart-section">
                <h3>Return Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={simulationResults.returnHistogram}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tickFormatter={(value) => `$${value.toFixed(0)}`} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value} outcomes`, 'Count']}
                      labelFormatter={(value) => `Net Return: $${value.toFixed(0)}`}
                    />
                    <Bar dataKey="value" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="chart-description">Distribution of potential net returns from 1,000 simulations</p>
              </div>
            )}
          </section>
        )}

        {/* Garden Calendar */}
        {gardenCalendar && (
          <section className="calendar-section">
            <h2>Garden Calendar</h2>
            <div className="calendar-grid">
              {gardenCalendar.map((month, index) => (
                <div key={index} className="calendar-month">
                  <h3>{month.month}</h3>
                  <div className="month-activities">
                    {month.activities.map((activity, i) => (
                      <div key={i} className={`activity activity-${activity.type}`}>
                        <strong>{activity.crop}</strong>: {activity.action}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section className="recommendations-section">
          <h2>Smart Recommendations</h2>
          <div className="recommendations-grid">
            <div className="recommendation-card">
              <h3>This Month's Focus</h3>
              <p>{monthlyFocus}</p>
            </div>
            
            <div className="recommendation-card">
              <h3>Weekly Actions</h3>
              <p>{weeklyActions}</p>
            </div>
            
            <div className="recommendation-card">
              <h3>Success Outlook</h3>
              <p>{successOutlook}</p>
            </div>
            
            <div className="recommendation-card">
              <h3>Investment Priority</h3>
              <p>{investmentPriority}</p>
            </div>
            
            <div className="recommendation-card">
              <h3>Top Crop Recommendations</h3>
              <p>{topCropRecommendations}</p>
            </div>
            
            <div className="recommendation-card">
              <h3>Site-Specific Tips</h3>
              <p>{siteSpecificRecommendations}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;