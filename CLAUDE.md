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
   ## [Task] ([Date]) - [git SHA]
   **Insight:** [What saves time/changes approach]
   **Pattern:** [Reusable technique]
   **Impact:** [Cost/time/quality effect]
   ```
4. **Commit with learning** if documentation updated

### API Documentation Maintenance
**CRITICAL: Update API docs when modifying database services**

**Triggers for docs/DATABASE_API.md updates:**
- Adding new methods to DatabaseService, CropDataService, or related services
- Changing method signatures (parameters, return types)
- Modifying parameter validation or error handling
- Adding new template placeholder patterns
- Changing fallback behavior or error conditions

**Process:**
1. **Before coding**: Check existing API docs to understand current patterns
2. **During development**: Add JSDoc comments to new/modified methods
3. **After completion**: Update docs/DATABASE_API.md with:
   - New method documentation
   - Updated parameter descriptions
   - Changed return value specifications
   - Modified error conditions or fallback behavior
4. **Testing**: Verify documentation matches implementation
5. **Commit**: Include API doc updates in same commit as implementation changes

**Documentation Standards:**
- All public methods must have complete JSDoc comments
- Parameter types, return types, and error conditions documented
- Example usage for complex methods
- Clear distinction between database and fallback behavior

### WEEKLY: When user uses `_reflect` command
1. **Auto-prompt**: "Development insights from this week?"
2. **Add to docs/LEARNINGS.md** with timestamp
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
- `/estimate <task>` - Project-specific cost estimate based on learned patterns
- `/version-tag [type]` - Interactive version tagging with package.json sync
- `/learn <insight>` - Capture development insight to docs/LEARNINGS.md
- `/docs [scope]` - Update all documentation (README, API docs, ACTIVE_WORK)
- `/maintainability [scope]` - Evaluate repository maintainability across multiple dimensions
- `/hygiene` - Check repository hygiene and development artifact cleanliness

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

**BEFORE any commit:**
5. **Repository hygiene check** - Run `git status` and verify no development artifacts are staged:
   - No `*.log` files (dev-server.log, server.log, etc.)
   - No `test-*.html` or coverage files 
   - No `package-lock.json` unless intentionally updating dependencies
   - No IDE files (.vscode/, .idea/) or OS files (Thumbs.db, .DS_Store)
6. **Code quality check** - Run `npm run lint:changed:fix` to auto-fix style issues
7. **Use `git add` selectively** - Never use `git add .` or `git add -A` without reviewing what's being added
8. **Pre-commit hook enforcement** - Hook automatically blocks commits with ESLint errors/warnings

These steps prevent the user from discovering errors that Claude should have caught during development and keep the repository clean.

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
- **Repository hygiene**: Always check `git status` before committing to ensure no development artifacts are included
- **Selective staging**: Use `git add <specific-files>` instead of `git add .` to avoid accidentally staging ignored files
- **Pre-commit verification**: Verify staged files with `git diff --cached --name-only` before committing

## Version Management
**CRITICAL: Keep package.json version in sync with git tags**

**Process for creating new versions:**
1. **Update package.json version** to match intended tag (e.g., "1.0.0")
2. **Commit version update** with message: "Bump version to vX.Y.Z"
3. **Create git tag** with same version: `git tag vX.Y.Z`
4. **Push both** commit and tag: `git push origin main && git push origin vX.Y.Z`

**Version numbering:**
- **Major (X.0.0)**: Breaking changes, new architecture
- **Minor (1.X.0)**: New features, significant enhancements
- **Patch (1.0.X)**: Bug fixes, documentation updates, small improvements

**Automation requirement:** Always update package.json version before creating git tags