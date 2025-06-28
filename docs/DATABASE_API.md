# Database Services API Reference

*Last Updated: 2025-06-28*

## Overview

This document provides comprehensive API reference for all database services in the Durham Garden Planner. The system uses SQLite with WebAssembly for browser-native database operations, with structured fallback data when the database is unavailable.

## Core Services

### DatabaseService (`src/services/databaseService.js`)

The primary service for SQLite database operations using sql.js WebAssembly runtime.

#### Initialization Methods

##### `initializeDatabase(forceReload = false)`
Initializes the SQLite database with WebAssembly runtime.
- **Parameters:**
  - `forceReload` (boolean, optional): Force database reload ignoring cache
- **Returns:** `Promise<void>`
- **Throws:** Error if database fails to load
- **Usage:** Automatically called in production, lazy-loaded in development
- **Cache Control:** Uses versioned URLs with cache-busting headers

##### `reloadDatabase()`
Forces complete database reload with new cache version.
- **Returns:** `Promise<void>`
- **Usage:** Development/testing only, clears all cached state

##### `waitForInitialization()`
Waits for database initialization to complete.
- **Returns:** `Promise<void>`
- **Usage:** Called internally by all query methods

#### Activity Template Methods

##### `getActivityTemplates(regionId = 1, month, enabledPlantKeys = [])`
Retrieves activity templates filtered by region, month, and enabled plants.
- **Parameters:**
  - `regionId` (number): Database region ID (default: 1 for US)
  - `month` (number): Month number 1-12
  - `enabledPlantKeys` (Array<string>): Plant keys to include (filters crops)
- **Returns:** `Promise<Array<Object>>` Activity template objects
- **Template Fields:**
  - `id` (number): Template database ID
  - `plant_key` (string|null): Plant identifier
  - `activity_type` (string): Type key (shopping, direct-sow, etc.)
  - `action_template` (string): Action description with placeholder support
  - `timing_template` (string): Timing guidance with placeholder support
  - `priority` (string): high, medium, low
  - `variety_suggestions` (Array): Recommended plant varieties
  - `supplier_preferences` (Array): Preferred suppliers/vendors
  - `estimated_cost_min/max` (number): Cost range
  - `bed_requirements` (Object): Bed size and spacing data
- **Fallback:** Returns structured fallback data if database unavailable

##### `getRotationTemplates(regionId = 1, month)`
Retrieves bed rotation and management templates.
- **Parameters:**
  - `regionId` (number): Database region ID
  - `month` (number): Month number 1-12
- **Returns:** `Promise<Array<Object>>` Rotation templates
- **Usage:** Garden bed management, crop rotation planning

##### `getSuccessionTemplates(regionId = 1, month)`
Retrieves succession planting templates.
- **Parameters:**
  - `regionId` (number): Database region ID
  - `month` (number): Month number 1-12
- **Returns:** `Promise<Array<Object>>` Succession planting templates
- **Usage:** Continuous harvest planning, staggered plantings

#### Text Generation Methods

##### `generateActionText(template)`
Generates user-ready action text from template with all placeholders resolved.
- **Parameters:**
  - `template` (Object): Activity template from database
- **Returns:** `string` Complete action text with no placeholders
- **Placeholder Support:**
  - `{varieties}`: Top 2 recommended varieties
  - `{variety}`: Primary recommended variety
  - `{supplier}`: Preferred supplier
  - `{bed}`: Target garden bed (4×8 Bed, 3×15 Bed, etc.)
  - `{quantity}`: Appropriate planting quantity
- **Validation:** **ZERO TOLERANCE** - throws error if any placeholder remains
- **Cost Integration:** Adds cost ranges for shopping activities

##### `generateTimingText(template)`
Generates timing guidance text with all placeholders resolved.
- **Parameters:**
  - `template` (Object): Activity template from database  
- **Returns:** `string` Complete timing text with no placeholders
- **Validation:** **ZERO TOLERANCE** - throws error if any placeholder remains

##### `validateNoPlaceholders(text)`
Critical validation ensuring no template placeholders reach the UI.
- **Parameters:**
  - `text` (string): Text to validate
- **Returns:** `string` Validated text
- **Throws:** Error with details if placeholders found (`{anything}` pattern)
- **Usage:** Called by all text generation methods

#### Plant Data Methods

