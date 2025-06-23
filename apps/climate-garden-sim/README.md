# Climate Garden Simulation

A comprehensive React application for climate-aware garden planning with Monte Carlo simulation, dynamic calendar generation, and global crop database integration.

## Current Features

- **Global Climate Database**: 15+ crop varieties with climate adaptations and multi-language support
- **Dynamic Location Support**: Multi-region presets (Durham NC, Phoenix AZ, Minneapolis MN, Seattle WA, Miami FL)
- **Advanced Portfolio Management**: Three adaptive strategies plus full granular customization
- **Monte Carlo Simulation**: Professional statistical modeling using jStat library (5,000 iterations)
- **12-Month Garden Calendar**: Dynamically generated planting, harvesting, and care schedules
- **Climate Timeline Visualization**: Interactive bars showing scenario overlap across growing seasons
- **Investment Tracking**: Detailed breakdown with customizable budget allocations
- **Real-time Validation**: Smart percentage formatting and allocation validation

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

1. **Location Setup**: Choose from preset locations or configure custom climate parameters
2. **Climate Scenarios**: Select from 4 summer and 4 winter climate predictions with visual timeline
3. **Portfolio Strategy**: Pick from three adaptive strategies or create custom allocations
4. **Investment Planning**: Adjust budget across 8 categories (seeds, irrigation, tools, etc.)
5. **Simulation Analysis**: Run Monte Carlo simulation to see probabilistic outcomes
6. **Garden Calendar**: Review month-by-month planting and harvesting schedule
7. **Risk Assessment**: Analyze success rates, worst-case scenarios, and confidence intervals

## Climate Scenarios

### Summer Options (with probability weights)
- **Mild Summer** (20%): 85-95°F, Jun-Aug, traditional crops survive
- **Normal Heat** (30%): 95-100°F, Jun-Sep, heat-adapted strategy works  
- **Extreme Heat** (40%): 100-107°F, May-Sep, current planning scenario
- **Catastrophic** (10%): 107°F+, Apr-Oct, only specialists survive

### Winter Options (with probability weights)
- **Traditional Winter** (15%): 20-30°F lows, Dec-Feb, need cold protection
- **Mild Winter** (35%): 30-40°F lows, Dec-Jan, extended cool season
- **Warm Winter** (40%): 40-50°F lows, Dec-Jan, current planning
- **No Winter** (10%): 50°F+ minimum, year-round growing

## Portfolio Strategies

### Preset Strategies (Climate-Adaptive)
- **Conservative Portfolio**: 60% success rate, adapted to local conditions
- **Aggressive Portfolio**: 80% upside potential, climate-optimized allocations
- **Hedge Portfolio**: 70% success rate, climate-balanced approach

### Custom Portfolio Builder
- **Granular Control**: Adjust four crop categories with interactive sliders
- **Real-time Validation**: Ensures allocations total 100% with visual feedback
- **Crop Categories**:
  - Heat-Tolerant Crops: Okra, hot peppers, amaranth, sweet potatoes
  - Cool-Season Crops: Kale, cabbage, lettuce, spinach, carrots
  - Perennial Herbs: Rosemary, thyme, oregano, mint
  - Experimental: New varieties and climate adaptation trials

## Economic Model

### Investment Categories (Fully Customizable)
- **Seeds**: $45-120 per season (variety-dependent)
- **Infrastructure**: $65-180 (drip irrigation, raised beds, trellises)  
- **Tools**: $25-75 (hand tools, wheelbarrow, pruners)
- **Soil**: $20-60 (compost, amendments, mulch)
- **Containers**: $35-100 (pots, grow bags, planters)
- **Irrigation**: $45-150 (timers, hoses, emitters)
- **Protection**: $15-45 (row covers, shade cloth, cages)
- **Fertilizer**: $20-50 (organic feeds, amendments)

### Market Values (Regional)
- **Heat Crops**: $1.20/lb premium for heat-adapted varieties
- **Cool Crops**: $0.80/lb baseline for traditional varieties  
- **Herbs**: $2.50/lb premium for fresh perennial herbs
- **Regional Multipliers**: 1.0-1.3x based on location (higher in urban areas)

### Statistical Modeling
- **Monte Carlo Simulation**: 5,000 iterations using proper statistical distributions
- **Weather Events**: Poisson distribution for heat stress and freeze probability
- **Harvest Variability**: Normal distribution reflecting real-world yield ranges
- **Risk Metrics**: Success rates, percentile ranges, worst-case scenarios

## Global Crop Database

