import React, { useState } from 'react';
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

  const runSimulation = () => {
    const portfolio = portfolioStrategies[selectedPortfolio];
    const summerMultiplier = cropMultipliers.heatSpecialists[selectedSummer];
    const coolMultiplier = cropMultipliers.coolSeason[selectedSummer];
    const perennialMultiplier = cropMultipliers.perennials[selectedSummer];

    // Base investment
    const seedCost = 90; // Average of $75-105
    const infrastructure = selectedPortfolio === 'conservative' ? 60 : 110; // Drip irrigation
    const totalInvestment = seedCost + infrastructure;

    // Base harvest values (per percentage point of portfolio)
    const heatValue = 5; // $5 per percentage point
    const coolValue = 3; // $3 per percentage point  
    const perennialValue = 8; // $8 per percentage point (herbs are high value)

    // Calculate yields
    const heatYield = (portfolio.heatSpecialists * heatValue * summerMultiplier);
    const coolYield = (portfolio.coolSeason * coolValue * coolMultiplier);
    const perennialYield = (portfolio.perennials * perennialValue * perennialMultiplier);
    const totalHarvestValue = heatYield + coolYield + perennialYield;

    // Add some randomness (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4);
    const finalHarvestValue = Math.round(totalHarvestValue * randomFactor);

    const netReturn = finalHarvestValue - totalInvestment;
    const roi = Math.round((netReturn / totalInvestment) * 100);

    setSimulationResults({
      investment: totalInvestment,
      harvestValue: finalHarvestValue,
      netReturn,
      roi,
      heatYield: Math.round(heatYield * randomFactor),
      coolYield: Math.round(coolYield * randomFactor),
      perennialYield: Math.round(perennialYield * randomFactor)
    });
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🌡️ Climate Garden Simulation</h1>
        <p>Durham Heat-Adapted Garden Strategy Tester</p>
      </div>

      <div className="simulation-container">
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
          <h3>🎲 Run Simulation</h3>
          <p>Selected scenario: <strong>{climateScenarios.summer.find(s => s.id === selectedSummer)?.name}</strong> + <strong>{climateScenarios.winter.find(s => s.id === selectedWinter)?.name}</strong></p>
          <p>Portfolio: <strong>{portfolioStrategies[selectedPortfolio].name}</strong></p>
          <button className="button simulate" onClick={runSimulation}>
            🎯 Run Climate Simulation
          </button>
        </div>

        {simulationResults && (
          <div className="section results-section">
            <h3>📊 Simulation Results</h3>
            <div className="results-grid">
              <div className="result-card">
                <div className="result-value">${simulationResults.investment}</div>
                <div>Total Investment</div>
              </div>
              <div className="result-card">
                <div className="result-value">${simulationResults.harvestValue}</div>
                <div>Harvest Value</div>
              </div>
              <div className="result-card">
                <div className="result-value">${simulationResults.netReturn}</div>
                <div>Net Return</div>
              </div>
              <div className="result-card">
                <div className="result-value">{simulationResults.roi}%</div>
                <div>ROI</div>
              </div>
            </div>
            <div className="portfolio-section">
              <h4>Crop Performance Breakdown:</h4>
              <div className="crop-allocation">
                <div className="crop-item">
                  <div className="crop-percentage">${simulationResults.heatYield}</div>
                  <div>Heat Specialists</div>
                </div>
                <div className="crop-item">
                  <div className="crop-percentage">${simulationResults.coolYield}</div>
                  <div>Cool Season</div>
                </div>
                <div className="crop-item">
                  <div className="crop-percentage">${simulationResults.perennialYield}</div>
                  <div>Perennials</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;