##### `getEnhancedPlantData(plantKey, locationConfig)`
Combines database plant information with static configuration.
- **Parameters:**
  - `plantKey` (string): Plant identifier (e.g., 'kale', 'hot_peppers')
  - `locationConfig` (Object): User location with hardiness zone, coordinates
- **Returns:** `Promise<Object>` Enhanced plant data
- **Enhancement Fields:**
  - Database: zones, temperatures, tolerances, maturity days
  - Static: planting schedules, harvest info, growing tips
  - Combined: location-specific recommendations
- **Fallback:** Returns static data if database unavailable

##### `getGrowingTips(plantKey, locationConfig)`
Retrieves location-specific growing tips from database.
- **Parameters:**
  - `plantKey` (string): Plant identifier
  - `locationConfig` (Object): User location configuration
- **Returns:** `Promise<Array<Object>>` Growing tips
- **Tip Fields:**
  - `text` (string): Tip content
  - `category` (string): Tip category
  - `zones` (string): Applicable hardiness zones
  - `priority` (number): Importance ranking
- **Filtering:** Returns tips relevant to user's hardiness zone

##### `getCompanionPlants(plantKey)`
Retrieves companion planting relationships from database.
- **Parameters:**
  - `plantKey` (string): Plant identifier
- **Returns:** `Promise<Object>` Companion planting data
- **Structure:**
  ```javascript
  {
    beneficial: [{ plantKey, name, notes }],
    neutral: [{ plantKey, name, notes }],
    antagonistic: [{ plantKey, name, notes }]
  }
  ```

##### `getPlantsByZone(hardinessZone)`
Retrieves all plants suitable for specified hardiness zone.
- **Parameters:**
  - `hardinessZone` (string): USDA zone (e.g., '7b', '9a')
- **Returns:** `Promise<Array<Object>>` Zone-suitable plants
- **Plant Fields:**
  - `plantKey`, `name`, `minZone`, `maxZone`
  - `category`, `heatTolerance`, `droughtTolerance`
- **Fallback:** Returns static zone data if database unavailable

##### `getPlantVarieties(plantKey)`
Retrieves all varieties for a specific plant with vendor information.
- **Parameters:**
  - `plantKey` (string): Plant identifier
- **Returns:** `Promise<Array<Object>>` Plant varieties
- **Variety Fields:**
  - Plant data: zones, temperatures, tolerances, spacing
  - Vendor data: prices, packet sizes, organic/heirloom status
  - Variety data: specific variety characteristics

##### `getAllCropsFromDatabase()`
Retrieves complete crop database organized by categories.
- **Returns:** `Promise<Object>` Complete crop database
- **Structure:**
  ```javascript
  {
    heatTolerant: { plantKey: cropData },
    coolSeason: { plantKey: cropData },
    perennials: { plantKey: cropData }
  }
  ```
- **Usage:** Replaces static GLOBAL_CROP_DATABASE

#### Utility Methods

##### `getGardenBeds(gardenId = 1)`
Returns predefined garden bed configurations.
- **Parameters:**
  - `gardenId` (number): Garden identifier
- **Returns:** `Promise<Array<Object>>` Garden bed definitions
- **Bed Specifications:**
  - `{ id, name, length, width, area }` in feet/square feet

##### `getActivityTypes()`
Retrieves available activity types from database.
- **Returns:** `Promise<Array<Object>>` Activity type definitions
- **Usage:** Activity categorization and filtering

##### `getActivityTemplatesByType(activityType)`
Retrieves templates filtered by activity type.
- **Parameters:**
  - `activityType` (string): Activity type key
- **Returns:** `Promise<Array<Object>>` Filtered templates

### CropDataService (`src/services/cropDataService.js`)

Unified crop data access with database preference and static fallback.

#### Core Methods

##### `getCropDatabase()`
Returns complete crop database with caching and timeout protection.
- **Returns:** `Promise<Object>` Complete crop database
- **Caching:** Single load with memory caching
- **Timeout:** 10-second timeout with static fallback
- **Structure:** Organized by heatTolerant, coolSeason, perennials

##### `getCropsByCategory(category)`
Retrieves crops filtered by category.
- **Parameters:**
  - `category` (string): 'heatTolerant', 'coolSeason', 'perennials'
- **Returns:** `Promise<Object>` Crops in specified category

