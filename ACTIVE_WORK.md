# Active Work - Current Session Focus

*Updated: 2025-06-27*

## 🎯 CANDIDATE TASKS - Choose Next

### **High-Value Opportunities** 
1. **Monte Carlo Calendar Generation - Phase 2** (~$3-4) - Calendar Intelligence & Risk-Adjusted Timing
   - Build UI components to display probabilistic calendar recommendations  
   - Add confidence visualization and scenario strength indicators
   - Implement weather-driven timing adjustments for critical decisions
2. **Regional Plant Varieties** (~$3-4) - Add zone-specific variety recommendations based on hardiness zones
3. **Microclimate Adjustments** (~$3-4) - Factor in user's site conditions (slope, exposure, soil type)

### **Quick Wins** (~$1-2 each)
- Eliminate unused code cleanup
- CSS refactoring into modules  
- Design system updates review
- Mobile responsiveness improvements

### **Advanced Features** (~$5-8 each)
- Season Extension Planning - Cold frames, row covers by zone
- Companion Planting Integration - Zone-aware suggestions from database
- Onboarding Flow - Guided setup for new users

---

## ✅ Recent Completions

**Monte Carlo Calendar Generation - Phase 1** - COMPLETED (~$2-3 actual)
- Transformed simulation from abstract yield histograms to date-specific garden events
- Created `generateCalendarFromScenario()` - converts weather scenarios to planting/harvest windows
- Modified `runMonteCarloSimulation()` to output probabilistic calendar data for each iteration
- Built consensus algorithm `generateProbabilisticCalendar()` aggregating 5,000 scenario calendars
- Now generates actionable recommendations: "Plant tomatoes April 15-25 (70% confidence)"

**Weather Data Integration** - COMPLETED (~$3-4 actual)
- Real forecast data now drives Monte Carlo simulation
- Hook composition pattern: useWeatherData → useSimulation → enhanced predictions
- Graceful degradation when weather APIs unavailable

**Species Coverage Expansion** - COMPLETED (~$3 actual)
- Expanded database from 22 → 41 varieties (+86%)

**Documentation Restructure** - COMPLETED
- Automated workflow with learning triggers built into CLAUDE.md
- Cost reality check: estimates were 3-4x higher than actual usage

## Blockers & Decisions Needed
*None currently*

## Quick Capture
*Use /todo or /idea commands to add items here*

---
*Auto-updated after each task completion*