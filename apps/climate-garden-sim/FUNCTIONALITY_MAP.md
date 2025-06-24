# Durham Garden Planner - Functionality Map

*Last Updated: 2025-06-24*

## Core Application Structure

### Main Application Entry Point
- **`src/App.js`** - Main React component, integrates all major components
  - Climate scenario selection
  - Portfolio management
  - Investment configuration
  - Simulation results
  - Garden calendar
  - Recommendations panel

### Configuration & Data
- **`src/config.js`** - Core configuration constants, investment presets, utility functions
- **`src/config/durhamConfig.js`** - Durham, NC specific gardening data and crop information
- **`src/config/gardenStatus.js`** - Configurable garden status system (what's growing, dying, not wanted)

## Components

### UI Components
- **`src/components/ClimateScenarioSelector.js`** - Summer/winter climate scenario selection
- **`src/components/PortfolioManager.js`** - Garden portfolio strategy selection and custom allocation
- **`src/components/InvestmentConfigurer.js`** - Annual investment configuration with presets for existing equipment
- **`src/components/SimulationResults.js`** - Financial simulation results and ROI analysis
- **`src/components/GardenCalendar.js`** - Month-by-month garden activity calendar
- **`src/components/RecommendationsPanel.js`** - Durham-specific gardening recommendations

### Location Setup Components
- **`src/components/LocationSetup.js`** - Main location configuration wrapper
- **`src/components/LocationSetup/BasicLocationForm.js`** - Basic location settings form
- **`src/components/LocationSetup/MicroclimateTuner.js`** - Microclimate adjustment controls
- **`src/components/LocationSetup/RegionPresetSelector.js`** - Regional preset selection
- **`src/components/LocationSetup/SolarDataIntegration.js`** - Solar data integration

### Utility Components
- **`src/components/WeatherDashboard.js`** - Weather data display
- **`src/components/ShoppingListGenerator.js`** - Shopping list generation (legacy/unused)

## Services & Business Logic

### Core Services
- **`src/services/databaseCalendarService.js`** - Database-driven garden calendar generation
- **`src/services/databaseService.js`** - SQLite database abstraction layer for activity templates
- **`src/services/simulationEngine.js`** - Monte Carlo simulation for garden ROI analysis
- **`src/services/durhamRecommendations.js`** - Durham-specific recommendations engine
- **`src/services/storageService.js`** - localStorage management utilities

### Data Sources
- **`src/data/portfolioStrategies.js`** - Portfolio strategy definitions and allocation logic
- **`src/data/climateScenarios.js`** - Climate scenario data for different regions

### Database
- **`database/plant_varieties.db`** - SQLite database with plant data, activity templates, and garden management
- **`database/activity_schema.sql`** - Database schema for garden calendar system
- **`database/durham_data.sql`** - Durham-specific activity templates and garden configuration

## State Management

### Custom Hooks
- **`src/hooks/useLocalStorage.js`** - localStorage state management hooks:
  - `useClimateSelection()` - Climate scenario selection state
  - `useLocationConfig()` - Location configuration state  
  - `useInvestmentConfig()` - Investment configuration state
  - `useUIPreferences()` - UI preference state
- **`src/hooks/useSimulation.js`** - Simulation engine integration hook

## Key Features by Location

### Investment Configuration
- **Component**: `src/components/InvestmentConfigurer.js`
- **State Hook**: `useInvestmentConfig()` in `src/hooks/useLocalStorage.js`
- **Presets**: Default configurations in hook, component-specific presets for established gardens

### Garden Status Management
- **Configuration**: `src/config/gardenStatus.js`
- **Filter Logic**: `shouldShowCropActivity()` function in same file
- **Integration**: Used in `src/services/databaseCalendarService.js` for systematic activity filtering

### Calendar Generation
- **Main Logic**: `generateDatabaseGardenCalendar()` in `src/services/databaseCalendarService.js`
- **Database Layer**: `databaseService` provides activity templates from SQLite database
- **Filtering**: Systematic filtering via `shouldShowCropActivity()` from garden status
- **Templates**: Activity templates stored in database with variety suggestions, costs, timing

### Simulation Engine
- **Core Engine**: `src/services/simulationEngine.js`
- **Integration**: `useSimulation()` hook in `src/hooks/useSimulation.js`
- **Results Display**: `src/components/SimulationResults.js`

## Styling System
- **Main Styles**: `src/index.css` - Cohesive design system with CSS variables
- **Design System**: White/black/green color scheme, component-specific styles included

## Recent Major Changes

### Database-Driven Calendar System (2025-06-24)
- Replaced hard-coded calendar logic with database-driven templates
- Created SQLite schema for activity templates and garden management
- Eliminated duplication by centralizing activity data
- Added structured templates with variety suggestions, costs, and timing
- Improved calendar specificity (exact varieties, bed assignments, suppliers)

### ESLint Fixes (2025-06-24)
- Removed undefined variables from garden calendar service
- Cleaned up unused imports and variables
- Fixed systematic filtering implementation

### Investment Configuration (2025-06-24)  
- Added InvestmentConfigurer component for annual investment management
- Created presets for users with existing equipment
- Integrated with existing investment state management

### Garden Status System (Previous)
- Replaced hard-coded garden status with configurable system
- Implemented systematic activity filtering
- Eliminated phantom activities for non-existent crops

## Development Workflow
- **Linting**: `npm run lint:changed:fix` - Run after code changes
- **Development Server**: `npm start` - Runs on localhost:3000
- **Git Integration**: Standard git workflow with co-author attribution to Claude