# Climate Garden Simulation

A React app for testing climate scenarios and crop hedging strategies for your heat-adapted Durham garden.

## Features

- **Real Weather Data**: Live NOAA forecasts for Durham, NC with AI recommendations
- **Climate Betting**: Choose from 4 summer and 4 winter scenarios
- **Portfolio Strategies**: Conservative, Aggressive, or Hedge approaches
- **Economic Simulation**: Real investment tracking and ROI calculations
- **Interactive Results**: See how different crop allocations perform

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How to Use

1. **Review Weather Intelligence**: Check 14-day NOAA forecast and AI recommendations
2. **Select Climate Scenarios**: Click on summer and winter climate predictions
3. **Choose Portfolio Strategy**: Pick your crop allocation approach
4. **Run Simulation**: Click "Run Climate Simulation" to see results
5. **Analyze Results**: Review ROI, crop performance, and economic outcomes

## Scenarios

### Summer Climate Options
- **Mild Summer** (20%): 85-95°F, traditional crops might survive
- **Normal Heat** (30%): 95-100°F, heat-adapted strategy works
- **Extreme Heat** (40%): 100-107°F, current planning scenario
- **Catastrophic** (10%): 107°F+, only specialists survive

### Portfolio Strategies
- **Conservative**: 60% success rate, balanced approach
- **Aggressive**: High upside potential, higher risk
- **Hedge**: 70% success rate, diversified risk management

## Economic Model

Based on real costs:
- Seeds: $75-105 per season
- Infrastructure: $60-110 (drip irrigation)
- Market values: Herbs $15/oz, Peppers $4-6/lb, Greens $2-4/lb

The simulation includes randomness (±20%) to reflect real-world variability.

## Weather Data Sources

- **NOAA National Weather Service**: 14-day forecasts for Durham, NC (35.994°N, 78.899°W)
- **Climate Prediction Center**: Seasonal outlook data when available
- **Real-time Updates**: Fresh forecast data loaded on each session
- **AI Recommendations**: Algorithm analyzes forecast trends to suggest optimal climate scenarios