##### `getCrop(cropKey)`
Retrieves specific crop data with category information.
- **Parameters:**
  - `cropKey` (string): Crop identifier
- **Returns:** `Promise<Object|null>` Crop data with category, null if not found

##### `getAllCropKeys()`
Returns array of all available crop identifiers.
- **Returns:** `Promise<Array<string>>` All crop keys across categories

##### `getCropsByZone(hardinessZone)`
Filters entire crop database by hardiness zone suitability.
- **Parameters:**
  - `hardinessZone` (string): USDA zone (e.g., '7b')
- **Returns:** `Promise<Object>` Filtered crop database

#### Utility Methods

##### `isCropSuitableForZone(crop, zoneNumber)`
Determines if crop is suitable for numeric hardiness zone.
- **Parameters:**
  - `crop` (Object): Crop data with zones field
  - `zoneNumber` (number): Numeric zone value
- **Returns:** `boolean` True if suitable

##### `isPlantingSeasonValid(crop, month, region = 'temperate')`
Checks if crop planting season is valid for specified month.
- **Parameters:**
  - `crop` (Object): Crop data
  - `month` (number): Month number 1-12
  - `region` (string): Climate region
- **Returns:** `boolean` True if valid planting season

##### `reset()`
Clears cached data for testing or refresh.
- **Usage:** Development and testing only

### DatabaseLocationRecommendations (`src/services/databaseLocationRecommendations.js`)

Location-aware plant recommendations with database enhancement.

#### Core Methods

##### `getDatabaseLocationRecommendations(locationConfig)`
Returns location-appropriate plants with database enhancement.
- **Parameters:**
  - `locationConfig` (Object): User location with hardiness, coordinates, climate data
- **Returns:** `Promise<Array<Object>>` Enhanced plant recommendations
- **Enhancement:** Growing tips, companion plants, varieties, suitability scoring
- **Fallback:** Static recommendations if database unavailable

##### `getDatabaseCropRecommendations(locationConfig)`
Organizes location recommendations by crop categories.
- **Parameters:**
  - `locationConfig` (Object): User location configuration
- **Returns:** `Promise<Object>` Organized crop recommendations
- **Structure:**
  ```javascript
  {
    heatSpecialists: [plantData],
    coolSeason: [plantData], 
    perennials: [plantData],
    database: true
  }
  ```

##### `getLocationGrowingTips(plantKeys, locationConfig)`
Batch retrieval of growing tips for multiple plants.
- **Parameters:**
  - `plantKeys` (Array<string>): Plant identifiers
  - `locationConfig` (Object): User location
- **Returns:** `Promise<Object>` Tips organized by plant key

##### `getCompanionPlantingInfo(plantKeys)`
Batch retrieval of companion planting information.
- **Parameters:**
  - `plantKeys` (Array<string>): Plant identifiers
- **Returns:** `Promise<Object>` Companion info organized by plant key

##### `calculateLocationSuitability(plantData, locationConfig)`
Calculates location suitability score for plant.
- **Parameters:**
  - `plantData` (Object): Plant data with zones, tolerances
  - `locationConfig` (Object): User location configuration
- **Returns:** `number` Suitability score 0-1
- **Factors:** Zone compatibility (30%), heat tolerance, drought tolerance, winter hardiness

### DatabaseCalendarService (`src/services/databaseCalendarService.js`)

Database-driven garden calendar generation.

#### Core Methods

##### `generateDatabaseGardenCalendar(summerScenario, winterScenario, portfolioKey, locationConfig, customPortfolio = null)`
Generates 12-month garden calendar using database templates.
- **Parameters:**
  - `summerScenario` (string): Climate scenario selection
  - `winterScenario` (string): Winter scenario selection  
  - `portfolioKey` (string): Plant portfolio selection
  - `locationConfig` (Object): User location configuration
  - `customPortfolio` (Object, optional): Custom plant selection
- **Returns:** `Promise<Array<Object>>` Monthly calendar entries
- **Calendar Structure:**
  ```javascript
  [{
    month: "January",
    monthNumber: 1,
    activities: [{
      type: "shopping",
      crop: "Hot Peppers", 
      action: "Order pepper seeds: Habanero, Jalapeño from True Leaf Market - $12-18",
      timing: "Start indoors March 1st, need 8-10 weeks before transplant",
      priority: "medium"
    }]
  }]
  ```

