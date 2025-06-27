# TODOs for Claude Code


## the simulation should incorporate updated weather data

 

# evergreen todos

## Does the design system need any updates?

## Eliminate unused code

## Review navigation styling

## Does the CSS need to be refactored into modules, or is it fine as is?

## Eliminate duplicate / unnecessary CSS

## Feature: Let users choose their location on a map (LOW PRIORITY)

- Current geolocation + coordinate entry is acceptable for now
- Future enhancement: Add interactive map for location selection
- Would integrate with existing continental US validation
- Cost vs benefit doesn't justify current implementation

---

# KEY LEARNINGS & ARCHITECTURAL DECISIONS

## Species Coverage Expansion (2025-06-27)
**Learning:** Database expansion from 22 → 41 varieties (+86%) cost only ~$23 vs. initial $300+ estimate - content work much cheaper than expected
**Pattern Established:** Efficient batch data entry using extension service sources and template approach for rapid variety addition
**Architecture:** Existing database schema handled expansion seamlessly - technical foundation was ready, just needed content

## Database Schema Documentation (2025-06-27)
**Learning:** Well-structured database architecture but massive content gap - 22 varieties vs. 100+ needed for continental US coverage
**Pattern Established:** Comprehensive schema documentation reveals both technical strengths and data limitations that constrain application utility
**Architecture:** Complex relational design with vendors, regions, growing tips, companion plants - technically sound but under-populated

## Database Integration (2025-06-27)
**Learning:** Database contains only 22 plant varieties - insufficient for continental US coverage (needs 100+ varieties across more categories)
**Pattern Established:** Graceful degradation from database queries to static data fallback when comprehensive data unavailable
**Architecture:** Location suitability scoring algorithm combining hardiness zones, heat/drought tolerance, and climate factors

## Location-Agnostic Transformation (2025-06-26)
**Learning:** Rebranding from "Durham Garden Planner" to "GardenSim" required systematic function renaming and hardiness zone intelligence
**Pattern Established:** All recommendation functions require locationConfig parameter - garden advice is inherently location-specific
**Architecture:** Achieved 100% location-agnostic codebase supporting continental US zones 3-11

## Weather API Integration (2024-12-19) 
**Learning:** API routes require `npm run dev:vercel` in local development - `npm run dev` breaks serverless functions
**Pattern Established:** Fallback weather data generation when National Weather Service API unavailable
**Architecture:** 10-day forecast integration with growing degree days and garden-specific risk calculations