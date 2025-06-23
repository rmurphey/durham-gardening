# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal garden management system for a Durham, NC garden (Zone 7) containing detailed documentation for:
- Monthly garden calendar with planting and care schedules
- Individual plant care guides for specific varieties
- Detailed planting schedule organized by bed location and timing
- Space management for succession planting and seasonal transitions

## Content Structure

- **garden_calendar.md**: Monthly overview of all planting, care, and harvest tasks
- **planting_schedule.md**: Detailed table showing what to plant when and where
- **plant_care_guides/**: Individual care guides for each crop variety
- **Legacy files**: Original seed ordering documentation (for reference)

## Working with This Repository

When editing or adding content:
- Maintain consistent markdown formatting across all files
- Keep seasonal timing information relevant to Zone 7 growing conditions
- Use clear, actionable tables and checklists for garden tasks
- Update space calculations when changing plant spacing or bed assignments
- Focus on practical garden management over theoretical information

## Code Development Principles

- Prepare a commit with every substantial change
- Every commit that includes functional files should include associated tests
- Aim to minimize complex if/else statements by using more elegant code structures
- The database is the source of truth. It should always build. Automation should prevent commits if it doesn't build. It should always have the most recent data. There is a simple npm script to update the database

## Garden Management Focus

- **Monthly planning**: What to plant, when, and where in specific beds
- **Space optimization**: Succession planting and intercropping in limited space
- **Fresh eating priority**: Varieties and harvest timing for immediate consumption
- **Seasonal transitions**: Moving from summer to winter crops efficiently
- **Container mobility**: Using moveable containers to optimize growing conditions

This repository serves as a complete garden management system for year-round growing in Durham, NC.

## Project overview

This project is for a garden in Durham, North Carolina. In addition to a variety of shaded and unshaded areas in the yard, the garden includes:

- **3×15 Bed**: Long bed (45 sq ft)
- **4×8 Bed**: Medium bed (32 sq ft)
- **4×5 Bed**: Small bed (20 sq ft)
- **Containers**: Individual pots (15-20 sq ft total)

## Gardening Preferences & Constraints

- **Budget**: No significant constraints on seed purchases
- **Storage**: Limited cold/dark storage space - prioritize varieties for fresh eating and short-term storage
- **Seed suppliers**: Primary preference for True Leaf Market (proven success), open to other suppliers when needed
- **Time availability**: Daily maintenance possible, larger projects scheduled for weekends
- **Focus**: Emphasize fresh harvest varieties over long-storage crops due to storage limitations
- **Irrigation**: Backyard sprinkler system with basic automation covers all garden beds and containers
- **Budget Realism**: Our budget isn't actually unlimited. We can make practical expenditures, and we are happy to make long-term investments, but we also don't need heroics. Plants die.

## Sun Exposure

- **Main garden beds**: All three beds (3×15, 4×8, 4×5) receive ~6 hours of good sun daily - suitable for most vegetables
- **Front yard**: Significantly shaded by trees with some morning sun areas - contains existing plantings (ferns, hydrangea, jacob's ladder, other ornamentals) with limited space for edibles
- **Container placement**: Can be moved to optimize sun exposure as needed

## Sustainability Practices

- **Compost**: We have ready access to compost
- We can get a 40lb compost bag for $10 whenever we want

## Climate Adaptation

- Let's assume extended heat waves are the new average, and adjust long-term plans accordingly. Winters, too, should be expected to tend to be warmer than normal. Don't plant things that may not survive a heat wave, and don't assume plants won't overwinter, because they might.

## Economic Goals

- Our overall goal is for this garden to produce more dollar value than the dollar value we input to it. Assume our manual labor is free as long as it can fit easily within the obligations of full-time employment. 
- I don't care if the garden is profitable, this is more about not wanting to spend unnecessarily.
- I'm happy to invest in things like drip irrigation that have perennial value and reduce ongoing effort/costs.
- Avoid short-term/low-value spending and heroic measures to save failing plants.
- Focus on infrastructure that builds a low-maintenance, high-productivity system over time.

## Currency and Financial Considerations

- The UI should show currency to appropriate decimal precision depending on the currency. For example, USD should have two-digit decimal precision, whereas JPY generally requires zero decimal precision for common transactions.

## Design Principles

- The interfaces in this project meet the needs of the task, and nothing more. If data doesn't impact a decision, it is not shown.

## Interaction Guidelines

- It is OK to ask about the task to be performed if it helps inform the solution

## Data Sourcing

- We trust NOAA data and other government-provided data