#### Activity Processing

- **Template Integration:** Combines activity, rotation, and succession templates
- **Garden Status Filtering:** Respects enabled/disabled crop settings
- **Placeholder Resolution:** All template placeholders resolved to user-ready text
- **Priority Sorting:** Activities sorted by priority and type
- **Maintenance Integration:** Comprehensive maintenance tasks for Durham climate
- **Limit Control:** Maximum 8 activities per month for readability

#### Utility Functions

##### `getCropDisplayName(cropKey)`
Converts plant keys to user-friendly display names.
- **Parameters:**
  - `cropKey` (string): Database plant key
- **Returns:** `string` Human-readable name

## Error Handling & Fallbacks

### Database Unavailable
All services provide graceful fallback to static data when database is unavailable:
- **Detection:** Connection timeouts, initialization failures
- **Fallback Source:** Static GLOBAL_CROP_DATABASE configuration
- **User Experience:** Seamless operation with reduced feature set
- **Logging:** Clear distinction between database and static data sources

### Placeholder Validation
**ZERO TOLERANCE policy** for template placeholders reaching the UI:
- **Pattern Detection:** `/\{[^}]+\}/g` regex for any `{placeholder}` format
- **Error Throwing:** Immediate error with placeholder details
- **Development Testing:** Comprehensive test suite validates all templates
- **Production Safety:** Fallback text replacement for unexpected placeholders

### Input Validation
- **Parameter Checking:** Required parameters validated before database queries
- **Type Safety:** Numeric parameters parsed and validated
- **Null Handling:** Graceful handling of missing or null configuration
- **Default Values:** Sensible defaults for optional parameters

## Development & Testing

### Auto-Testing Features
- **Browser Testing:** `window.testPlaceholderReplacement()` comprehensive test
- **Template Validation:** Tests all activity types across all months
- **Visual Indicators:** Development-only success/failure notifications
- **Auto-Execution:** Tests run automatically after page load

### Debug Access
- **Global Exposure:** `window.databaseService` for browser console debugging
- **Query Logging:** Detailed SQL query and parameter logging
- **Performance Timing:** Database operation timing measurements
- **State Inspection:** Database initialization and cache status

### Cache Management
- **Development:** Lazy loading to avoid conflicts with dev server
- **Production:** Automatic initialization with cache-busting
- **Manual Control:** `reloadDatabase()` for forced cache refresh
- **Version Control:** Database file versioning with URL parameters

## Performance Characteristics

### Initial Load
- **WebAssembly:** ~2-3 seconds for WASM + database initialization
- **Database Size:** ~50KB current data, supports up to ~10MB efficiently
- **Memory Usage:** ~5-10MB for current database size
- **Offline Capability:** Fully functional after initial load

### Query Performance
- **Simple Queries:** Sub-millisecond execution
- **Complex Joins:** ~1-5ms for typical template queries
- **Batch Operations:** Parallel Promise.all for multiple queries
- **Caching:** In-memory caching for expensive operations

### Network Optimization
- **WebAssembly:** 1.6MB WASM file served separately
- **Database File:** Compressed SQLite with cache headers
- **Static Fallback:** Minimal impact when database unavailable
- **Progressive Enhancement:** Core functionality available immediately

## Security Considerations

### Data Safety
- **Browser Sandbox:** Database runs in browser security context
- **Read-Only Access:** No user data persistence, prevents corruption
- **No SQL Injection:** Parameterized queries, browser execution only
- **Memory Safety:** WebAssembly provides memory-safe execution

### Input Sanitization
- **Parameter Validation:** All user inputs validated before database queries
- **XSS Prevention:** Text generation includes XSS-safe placeholder replacement
- **File Access:** Database file served as static asset only

## Migration & Updates

### Schema Changes
1. Update schema files in `/database/` directory
2. Rebuild database with `npm run db:build`
3. Test with `npm run db:verify`
4. Update API documentation for breaking changes

### Data Updates
1. Modify data files in `/database/` directory
2. Rebuild and test database
3. Deploy updated database file
4. Version control database file for cache-busting

### API Versioning
- **Backward Compatibility:** Maintain existing method signatures
- **Deprecation Process:** Clear migration path for breaking changes
- **Documentation Updates:** API reference updated with all changes
- **Testing:** Comprehensive testing before production deployment