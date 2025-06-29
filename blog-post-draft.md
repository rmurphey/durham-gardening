# Building a Garden Planning App with Claude Code: Lessons from a $400 AI Development Experiment

## Executive Summary

I spent $400-600 learning how AI-assisted development works in practice by building a location-aware garden planning application. This post documents the concrete patterns, costs, failures, and architectural decisions that emerged from 6 days of intensive development with Claude Code (June 22-28, 2025).

Key findings:
- Cost estimates were consistently 3-4x higher than actual usage
- Quality tool drift (197 ESLint warnings) required systematic cleanup approach
- AI development makes traditional engineering practices MORE critical, not less
- Mixed AST/manual approaches optimal for different problem types
- Prevention systems exponentially more effective than reactive cleanup

## Project Evolution: 6 Days of Intensive Development

### Day 1-2: Foundation Building (June 22-23)
**Commits**: 20 commits, from initial garden system to React application
**Key Features Built**:
- Initial garden management system with climate adaptation
- React-based climate simulation with Monte Carlo analysis
- Visual risk analysis with histograms and timeline visualization
- Global climate-aware garden planning with intelligent crop recommendations
- SQLite database with comprehensive plant varieties (79 growing tips, 56 companion relationships)

**Major Architectural Decisions**:
- React + Vercel serverless functions
- Monte Carlo simulation for probabilistic growing season predictions
- Database automation with Node.js instead of shell scripts
- Template-driven data entry for rapid content expansion

### Day 3-5: Feature Expansion & Complexity Accumulation (June 23-27)
**Technical Debt Warning Signs**:
- Large files emerging (config.js approaching 1,576 lines)
- ESLint violations starting to accumulate
- Multiple approaches to similar problems
- Service interdependencies forming

**Learning Documentation Phase**:
- Created comprehensive learning capture system
- Added /maintainability command for health monitoring
- Implemented git SHA traceability for insights
- Began systematic architectural analysis

### Day 6: Quality Crisis & Systematic Recovery (June 28)
**Crisis Point**: 197 ESLint warnings discovered blocking development
**Budget Used**: ~$50-100 in single day
**Recovery Strategy**: Mixed AST/manual cleanup approach
**Timeline**: 
- Morning: 197 problems → 0 errors (strategic rule downgrading)
- Afternoon: 163 → 104 warnings (36% reduction, major Testing Library cleanup)
- Evening: 104 → 34 warnings (82% total reduction)

**Results**: Systematic cleanup with prevention systems implemented

## Cost Reality vs Estimates

### Actual Costs by Task Type
- **Major Features**: $3-5 (estimated $15+)
- **Bug Fixes**: $1-2 (estimated $5-8)
- **Documentation**: Nearly free due to caching (estimated $10+)
- **Database Expansion**: $23 for 41 varieties (estimated $300+)

### Cost Efficiency Patterns
- **Template-driven approaches**: 3-4 minutes per variety vs 30+ minutes assumed
- **Context reuse**: 21.5M cache reads dramatically reduced costs
- **Batch operations**: Multiple related tasks in single session
- **Structured research**: Systematic analysis vs ad-hoc exploration

## Quality Tool Drift: The 197 Warning Crisis

### How Quality Debt Accumulates
The accumulation of 197 ESLint warnings represents a **prevention system failure**, not just technical debt:

1. **Incremental Tolerance**: Each commit with warnings normalized the next
2. **No Enforcement**: Pre-commit hooks not configured for warnings
3. **AI Velocity**: Rapid development without quality gates
4. **Complexity Bias**: Each fix added layers instead of simplifying

### Systematic Recovery Approach
**Strategy**: Mixed AST/manual approach targeting violations by complexity

**AST Codemod Successes**:
- `act()` removal: 5/5 violations fixed (100% success rate)
- Mechanical transformations: Import cleanup, variable renaming
- Time saved: 15+ minutes vs manual search-and-replace

**Manual Fix Successes**:
- Container queries → screen queries: 5/5 violations (100% success)
- Conditional expect patterns: 8/8 violations (100% success)
- Context-aware transformations requiring semantic understanding

**Results**: 82% violation reduction, zero-tolerance pre-push hooks implemented

## Architectural Patterns That Worked

### 1. Graceful Degradation
```javascript
// Database queries with static fallback
const recommendations = await databaseService.getRecommendations(location)
  .catch(() => staticRecommendations.getForLocation(location));
```

### 2. Hook Composition
```javascript
// Weather → Simulation → Recommendations pipeline
const weather = useWeatherData(locationConfig);
const simulation = useSimulation(weather, crops);
const recommendations = useRecommendations(simulation);
```

