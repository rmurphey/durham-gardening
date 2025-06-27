# GardenSim Development Log

A $400-600 learning experiment about AI-assisted development patterns.

## Project Evolution
**Durham garden planner** → **Continental US garden planning app** → **GardenSim with Monte Carlo simulation**

Started with personal garden recommendations, evolved into comprehensive garden planning application with weather integration, SQLite database, and statistical modeling.

## Key Learnings

### AI Development Patterns
- **Complexity Accumulation**: AI adds sophistication faster than utility. Each "solution" creates new layers rather than simplifying foundations. Requires increasing human guidance as complexity grows.
- **Phantom Dependencies**: AI rapid development creates tests/mocks referencing refactored-away services. Unlike manual development, AI evolves architecture without updating all references.
- **Velocity vs Architecture**: AI's high development speed makes traditional practices (tests, modularization, type annotations) MORE critical, not less. Speed without constraints leads to architectural drift.

### Maintenance Insights  
- **Automation Enables Gardening**: Maintenance friction determines if it happens. AI transforms "tedious manual work" into "quick automated task" - psychological difference drives action.
- **AST > String Replacement**: String-based refactoring is fragile and error-prone. AST-aware transformations essential for reliable code changes.
- **Infrastructure Lag**: App identity evolves faster than naming (directory: `shopping`, repo: `durham-gardening`, app: `GardenSim`). Accept debt rather than disrupt workflow.

### Architectural Decisions
- **Triple Data System**: Static data (performance) + Garden log (reality) + SQLite database (completeness)
- **Functional Focus**: Preferred deep functionality (statistical modeling, weather integration) over surface polish
- **User Value > Code Purity**: 15 minutes UX improvement beats 60 minutes internal cleanup users never see

### Technical Debt Categories
- **Phantom dependencies** from rapid AI refactoring
- **Naming debt** from evolving app identity
- **Service layer sprawl** from adding features without consolidation
- **Error handling cascades** from patching vs fixing root issues

## Development Experience

### What Worked
- AI excellent at guided cleanup and modularization
- Command organization iteration (docs → separate tools → unified interface)
- Habitat preservation philosophical shift implemented systematically
- Garden log bridged theoretical recommendations with planting reality

### What Required Guidance  
- Architectural thinking and broader context
- When to use SQLite vs hard-coding
- Geographic expansion data model implications
- Major feature prioritization decisions

### Workflow Patterns
- Multiple sessions due to AI instability costs
- Dev server management challenging (blocking Claude interface)
- Commit messages as technical documentation
- Manual intervention for architectural decisions

## Core Insight
**AI development velocity requires stronger engineering constraints, not weaker ones.** Traditional practices become amplifiers of AI capability rather than impediments to AI speed.

---

*Total cost: ~$400-600 | Architecture: React + SQLite + Monte Carlo simulation | Scope: Continental US garden planning*