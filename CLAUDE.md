# CLAUDE.md - AI Behavioral Guide

## Core Directive
Learning experiment about Claude Code workflows ($400-600 budget). Extract concrete insights about AI-assisted development patterns, not utility optimization.

## Communication Style
- Concise, direct responses (4 lines max unless detail requested)
- Professional peer relationship (user is senior)
- No preamble/postamble unless asked
- Functional programming preferred over mutation

## Development Workflow

### After Any Code Changes
1. **Code quality**: Run `npm run lint:changed:fix`
2. **Dev server**: Monitor dev-server.log for compilation/runtime issues
3. **Critical paths**: Verify key features still work
4. **Proactive debugging**: Find and fix issues before user encounters them

### Before Commits
1. **Repository hygiene**: Check `git status` - no dev artifacts (*.log, test-*.html, IDE files)
2. **Selective staging**: Use `git add <specific-files>`, never `git add .`
3. **Small commits**: Max 100 lines unless unavoidable
4. **Pre-commit hooks**: ESLint automatically blocks errors/warnings

### Documentation Triggers
- **Always**: Update docs/ACTIVE_WORK.md when completing tasks
- **Always**: Update the blog post draft as needed when completing tasks.
- **New features**: Update README.md functionality map
- **API changes**: Update docs/DATABASE_API.md for database service modifications
- **Insights**: Add to docs/LEARNINGS.md with template:
  ```
  ## [Task] ([Date]) - [git SHA]
  **Insight:** [What saves time/changes approach]
  **Pattern:** [Reusable technique]
  **Impact:** [Cost/time/quality effect]
  ```

## Available Commands
Commands stored in `.claude/commands/` directory:
- `/todo <item>` - Quick capture to docs/ACTIVE_WORK.md
- `/next` - Analyze priorities and recommend next task
- `/reflect` - Weekly insights update
- `/estimate <task>` - Cost estimate based on learned patterns
- `/docs [scope]` - Update all documentation
- `/hygiene` - Check repository cleanliness

## AI Development Constraints

**CRITICAL LEARNING:** AI's high velocity makes engineering practices MORE critical, not less.

### Required Practices
- **Tests as Guardrails**: Catch parameter mismatches before runtime
- **Module Boundaries**: Prevent service layer sprawl
- **Function Contracts**: JSDoc annotations prevent breaking changes
- **Architectural Reviews**: Complexity should serve the problem, not demonstrate AI capability

### Warning Signs
- Each solution adds layers rather than simplifying
- Increasing human guidance for basic functionality
- Multi-layered error handling patching architecture issues

**Key Principle:** Faster code addition = more important automated checks and boundaries.

## Key Constraints
- Never commit without explicit request
- Use `./scripts/start-dev.sh` for dev server
- Require locationConfig for all garden functions
- Keep package.json version synced with git tags

## Version Management
1. Update package.json version
2. Commit: "Bump version to vX.Y.Z"
3. Tag: `git tag vX.Y.Z`
4. Push: `git push origin main && git push origin vX.Y.Z`

**Versioning**: Major (breaking), Minor (features), Patch (fixes)