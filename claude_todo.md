# TODOs for Claude Code

## consider how to make the app usable for more locations

- Use the zip code 27707 as the default.
- Plan how to let users geolocate themselves.
- Support locations in the continental US.

## Get more valuable information above the fold. 

- Right now I see "Durham Garden" or some variation at least six times above the fold, and almost no useful information.

## There should be no more mention of KV storage

- We switched to blob storage. It sucks, but it's free.
- Are there free KV options you should consider?

## Metrics display

- Percents should ALWAYS be shown ONLY to 0 decimal point precision.
- Temperatures should be shown in Fahrenheit.

## Is `NODE_ENV` set properly for dev vs production?

## when I click "share" there should be some kind of feedback

# evergreen todos

## Does the design system need any updates?

## Eliminate unused code

## Review navigation styling

## Does the CSS need to be refactored into modules, or is it fine as is?

## Eliminate duplicate / unnecessary CSS

---

# COMPLETED ITEMS

## ✅ COMPLETED: Incorporate current weather and forecast data async (2024-12-19)

- ✅ Created forecast API route with 10-day weather data from National Weather Service
- ✅ Built Vercel cron function to update forecast every 6 hours
- ✅ Added forecast data storage in Vercel KV for caching
- ✅ Created ForecastWidget component with garden-specific alerts and recommendations
- ✅ Integrated forecast display on dashboard with simulation impact factors
- ✅ Added growing degree days, frost risk, and heat stress calculations
- ✅ Built garden planning recommendations based on weather conditions

## ✅ COMPLETED: Combine Garden Tasks and Calendar (2024-12-19)

- ✅ Replace Garden Tasks with the Calendar, and incorporate task information into the calendar
- ✅ For non-recurring calendar items, let me dismiss the item once it's done.
- ✅ For recurring calendar items (like watering), let me mark them as done so you'll remind me when to do them again.
- ✅ This involves refreshing the interface async without user input!

## ✅ COMPLETED: Move the calendar to the dashboard (2024-12-19)

## ✅ COMPLETED: Plan a system that allows for cross-session persistence (2024-12-19)

Right now, the application is based entirely on browser storage. What would it take to add authenticated users (via some existing SSO provider e.g. Google or Github)?

## ✅ COMPLETED: Rethink settings (2025-06-26)

- ✅ Eliminated the settings page completely
- ✅ Created CompactSettingsPanel component for unified settings interface
- ✅ Added settings to both dashboard and analysis pages with minimal visual footprint
- ✅ Implemented collapsible UI showing current selections in compact summary
- ✅ Consolidated climate scenarios, portfolio strategy, and investment configuration
- ✅ Added comprehensive responsive CSS styling with mobile optimization
- ✅ Maintained read-only mode support for shared gardens
- ✅ Reordered navigation: moved Simulation before Shopping, renamed from Analysis

## ✅ COMPLETED: Move simulation to dashboard (2025-06-26)

- ✅ Eliminated Simulation tab from navigation completely
- ✅ Integrated SimulationResults component directly into dashboard
- ✅ Removed all /analysis routes from both regular and garden routing
- ✅ Updated dashboard to provide complete simulation workflow
- ✅ Simplified navigation to just Dashboard + Shopping
- ✅ Created single-page garden planning experience
- ✅ Cleaned up unused imports and navigation buttons

## ✅ COMPLETED: Fix weather loading in local development (2025-06-26)

- ✅ Identified root cause: API routes don't work with npm run dev
- ✅ Fixed NWS API data parsing by removing incorrect .data property access
- ✅ Added proper fallback handling with generateFallbackDay function
- ✅ Enhanced fallback indicators in ForecastWidget for better user feedback
- ✅ Updated CLAUDE.md with requirement to use vercel dev for local development
- ✅ Weather widget now displays real 10-day forecasts from National Weather Service
- ✅ Documented proper development workflow for API route support

## ✅ COMPLETED: Reduce forecast visual footprint with emojis (2025-06-26)

- ✅ Added weather emoji indicators based on forecast conditions (⛈️🌧️🌦️☀️⛅☁️🌨️🌫️💨)
- ✅ Created compact forecast card layout with reduced padding and font sizes
- ✅ Replaced verbose text with visual indicators for precipitation, frost risk, heat stress
- ✅ Maintained all essential weather information in smaller format
- ✅ Fixed duplicate getWeatherEmoji function causing compilation warnings
- ✅ Added comprehensive CSS styling for compact forecast display

## ✅ COMPLETED: Component modularization and architecture improvements (2025-06-26)

- ✅ Extracted AppHeader component from AppContent.js and GardenAppContent.js eliminating ~80 lines of duplicate header JSX
- ✅ Created GardenStateProvider component with useGardenAppState hook centralizing ~150+ lines of duplicate state management
- ✅ Integrated both components to use GardenStateProvider for consistent state interface and improved maintainability
- ✅ Fixed all ESLint warnings related to modularization work - dev server now compiles with minimal warnings
- ✅ Resolved SQL.js WASM loading issue in test environment with proper mock setup
- ✅ Analyzed remaining modularization opportunities and determined current architecture is well-structured for maintainability

## ✅ COMPLETED: Calendar-shopping integration with intelligent activity-based suggestions (2025-06-26)

- ✅ Created smart activity filtering system that only triggers shopping suggestions for relevant activities (shopping, infrastructure, indoor-starting)
- ✅ Built contextual shopping recommendation engine that maps activity types to relevant items (irrigation→drip systems, indoor-starting→seed kits)
- ✅ Implemented interactive ShoppingSuggestionModal with checkbox selection, pricing display, and urgency indicators
- ✅ Integrated seamlessly with existing shopping list state management and localStorage persistence
- ✅ Added comprehensive test coverage for both service logic and UI component interactions
- ✅ Created professional modal design with mobile-responsive layout and suggestion reasoning
- ✅ Enhanced user experience: complete calendar activity → get targeted suggestions → add to persistent shopping list

## ✅ COMPLETED: Fix summary stats layout and add metric units (2025-06-26)

- ✅ Created unified unit conversion system with formatTemperature() and formatPrecipitation() functions
- ✅ Consolidated 3 duplicate .summary-stats CSS implementations into single reusable system
- ✅ Enhanced visual hierarchy with better label/value differentiation and card-style stat items
- ✅ Added metric-first display (Celsius, millimeters) with imperial secondary values
- ✅ Improved responsive design with better mobile spacing and hover effects
- ✅ Reduced CSS debt by ~40 lines and created reusable formatting utilities