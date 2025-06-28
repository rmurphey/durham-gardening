# GardenSim Project History

Personal journal documenting the evolution of a garden planning application from concept to continental US coverage.

## Documentation Organization (2025-06-28)
**Change:** Moved project documentation from root directory to `/docs/` for better organization
**Files Moved:** ACTIVE_WORK.md, AI_WORKFLOW_INSIGHTS.md, DATABASE_ARCHITECTURE.md, DEPLOYMENT.md, IDEAS.md, LEARNINGS.md, PROJECT_HISTORY.md, TEST_COVERAGE_PLAN.md
**Rationale:** Keep root directory clean with only essential files (CLAUDE.md, README.md), while preserving comprehensive development documentation in dedicated location
**Impact:** Improved repository navigation and clearer separation between code and documentation

## Project Journey
Started with simple Durham garden recommendations, evolved into a comprehensive continental US garden planning application with weather forecasting and Monte Carlo simulation.

**Evolution**: Durham-specific advice → location-agnostic system → weather-integrated planning → statistical modeling → actual garden state tracking

## Development Phases

### Genesis
- Had a garden, wanted AI recommendations
- Convinced this problem was "app-able" 
- Initial output promising enough to pursue

### Durham Focus  
- 3KLOC single file → modular architecture
- SQLite database with crop data
- Core functionality working locally

### Geographic Expansion
- Durham-specific → Continental US support
- Required guidance on data model implications
- Hardiness zone integration

### Feature Sophistication
- Weather API integration via Vercel serverless
- Monte Carlo simulation with jStat library
- Garden log system bridging theory and reality
- Probabilistic calendar generation

### Philosophical Shift
- Reddit post about habitat collapse changed direction
- Language shift: "install/build" → "support/maintain"
- Preservation over intervention mindset

## Development Experience

### AI Collaboration Patterns
- Excellent at guided cleanup and implementation
- Required constant architectural guidance
- Needed help with broader context and prioritization
- Multiple sessions due to occasional instability

### What Surprised Me
- Complexity accumulated faster than utility
- Manual maintenance vs automated maintenance psychological difference
- AI can implement philosophical concepts systematically

### Infrastructure Learnings
- Dev server management tricky (blocking interface)
- Naming debt accumulates (directory ≠ repo ≠ app name)
- Vercel development workflow different from standard React
- Commit messages serve as technical documentation

## Architecture Outcomes
- **Triple data system**: Static (performance) + Garden log (reality) + Database (completeness) 
- **Weather-responsive**: Real forecast data drives recommendations
- **Location-aware**: All functions require locationConfig parameter
- **Statistically modeled**: Monte Carlo simulation with thousands of iterations

## Current State
Fully functional garden planning application for continental US with real-time weather integration, comprehensive plant database, and actual garden state tracking.

**User flow**: Set location → Configure portfolio → Get weather-aware recommendations → Track actual plantings → Receive honest task guidance

---

*$400-600 learning investment | React + SQLite + jStat + National Weather Service API*