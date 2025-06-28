# CLAUDE.md - AI Behavioral Guide

## Core Directive
Learning experiment about Claude Code workflows ($400-600 budget). Extract concrete insights about AI-assisted development patterns, not utility optimization.

## Tone & Communication
- Concise, direct responses (4 lines max unless detail requested)
- Professional peer relationship (user is senior)
- No preamble/postamble unless asked
- Functional programming preferred over mutation

## Auto-Documentation Triggers

### ALWAYS: After completing any task
1. **Check docs/ACTIVE_WORK.md** - mark completed, add any blockers discovered
2. **Update README.md** - Add new features to functionality map, update status indicators (single source of truth)
3. **If significant insight discovered** → add to docs/LEARNINGS.md using template:
   ```
   ## [Task] ([Date])
   **Insight:** [What saves time/changes approach]
   **Pattern:** [Reusable technique]
   **Impact:** [Cost/time/quality effect]
   ```
4. **Commit with learning** if documentation updated

### WEEKLY: When user uses `_reflect` command
1. **Auto-prompt**: "Development insights from this week?"
2. **Add to docs/AI_WORKFLOW_INSIGHTS.md** with timestamp
3. **Update docs/ACTIVE_WORK.md** with next session priorities

### CRITICAL: Before major decisions
1. **Check docs/LEARNINGS.md** for relevant patterns
2. **Estimate cost** based on previous similar work
3. **Mention if approach contradicts** established patterns

Within reason, minimize irrigation needs. 

## Available Commands
Commands now properly stored in `.claude/commands/` directory:
- `/todo <item>` - Quick capture to docs/ACTIVE_WORK.md
- `/idea <item>` - Add exploration idea
- `/next` - Analyze priorities and recommend next task
- `/reflect` - Weekly insights update
- `/cost <task>` - Estimate based on learned patterns (major features ~$3-5, fixes ~$1-2)

## Key Constraints
- Never commit without explicit request
- Run `npm run lint:changed:fix` after code changes
- Use `./start-dev.sh` for dev server
- Require locationConfig for all garden functions

## Critical Development Workflow

**ALWAYS do these steps after any code changes:**
1. **Check dev server logs** - Monitor dev-server.log for compilation errors and runtime issues
2. **Test critical functionality paths** - Verify that key features still work after changes
3. **Address compilation warnings** - Fix linting and TypeScript warnings before they become runtime errors  
4. **Be proactive about error detection** - Find and fix issues before the user encounters them

These steps prevent the user from discovering errors that Claude should have caught during development.

## AI-Assisted Development Constraints

**CRITICAL LEARNING:** AI's high development velocity makes traditional engineering practices MORE critical, not less. Without constraints, AI assistance enables rapid sophistication that outpaces architectural coherence.

### Required Practices for AI Development:
- **Tests as Guardrails**: Comprehensive test coverage catches parameter mismatches (locationConfig.coordinates vs lat/lon) before they become runtime cascades
- **Modularization as Constraint**: Clear module boundaries prevent service layer sprawl and make dependencies explicit
- **Function Contracts**: JSDoc type annotations and parameter validation prevent breaking changes from propagating silently
- **Architectural Reviews**: Regular assessment of whether complexity serves the problem or just demonstrates AI capability

### Warning Signs of Complexity Accumulation:
- Each "solution" adds layers rather than simplifying foundations
- Increasing human guidance required for basic functionality
- Multi-layered error handling to patch architectural issues
- Service interdependencies that require deep knowledge to modify

**Key Principle:** The faster you can add code with AI, the more important automated checks and clear boundaries become.

## Commit Guidelines
- IMPORTANT: make small commits, no more than 100 lines each, unless you have no other options