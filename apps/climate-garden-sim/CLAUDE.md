# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based climate-aware garden planning application with Monte Carlo simulation, SQLite database integration, and comprehensive crop recommendations for US/Canadian regions.

## Key Commands

### Development
```bash
npm run dev        # Start development server with auto-restart (preferred)
npm start          # Start basic development server  
npm run build      # Create production build
npm test           # Run React test suite
npm run test:db    # Run database-specific tests
```

### Database Operations
```bash
npm run db:build   # Build database from SQL source files
npm run db:test    # Run comprehensive database integrity tests
npm run db:verify  # Quick database integrity check (used in precommit)
npm run db:update  # Full rebuild and test cycle
npm run db:status  # Check database data freshness
```

### Utilities
```bash
./restart.sh       # Kill existing server and start fresh (development)
```

## Architecture Overview

### Data Architecture (Dual-System)
- **React App Data**: Static crop data in `src/config.js` for performance
- **SQLite Database**: Comprehensive plant database at `database/plant_varieties.db` with 18 varieties, 79 growing tips, 56 companion relationships
- **Key Difference**: Database stores planting months as JSON strings (`"[4,5,6]"`) while app expects JavaScript arrays (`[4,5,6]`)

### Core Components Structure
```
src/
├── App.js          # Main application with simulation logic
├── config.js       # Consolidated configuration, crop database, helpers
├── index.css       # Complete styling with responsive design
└── index.js        # React app entry point

database/
├── plant_varieties.db        # SQLite database (132KB, production-ready)
├── create_plant_database.sql # Database schema
├── populate_data.sql         # Core plant data
└── build_database.sh         # Database build script
```

### Statistical Engine
- **Monte Carlo Simulation**: 5,000 iterations using jStat library
- **Weather Modeling**: Poisson distribution for climate events
- **Harvest Variability**: Normal distribution with real-world yield ranges
- **Libraries**: jStat for statistics, simple-statistics for calculations, Recharts for visualization

### Configuration System
- **Static Data**: `GLOBAL_CROP_DATABASE` in config.js with 15+ crop varieties
- **Climate Scenarios**: Summer/winter climate combinations with probability weights
- **Regional Presets**: Durham NC, Phoenix AZ, Minneapolis MN, Seattle WA, Miami FL
- **Portfolio Strategies**: Conservative, Aggressive, Hedge, plus custom allocations

## Development Patterns

### State Management
- React hooks-based state management (no Redux)
- localStorage for configuration persistence
- Debounced simulations for performance optimization

### Data Flow
1. User configures location, climate scenarios, portfolio strategy
2. App generates Monte Carlo simulation (5,000 iterations)
3. Results displayed as charts, garden calendar, risk analysis
4. Configuration persisted to localStorage

### Database Integration Notes
Database exists but app currently uses static data. Future integration requires:
- JSON parsing of database month arrays: `JSON.parse('[4,5,6]')` → `[4,5,6]`
- Client-side SQLite querying or API layer
- Error handling for data format mismatches (see `isPlantingSeasonValid` function)

## Critical Functions

### Core Simulation Logic (`src/App.js`)
- `runSimulation()`: Main Monte Carlo simulation engine
- `generateGardenCalendar()`: Creates 12-month planting/harvest schedule
- Climate scenario selection and portfolio optimization

### Configuration Helpers (`src/config.js`)
- `isPlantingSeasonValid()`: Handles both array and JSON string formats
- `getClimateAdaptedCrops()`: Returns crops suitable for climate conditions
- `getMicroclimateAdjustedRecommendations()`: Site-specific adaptations

### Database Management (`scripts/database.js`)
- `DatabaseCLI`: Command-line interface for database operations
- `DatabaseManager`: Core database operations and validation
- Automated quality assurance with pre-commit hooks

## Quality Assurance

### Database Integrity
- Pre-commit hook runs `npm run db:verify` to prevent broken database commits
- Comprehensive testing suite validates data completeness and accuracy
- Database must always build successfully (source of truth principle)

### Code Standards
- Functional programming patterns preferred over mutation
- Performance-optimized with debounced operations
- Mobile-responsive design throughout
- Decision-focused interface (only show actionable data)

## Development Workflow

1. **Database Changes**: Edit SQL files in `database/`, run `npm run db:update`
2. **App Changes**: Edit React components, use `npm run dev` for auto-restart
3. **Pre-commit**: Database verification runs automatically
4. **Testing**: Run both React tests (`npm test`) and database tests (`npm run test:db`)

## Integration Points

### Current Data Flow
React App (static data) → User Interface → Monte Carlo Simulation → Results

### Future Database Integration
SQLite Database → API/Query Layer → React App → Simulation → Results

### Key Integration Challenges
- Format conversion: JSON strings ↔ JavaScript arrays
- Performance: Database queries vs. static data lookup
- Error handling: Missing or malformed database data

## Architecture Decisions

### Why Dual Data Systems
- **Performance**: Static data provides instant access for simulations
- **Completeness**: Database contains comprehensive plant data and growing tips
- **Flexibility**: Database supports multi-language, regional variations
- **Development Speed**: Static data simplifies React development

### Technology Choices
- **React 18**: Modern hooks, fast refresh for development
- **jStat**: Professional statistical computing for Monte Carlo simulation
- **SQLite**: Embedded database, no server dependencies
- **Recharts**: React-native charting library for data visualization

This application demonstrates production-quality architecture with comprehensive statistical modeling, automated quality assurance, and dual-data systems for optimal performance and maintainability.

## Implementation Notes

- Use React architecture best practices. Separate concerns.
- When modeling weather, consider global warming trends.
- The development server must always be running; if it is not running, or if it has errors, that is an urgent issue to fix.