### 3. Environment-Specific Initialization
```javascript
// Production: immediate initialization
// Development: lazy loading to avoid WASM/webpack conflicts
const dbService = process.env.NODE_ENV === 'production' 
  ? new DatabaseService() 
  : new LazyDatabaseService();
```

### 4. Template-Driven Content
```javascript
// Rapid data entry pattern
const plantTemplate = {
  name: 'Tomato',
  zones: [3, 4, 5, 6, 7, 8, 9],
  plantingDepth: '0.25 inches',
  // ... standardized structure
};
```

## Major Failures and Lessons

### 1. Quality Tool Drift Prevention Failure
**Failure**: 197 ESLint warnings accumulated over months
**Lesson**: Prevention exponentially cheaper than cure
**Solution**: Zero-tolerance pre-push hooks, daily maintenance principle
**Cost**: 5 warnings = 5 minutes, 197 warnings = hours of systematic work

### 2. Claude-Centric vs Universal Automation
**Failure**: Prevention systems only worked within Claude ecosystem
**Lesson**: Real prevention needs tool-agnostic automation
**Solution**: Git hooks, linters, CI checks that work regardless of development environment

### 3. AST Transformation Overconfidence
**Failure**: Generated invalid syntax (`const x = throw new Error()`)
**Lesson**: AST excellent for mechanical changes, manual better for semantic changes
**Solution**: Match tool capabilities to problem characteristics

### 4. Complexity Accumulation Blindness
**Failure**: Each solution added sophistication without simplifying foundations
**Lesson**: AI velocity makes traditional constraints MORE critical
**Solution**: Systematic architectural reviews, function contracts, modular boundaries

## Prevention Systems That Work

### 1. Git Hook Workflow
```bash
# Pre-commit: Block errors, allow warnings with notification
# Pre-push: Zero tolerance for any warnings/errors
```

### 2. Quality Thresholds
- **Green**: <10 warnings (excellent)
- **Yellow**: 10-25 warnings (schedule cleanup)
- **Red**: 25+ warnings (immediate systematic cleanup)

### 3. Daily Maintenance Principle
Fix quality issues within 24 hours. Exponential cost scaling prevents accumulation.

### 4. Documentation-Driven Development
- Real-time learning capture in `docs/LEARNINGS.md`
- Commit associations with codemod usage
- Pattern documentation for future application

## How I'd Build This From Scratch

### Technology Choices
- **Framework**: Next.js 14 with App Router (better than React + Vercel functions)
- **Database**: Vercel KV store instead of SQLite (simpler deployment)
- **Styling**: Tailwind CSS with design system constraints
- **Testing**: Vitest + Testing Library from day 1

### Quality-First Setup
```bash
# Initial setup commands
npm install --save-dev eslint prettier husky lint-staged
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/pre-push "npm run lint && npm run test"
```

### Architectural Constraints
1. **File Size Limits**: 400 lines maximum (enforced by linter)
2. **Function Complexity**: Max 10 branches per function
3. **Test Coverage**: 60% minimum before features
4. **Dependency Injection**: No direct service imports in components

### Development Workflow
1. **Quality gates from start**: Zero-tolerance ESLint, mandatory tests
2. **Modular architecture**: Clear service boundaries, interface definitions
3. **Learning documentation**: Capture insights in real-time
4. **Cost tracking**: Estimate vs actual for pattern learning

## Documentation & Command System: The Learning Infrastructure

One of the most valuable patterns that emerged was building a systematic learning infrastructure from day 3 onward. This wasn't just documentation—it was an active system for capturing, applying, and evolving insights in real-time.

### Documentation Structure

**docs/LEARNINGS.md**: Real-time insight capture with git commit associations
- 25+ detailed insights with Insight/Pattern/Impact structure
- Git SHA references for traceability (e.g., "AST Tooling for Architectural Refactoring (2025-06-28) - 5bef90f")
- Cost reality checks and efficiency patterns
- Failure analysis with prevention strategies

**docs/ACTIVE_WORK.md**: Dynamic project status and priority management
- Current session priorities with budget tracking
- Phase-based work breakdown (1A, 1B, 1C)
- Success metrics and completion tracking
- Quick capture section for rapid todo entry

**docs/DEVELOPMENT_LOG.md**: Weekly reflection and architectural evolution
- Development insights by theme (Quality Tool Synchronization Failure, Mixed AST/Manual Approach Success)
- AI collaboration patterns and supervision requirements
- Architectural decisions with rationale
- Next session priorities based on reflection

**docs/DATABASE_API.md**: Living API documentation with JSDoc standards
- Method signatures with parameter validation
- Error conditions and fallback behavior
- Template placeholder patterns
- Example usage for complex methods