### Heat-Tolerant Varieties
- **Okra** (Zones 6-11): Excellent drought/heat tolerance, 4-month harvest
- **Hot Peppers** (Zones 5-11): Excellent heat tolerance, 5-month harvest  
- **Amaranth Greens** (Zones 4-11): Excellent drought/heat/humidity tolerance
- **Sweet Potato** (Zones 6-11): Excellent drought/heat tolerance
- **Malabar Spinach** (Zones 7-11): Excellent heat/humidity tolerance

### Cool-Season Varieties  
- **Kale** (Zones 2-9): Poor heat tolerance, 4-month harvest
- **Cabbage** (Zones 1-9): Poor heat tolerance, 2-month harvest
- **Lettuce** (Zones 2-9): Poor heat/drought tolerance, 2-month harvest
- **Spinach** (Zones 2-9): Poor heat tolerance, 2-month harvest
- **Carrots** (Zones 3-10): Fair heat tolerance, 1-month harvest

### Perennial Herbs
- **Rosemary** (Zones 6-10): Excellent drought/heat tolerance, year-round harvest
- **Thyme** (Zones 4-9): Excellent drought tolerance, year-round harvest
- **Oregano** (Zones 4-10): Good drought/heat tolerance, year-round harvest
- **Mint** (Zones 3-9): Poor drought tolerance, excellent humidity tolerance

## Technology Stack

- **Frontend**: React 18 with hooks-based state management
- **Statistics**: jStat library for Monte Carlo simulation
- **Charting**: Recharts for data visualization
- **Styling**: CSS Grid and Flexbox for responsive design
- **Storage**: localStorage for configuration persistence
- **Build**: Create React App with fast refresh

## Project Architecture

### Key Files
- `src/App.js` - Main application component with simulation logic
- `src/config.js` - Consolidated configuration, crop database, and helper functions
- `src/index.css` - Complete styling including responsive design
- `restart.sh` - Development utility for clean server restarts

### Design Principles
- **Decision-Focused Interface**: Only show data that impacts decisions
- **Functional Programming**: Avoid mutation, prefer functional patterns
- **Performance Optimized**: Debounced simulations, efficient state management
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## Available Scripts

- `npm start` - Start development server with fast refresh
- `npm run dev` - Start development server with nodemon auto-restart (recommended)
- `npm run build` - Create production build  
- `npm test` - Run test suite
- `./restart.sh` - Kill existing server and start fresh (development utility)

## Current Status

This application represents a fully functional climate-aware garden planning system with:

✅ **Complete Feature Set**: All core functionality implemented and tested  
✅ **Professional Statistics**: Monte Carlo simulation with proper statistical modeling  
✅ **Global Adaptability**: Multi-region support with localized crop recommendations  
✅ **User Customization**: Granular control over all planning parameters  
✅ **Visual Analytics**: Interactive charts and timeline visualizations  
✅ **Persistent Storage**: Configuration saved between sessions  
✅ **Responsive Design**: Works across all device sizes  

### Recent Development Notes

**Data Architecture Discovery (2025-06-23)**:
- The application currently uses static crop data from `src/config.js` rather than the SQLite database
- Database stores planting months as JSON strings (`"[4, 5, 6]"`) while the app expects JavaScript arrays (`[4, 5, 6]`)
- Fixed `isPlantingSeasonValid` function to handle both static array data and JSON string data with proper error handling
- Development server stability improved using `nodemon` instead of custom solutions

**Server Stability**:
- Replaced custom development server with industry-standard `nodemon` for auto-restart functionality
- Use `npm run dev` for best development experience with automatic file watching and server restart

**Database vs Static Data**:
- SQLite database in `/database/plant_varieties.db` contains comprehensive crop data with regional planting schedules
- React app uses hardcoded `GLOBAL_CROP_DATABASE` for performance and simplicity
- Future integration would require JSON parsing of database strings and client-side database querying

### Future Enhancements
- Integration with weather APIs for live data
- Database-driven crop data instead of static configuration
- Additional crop varieties and regional adaptations
- Export functionality for garden calendars
- Social sharing of simulation results
- Advanced risk modeling for climate change scenarios

## Contributing

This project follows functional programming principles and emphasizes decision-focused interfaces. When adding features:

1. Ensure changes don't decrease maintainability or readability
2. Use the TodoWrite tool for planning complex changes
3. Run linting and formatting after code changes
4. Focus on data that impacts user decisions
5. Maintain the existing responsive design patterns

## License

This project is for educational and personal garden planning use.