### Custom Commands System

**/.claude/commands/estimate.md**: Project-calibrated cost estimation
```bash
/estimate <task_description>
```
- Pattern matching against documented work in LEARNINGS.md
- Reality-adjusted estimates (2-4x reduction from initial assumptions)
- Risk factor assessment and confidence levels
- Reference to similar completed work for calibration

**Built-in Commands** (defined in CLAUDE.md):
```bash
/todo <item>     # Quick capture to ACTIVE_WORK.md
/idea <item>     # Add exploration idea  
/next           # Analyze priorities, recommend next task
/reflect        # Weekly insights update
/learn <insight> # Capture development insight to LEARNINGS.md
```

### Auto-Documentation Triggers

The system automated learning capture through behavioral triggers defined in CLAUDE.md:

**ALWAYS: After completing any task**
1. Check docs/ACTIVE_WORK.md - mark completed, add blockers
2. Update README.md functionality map
3. If significant insight → add to docs/LEARNINGS.md with template
4. Commit with learning if documentation updated

**CRITICAL: Before major decisions**  
1. Check docs/LEARNINGS.md for relevant patterns
2. Estimate cost based on previous similar work
3. Mention if approach contradicts established patterns

### Learning Infrastructure Impact

This documentation system proved essential for several reasons:

**Pattern Recognition**: When facing the 197 ESLint warning crisis, documented patterns from "Quality Tool Drift Prevention Failure" immediately informed the systematic cleanup approach.

**Cost Calibration**: The /estimate command, calibrated against actual costs, prevented overestimation anxiety that was blocking valuable work.

**Architectural Consistency**: Before implementing new features, checking LEARNINGS.md prevented repeating failed patterns and reinforced successful approaches.

**Knowledge Transfer**: Each insight captured with git commit associations created institutional memory that survived context switches and session boundaries.

## Specific Tool Recommendations

### Essential for AI Development
- **jscodeshift**: AST transformations for systematic refactoring
- **ESLint + Prettier**: Quality enforcement, not optional
- **Husky + lint-staged**: Git hook automation
- **Testing Library**: Proper testing patterns from start

### AI-Specific Patterns
- **Mixed AST/Manual**: Match tool capabilities to problem types
- **Template-driven**: Standardized structures for rapid content
- **Graceful degradation**: Assume services will fail
- **Learning capture**: Document patterns for future application

### Documentation Infrastructure
- **LEARNINGS.md**: Real-time insight capture with git traceability
- **ACTIVE_WORK.md**: Dynamic priority management and quick capture
- **Custom commands**: Project-specific estimation and workflow automation
- **Auto-documentation triggers**: Behavioral rules for systematic learning

## Budget Breakdown

| Category | Estimated | Actual | Efficiency |
|----------|-----------|--------|------------|
| Feature Development | $200-300 | $150-200 | 1.5-2x better |
| Database Content | $300+ | $23 | 13x better |
| Quality Cleanup | $50-100 | $50-100 | As expected |
| Documentation | $50-100 | ~$10 | 5-10x better |
| **Total** | **$600-800** | **$400-500** | **2x better** |

## Key Takeaways

1. **Cost Anxiety Blocks Value**: Estimates were consistently 3-4x too high
2. **Prevention > Cure**: Quality systems must be first-class architectural concerns
3. **AI Amplifies Patterns**: Whatever practices you use, AI will accelerate them
4. **Complexity Accumulation**: Traditional constraints become MORE important with AI
5. **Mixed Approaches**: No single tool (AST, manual, AI) solves everything
6. **Learning Investment**: Documentation and pattern capture pay exponential dividends
7. **Documentation as Infrastructure**: Active learning systems (LEARNINGS.md, custom commands) more valuable than static documentation
8. **Real-time Insight Capture**: Git commit associations and behavioral triggers create institutional memory that survives context switches

## Conclusion

AI-assisted development can achieve remarkable velocity in compressed timeframes, but requires more discipline, not less. In just 6 days, we built a sophisticated garden planning application with Monte Carlo simulation, real-time weather integration, and comprehensive plant databases. However, the same velocity that enabled this rapid development also created quality debt that required systematic remediation.

The key insight: AI development isn't about replacing traditional engineering practices—it's about making them more critical and more valuable than ever. When you can accumulate technical debt at AI speeds, prevention systems become the difference between sustainable development and constant firefighting.

This experiment cost $400-500 over 6 intensive days and produced actionable patterns for AI-assisted development that can inform future projects. The compressed timeline revealed both the immense potential and the critical constraints needed for AI development to succeed at scale.